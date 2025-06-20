import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Customer, Campaign, WhatsAppTemplate, Analytics, UserProfile } from '../types';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export class SupabaseService {
  // Customer operations
  static async getCustomers(): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(row => ({
        id: row.id,
        name: row.name,
        mobile: row.mobile,
        visitDate: row.visit_date,
        services: row.services,
        paymentAmount: row.payment_amount,
        birthday: row.birthday,
        notes: row.notes,
        createdAt: row.created_at,
        syncStatus: 'synced'
      }));
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  static async createCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          name: customer.name,
          mobile: customer.mobile,
          visit_date: customer.visitDate,
          services: customer.services,
          payment_amount: customer.paymentAmount,
          birthday: customer.birthday,
          notes: customer.notes,
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        mobile: data.mobile,
        visitDate: data.visit_date,
        services: data.services,
        paymentAmount: data.payment_amount,
        birthday: data.birthday,
        notes: data.notes,
        createdAt: data.created_at,
        syncStatus: 'synced'
      };
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  static async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.mobile) dbUpdates.mobile = updates.mobile;
      if (updates.visitDate) dbUpdates.visit_date = updates.visitDate;
      if (updates.services) dbUpdates.services = updates.services;
      if (updates.paymentAmount !== undefined) dbUpdates.payment_amount = updates.paymentAmount;
      if (updates.birthday) dbUpdates.birthday = updates.birthday;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      const { data, error } = await supabase
        .from('customers')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        mobile: data.mobile,
        visitDate: data.visit_date,
        services: data.services,
        paymentAmount: data.payment_amount,
        birthday: data.birthday,
        notes: data.notes,
        createdAt: data.created_at,
        syncStatus: 'synced'
      };
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  static async deleteCustomer(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  // Analytics operations
  static async getAnalytics(): Promise<Analytics> {
    try {
      const { data: customers, error } = await supabase
        .from('customers')
        .select('*');

      if (error) throw error;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const customersData = customers || [];

      // Calculate metrics
      const todayCustomers = customersData.filter(c => 
        new Date(c.visit_date) >= today
      );
      const todayRevenue = todayCustomers.reduce((sum, c) => sum + c.payment_amount, 0);

      const weeklyCustomers = customersData.filter(c => 
        new Date(c.visit_date) >= weekAgo
      );
      const weeklyRevenue = weeklyCustomers.reduce((sum, c) => sum + c.payment_amount, 0);

      const monthlyCustomers = customersData.filter(c => 
        new Date(c.visit_date) >= monthAgo
      );
      const monthlyRevenue = monthlyCustomers.reduce((sum, c) => sum + c.payment_amount, 0);

      // Calculate popular services
      const serviceCount: { [key: string]: number } = {};
      customersData.forEach(customer => {
        customer.services.forEach(service => {
          serviceCount[service] = (serviceCount[service] || 0) + 1;
        });
      });

      const popularServices = Object.entries(serviceCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Get upcoming birthdays
      const upcomingBirthdays = customersData
        .filter(customer => {
          if (!customer.birthday) return false;
          const birthday = new Date(customer.birthday);
          const today = new Date();
          const nextBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
          if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
          }
          const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntil <= 7;
        })
        .map(customer => ({
          name: customer.name,
          birthday: customer.birthday,
          mobile: customer.mobile
        }));

      return {
        todayCustomers: todayCustomers.length,
        todayRevenue,
        weeklyCustomers: weeklyCustomers.length,
        weeklyRevenue,
        monthlyCustomers: monthlyCustomers.length,
        monthlyRevenue,
        popularServices,
        upcomingBirthdays
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  // Authentication
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  static async signUp(email: string, password: string, metadata?: any) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  static async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // User Profile
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        shopName: data.shop_name,
        currency: data.currency,
        currencySymbol: data.currency_symbol,
        subscriptionStatus: data.subscription_status,
        subscriptionEndDate: data.subscription_end_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }
}