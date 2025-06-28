import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Customer } from '../../types';
import { Linking } from 'react-native';

interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  currencySymbol?: string;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onEdit,
  onDelete,
  currencySymbol = '$'
}) => {
  const handleCall = () => {
    const phoneNumber = customer.mobile.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleWhatsApp = () => {
    const phoneNumber = customer.mobile.replace(/[^\d]/g, '');
    const url = `whatsapp://send?phone=${phoneNumber}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://wa.me/${phoneNumber}`);
      }
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${customer.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(customer.id) }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getSyncStatusColor = () => {
    switch (customer.syncStatus) {
      case 'pending': return '#F59E0B';
      case 'conflict': return '#EF4444';
      default: return '#10B981';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onEdit(customer)}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {customer.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.customerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{customer.name}</Text>
            {customer.syncStatus !== 'synced' && (
              <View style={[styles.syncIndicator, { backgroundColor: getSyncStatusColor() }]} />
            )}
          </View>
          <Text style={styles.mobile}>{customer.mobile}</Text>
          <Text style={styles.visitDate}>
            Last visit: {formatDate(customer.visitDate)}
          </Text>
        </View>
      </View>

      <View style={styles.services}>
        {customer.services.map((service, index) => (
          <View key={index} style={styles.serviceTag}>
            <Text style={styles.serviceText}>{service}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.amount}>
          {currencySymbol}{customer.paymentAmount.toFixed(2)}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <Icon name="phone" size={20} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleWhatsApp}>
            <Icon name="chat" size={20} color="#25D366" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(customer)}>
            <Icon name="edit" size={20} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <Icon name="delete" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {customer.birthday && (
        <View style={styles.birthdayIndicator}>
          <Icon name="cake" size={16} color="#F59E0B" />
          <Text style={styles.birthdayText}>
            Birthday: {formatDate(customer.birthday)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  customerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  syncIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  mobile: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  visitDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  services: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  serviceTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  serviceText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  birthdayIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  birthdayText: {
    fontSize: 12,
    color: '#F59E0B',
    marginLeft: 4,
    fontWeight: '500',
  },
});