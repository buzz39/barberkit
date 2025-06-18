-- BarberKit Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create customers table
CREATE TABLE customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    visit_date TIMESTAMPTZ NOT NULL,
    services TEXT[] NOT NULL DEFAULT '{}',
    payment_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    birthday DATE,
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
CREATE INDEX idx_customers_visit_date ON customers(visit_date);
CREATE INDEX idx_customers_birthday ON customers(birthday);
CREATE INDEX idx_customers_mobile ON customers(mobile);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_scheduled_date ON campaigns(scheduled_date);
CREATE INDEX idx_templates_type ON whatsapp_templates(type);

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (you can modify these based on your needs)
-- For now, we'll allow all operations for authenticated users

-- Customers policies
CREATE POLICY "Allow all operations for authenticated users" ON customers
    FOR ALL USING (auth.role() = 'authenticated');

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

-- Insert sample customers (optional - for testing)
INSERT INTO customers (name, mobile, visit_date, services, payment_amount, birthday, notes) VALUES
('John Doe', '+1 (555) 123-4567', '2024-01-15T10:30:00Z', ARRAY['Haircut', 'Beard Trim'], 45.00, '1990-01-20', 'Prefers short fade cuts'),
('Mike Johnson', '+1 (555) 987-6543', '2024-01-14T14:15:00Z', ARRAY['Haircut', 'Shave'], 55.00, '1985-02-14', NULL),
('David Wilson', '+1 (555) 456-7890', '2024-01-13T16:45:00Z', ARRAY['Styling', 'Hair Wash'], 35.00, '1992-01-25', 'Allergic to certain hair products');

-- Insert sample campaigns (optional - for testing)
INSERT INTO campaigns (name, message, target_segment, status, recipient_count) VALUES
('New Year Special Offer', '🎉 New Year Special! Get 20% off on all services this week. Book your appointment now!', 'all', 'sent', 45),
('Birthday Wishes January', '🎂 Happy Birthday! We hope you have a wonderful day. Enjoy a special 15% discount on your next visit!', 'birthday', 'sent', 8),
('Weekend Promotion', '⭐ Weekend Special: Premium styling package at 25% off. Available Saturday & Sunday only!', 'recent', 'scheduled', 23);

-- Function to convert camelCase to snake_case for compatibility
-- This helps with the JavaScript objects that use camelCase
CREATE OR REPLACE FUNCTION to_snake_case(text)
RETURNS text AS $$
BEGIN
    RETURN lower(regexp_replace($1, '([A-Z])', '_\1', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- View to help with camelCase to snake_case conversion if needed
CREATE OR REPLACE VIEW customers_view AS
SELECT 
    id,
    name,
    mobile,
    visit_date as "visitDate",
    services,
    payment_amount as "paymentAmount",
    birthday,
    notes,
    created_at as "createdAt"
FROM customers;

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

