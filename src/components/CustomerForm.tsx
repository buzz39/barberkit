import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { serviceService } from '../services/database';
import type { Customer, UserProfile, Service } from '../types';

interface CustomerFormProps {
  onSubmit: (customerData: Omit<Customer, 'id' | 'createdAt'>) => void;
  initialData?: Customer;
  userProfile?: UserProfile | null;
  onCancel?: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onSubmit, initialData, userProfile, onCancel }) => {
  const { currencySymbol, currency } = useCurrency();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    visitDate: new Date().toISOString().split('T')[0],
    services: [] as string[],
    paymentAmount: '',
    birthday: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // Load available services
  useEffect(() => {
    const loadServices = async () => {
      if (!user) return;
      
      setServicesLoading(true);
      try {
        const result = await serviceService.getActive(user.id);
        if (result.success && result.data) {
          setAvailableServices(result.data);
        }
      } catch (error) {
        console.error('Failed to load services:', error);
      } finally {
        setServicesLoading(false);
      }
    };

    loadServices();
  }, [user]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        mobile: initialData.mobile,
        visitDate: initialData.visitDate.split('T')[0],
        services: initialData.services,
        paymentAmount: initialData.paymentAmount.toString(),
        birthday: initialData.birthday?.split('T')[0] || '',
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid mobile number';
    }

    if (!formData.visitDate) {
      newErrors.visitDate = 'Visit date is required';
    }

    if (formData.services.length === 0) {
      newErrors.services = 'Please select at least one service';
    }

    if (!formData.paymentAmount || isNaN(Number(formData.paymentAmount))) {
      newErrors.paymentAmount = 'Please enter a valid payment amount';
    } else if (Number(formData.paymentAmount) <= 0) {
      newErrors.paymentAmount = 'Payment amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit({
      name: formData.name.trim(),
      mobile: formData.mobile.trim(),
      visitDate: formData.visitDate,
      services: formData.services,
      paymentAmount: Number(formData.paymentAmount),
      birthday: formData.birthday || undefined,
      notes: formData.notes.trim() || undefined
    });
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Customer Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter customer name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Mobile Number */}
        <div>
          <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Number *
          </label>
          <input
            type="tel"
            id="mobile"
            value={formData.mobile}
            onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.mobile ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="+1 (555) 123-4567"
          />
          {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>}
        </div>

        {/* Visit Date */}
        <div>
          <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700 mb-2">
            Visit Date *
          </label>
          <input
            type="date"
            id="visitDate"
            value={formData.visitDate}
            onChange={(e) => setFormData(prev => ({ ...prev, visitDate: e.target.value }))}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.visitDate ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.visitDate && <p className="mt-1 text-sm text-red-600">{errors.visitDate}</p>}
        </div>

        {/* Services */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Services *
          </label>
          {servicesLoading ? (
            <div className="flex items-center justify-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <RefreshCw className="h-5 w-5 animate-spin text-gray-400 mr-2" />
              <span className="text-gray-500">Loading services...</span>
            </div>
          ) : availableServices.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500 mb-2">No services available</p>
              <p className="text-sm text-gray-400">Add services in Settings to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableServices.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleServiceToggle(service.name)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors text-left ${
                    formData.services.includes(service.name)
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  title={service.description || service.name}
                >
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-xs opacity-75">
                      {currencySymbol}{service.price.toFixed(2)} • {service.duration}min
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {errors.services && <p className="mt-1 text-sm text-red-600">{errors.services}</p>}
        </div>

        {/* Payment Amount */}
        <div>
          <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-2">
            Payment Amount * ({currencySymbol})
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
              {currencySymbol}
            </span>
            <input
              type="number"
              id="paymentAmount"
              value={formData.paymentAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentAmount: e.target.value }))}
              className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.paymentAmount ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          {errors.paymentAmount && <p className="mt-1 text-sm text-red-600">{errors.paymentAmount}</p>}
          {currency && currency !== 'USD' && (
            <p className="mt-1 text-xs text-gray-500">
              Amount in {currency}
            </p>
          )}
        </div>

        {/* Birthday */}
        <div>
          <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-2">
            Birthday (Optional)
          </label>
          <input
            type="date"
            id="birthday"
            value={formData.birthday}
            onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any additional notes about the customer or service..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {initialData ? 'Update Customer' : 'Save Customer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;