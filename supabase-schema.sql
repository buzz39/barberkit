-- BarberKit Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create customers table (modified for visit history system)
CREATE TABLE customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL UNIQUE, -- Made unique to prevent duplicates
    birthday DATE,
    notes TEXT,
    total_visits INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    last_visit_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create visits table to track individual visits
CREATE TABLE visits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    visit_date TIMESTAMPTZ NOT NULL,
    services TEXT[] NOT NULL DEFAULT '{}',
    payment_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    target_segment VARCHAR(100) NOT NULL,
    scheduled_date TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'scheduled', 'sent')),
    recipient_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create whatsapp_templates table
CREATE TABLE whatsapp_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('birthday', 'reminder', 'promotion'))
);

-- Create indexes for better performance
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_birthday ON customers(birthday);
CREATE INDEX idx_customers_mobile ON customers(mobile);
CREATE INDEX idx_customers_last_visit ON customers(last_visit_date);
CREATE INDEX idx_visits_customer_id ON visits(customer_id);
CREATE INDEX idx_visits_date ON visits(visit_date);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_scheduled_date ON campaigns(scheduled_date);
CREATE INDEX idx_templates_type ON whatsapp_templates(type);

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (you can modify these based on your needs)
-- For now, we'll allow all operations for authenticated users

-- Customers policies
CREATE POLICY "Users can manage own customers" ON customers
    FOR ALL USING (auth.uid() = user_id);

-- Visits policies
CREATE POLICY "Users can manage visits for own customers" ON visits
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM customers 
            WHERE customers.id = visits.customer_id 
            AND customers.user_id = auth.uid()
        )
    );

-- Campaigns policies
CREATE POLICY "Allow all operations for authenticated users" ON campaigns
    FOR ALL USING (auth.role() = 'authenticated');

-- Templates policies
CREATE POLICY "Allow all operations for authenticated users" ON whatsapp_templates
    FOR ALL USING (auth.role() = 'authenticated');

-- If you want to allow anonymous access (for development), use these policies instead:
-- (Comment out the above policies and uncomment these)

-- CREATE POLICY "Allow all operations for everyone" ON customers FOR ALL USING (true);
-- CREATE POLICY "Allow all operations for everyone" ON campaigns FOR ALL USING (true);
-- CREATE POLICY "Allow all operations for everyone" ON whatsapp_templates FOR ALL USING (true);

-- Insert default WhatsApp templates
INSERT INTO whatsapp_templates (name, message, type) VALUES
('Birthday Wishes', '🎂 Happy Birthday {name}! We hope you have a wonderful day. Enjoy a special discount on your next visit!', 'birthday'),
('Service Reminder', 'Hi {name}! It''s been a while since your last visit. Time for a fresh new look? Book your appointment today!', 'reminder'),
('Monthly Promotion', '⭐ Special offer this month! Get 20% off on all premium services. Don''t miss out!', 'promotion');

-- Insert sample data (optional - for testing)
-- Note: Replace 'sample-user-id' with actual user ID when testing
-- INSERT INTO customers (user_id, name, mobile, birthday, notes, total_visits, total_spent, last_visit_date) VALUES
-- ('sample-user-id', 'John Doe', '+1 (555) 123-4567', '1990-01-20', 'Prefers short fade cuts', 1, 45.00, '2024-01-15T10:30:00Z'),
-- ('sample-user-id', 'Mike Johnson', '+1 (555) 987-6543', '1985-02-14', NULL, 1, 55.00, '2024-01-14T14:15:00Z'),
-- ('sample-user-id', 'David Wilson', '+1 (555) 456-7890', '1992-01-25', 'Allergic to certain hair products', 1, 35.00, '2024-01-13T16:45:00Z');

-- INSERT INTO visits (customer_id, visit_date, services, payment_amount) VALUES
-- ('customer-id-1', '2024-01-15T10:30:00Z', ARRAY['Haircut', 'Beard Trim'], 45.00),
-- ('customer-id-2', '2024-01-14T14:15:00Z', ARRAY['Haircut', 'Shave'], 55.00),
-- ('customer-id-3', '2024-01-13T16:45:00Z', ARRAY['Styling', 'Hair Wash'], 35.00);

-- Insert sample campaigns (optional - for testing)
INSERT INTO campaigns (name, message, target_segment, status, recipient_count) VALUES
('New Year Special Offer', '🎉 New Year Special! Get 20% off on all services this week. Book your appointment now!', 'all', 'sent', 45),
('Birthday Wishes January', '🎂 Happy Birthday! We hope you have a wonderful day. Enjoy a special 15% discount on your next visit!', 'birthday', 'sent', 8),
('Weekend Promotion', '⭐ Weekend Special: Premium styling package at 25% off. Available Saturday & Sunday only!', 'recent', 'scheduled', 23);

