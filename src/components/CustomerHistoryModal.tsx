import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  DollarSign, 
  Scissors, 
  Plus,
  Clock,
  User,
  Phone,
  Gift,
  FileText,
  History
} from 'lucide-react';
import type { CustomerWithLatestVisit, Visit, NewVisit } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { visitService } from '../services/database';

interface CustomerHistoryModalProps {
  customer: CustomerWithLatestVisit;
  isOpen: boolean;
  onClose: () => void;
  onAddVisit: (visit: NewVisit) => void;
}

const CustomerHistoryModal: React.FC<CustomerHistoryModalProps> = ({
  customer,
  isOpen,
  onClose,
  onAddVisit
}) => {
  const { formatCurrency } = useCurrency();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [newVisit, setNewVisit] = useState<Omit<NewVisit, 'customerId'>>({
    visitDate: new Date().toISOString().split('T')[0],
    services: [],
    paymentAmount: 0,
    notes: ''
  });

  const services = ['Haircut', 'Beard Trim', 'Shave', 'Hair Wash', 'Styling', 'Facial'];

  useEffect(() => {
    if (isOpen && customer.id) {
      loadVisitHistory();
    }
  }, [isOpen, customer.id]);

  const loadVisitHistory = async () => {
    setLoading(true);
    try {
      const result = await visitService.getByCustomer(customer.id);
      if (result.success) {
        setVisits(result.data);
      } else {
        console.error('Error loading visit history:', result.error);
      }
    } catch (error) {
      console.error('Error loading visit history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVisit = async () => {
    if (newVisit.services.length === 0 || newVisit.paymentAmount <= 0) {
      alert('Please select services and enter a valid payment amount.');
      return;
    }

    const visitData: NewVisit = {
      customerId: customer.id,
      ...newVisit
    };

    await onAddVisit(visitData);
    
    // Reset form and reload history
    setNewVisit({
      visitDate: new Date().toISOString().split('T')[0],
      services: [],
      paymentAmount: 0,
      notes: ''
    });
    setShowAddVisit(false);
    loadVisitHistory();
  };

  const handleServiceToggle = (service: string) => {
    setNewVisit(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{customer.name}</h2>
                <div className="flex items-center space-x-4 text-blue-100">
                  <div className="flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>{customer.mobile}</span>
                  </div>
                  {customer.birthday && (
                    <div className="flex items-center space-x-1">
                      <Gift className="h-4 w-4" />
                      <span>Birthday: {formatDate(customer.birthday)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Customer Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span className="text-sm font-medium">Total Visits</span>
              </div>
              <p className="text-2xl font-bold mt-1">{customer.totalVisits}</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span className="text-sm font-medium">Total Spent</span>
              </div>
              <p className="text-2xl font-bold mt-1">{formatCurrency(customer.totalSpent)}</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-medium">Last Visit</span>
              </div>
              <p className="text-sm mt-1">
                {customer.lastVisitDate ? formatDate(customer.lastVisitDate) : 'No visits yet'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Add Visit Button */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <History className="h-5 w-5 mr-2" />
              Visit History
            </h3>
            <button
              onClick={() => setShowAddVisit(!showAddVisit)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Visit
            </button>
          </div>

          {/* Add Visit Form */}
          {showAddVisit && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-4">Add New Visit</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visit Date
                  </label>
                  <input
                    type="date"
                    value={newVisit.visitDate}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, visitDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newVisit.paymentAmount}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, paymentAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {services.map(service => (
                    <label key={service} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newVisit.services.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={newVisit.notes}
                  onChange={(e) => setNewVisit(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes about this visit..."
                />
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowAddVisit(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddVisit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Visit
                </button>
              </div>
            </div>
          )}

          {/* Visit History */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading visit history...</p>
            </div>
          ) : visits.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No visits yet</h3>
              <p className="text-gray-500">This customer hasn't visited yet. Add their first visit above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {visits.map((visit, index) => (
                <div key={visit.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span className="font-medium">{formatDate(visit.visitDate)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="text-sm">{formatTime(visit.createdAt)}</span>
                        </div>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Visit #{visits.length - index}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center">
                          <Scissors className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="flex flex-wrap gap-1">
                            {visit.services.map((service, serviceIndex) => (
                              <span
                                key={serviceIndex}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {visit.notes && (
                        <div className="flex items-start space-x-2 mb-2">
                          <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                          <p className="text-sm text-gray-600">{visit.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="flex items-center text-lg font-bold text-green-600">
                        <DollarSign className="h-4 w-4" />
                        {formatCurrency(visit.paymentAmount)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerHistoryModal;
