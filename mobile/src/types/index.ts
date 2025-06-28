export interface Customer {
  id: string;
  name: string;
  mobile: string;
  visitDate: string;
  services: string[];
  paymentAmount: number;
  birthday?: string;
  notes?: string;
  photoUri?: string;
  createdAt: string;
  updatedAt?: string;
  syncStatus?: 'synced' | 'pending' | 'conflict';
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
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

export interface SyncOperation {
  id: string;
  table: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  synced: boolean;
}

export interface NotificationPayload {
  type: 'birthday' | 'appointment' | 'campaign' | 'general';
  title: string;
  body: string;
  data?: any;
}

export interface AppState {
  isOnline: boolean;
  isLoading: boolean;
  user: any;
  customers: Customer[];
  analytics: Analytics | null;
  campaigns: Campaign[];
  templates: WhatsAppTemplate[];
  userProfile: UserProfile | null;
  syncQueue: SyncOperation[];
}