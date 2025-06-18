import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Store,
  DollarSign,
  Crown,
  Lock,
  CheckCircle,
  AlertTriangle,
  Save,
  RefreshCw,
  CreditCard,
  Zap,
  Plus,
  Edit2,
  Trash2,
  Clock,
  X
} from 'lucide-react';
import type { UserProfile, ShopSettings, Service } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { serviceService } from '../services/database';

interface SettingsProps {
  userProfile: UserProfile | null;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  loading?: boolean;
}

const CURRENCY_OPTIONS = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'Mx$', name: 'Mexican Peso' }
];

const SUBSCRIPTION_FEATURES = {
  free: [
    'Basic customer management',
    'Up to 50 customers',
    'Standard templates',
    'Basic analytics'
  ],
  premium: [
    'Unlimited customers',
    'Custom shop branding',
    'Currency configuration',
    'Advanced templates',
    'Detailed analytics',
    'Priority support'
  ],
  pro: [
    'Everything in Premium',
    'Multi-location support',
    'Advanced automation',
    'Custom integrations',
    'White-label options',
    '24/7 phone support'
  ]
};

const Settings: React.FC<SettingsProps> = ({ userProfile, onUpdateProfile, loading = false }) => {
  const { user } = useAuth();
  const { updateCurrency } = useCurrency();
  const [formData, setFormData] = useState<ShopSettings>({
    shopName: '',
    currency: 'USD',
    currencySymbol: '$'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  // Initialize form data whenever userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFormData({
        shopName: userProfile.shopName || '',
        currency: userProfile.currency || 'USD',
        currencySymbol: userProfile.currencySymbol || '$'
      });
    }
  }, [userProfile]);

  const isPaidUser = userProfile?.subscriptionStatus !== 'free';
  const isExpired = userProfile?.subscriptionEndDate && new Date(userProfile.subscriptionEndDate) < new Date();
  const hasAccess = isPaidUser && !isExpired;

  const handleCurrencyChange = (currency: string) => {
    const currencyOption = CURRENCY_OPTIONS.find(option => option.code === currency);
    if (currencyOption) {
      setFormData(prev => ({
        ...prev,
        currency: currencyOption.code,
        currencySymbol: currencyOption.symbol
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAccess) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      console.log('🔧 SETTINGS DEBUG - Starting save with data:', {
        shopName: formData.shopName,
        currency: formData.currency,
        currencySymbol: formData.currencySymbol,
        userProfile: userProfile,
        hasAccess: hasAccess
      });
      
      await onUpdateProfile({
        shopName: formData.shopName,
        currency: formData.currency,
        currencySymbol: formData.currencySymbol
      });
      
      console.log('✅ SETTINGS DEBUG - Profile update completed successfully');
      
      // Update currency context immediately
      updateCurrency(formData.currency, formData.currencySymbol);
      
      setSuccessMessage('Settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('❌ SETTINGS DEBUG - Error during save:', error);
      setErrorMessage('Failed to update settings. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubscriptionStatusBadge = () => {
    const status = userProfile?.subscriptionStatus || 'free';
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      premium: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
        {status === 'free' && <Lock className="h-4 w-4 mr-1" />}
        {status !== 'free' && <Crown className="h-4 w-4 mr-1" />}
        {status.toUpperCase()}
      </span>
    );
  };

  const PremiumUpgrade = () => (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">Upgrade to Premium</h3>
            <p className="text-sm text-gray-600">Unlock advanced features and customization options</p>
          </div>
        </div>
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center">
          <CreditCard className="h-4 w-4 mr-2" />
          Upgrade Now
        </button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <Zap className="h-4 w-4 text-blue-600 mr-1" />
            Premium Features
          </h4>
          <ul className="space-y-1 text-sm text-gray-600">
            {SUBSCRIPTION_FEATURES.premium.map((feature, index) => (
              <li key={index} className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">$19</div>
            <div className="text-sm text-gray-600 mb-3">per month</div>
            <div className="text-xs text-gray-500">30-day free trial</div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg text-gray-600">Loading settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg">
              <SettingsIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your shop configuration and preferences</p>
            </div>
          </div>
          {getSubscriptionStatusBadge()}
        </div>
      </div>

      {/* Subscription Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Crown className="h-5 w-5 text-purple-600 mr-2" />
          Subscription Status
        </h2>
        
        {userProfile && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Current Plan:</span>
                <span className="font-semibold text-gray-900">
                  {userProfile.subscriptionStatus.toUpperCase()}
                </span>
              </div>
              
              {userProfile.subscriptionEndDate && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Expires:</span>
                  <span className={`font-semibold ${
                    isExpired ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {new Date(userProfile.subscriptionEndDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Access Level:</span>
                <div className="flex items-center">
                  {hasAccess ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-600 font-semibold">Full Access</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-red-600 font-semibold">Limited Access</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Available Features:</h4>
              <ul className="space-y-1 text-sm">
                {SUBSCRIPTION_FEATURES[userProfile.subscriptionStatus].map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Prompt for Free Users */}
      {!hasAccess && <PremiumUpgrade />}

      {/* Shop Configuration - Restricted to Paid Users */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Store className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Shop Configuration</h2>
            </div>
            {!hasAccess && (
              <div className="flex items-center text-amber-600">
                <Lock className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Premium Feature</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {!hasAccess ? (
            <div className="text-center py-8">
              <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Lock className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Feature Required</h3>
              <p className="text-gray-600 mb-4 max-w-md mx-auto">
                Shop name and currency configuration is available for Premium and Pro subscribers only.
              </p>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                Upgrade to Premium
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Success/Error Messages */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800">{successMessage}</span>
                </div>
              )}
              
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-800">{errorMessage}</span>
                </div>
              )}

              {/* Shop Name */}
              <div>
                <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Name
                </label>
                <input
                  type="text"
                  id="shopName"
                  value={formData.shopName}
                  onChange={(e) => setFormData(prev => ({ ...prev, shopName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your shop name"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">This will appear in your receipts and communications</p>
              </div>

              {/* Currency Selection */}
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                  >
                    {CURRENCY_OPTIONS.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.symbol} - {option.name} ({option.code})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Selected currency: {formData.currencySymbol} ({formData.currency})
                </p>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

{/* Services Management */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-4">Manage Services</h2>
  <ServiceList />
</div>

{/* Additional Settings (Future) */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Settings</h2>
  <div className="space-y-4 text-gray-600">
    <p className="flex items-center">
      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
      Notification preferences - Coming soon
    </p>
    <p className="flex items-center">
      <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
      Theme customization - Coming soon
    </p>
    <p className="flex items-center">
      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-3"></span>
      Integration settings - Coming soon
    </p>
  </div>
      </div>
    </div>
  );
};

// ServiceList Component for managing services
const ServiceList: React.FC = () => {
  const { user } = useAuth();
  const { currencySymbol } = useCurrency();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    description: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load services on mount
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const result = await serviceService.getAll(user.id);
      if (result.success && result.data) {
        setServices(result.data);
      } else {
        setError(result.error || 'Failed to load services');
      }
    } catch (err) {
      setError('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const serviceData = {
        name: formData.name,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        description: formData.description || undefined
      };

      const result = await serviceService.create(user.id, serviceData);
      if (result.success && result.data) {
        setServices([...services, result.data]);
        setFormData({ name: '', price: '', duration: '', description: '' });
        setShowAddForm(false);
        setSuccess('Service added successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to add service');
      }
    } catch (err) {
      setError('Failed to add service');
    }
  };

  const handleUpdateService = async (serviceId: string, updates: Partial<Service>) => {
    try {
      const result = await serviceService.update(serviceId, updates);
      if (result.success && result.data) {
        setServices(services.map(service => 
          service.id === serviceId ? result.data : service
        ));
        setIsEditing(null);
        setSuccess('Service updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to update service');
      }
    } catch (err) {
      setError('Failed to update service');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const result = await serviceService.delete(serviceId);
      if (result.success) {
        setServices(services.filter(service => service.id !== serviceId));
        setSuccess('Service deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to delete service');
      }
    } catch (err) {
      setError('Failed to delete service');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', duration: '', description: '' });
    setShowAddForm(false);
    setIsEditing(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading services...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800">{success}</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Add Service Button */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">Manage the services you offer to your customers</p>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </button>
      </div>

      {/* Add Service Form */}
      {showAddForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Service</h3>
          <form onSubmit={handleAddService} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Haircut"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="25.00"
                  required
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description (optional)"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Services List */}
      {services.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Store className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Services Added</h3>
          <p className="text-gray-600 mb-4">Add your first service to get started</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Add Your First Service
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <ServiceItem
              key={service.id}
              service={service}
              isEditing={isEditing === service.id}
              onEdit={() => setIsEditing(service.id)}
              onCancelEdit={() => setIsEditing(null)}
              onUpdate={(updates) => handleUpdateService(service.id, updates)}
              onDelete={() => handleDeleteService(service.id)}
              currencySymbol={currencySymbol}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ServiceItem Component for individual service management
interface ServiceItemProps {
  service: Service;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (updates: Partial<Service>) => void;
  onDelete: () => void;
  currencySymbol: string;
}

const ServiceItem: React.FC<ServiceItemProps> = ({
  service,
  isEditing,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  currencySymbol
}) => {
  const [editData, setEditData] = useState({
    name: service.name,
    price: service.price.toString(),
    duration: service.duration.toString(),
    description: service.description || ''
  });

  const handleSave = () => {
    onUpdate({
      name: editData.name,
      price: parseFloat(editData.price),
      duration: parseInt(editData.duration),
      description: editData.description || undefined
    });
  };

  const handleCancel = () => {
    setEditData({
      name: service.name,
      price: service.price.toString(),
      duration: service.duration.toString(),
      description: service.description || ''
    });
    onCancelEdit();
  };

  if (isEditing) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Edit Service</h4>
        <div className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Name
              </label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                value={editData.price}
                onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={editData.duration}
                onChange={(e) => setEditData({ ...editData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional description"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{service.name}</h4>
              {service.description && (
                <p className="text-sm text-gray-600">{service.description}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
                {currencySymbol}{service.price.toFixed(2)}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {service.duration} min
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit service"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete service"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

