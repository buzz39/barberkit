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
  Zap
} from 'lucide-react';
import type { UserProfile, ShopSettings } from '../types';
import { useAuth } from '../contexts/AuthContext';

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
  const [formData, setFormData] = useState<ShopSettings>({
    shopName: '',
    currency: 'USD',
    currencySymbol: '$'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize form data when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFormData({
        shopName: userProfile.shopName,
        currency: userProfile.currency,
        currencySymbol: userProfile.currencySymbol
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
      await onUpdateProfile({
        shopName: formData.shopName,
        currency: formData.currency,
        currencySymbol: formData.currencySymbol
      });
      setSuccessMessage('Settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
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

export default Settings;

