import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Analytics } from '../types';
import { SupabaseService } from '../services/SupabaseService';
import { LocalStorageService } from '../services/LocalStorageService';
import { SyncService } from '../services/SyncService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { FloatingActionButton } from '../components/common/FloatingActionButton';

const { width } = Dimensions.get('window');

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(SyncService.getNetworkStatus());

  const loadAnalytics = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        // Try to load cached data first
        const cachedAnalytics = await LocalStorageService.getCachedAnalytics();
        if (cachedAnalytics) {
          setAnalytics(cachedAnalytics);
          setLoading(false);
        }
      }

      // Load fresh data if online
      if (SyncService.getNetworkStatus()) {
        const freshAnalytics = await SupabaseService.getAnalytics();
        setAnalytics(freshAnalytics);
        await LocalStorageService.cacheAnalytics(freshAnalytics);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
    
    // Set up network status monitoring
    const interval = setInterval(() => {
      setIsOnline(SyncService.getNetworkStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, [loadAnalytics]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAnalytics(true);
  }, [loadAnalytics]);

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const StatCard = ({ title, value, icon, color, onPress }: any) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.statContent}>
        <View style={styles.statText}>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={styles.statValue}>{value}</Text>
        </View>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Icon name={icon} size={24} color="white" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const QuickAction = ({ icon, title, onPress, color }: any) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Icon name={icon} size={24} color="white" />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading && !analytics) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back! 👋</Text>
            <Text style={styles.subtitle}>Here's your business overview</Text>
          </View>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : '#EF4444' }]} />
            <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(analytics?.todayRevenue || 0)}
            icon="attach-money"
            color="#10B981"
            onPress={() => navigation.navigate('Analytics')}
          />
          <StatCard
            title="Today's Customers"
            value={analytics?.todayCustomers || 0}
            icon="people"
            color="#3B82F6"
            onPress={() => navigation.navigate('Customers')}
          />
          <StatCard
            title="Weekly Revenue"
            value={formatCurrency(analytics?.weeklyRevenue || 0)}
            icon="trending-up"
            color="#8B5CF6"
            onPress={() => navigation.navigate('Analytics')}
          />
          <StatCard
            title="Monthly Customers"
            value={analytics?.monthlyCustomers || 0}
            icon="calendar-today"
            color="#F59E0B"
            onPress={() => navigation.navigate('Analytics')}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              icon="person-add"
              title="Add Customer"
              color="#3B82F6"
              onPress={() => navigation.navigate('AddCustomer')}
            />
            <QuickAction
              icon="message"
              title="Send Message"
              color="#25D366"
              onPress={() => navigation.navigate('Communication')}
            />
            <QuickAction
              icon="campaign"
              title="Marketing"
              color="#8B5CF6"
              onPress={() => navigation.navigate('Marketing')}
            />
            <QuickAction
              icon="analytics"
              title="Analytics"
              color="#F59E0B"
              onPress={() => navigation.navigate('Analytics')}
            />
          </View>
        </View>

        {/* Popular Services */}
        {analytics?.popularServices && analytics.popularServices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Services</Text>
            <View style={styles.servicesList}>
              {analytics.popularServices.slice(0, 5).map((service, index) => (
                <View key={index} style={styles.serviceItem}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceCount}>{service.count} bookings</Text>
                  </View>
                  <View style={styles.serviceProgress}>
                    <View
                      style={[
                        styles.serviceProgressBar,
                        {
                          width: `${(service.count / (analytics.popularServices[0]?.count || 1)) * 100}%`
                        }
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Upcoming Birthdays */}
        {analytics?.upcomingBirthdays && analytics.upcomingBirthdays.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Birthdays 🎂</Text>
            <View style={styles.birthdaysList}>
              {analytics.upcomingBirthdays.map((customer, index) => (
                <TouchableOpacity key={index} style={styles.birthdayItem}>
                  <View style={styles.birthdayAvatar}>
                    <Text style={styles.birthdayAvatarText}>
                      {customer.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.birthdayInfo}>
                    <Text style={styles.birthdayName}>{customer.name}</Text>
                    <Text style={styles.birthdayDate}>
                      {new Date(customer.birthday).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.birthdayAction}>
                    <Icon name="cake" size={20} color="#F59E0B" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#3B82F6' }]}>
                <Icon name="person-add" size={16} color="white" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>New customer added</Text>
                <Text style={styles.activityTime}>2 minutes ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#10B981' }]}>
                <Icon name="attach-money" size={16} color="white" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Payment received</Text>
                <Text style={styles.activityTime}>15 minutes ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#8B5CF6' }]}>
                <Icon name="campaign" size={16} color="white" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Campaign sent</Text>
                <Text style={styles.activityTime}>1 hour ago</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FloatingActionButton
        onPress={() => navigation.navigate('AddCustomer')}
        icon="add"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statsGrid: {
    padding: 16,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statText: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: (width - 48) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  servicesList: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  serviceItem: {
    marginBottom: 16,
  },
  serviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  serviceCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  serviceProgress: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  serviceProgressBar: {
    height: 4,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  birthdaysList: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  birthdayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  birthdayAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  birthdayAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  birthdayInfo: {
    flex: 1,
  },
  birthdayName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  birthdayDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  birthdayAction: {
    padding: 8,
  },
  activityList: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});