import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Calendar,
  Edit,
  Trash2,
  Gift,
  ExternalLink
} from 'lucide-react';
import type { CustomerWithLatestVisit, NewCustomerWithVisit, NewVisit } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import CustomerForm from './CustomerForm';

interface CustomerManagementProps {
  customers: CustomerWithLatestVisit[];
  onAddCustomer: (customer: NewCustomerWithVisit) => void;
  onAddVisit: (visit: NewVisit) => void;
  onEditCustomer: (id: string, customer: Partial<CustomerWithLatestVisit>) => void;
  onDeleteCustomer: (id: string) => void;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({
  customers,
  onAddCustomer,
  onAddVisit,
  onEditCustomer,
  onDeleteCustomer
}) => {
  const { formatCurrency } = useCurrency();
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerWithLatestVisit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('');

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.mobile.includes(searchTerm);
    const matchesFilter = !filterService || 
      (customer.latestVisit && customer.latestVisit.services.includes(filterService));
    return matchesSearch && matchesFilter;
  });

  const services = ['Haircut', 'Beard Trim', 'Shave', 'Hair Wash', 'Styling', 'Facial'];

  const handleAddCustomerOrVisit = (customerData: NewCustomerWithVisit | NewVisit) => {
    if ('customer' in customerData) {
      // New customer with first visit
      onAddCustomer(customerData);
    } else {
      // New visit for existing customer
      onAddVisit(customerData);
    }
    setShowForm(false);
    setEditingCustomer(null);
  };

  const handleEditCustomer = (customerData: NewCustomerWithVisit | NewVisit) => {
    if (editingCustomer && 'customer' in customerData) {
      onEditCustomer(editingCustomer.id, {
        name: customerData.customer.name,
        mobile: customerData.customer.mobile,
        birthday: customerData.customer.birthday,
        notes: customerData.customer.notes
      });
      // Also add the visit
      onAddVisit({
        customerId: editingCustomer.id,
        visitDate: customerData.visit.visitDate,
        services: customerData.visit.services,
        paymentAmount: customerData.visit.paymentAmount,
        notes: customerData.visit.notes
      });
      setEditingCustomer(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (showForm || editingCustomer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
          </h1>
          <button
            onClick={() => {
              setShowForm(false);
              setEditingCustomer(null);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
        <CustomerForm
          initialData={editingCustomer || undefined}
          onSubmit={handleAddCustomerOrVisit}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage your customers and their information</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Customer
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers by name or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Services</option>
                {services.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-500">
              {searchTerm || filterService ? 'Try adjusting your search or filter criteria.' : 'Get started by adding your first customer.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Latest Services
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {customer.name}
                            {customer.birthday && (
                              <Gift className="h-4 w-4 text-orange-500 ml-2" />
                            )}
                          </div>
                          {customer.birthday && (
                            <div className="text-sm text-gray-500">
                              Birthday: {formatDate(customer.birthday)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{customer.mobile}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {customer.lastVisitDate ? formatDate(customer.lastVisitDate) : 'No visits'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {customer.latestVisit ? customer.latestVisit.services.map((service, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {service}
                          </span>
                        )) : (
                          <span className="text-sm text-gray-500">No services</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(customer.totalSpent)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{customer.totalVisits}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingCustomer(customer)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => window.open(`https://wa.me/${customer.mobile.replace(/\D/g, '')}`)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteCustomer(customer.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerManagement;