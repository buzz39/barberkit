import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CustomerManagement from './components/CustomerManagement';
import Communication from './components/Communication';
import Marketing from './components/Marketing';
import Settings from './components/Settings';
import Login from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import type { Customer, Analytics, Campaign, WhatsAppTemplate, UserProfile } from './types';
import { 
  customerService, 
  campaignService, 
  templateService, 
  analyticsService,
  userProfileService,
  initializeDefaultData
} from './services/database';

function AppContent() {
  const { user, authLoading, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data will be loaded when user is authenticated

  // Load initial data when user is authenticated
  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initialize default data if needed
        await initializeDefaultData();

        // Load user profile first
        const profileResult = await userProfileService.getProfile(user.id);
        if (profileResult.success) {
          setUserProfile(profileResult.data);
        } else {
          // If profile doesn't exist, create one
          const createResult = await userProfileService.createProfile(user.id, {});
          if (createResult.success) {
            setUserProfile(createResult.data);
          }
        }

        // Load all data in parallel
        const [customersResult, campaignsResult, templatesResult, analyticsResult] = await Promise.all([
          customerService.getAll(),
          campaignService.getAll(),
          templateService.getAll(),
          analyticsService.getAnalytics()
        ]);

        if (customersResult.success) {
          setCustomers(customersResult.data);
        } else {
          console.error('Failed to load customers:', customersResult.error);
        }

        if (campaignsResult.success) {
          setCampaigns(campaignsResult.data);
        } else {
          console.error('Failed to load campaigns:', campaignsResult.error);
        }

        if (templatesResult.success) {
          setTemplates(templatesResult.data);
        } else {
          console.error('Failed to load templates:', templatesResult.error);
        }

        if (analyticsResult.success) {
          setAnalytics(analyticsResult.data);
        } else {
          console.error('Failed to load analytics:', analyticsResult.error);
        }

      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load application data. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Customer operations
  const handleAddCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    try {
      const result = await customerService.create(customerData);
      if (result.success) {
        setCustomers(prev => [result.data, ...prev]);
        // Refresh analytics
        const analyticsResult = await analyticsService.getAnalytics();
        if (analyticsResult.success) {
          setAnalytics(analyticsResult.data);
        }
        alert('Customer added successfully!');
      } else {
        alert(`Error adding customer: ${result.error}`);
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('Failed to add customer. Please try again.');
    }
  };

  const handleEditCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const result = await customerService.update(id, updates);
      if (result.success) {
        setCustomers(prev => prev.map(customer => 
          customer.id === id ? result.data : customer
        ));
        // Refresh analytics
        const analyticsResult = await analyticsService.getAnalytics();
        if (analyticsResult.success) {
          setAnalytics(analyticsResult.data);
        }
        alert('Customer updated successfully!');
      } else {
        alert(`Error updating customer: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Failed to update customer. Please try again.');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      const result = await customerService.delete(id);
      if (result.success) {
        setCustomers(prev => prev.filter(customer => customer.id !== id));
        // Refresh analytics
        const analyticsResult = await analyticsService.getAnalytics();
        if (analyticsResult.success) {
          setAnalytics(analyticsResult.data);
        }
        alert('Customer deleted successfully!');
      } else {
        alert(`Error deleting customer: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer. Please try again.');
    }
  };

  // Campaign operations
  const handleCreateCampaign = async (campaignData: Omit<Campaign, 'id' | 'createdAt'>) => {
    try {
      const result = await campaignService.create(campaignData);
      if (result.success) {
        setCampaigns(prev => [result.data, ...prev]);
        alert('Campaign created successfully!');
      } else {
        alert(`Error creating campaign: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
    }
  };

  const handleUpdateCampaign = async (id: string, updates: Partial<Campaign>) => {
    try {
      const result = await campaignService.update(id, updates);
      if (result.success) {
        setCampaigns(prev => prev.map(campaign => 
          campaign.id === id ? result.data : campaign
        ));
        alert('Campaign updated successfully!');
      } else {
        alert(`Error updating campaign: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      alert('Failed to update campaign. Please try again.');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      const result = await campaignService.delete(id);
      if (result.success) {
        setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
        alert('Campaign deleted successfully!');
      } else {
        alert(`Error deleting campaign: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Failed to delete campaign. Please try again.');
    }
  };

  const handleSendCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to send this campaign?')) return;
    
    try {
      const result = await campaignService.update(id, { status: 'sent' });
      if (result.success) {
        setCampaigns(prev => prev.map(campaign => 
          campaign.id === id ? result.data : campaign
        ));
        alert('Campaign sent successfully!');
      } else {
        alert(`Error sending campaign: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Failed to send campaign. Please try again.');
    }
  };

  const handleSendMessage = (customerIds: string[], message: string, type: string) => {
    console.log('Sending message:', { customerIds, message, type });
    // In a real app, this would integrate with WhatsApp API
    alert(`Message sent to ${customerIds.length} customers!`);
  };

  // Authentication handlers
  const handleLoginSuccess = () => {
    // Data will be loaded automatically via useEffect when user state changes
    console.log('Login successful');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Clear application state
      setCustomers([]);
      setCampaigns([]);
      setTemplates([]);
      setAnalytics(null);
      setUserProfile(null);
      setCurrentPage('dashboard');
      setError(null);
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  // User profile operations
  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) return;

    try {
      const result = await userProfileService.updateProfile(user.id, updates);
      if (result.success) {
        setUserProfile(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Show auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if user is not authenticated
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Show loading state for data
  if (loading) {
    return (
      <Layout 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
        user={user} 
        userProfile={userProfile}
        onLogout={handleLogout}
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (error) {
    return (
      <Layout 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
        user={user} 
        userProfile={userProfile}
        onLogout={handleLogout}
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center max-w-md">
            <div className="bg-red-100 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl">⚠</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Default analytics fallback
  const fallbackAnalytics: Analytics = {
    todayCustomers: 0,
    todayRevenue: 0,
    weeklyCustomers: 0,
    weeklyRevenue: 0,
    monthlyCustomers: 0,
    monthlyRevenue: 0,
    popularServices: [],
    upcomingBirthdays: []
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard analytics={analytics || fallbackAnalytics} />;
      case 'customers':
        return (
          <CustomerManagement 
            customers={customers}
            onAddCustomer={handleAddCustomer}
            onEditCustomer={handleEditCustomer}
            onDeleteCustomer={handleDeleteCustomer}
          />
        );
      case 'communication':
        return (
          <Communication 
            customers={customers}
            templates={templates}
            onSendMessage={handleSendMessage}
          />
        );
      case 'marketing':
        return (
          <Marketing 
            customers={customers}
            campaigns={campaigns}
            onCreateCampaign={handleCreateCampaign}
            onUpdateCampaign={handleUpdateCampaign}
            onDeleteCampaign={handleDeleteCampaign}
            onSendCampaign={handleSendCampaign}
          />
        );
      case 'settings':
        return (
          <Settings 
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            loading={loading}
          />
        );
      default:
        return <Dashboard analytics={analytics || fallbackAnalytics} />;
    }
  };

  return (
    <Layout 
      currentPage={currentPage} 
      onPageChange={setCurrentPage} 
      user={user} 
      userProfile={userProfile}
      onLogout={handleLogout}
    >
      {renderCurrentPage()}
    </Layout>
  );
}

// Main App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
