import { supabase, handleSupabaseError, handleSuccess } from '../lib/supabase';
import type { Customer, Campaign, WhatsAppTemplate, Analytics } from '../types';

// Customer operations
export const customerService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return handleSupabaseError(error);
      
      // Convert snake_case to camelCase
      const convertedData = (data || []).map(row => ({
        id: row.id,
        name: row.name,
        mobile: row.mobile,
        visitDate: row.visit_date,
        services: row.services,
        paymentAmount: row.payment_amount,
        birthday: row.birthday,
        notes: row.notes,
        createdAt: row.created_at
      }));
      
      return handleSuccess(convertedData);
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async create(customer: Omit<Customer, 'id' | 'createdAt'>) {
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
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) return handleSupabaseError(error);
      
      // Convert back to camelCase
      const convertedData = {
        id: data.id,
        name: data.name,
        mobile: data.mobile,
        visitDate: data.visit_date,
        services: data.services,
        paymentAmount: data.payment_amount,
        birthday: data.birthday,
        notes: data.notes,
        createdAt: data.created_at
      };
      
      return handleSuccess(convertedData);
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async update(id: string, updates: Partial<Customer>) {
    try {
      // Convert camelCase to snake_case for database
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

      if (error) return handleSupabaseError(error);
      
      // Convert back to camelCase
      const convertedData = {
        id: data.id,
        name: data.name,
        mobile: data.mobile,
        visitDate: data.visit_date,
        services: data.services,
        paymentAmount: data.payment_amount,
        birthday: data.birthday,
        notes: data.notes,
        createdAt: data.created_at
      };
      
      return handleSuccess(convertedData);
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) return handleSupabaseError(error);
      return handleSuccess({ id });
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async getUpcomingBirthdays() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('name, birthday, mobile')
        .not('birthday', 'is', null);

      if (error) return handleSupabaseError(error);

      // Filter birthdays in the next 7 days
      const upcomingBirthdays = (data || []).filter(customer => {
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

      return handleSuccess(upcomingBirthdays);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }
};

// Campaign operations
export const campaignService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return handleSupabaseError(error);
      
      // Convert snake_case to camelCase
      const convertedData = (data || []).map(row => ({
        id: row.id,
        name: row.name,
        message: row.message,
        targetSegment: row.target_segment,
        scheduledDate: row.scheduled_date,
        status: row.status,
        recipientCount: row.recipient_count,
        createdAt: row.created_at
      }));
      
      return handleSuccess(convertedData);
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async create(campaign: Omit<Campaign, 'id' | 'createdAt'>) {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([{
          name: campaign.name,
          message: campaign.message,
          target_segment: campaign.targetSegment,
          scheduled_date: campaign.scheduledDate,
          status: campaign.status,
          recipient_count: campaign.recipientCount,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) return handleSupabaseError(error);
      
      // Convert back to camelCase
      const convertedData = {
        id: data.id,
        name: data.name,
        message: data.message,
        targetSegment: data.target_segment,
        scheduledDate: data.scheduled_date,
        status: data.status,
        recipientCount: data.recipient_count,
        createdAt: data.created_at
      };
      
      return handleSuccess(convertedData);
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async update(id: string, updates: Partial<Campaign>) {
    try {
      // Convert camelCase to snake_case for database
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.message) dbUpdates.message = updates.message;
      if (updates.targetSegment) dbUpdates.target_segment = updates.targetSegment;
      if (updates.scheduledDate) dbUpdates.scheduled_date = updates.scheduledDate;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.recipientCount !== undefined) dbUpdates.recipient_count = updates.recipientCount;

      const { data, error } = await supabase
        .from('campaigns')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) return handleSupabaseError(error);
      
      // Convert back to camelCase
      const convertedData = {
        id: data.id,
        name: data.name,
        message: data.message,
        targetSegment: data.target_segment,
        scheduledDate: data.scheduled_date,
        status: data.status,
        recipientCount: data.recipient_count,
        createdAt: data.created_at
      };
      
      return handleSuccess(convertedData);
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) return handleSupabaseError(error);
      return handleSuccess({ id });
    } catch (error) {
      return handleSupabaseError(error);
    }
  }
};

// WhatsApp Template operations
export const templateService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .order('name');

      if (error) return handleSupabaseError(error);
      return handleSuccess(data || []);
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async create(template: Omit<WhatsAppTemplate, 'id'>) {
    try {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .insert([template])
        .select()
        .single();

      if (error) return handleSupabaseError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async update(id: string, updates: Partial<WhatsAppTemplate>) {
    try {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) return handleSupabaseError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('whatsapp_templates')
        .delete()
        .eq('id', id);

      if (error) return handleSupabaseError(error);
      return handleSuccess({ id });
    } catch (error) {
      return handleSupabaseError(error);
    }
  }
};

