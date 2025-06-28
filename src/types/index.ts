export interface Customer {
  id: string;
  userId: string;
  name: string;
  mobile: string;
  birthday?: string;
  notes?: string;
  totalVisits: number;
  totalSpent: number;
  lastVisitDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Visit {
  id: string;
  customerId: string;
  visitDate: string;
  services: string[];
  paymentAmount: number;
  notes?: string;
  createdAt: string;
}

// Combined type for displaying customer with their latest visit info
export interface CustomerWithLatestVisit extends Customer {
  latestVisit?: Visit;
  visits?: Visit[];
}

// Type for creating a new visit
export interface NewVisit {
  customerId: string;
  visitDate: string;
  services: string[];
  paymentAmount: number;
  notes?: string;
}

// Type for adding a new customer with their first visit
export interface NewCustomerWithVisit {
  customer: {
    name: string;
    mobile: string;
    birthday?: string;
    notes?: string;
  };
  visit: {
    visitDate: string;
    services: string[];
    paymentAmount: number;
    notes?: string;
  };
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Analytics {
  todayCustomers: number;
  todayRevenue: number;
  weeklyCustomers: number;
  weeklyRevenue: number;
  monthlyCustomers: number;
  monthlyRevenue: number;
  totalCustomers: number;
  averageVisitValue: number;
  popularServices: { name: string; count: number }[];
  upcomingBirthdays: { name: string; birthday: string; mobile: string }[];
  recentVisits: Visit[];
  topCustomers: { name: string; totalSpent: number; totalVisits: number }[];
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
  customers: CustomerWithLatestVisit[];
  visits: Visit[];
  campaigns: Campaign[];
  templates: WhatsAppTemplate[];
  analytics: Analytics | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
}
