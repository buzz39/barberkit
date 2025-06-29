import React from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Phone,
  Gift,
  Bell,
  ChevronRight,
  ArrowUp
} from 'lucide-react';
import type { Analytics } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';

interface DashboardProps {
  analytics: Analytics;
}

// Helper function to calculate time ago
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMins < 1) return 'Just now';
  if (diffInMins < 60) return `${diffInMins} min${diffInMins > 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

const Dashboard: React.FC<DashboardProps> = ({ analytics }) => {
  const { formatCurrency } = useCurrency();
  
  const stats = [
    {
      name: "Today's Customers",
      value: analytics.todayCustomers,
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      name: "Today's Revenue",
      value: formatCurrency(analytics.todayRevenue),
      change: '+8%',
      changeType: 'positive',
      icon: DollarSign,
      gradient: 'from-green-500 to-green-600'
    },
    {
      name: 'Weekly Customers',
      value: analytics.weeklyCustomers,
      change: '+23%',
      changeType: 'positive',
      icon: TrendingUp,
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Monthly Revenue',
      value: formatCurrency(analytics.monthlyRevenue),
      change: '+18%',
      changeType: 'positive',
      icon: Calendar,
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
            <p className="text-blue-100 text-lg">Here's what's happening at your barber shop today</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-blue-100">Today's Date</p>
              <p className="text-xl font-semibold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mb-3">{stat.value}</p>
                <div className="flex items-center">
                  <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium text-green-600 mr-1">{stat.change}</span>
                  <span className="text-sm text-gray-500">from last week</span>
                </div>
              </div>
              <div className={`bg-gradient-to-r ${stat.gradient} p-4 rounded-xl shadow-lg`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Services */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Popular Services</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {analytics.popularServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-4"></div>
                  <span className="text-gray-900 font-semibold">{service.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 font-medium mr-2">{service.count} bookings</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Birthdays */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Upcoming Birthdays</h3>
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-2 rounded-lg">
              <Gift className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="space-y-4">
            {analytics.upcomingBirthdays.length > 0 ? (
              analytics.upcomingBirthdays.map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl border border-orange-100">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-sm">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-600">{new Date(customer.birthday).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors">
                      <Phone className="h-4 w-4 text-orange-600" />
                    </button>
                    <button className="p-2 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors">
                      <Bell className="h-4 w-4 text-orange-600" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Gift className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No upcoming birthdays</p>
                <p className="text-gray-400 text-sm">Check back later for birthday notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Visits</h3>
        <div className="space-y-4">
          {analytics.recentVisits && analytics.recentVisits.length > 0 ? (
            analytics.recentVisits.slice(0, 5).map((visit, index) => {
              const visitDate = new Date(visit.visitDate);
              const timeAgo = getTimeAgo(visitDate);
              const gradients = [
                'from-blue-50 to-cyan-50 border-blue-500',
                'from-green-50 to-emerald-50 border-green-500', 
                'from-purple-50 to-pink-50 border-purple-500',
                'from-orange-50 to-yellow-50 border-orange-500',
                'from-indigo-50 to-blue-50 border-indigo-500'
              ];
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-indigo-500'];
              
              return (
                <div key={visit.id} className={`flex items-center p-4 bg-gradient-to-r ${gradients[index % gradients.length]} rounded-xl border-l-4`}>
                  <div className={`h-3 w-3 ${colors[index % colors.length]} rounded-full mr-4`}></div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-semibold">Visit completed</p>
                    <p className="text-sm text-gray-600">
                      {visit.services.join(', ')} • ₹{visit.paymentAmount}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">{timeAgo}</span>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-gray-400 text-xl">📋</span>
              </div>
              <p className="text-gray-500 font-medium">No recent visits</p>
              <p className="text-gray-400 text-sm">Recent customer visits will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;