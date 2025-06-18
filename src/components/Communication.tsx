import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Calendar,
  Gift,
  Bell,
  Phone,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import type { WhatsAppTemplate, Customer } from '../types';

interface CommunicationProps {
  customers: Customer[];
  templates: WhatsAppTemplate[];
  onSendMessage: (customerIds: string[], message: string, type: string) => void;
}

const Communication: React.FC<CommunicationProps> = ({ customers, templates, onSendMessage }) => {
  const [activeTab, setActiveTab] = useState('send');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [messageType, setMessageType] = useState('custom');

  const tabs = [
    { id: 'send', name: 'Send Messages', icon: MessageSquare },
    { id: 'templates', name: 'Templates', icon: Settings },
    { id: 'history', name: 'Message History', icon: Clock },
  ];

  const messageTypes = [
    { id: 'birthday', name: 'Birthday Wishes', icon: Gift, color: 'text-orange-600' },
    { id: 'reminder', name: 'Service Reminders', icon: Bell, color: 'text-blue-600' },
    { id: 'promotion', name: 'Promotions', icon: Users, color: 'text-green-600' },
    { id: 'custom', name: 'Custom Message', icon: MessageSquare, color: 'text-purple-600' },
  ];

  const upcomingBirthdays = customers.filter(customer => {
    if (!customer.birthday) return false;
    const birthday = new Date(customer.birthday);
    const today = new Date();
    const nextBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7;
  });

  const handleSendMessage = () => {
    if (selectedCustomers.length === 0) {
      alert('Please select at least one customer');
      return;
    }

    const message = selectedTemplate 
      ? templates.find(t => t.id === selectedTemplate)?.message || ''
      : customMessage;

    if (!message.trim()) {
      alert('Please enter a message or select a template');
      return;
    }

    onSendMessage(selectedCustomers, message, messageType);
    setSelectedCustomers([]);
    setCustomMessage('');
    setSelectedTemplate('');
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c.id));
    }
  };

  const messageHistory = [
    {
      id: '1',
      type: 'birthday',
      message: 'Happy Birthday! 🎉 We hope you have a wonderful day!',
      recipients: 5,
      sentAt: '2024-01-15T10:30:00Z',
      status: 'delivered'
    },
    {
      id: '2',
      type: 'promotion',
      message: 'Special offer: 20% off on all services this weekend!',
      recipients: 25,
      sentAt: '2024-01-14T14:00:00Z',
      status: 'delivered'
    },
    {
      id: '3',
      type: 'reminder',
      message: 'Its been a while since your last visit. Book your next appointment!',
      recipients: 12,
      sentAt: '2024-01-13T09:15:00Z',
      status: 'pending'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Communication Center</h1>
        <p className="text-gray-600">Send WhatsApp messages to your customers</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
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
          {activeTab === 'send' && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-orange-900">Upcoming Birthdays</h3>
                      <p className="text-sm text-orange-700">{upcomingBirthdays.length} customers</p>
                    </div>
                    <Gift className="h-8 w-8 text-orange-600" />
                  </div>
                  <button 
                    onClick={() => {
                      setMessageType('birthday');
                      setSelectedCustomers(upcomingBirthdays.map(c => c.id));
                    }}
                    className="mt-3 w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors text-sm"
                  >
                    Send Birthday Wishes
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-blue-900">Service Reminders</h3>
                      <p className="text-sm text-blue-700">Due customers</p>
                    </div>
                    <Bell className="h-8 w-8 text-blue-600" />
                  </div>
                  <button 
                    onClick={() => setMessageType('reminder')}
                    className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Send Reminders
                  </button>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-green-900">Bulk Promotion</h3>
                      <p className="text-sm text-green-700">All customers</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <button 
                    onClick={() => {
                      setMessageType('promotion');
                      setSelectedCustomers(customers.map(c => c.id));
                    }}
                    className="mt-3 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Send Promotion
                  </button>
                </div>
              </div>

              {/* Message Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Message Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {messageTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setMessageType(type.id)}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        messageType === type.id
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <type.icon className={`h-6 w-6 ${type.color} mb-2`} />
                      <p className="font-medium text-gray-900 text-sm">{type.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Message Content</label>
                  
                  {/* Template Selection */}
                  {templates.filter(t => t.type === messageType).length > 0 && (
                    <div className="mb-4">
                      <select
                        value={selectedTemplate}
                        onChange={(e) => {
                          setSelectedTemplate(e.target.value);
                          if (e.target.value) {
                            const template = templates.find(t => t.id === e.target.value);
                            setCustomMessage(template?.message || '');
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a template...</option>
                        {templates
                          .filter(t => t.type === messageType)
                          .map(template => (
                            <option key={template.id} value={template.id}>
                              {template.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex justify-between mt-2">
                    <span className={`text-sm ${customMessage.length > 160 ? 'text-red-600' : 'text-gray-500'}`}>
                      {customMessage.length}/160 characters
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Recipients ({selectedCustomers.length})
                    </label>
                    <button
                      onClick={handleSelectAll}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {selectedCustomers.length === customers.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    {customers.map((customer) => (
                      <label key={customer.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCustomers([...selectedCustomers, customer.id]);
                            } else {
                              setSelectedCustomers(selectedCustomers.filter(id => id !== customer.id));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-500">{customer.mobile}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Send Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSendMessage}
                  disabled={selectedCustomers.length === 0 || !customMessage.trim()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Send Message ({selectedCustomers.length})
                </button>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Message Templates</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Add Template
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        template.type === 'birthday' ? 'bg-orange-100 text-orange-800' :
                        template.type === 'reminder' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {template.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.message}</p>
                    <div className="flex justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                      <button className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Message History</h3>
              
              <div className="space-y-4">
                {messageHistory.map((message) => (
                  <div key={message.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs rounded-full mr-3 ${
                          message.type === 'birthday' ? 'bg-orange-100 text-orange-800' :
                          message.type === 'reminder' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {message.type}
                        </span>
                        <span className="text-sm text-gray-600">
                          {new Date(message.sentAt).toLocaleDateString()} at {new Date(message.sentAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {message.status === 'delivered' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : message.status === 'pending' ? (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="ml-2 text-sm text-gray-600 capitalize">{message.status}</span>
                      </div>
                    </div>
                    <p className="text-gray-900 mb-2">{message.message}</p>
                    <p className="text-sm text-gray-600">Sent to {message.recipients} recipients</p>
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

export default Communication;