// Analytics operations
export const analyticsService = {
  async getAnalytics(): Promise<{ success: boolean; data?: Analytics; error?: string }> {
    try {
      // Get all customers
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*');

      if (customersError) return handleSupabaseError(customersError);

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const customersData = customers || [];

      // Calculate today's metrics (using database field names)
      const todayCustomers = customersData.filter(c => 
        new Date(c.visit_date) >= today
      );
      const todayRevenue = todayCustomers.reduce((sum, c) => sum + c.payment_amount, 0);

      // Calculate weekly metrics
      const weeklyCustomers = customersData.filter(c => 
        new Date(c.visit_date) >= weekAgo
      );
      const weeklyRevenue = weeklyCustomers.reduce((sum, c) => sum + c.payment_amount, 0);

      // Calculate monthly metrics
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
      const upcomingBirthdaysResult = await customerService.getUpcomingBirthdays();
      const upcomingBirthdays = upcomingBirthdaysResult.success ? upcomingBirthdaysResult.data : [];

      const analytics: Analytics = {
        todayCustomers: todayCustomers.length,
        todayRevenue,
        weeklyCustomers: weeklyCustomers.length,
        weeklyRevenue,
        monthlyCustomers: monthlyCustomers.length,
        monthlyRevenue,
        popularServices,
        upcomingBirthdays
      };

      return handleSuccess(analytics);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }
};

// User Profile operations
export const userProfileService = {
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) return handleSupabaseError(error);
      
      // Convert snake_case to camelCase
      const convertedData = {
        id: data.id,
        shopName: data.shop_name,
        currency: data.currency,
        currencySymbol: data.currency_symbol,
        subscriptionStatus: data.subscription_status,
        subscriptionEndDate: data.subscription_end_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      return handleSuccess(convertedData);
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async updateProfile(userId: string, updates: Partial<any>) {
    try {
      // Convert camelCase to snake_case for database
      const dbUpdates: any = {};
      if (updates.shopName) dbUpdates.shop_name = updates.shopName;
      if (updates.currency) dbUpdates.currency = updates.currency;
      if (updates.currencySymbol) dbUpdates.currency_symbol = updates.currencySymbol;
      if (updates.subscriptionStatus) dbUpdates.subscription_status = updates.subscriptionStatus;
      if (updates.subscriptionEndDate !== undefined) dbUpdates.subscription_end_date = updates.subscriptionEndDate;

      const { data, error } = await supabase
        .from('user_profiles')
        .update(dbUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) return handleSupabaseError(error);
      
      // Convert back to camelCase
      const convertedData = {
        id: data.id,
        shopName: data.shop_name,
        currency: data.currency,
        currencySymbol: data.currency_symbol,
        subscriptionStatus: data.subscription_status,
        subscriptionEndDate: data.subscription_end_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      return handleSuccess(convertedData);
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async createProfile(userId: string, profileData: any) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{
          id: userId,
          shop_name: profileData.shopName || 'My Barber Shop',
          currency: profileData.currency || 'USD',
          currency_symbol: profileData.currencySymbol || '$',
          subscription_status: profileData.subscriptionStatus || 'free',
          subscription_end_date: profileData.subscriptionEndDate || null
        }])
        .select()
        .single();

      if (error) return handleSupabaseError(error);
      
      // Convert back to camelCase
      const convertedData = {
        id: data.id,
        shopName: data.shop_name,
        currency: data.currency,
        currencySymbol: data.currency_symbol,
        subscriptionStatus: data.subscription_status,
        subscriptionEndDate: data.subscription_end_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      return handleSuccess(convertedData);
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async checkPremiumAccess(userId: string) {
    try {
      const { data, error } = await supabase
        .rpc('has_premium_access', { user_id: userId });

      if (error) return handleSupabaseError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }
};

// App Settings operations
export const settingsService = {
  async getSetting(userId: string, key: string) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('user_id', userId)
        .eq('setting_key', key)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned, setting doesn't exist
          return handleSuccess(null);
        }
        return handleSupabaseError(error);
      }
      
      // Convert snake_case to camelCase
      const convertedData = {
        id: data.id,
        userId: data.user_id,
        settingKey: data.setting_key,
        settingValue: data.setting_value,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      return handleSuccess(convertedData);
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async getAllSettings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('user_id', userId);

      if (error) return handleSupabaseError(error);
      
      // Convert snake_case to camelCase
      const convertedData = (data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        settingKey: row.setting_key,
        settingValue: row.setting_value,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      
      return handleSuccess(convertedData);
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async setSetting(userId: string, key: string, value: string) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .upsert({
          user_id: userId,
          setting_key: key,
          setting_value: value
        })
        .select()
        .single();

      if (error) return handleSupabaseError(error);
      
      // Convert back to camelCase
      const convertedData = {
        id: data.id,
        userId: data.user_id,
        settingKey: data.setting_key,
        settingValue: data.setting_value,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      return handleSuccess(convertedData);
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async deleteSetting(userId: string, key: string) {
    try {
      const { error } = await supabase
        .from('app_settings')
        .delete()
        .eq('user_id', userId)
        .eq('setting_key', key);

      if (error) return handleSupabaseError(error);
      return handleSuccess({ key });
    } catch (error) {
      return handleSupabaseError(error);
    }
  }
};

// Initialize default templates (run once)
export const initializeDefaultData = async () => {
  try {
    // Check if templates already exist
    const templatesResult = await templateService.getAll();
    if (!templatesResult.success || templatesResult.data.length > 0) {
      return;
    }

    // Create default templates
    const defaultTemplates: Omit<WhatsAppTemplate, 'id'>[] = [
      {
        name: 'Birthday Wishes',
        message: '🎂 Happy Birthday {name}! We hope you have a wonderful day. Enjoy a special discount on your next visit!',
        type: 'birthday'
      },
      {
        name: 'Service Reminder',
        message: 'Hi {name}! It\'s been a while since your last visit. Time for a fresh new look? Book your appointment today!',
        type: 'reminder'
      },
      {
        name: 'Monthly Promotion',
        message: '⭐ Special offer this month! Get 20% off on all premium services. Don\'t miss out!',
        type: 'promotion'
      }
    ];

    for (const template of defaultTemplates) {
      await templateService.create(template);
    }

    console.log('Default templates initialized successfully');
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
};

