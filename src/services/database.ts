import { supabase, handleSupabaseError, handleSuccess } from '../lib/supabase';
import type { Customer, CustomerWithLatestVisit, Visit, NewVisit, NewCustomerWithVisit, Campaign, WhatsAppTemplate, Analytics, Service } from '../types';

// Customer operations
export const customerService = {
  // Backward compatible version - works with old schema
  async getAll(userId?: string) {
    try {
      // Check if we're using new schema (has user_id) or old schema
      const query = supabase.from('customers').select('*');
      
      // If userId is provided, try to filter by user_id (new schema)
      if (userId) {
        try {
          const { data: testData } = await supabase
            .from('customers')
            .select('user_id')
            .limit(1);
          
          // If user_id column exists, use new schema approach
          if (testData !== null) {
            query.eq('user_id', userId);
          }
        } catch {
          // user_id column doesn't exist, use old schema
        }
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) return handleSupabaseError(error);
      
      // Convert to new format while maintaining backward compatibility
      const convertedData: CustomerWithLatestVisit[] = [];
      
      for (const row of data || []) {
        // Check if this is old schema format
        if (row.visit_date && row.services && row.payment_amount !== undefined) {
          // Old schema - convert to new format
          convertedData.push({
            id: row.id,
            userId: row.user_id || 'legacy',
            name: row.name,
            mobile: row.mobile,
            birthday: row.birthday,
            notes: row.notes,
            totalVisits: 1, // Assume 1 visit for legacy data
            totalSpent: row.payment_amount,
            lastVisitDate: row.visit_date,
            createdAt: row.created_at,
            updatedAt: row.updated_at || row.created_at,
            visits: [{
              id: `legacy-${row.id}`,
              customerId: row.id,
              visitDate: row.visit_date,
              services: row.services,
              paymentAmount: row.payment_amount,
              notes: row.notes,
              createdAt: row.created_at
            }],
            latestVisit: {
              id: `legacy-${row.id}`,
              customerId: row.id,
              visitDate: row.visit_date,
              services: row.services,
              paymentAmount: row.payment_amount,
              notes: row.notes,
              createdAt: row.created_at
            }
          });
        } else {
          // New schema - fetch latest visit from visits table
          let latestVisit = undefined;
          
          try {
            const { data: visitData, error: visitError } = await supabase
              .from('visits')
              .select('*')
              .eq('customer_id', row.id)
              .order('visit_date', { ascending: false })
              .limit(1)
              .single();
            
            if (!visitError && visitData) {
              latestVisit = {
                id: visitData.id,
                customerId: visitData.customer_id,
                visitDate: visitData.visit_date,
                services: visitData.services,
                paymentAmount: visitData.payment_amount,
                notes: visitData.notes,
                createdAt: visitData.created_at
              };
            }
          } catch {
            // No visits found or error - leave latestVisit as undefined
          }
          
          convertedData.push({
            id: row.id,
            userId: row.user_id || 'legacy',
            name: row.name,
            mobile: row.mobile,
            birthday: row.birthday,
            notes: row.notes,
            totalVisits: row.total_visits || 0,
            totalSpent: row.total_spent || 0,
            lastVisitDate: row.last_visit_date,
            createdAt: row.created_at,
            updatedAt: row.updated_at || row.created_at,
            visits: [],
            latestVisit: latestVisit
          });
        }
      }
      
      return handleSuccess(convertedData);
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async findByMobile(userId: string, mobile: string) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .eq('mobile', mobile)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No customer found
          return handleSuccess(null);
        }
        return handleSupabaseError(error);
      }
      
      const convertedData = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        mobile: data.mobile,
        birthday: data.birthday,
        notes: data.notes,
        totalVisits: data.total_visits,
        totalSpent: data.total_spent,
        lastVisitDate: data.last_visit_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      return handleSuccess(convertedData);
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  // Backward compatible create - handles both old and new data formats
  async create(userIdOrCustomerData: string | Omit<Customer, 'id' | 'createdAt'>, customerData?: NewCustomerWithVisit) {
    // Check if this is old API call (customerData directly) or new API call (userId + customerData)
    if (typeof userIdOrCustomerData === 'string' && customerData) {
      // New API format
      const userId = userIdOrCustomerData;
      return this.createWithVisits(userId, customerData);
    } else {
      // Old API format - convert to new format
      const oldCustomerData = userIdOrCustomerData as Omit<Customer, 'id' | 'createdAt'>;
      return this.createLegacy(oldCustomerData);
    }
  },

  async createLegacy(customerData: any) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          name: customerData.name,
          mobile: customerData.mobile,
          visit_date: customerData.visitDate,
          services: customerData.services,
          payment_amount: customerData.paymentAmount,
          birthday: customerData.birthday,
          notes: customerData.notes,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) return handleSupabaseError(error);
      
      // Convert back to expected format
      const convertedData = {
        id: data.id,
        userId: data.user_id || 'legacy',
        name: data.name,
        mobile: data.mobile,
        birthday: data.birthday,
        notes: data.notes,
        totalVisits: 1,
        totalSpent: data.payment_amount,
        lastVisitDate: data.visit_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at,
        latestVisit: {
          id: `legacy-${data.id}`,
          customerId: data.id,
          visitDate: data.visit_date,
          services: data.services,
          paymentAmount: data.payment_amount,
          notes: data.notes,
          createdAt: data.created_at
        }
      };
      
      return handleSuccess(convertedData);
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async createWithVisits(userId: string, customerData: NewCustomerWithVisit) {
    try {
      // Start a transaction to create customer and first visit
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert([{
          user_id: userId,
          name: customerData.customer.name,
          mobile: customerData.customer.mobile,
          birthday: customerData.customer.birthday,
          notes: customerData.customer.notes
        }])
        .select()
        .single();

      if (customerError) return handleSupabaseError(customerError);
      
      // Create the first visit
      const { data: visit, error: visitError } = await supabase
        .from('visits')
        .insert([{
          customer_id: customer.id,
          visit_date: customerData.visit.visitDate,
          services: customerData.visit.services,
          payment_amount: customerData.visit.paymentAmount,
          notes: customerData.visit.notes
        }])
        .select()
        .single();

      if (visitError) return handleSupabaseError(visitError);
      
      // Convert back to camelCase
      const convertedCustomer: CustomerWithLatestVisit = {
        id: customer.id,
        userId: customer.user_id,
        name: customer.name,
        mobile: customer.mobile,
        birthday: customer.birthday,
        notes: customer.notes,
        totalVisits: 1, // Will be updated by trigger
        totalSpent: customerData.visit.paymentAmount, // Will be updated by trigger
        lastVisitDate: customerData.visit.visitDate, // Will be updated by trigger
        createdAt: customer.created_at,
        updatedAt: customer.updated_at,
        latestVisit: {
          id: visit.id,
          customerId: visit.customer_id,
          visitDate: visit.visit_date,
          services: visit.services,
          paymentAmount: visit.payment_amount,
          notes: visit.notes,
          createdAt: visit.created_at
        }
      };
      
      return handleSuccess(convertedCustomer);
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
      if (updates.birthday !== undefined) dbUpdates.birthday = updates.birthday;
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
        userId: data.user_id,
        name: data.name,
        mobile: data.mobile,
        birthday: data.birthday,
        notes: data.notes,
        totalVisits: data.total_visits,
        totalSpent: data.total_spent,
        lastVisitDate: data.last_visit_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at
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

  async getUpcomingBirthdays(userId: string) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('name, birthday, mobile')
        .eq('user_id', userId)
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

// Visit operations
export const visitService = {
  async getAll(userId: string) {
    try {
      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          customers!inner (
            user_id,
            name
          )
        `)
        .eq('customers.user_id', userId)
        .order('visit_date', { ascending: false });

      if (error) return handleSupabaseError(error);
      
      // Convert snake_case to camelCase
      const convertedData = (data || []).map(row => ({
        id: row.id,
        customerId: row.customer_id,
        visitDate: row.visit_date,
        services: row.services,
        paymentAmount: row.payment_amount,
        notes: row.notes,
        createdAt: row.created_at
      }));
      
      return handleSuccess(convertedData);
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async getByCustomer(customerId: string) {
    try {
      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .eq('customer_id', customerId)
        .order('visit_date', { ascending: false });

      if (error) return handleSupabaseError(error);
      
      // Convert snake_case to camelCase
      const convertedData = (data || []).map(row => ({
        id: row.id,
        customerId: row.customer_id,
        visitDate: row.visit_date,
        services: row.services,
        paymentAmount: row.payment_amount,
        notes: row.notes,
        createdAt: row.created_at
      }));
      
      return handleSuccess(convertedData);
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async create(visitData: NewVisit) {
    try {
      const { data, error } = await supabase
        .from('visits')
        .insert([{
          customer_id: visitData.customerId,
          visit_date: visitData.visitDate,
          services: visitData.services,
          payment_amount: visitData.paymentAmount,
          notes: visitData.notes
        }])
        .select()
        .single();

      if (error) return handleSupabaseError(error);
      
      // Convert back to camelCase
      const convertedData = {
        id: data.id,
        customerId: data.customer_id,
        visitDate: data.visit_date,
        services: data.services,
        paymentAmount: data.payment_amount,
        notes: data.notes,
        createdAt: data.created_at
      };
      
      return handleSuccess(convertedData);
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async update(id: string, updates: Partial<Visit>) {
    try {
      // Convert camelCase to snake_case for database
      const dbUpdates: any = {};
      if (updates.visitDate) dbUpdates.visit_date = updates.visitDate;
      if (updates.services) dbUpdates.services = updates.services;
      if (updates.paymentAmount !== undefined) dbUpdates.payment_amount = updates.paymentAmount;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      const { data, error } = await supabase
        .from('visits')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) return handleSupabaseError(error);
      
      // Convert back to camelCase
      const convertedData = {
        id: data.id,
        customerId: data.customer_id,
        visitDate: data.visit_date,
        services: data.services,
        paymentAmount: data.payment_amount,
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
        .from('visits')
        .delete()
        .eq('id', id);

      if (error) return handleSupabaseError(error);
      return handleSuccess({ id });
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

// Calculate popular services from visits
      const { data: visitData, error: visitError } = await supabase
        .from('visits')
        .select('services')
        .neq('services', '{}');
      
      if (visitError) return handleSupabaseError(visitError);
      
      const serviceCount: { [key: string]: number } = {};
      visitData.forEach(visit = {
        visit.services.forEach(service = {
          serviceCount[service] = (serviceCount[service] || 0) + 1;
        });
      });

      const popularServices = Object.entries(serviceCount)
        .map(([name, count]) = ({ name, count }))
        .sort((a, b) = b.count - a.count)
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

// Service operations
export const serviceService = {
  async getAll(userId: string) {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) return handleSupabaseError(error);
      
      // Convert snake_case to camelCase
      const convertedData = (data || []).map(row => ({
        id: row.id,
        name: row.name,
        price: row.price,
        duration: row.duration,
        description: row.description,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      
      return handleSuccess(convertedData);
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async create(userId: string, serviceData: Omit<Service, 'id'>) {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([{
          user_id: userId,
          name: serviceData.name,
          price: serviceData.price,
          duration: serviceData.duration,
          description: serviceData.description,
          is_active: true
        }])
        .select()
        .single();

      if (error) return handleSupabaseError(error);
      
      // Convert back to camelCase
      const convertedData = {
        id: data.id,
        name: data.name,
        price: data.price,
        duration: data.duration,
        description: data.description,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      return handleSuccess(convertedData);
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async update(serviceId: string, updates: Partial<Service>) {
    try {
      // Convert camelCase to snake_case for database
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      const { data, error } = await supabase
        .from('services')
        .update(dbUpdates)
        .eq('id', serviceId)
        .select()
        .single();

      if (error) return handleSupabaseError(error);
      
      // Convert back to camelCase
      const convertedData = {
        id: data.id,
        name: data.name,
        price: data.price,
        duration: data.duration,
        description: data.description,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      return handleSuccess(convertedData);
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async delete(serviceId: string) {
    try {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', serviceId);

      if (error) return handleSupabaseError(error);
      return handleSuccess({ id: serviceId });
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async getActive(userId: string) {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('name');

      if (error) return handleSupabaseError(error);
      
      // Convert snake_case to camelCase
      const convertedData = (data || []).map(row => ({
        id: row.id,
        name: row.name,
        price: row.price,
        duration: row.duration,
        description: row.description
      }));
      
      return handleSuccess(convertedData);
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

