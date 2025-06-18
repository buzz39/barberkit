import React, { useState } from 'react';
import { 
  Megaphone, 
  Users, 
  Send, 
  Plus,
  Edit,
  Trash2,
  Calendar,
  Eye,
  BarChart3,
  Target,
  Filter,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import type { Campaign, Customer } from '../types';

interface MarketingProps {
  customers: Customer[];
  campaigns: Campaign[];
  onCreateCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt'>) => void;
  onUpdateCampaign: (id: string, campaign: Partial<Campaign>) => void;
  onDeleteCampaign: (id: string) => void;
  onSendCampaign: (id: string) => void;
}

const Marketing: React.FC<MarketingProps> = ({
  customers,
  campaigns,
  onCreateCampaign,
  onUpdateCampaign,
  onDeleteCampaign,
  onSendCampaign
}) => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    message: '',
    targetSegment: 'all',
    scheduledDate: ''
  });

  const tabs = [
    { id: 'campaigns', name: 'Campaigns', icon: Megaphone },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'segments', name: 'Segments', icon: Target },
  ];

  const targetSegments = [
    { id: 'all', name: 'All Customers', count: customers.length },
    { id: 'recent', name: 'Recent Customers', count: customers.filter(c => {
      const visitDate = new Date(c.visitDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return visitDate >= thirtyDaysAgo;
    }).length },
    { id: 'birthday', name: 'Birthday This Month', count: customers.filter(c => {
      if (!c.birthday) return false;
      const birthday = new Date(c.birthday);
      const currentMonth = new Date().getMonth();
      return birthday.getMonth() === currentMonth;
    }).length },
    { id: 'inactive', name: 'Inactive Customers', count: customers.filter(c => {
      const visitDate = new Date(c.visitDate);
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      return visitDate < ninetyDaysAgo;
    }).length }
  ];

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetSegment = targetSegments.find(s => s.id === formData.targetSegment);
    const recipientCount = targetSegment?.count || 0;

    const campaignData = {
      name: formData.name,
      message: formData.message,
      targetSegment: formData.targetSegment,
      scheduledDate: formData.scheduledDate || undefined,
      status: formData.scheduledDate ? 'scheduled' as const : 'draft' as const,
      recipientCount
    };

    if (editingCampaign) {
      onUpdateCampaign(editingCampaign.id, campaignData);
      setEditingCampaign(null);
    } else {
      onCreateCampaign(campaignData);
    }

    setFormData({ name: '', message: '', targetSegment: 'all', scheduledDate: '' });
    setShowCreateForm(false);
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      message: campaign.message,
      targetSegment: campaign.targetSegment,
      scheduledDate: campaign.scheduledDate || ''
    });
    setShowCreateForm(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'scheduled':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'draft':
        return <Edit className="h-5 w-5 text-gray-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing Center</h1>
          <p className="text-gray-600">Create and manage your marketing campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Campaign
        </button>
      </div>

      {/* Campaign Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter campaign name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Segment
                </label>
                <select
                  value={formData.targetSegment}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetSegment: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {targetSegments.map(segment => (
                    <option key={segment.id} value={segment.id}>
                      {segment.name} ({segment.count} customers)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your message here..."
                />
                <div className="flex justify-between mt-2">
                  <span className={`text-sm ${formData.message.length > 160 ? 'text-red-600' : 'text-gray-500'}`}>
                    {formData.message.length}/160 characters
                  </span>
                  <span className="text-sm text-gray-500">
                    Recipients: {targetSegments.find(s => s.id === formData.targetSegment)?.count || 0}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule Send (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingCampaign(null);
                    setFormData({ name: '', message: '', targetSegment: 'all', scheduledDate: '' });
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                  {editingCampaign ? 'Update' : 'Create'} Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-32"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="sent">Sent</option>
                  </select>
                </div>
              </div>

              {/* Campaigns List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredCampaigns.map((campaign) => (
                  <div key={campaign.id} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 mr-3">{campaign.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{campaign.message}</p>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {campaign.recipientCount} recipients
                          </div>
                          {campaign.scheduledDate && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(campaign.scheduledDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {getStatusIcon(campaign.status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        Created {new Date(campaign.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-2">
                        {campaign.status === 'draft' && (
                          <button
                            onClick={() => onSendCampaign(campaign.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(campaign)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteCampaign(campaign.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCampaigns.length === 0 && (
                <div className="text-center py-12">
                  <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
                  <p className="text-gray-500">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.' 
                      : 'Create your first marketing campaign to get started.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Campaign Analytics</h3>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Campaigns</p>
                      <p className="text-3xl font-bold mt-1">{campaigns.length}</p>
                    </div>
                    <Megaphone className="h-8 w-8 text-blue-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Messages Sent</p>
                      <p className="text-3xl font-bold mt-1">
                        {campaigns.filter(c => c.status === 'sent').reduce((sum, c) => sum + c.recipientCount, 0)}
                      </p>
                    </div>
                    <Send className="h-8 w-8 text-green-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Scheduled</p>
                      <p className="text-3xl font-bold mt-1">
                        {campaigns.filter(c => c.status === 'scheduled').length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-200" />
                  </div>
                </div>
              </div>

              {/* Campaign Performance */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Recent Campaign Performance</h4>
                <div className="space-y-4">
                  {campaigns.filter(c => c.status === 'sent').slice(0, 5).map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 bg-white rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">{campaign.name}</p>
                        <p className="text-sm text-gray-500">Sent to {campaign.recipientCount} customers</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">Delivered</p>
                        <p className="text-sm text-gray-500">{new Date(campaign.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'segments' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Customer Segments</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {targetSegments.map((segment) => (
                  <div key={segment.id} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">{segment.name}</h4>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {segment.count}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      {segment.id === 'all' && 'All customers in your database'}
                      {segment.id === 'recent' && 'Customers who visited in the last 30 days'}
                      {segment.id === 'birthday' && 'Customers with birthdays this month'}
                      {segment.id === 'inactive' && 'Customers who haven\'t visited in 90+ days'}
                    </p>
                    <button className="w-full bg-blue-50 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                      Create Campaign for This Segment
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketing;