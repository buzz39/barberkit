# Supabase Integration Setup Guide

This guide will help you set up Supabase integration for your BarberKit application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - Name: `BarberKit` (or your preferred name)
   - Database Password: Create a strong password
   - Region: Choose the closest to your location
5. Click "Create new project"
6. Wait for the project to be created (takes 1-2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings > API**
2. Copy the following values:
   - **Project URL** (something like `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Configure Environment Variables

1. In your project root, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and replace the placeholder values:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql` file
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create:
- `customers` table
- `campaigns` table
- `whatsapp_templates` table
- Proper indexes for performance
- Row Level Security (RLS) policies
- Sample data for testing

## Step 5: Configure Row Level Security (Optional)

By default, the schema allows all operations for authenticated users. If you want to allow anonymous access (for development), you can:

1. Go to **SQL Editor** in Supabase
2. Run these queries to allow anonymous access:

```sql
-- Drop existing policies
DROP POLICY "Allow all operations for authenticated users" ON customers;
DROP POLICY "Allow all operations for authenticated users" ON campaigns;
DROP POLICY "Allow all operations for authenticated users" ON whatsapp_templates;

-- Create new policies for anonymous access
CREATE POLICY "Allow all operations for everyone" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all operations for everyone" ON campaigns FOR ALL USING (true);
CREATE POLICY "Allow all operations for everyone" ON whatsapp_templates FOR ALL USING (true);
```

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to the application
3. You should see:
   - Loading spinner while data loads
   - Sample customers, campaigns, and templates from the database
   - Real-time analytics calculations
   - Ability to add, edit, and delete customers and campaigns

## Features Enabled

✅ **Real-time Data Sync**: All changes are immediately saved to Supabase
✅ **Customer Management**: Add, edit, delete customers with cloud storage
✅ **Campaign Management**: Create and manage marketing campaigns
✅ **Analytics**: Real-time business metrics calculated from database
✅ **WhatsApp Templates**: Manage message templates
✅ **Birthday Tracking**: Automatic upcoming birthday detection
✅ **Error Handling**: Graceful error handling with user feedback
✅ **Loading States**: Professional loading indicators

## Troubleshooting

### Connection Issues
- Verify your environment variables are correct
- Check that your Supabase project is active
- Ensure RLS policies allow your operations

### Schema Issues
- Make sure the SQL schema was executed completely
- Check the Supabase logs for any errors
- Verify table names match the service functions

### Data Not Loading
- Check browser console for errors
- Verify API keys have correct permissions
- Test connection in Supabase dashboard

## Security Considerations

- Never commit your `.env` file to version control
- Use Row Level Security policies for production
- Consider implementing user authentication
- Regularly rotate your API keys

## Next Steps

- Implement user authentication with Supabase Auth
- Add real-time subscriptions for live updates
- Set up automated backups
- Configure email notifications
- Integrate with WhatsApp Business API

## Support

If you encounter any issues:
1. Check the Supabase documentation: https://supabase.com/docs
2. Review the application logs in browser console
3. Check Supabase dashboard logs and metrics

Your BarberKit application is now fully integrated with Supabase! 🎉