-- Create user_profiles table
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    shop_name VARCHAR(255) DEFAULT 'My Barber Shop',
    currency VARCHAR(10) DEFAULT 'USD',
    currency_symbol VARCHAR(5) DEFAULT '$',
    subscription_status VARCHAR(20) DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium', 'pro')),
    subscription_end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create app_settings table for global settings
CREATE TABLE app_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, setting_key)
);

-- Create services table for shop services
CREATE TABLE services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    duration INTEGER NOT NULL DEFAULT 30, -- in minutes
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for user_profiles
CREATE INDEX idx_user_profiles_subscription_status ON user_profiles(subscription_status);
CREATE INDEX idx_user_profiles_subscription_end ON user_profiles(subscription_end_date);

-- Create indexes for app_settings
CREATE INDEX idx_app_settings_user_id ON app_settings(user_id);
CREATE INDEX idx_app_settings_key ON app_settings(setting_key);

-- Create indexes for services
CREATE INDEX idx_services_user_id ON services(user_id);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_services_name ON services(name);

-- Enable Row Level Security for new tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for app_settings
CREATE POLICY "Users can manage own settings" ON app_settings
    FOR ALL USING (auth.uid() = user_id);

-- Create policies for services
CREATE POLICY "Users can manage own services" ON services
    FOR ALL USING (auth.uid() = user_id);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, shop_name, currency, currency_symbol, subscription_status)
    VALUES (NEW.id, 'My Barber Shop', 'USD', '$', 'free');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON app_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update customer statistics when a visit is added
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE customers SET
            total_visits = total_visits + 1,
            total_spent = total_spent + NEW.payment_amount,
            last_visit_date = NEW.visit_date,
            updated_at = NOW()
        WHERE id = NEW.customer_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE customers SET
            total_spent = total_spent - OLD.payment_amount + NEW.payment_amount,
            last_visit_date = (
                SELECT MAX(visit_date) FROM visits WHERE customer_id = NEW.customer_id
            ),
            updated_at = NOW()
        WHERE id = NEW.customer_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE customers SET
            total_visits = total_visits - 1,
            total_spent = total_spent - OLD.payment_amount,
            last_visit_date = (
                SELECT MAX(visit_date) FROM visits WHERE customer_id = OLD.customer_id
            ),
            updated_at = NOW()
        WHERE id = OLD.customer_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update customer stats when visits change
CREATE TRIGGER update_customer_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON visits
    FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

-- Function to convert camelCase to snake_case for compatibility
-- This helps with the JavaScript objects that use camelCase
CREATE OR REPLACE FUNCTION to_snake_case(text)
RETURNS text AS $$
BEGIN
    RETURN lower(regexp_replace($1, '([A-Z])', '_\1', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Views to help with camelCase to snake_case conversion
CREATE OR REPLACE VIEW customers_view AS
SELECT 
    id,
    user_id as "userId",
    name,
    mobile,
    birthday,
    notes,
    total_visits as "totalVisits",
    total_spent as "totalSpent",
    last_visit_date as "lastVisitDate",
    created_at as "createdAt",
    updated_at as "updatedAt"
FROM customers;

CREATE OR REPLACE VIEW visits_view AS
SELECT 
    id,
    customer_id as "customerId",
    visit_date as "visitDate",
    services,
    payment_amount as "paymentAmount",
    notes,
    created_at as "createdAt"
FROM visits;

CREATE OR REPLACE VIEW campaigns_view AS
SELECT 
    id,
    name,
    message,
    target_segment as "targetSegment",
    scheduled_date as "scheduledDate",
    status,
    recipient_count as "recipientCount",
    created_at as "createdAt"
FROM campaigns;

CREATE OR REPLACE VIEW user_profiles_view AS
SELECT 
    id,
    shop_name as "shopName",
    currency,
    currency_symbol as "currencySymbol",
    subscription_status as "subscriptionStatus",
    subscription_end_date as "subscriptionEndDate",
    created_at as "createdAt",
    updated_at as "updatedAt"
FROM user_profiles;

-- Insert sample premium user (optional - for testing)
-- Note: This should be done after a real user signs up
-- INSERT INTO user_profiles (id, shop_name, currency, currency_symbol, subscription_status, subscription_end_date) 
-- VALUES ('sample-user-id', 'Elite Barber Studio', 'EUR', '€', 'premium', '2024-12-31T23:59:59Z');

-- Function to check if user has premium access
CREATE OR REPLACE FUNCTION has_premium_access(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    profile_record RECORD;
BEGIN
    SELECT subscription_status, subscription_end_date
    INTO profile_record
    FROM user_profiles
    WHERE id = user_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    IF profile_record.subscription_status = 'free' THEN
        RETURN FALSE;
    END IF;
    
    IF profile_record.subscription_end_date IS NOT NULL AND profile_record.subscription_end_date < NOW() THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

