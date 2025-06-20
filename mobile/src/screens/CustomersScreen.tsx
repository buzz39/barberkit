import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Customer } from '../types';
import { SupabaseService } from '../services/SupabaseService';
import { LocalStorageService } from '../services/LocalStorageService';
import { SyncService } from '../services/SyncService';
import { CustomerCard } from '../components/customer/CustomerCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { FloatingActionButton } from '../components/common/FloatingActionButton';

interface CustomersScreenProps {
  navigation: any;
}

export const CustomersScreen: React.FC<CustomersScreenProps> = ({ navigation }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const loadCustomers = useCallback(async (forceRefresh = false) => {
    try {
      // Load from local storage first
      const localCustomers = await LocalStorageService.getCustomers();
      setCustomers(localCustomers);
      setLoading(false);

      // Sync with server if online
      if (SyncService.getNetworkStatus()) {
        if (forceRefresh) {
          await SyncService.syncFromServer();
        }
        await SyncService.syncPendingOperations();
        
        // Reload local data after sync
        const updatedCustomers = await LocalStorageService.getCustomers();
        setCustomers(updatedCustomers);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      Alert.alert('Error', 'Failed to load customers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchQuery, selectedFilter]);

  const filterCustomers = () => {
    let filtered = customers;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.mobile.includes(searchQuery)
      );
    }

    // Apply category filter
    switch (selectedFilter) {
      case 'recent':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filtered = filtered.filter(customer =>
          new Date(customer.visitDate) >= thirtyDaysAgo
        );
        break;
      case 'birthday':
        const currentMonth = new Date().getMonth();
        filtered = filtered.filter(customer =>
          customer.birthday && new Date(customer.birthday).getMonth() === currentMonth
        );
        break;
      case 'pending':
        filtered = filtered.filter(customer => customer.syncStatus === 'pending');
        break;
    }

    setFilteredCustomers(filtered);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCustomers(true);
  }, [loadCustomers]);

  const handleEditCustomer = (customer: Customer) => {
    navigation.navigate('EditCustomer', { customer });
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      // Delete from local storage
      await LocalStorageService.deleteCustomer(id);
      
      // Queue for server sync
      await SyncService.queueOperation('customers', 'delete', { id });
      
      // Update local state
      setCustomers(prev => prev.filter(c => c.id !== id));
      
      Alert.alert('Success', 'Customer deleted successfully');
    } catch (error) {
      console.error('Error deleting customer:', error);
      Alert.alert('Error', 'Failed to delete customer');
    }
  };

  const FilterButton = ({ filter, title, count }: any) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter && styles.filterButtonTextActive
      ]}>
        {title} {count !== undefined && `(${count})`}
      </Text>
    </TouchableOpacity>
  );

  const renderCustomer = ({ item }: { item: Customer }) => (
    <CustomerCard
      customer={item}
      onEdit={handleEditCustomer}
      onDelete={handleDeleteCustomer}
      currencySymbol="$"
    />
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="people-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyStateTitle}>No customers found</Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery || selectedFilter !== 'all'
          ? 'Try adjusting your search or filter'
          : 'Add your first customer to get started'
        }
      </Text>
      {!searchQuery && selectedFilter === 'all' && (
        <TouchableOpacity
          style={styles.emptyStateButton}
          onPress={() => navigation.navigate('AddCustomer')}
        >
          <Text style={styles.emptyStateButtonText}>Add Customer</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && customers.length === 0) {
    return <LoadingSpinner message="Loading customers..." />;
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="clear" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filtersContainer}>
        <FilterButton filter="all" title="All" count={customers.length} />
        <FilterButton 
          filter="recent" 
          title="Recent" 
          count={customers.filter(c => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return new Date(c.visitDate) >= thirtyDaysAgo;
          }).length}
        />
        <FilterButton 
          filter="birthday" 
          title="Birthday" 
          count={customers.filter(c => 
            c.birthday && new Date(c.birthday).getMonth() === new Date().getMonth()
          ).length}
        />
        <FilterButton 
          filter="pending" 
          title="Pending Sync" 
          count={customers.filter(c => c.syncStatus === 'pending').length}
        />
      </View>

      {/* Customer List */}
      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomer}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={filteredCustomers.length === 0 ? styles.emptyContainer : undefined}
      />

      <FloatingActionButton
        onPress={() => navigation.navigate('AddCustomer')}
        icon="person-add"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});