export interface Customer {
  id: string;
  name: string;
  mobile: string;
  visitDate: string;
  services: string[];
  paymentAmount: number;
  birthday?: string;
  notes?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
}

export interface Analytics {
  todayCustomers: number;
  todayRevenue: number;
  weeklyCustomers: number;
  weeklyRevenue: number;
  monthlyCustomers: number;
  monthlyRevenue: number;
  popularServices: { name: string; count: number }[];
  upcomingBirthdays: { name: string; birthday: string; mobile: string }[];
}

export interface Campaign {
  id: string;
  name: string;
  message: string;
  targetSegment: string;
  scheduledDate?: string;
  status: 'draft' | 'scheduled' | 'sent';
  recipientCount: number;
  createdAt: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  message: string;
  type: 'birthday' | 'reminder' | 'promotion';
}

// Database response types
export interface DatabaseResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// User profile and subscription types
export interface UserProfile {
  id: string;
  shopName: string;
  currency: string;
  currencySymbol: string;
  subscriptionStatus: 'free' | 'premium' | 'pro';
  subscriptionEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSetting {
  id: string;
  userId: string;
  settingKey: string;
  settingValue: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopSettings {
  shopName: string;
  currency: string;
  currencySymbol: string;
  theme?: string;
  notifications?: boolean;
}

export interface SubscriptionInfo {
  status: 'free' | 'premium' | 'pro';
  endDate?: string;
  features: string[];
}

// Loading and error states
export interface AppState {
  customers: Customer[];
  campaigns: Campaign[];
  templates: WhatsAppTemplate[];
  analytics: Analytics | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
}
