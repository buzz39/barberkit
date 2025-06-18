# BarberKit - Professional Barber Shop Management System

A modern, cloud-powered React application for managing barber shop operations with real-time data synchronization using Supabase.

## 🎆 Features

### 📈 Dashboard & Analytics
- Real-time business metrics (daily, weekly, monthly revenue & customers)
- Popular services tracking
- Upcoming customer birthdays
- Recent activity feed
- Growth indicators with visual charts

### 👥 Customer Management
- Complete customer database with profiles
- Service history and payment tracking
- Birthday management for special offers
- Advanced search and filtering
- Customer notes and preferences
- Cloud-synced data storage

### 💬 WhatsApp Communication
- Pre-built message templates (birthday, reminders, promotions)
- Bulk messaging capabilities
- Customer segmentation for targeted messaging
- Message personalization with customer names

### 📢 Marketing Campaigns
- Create and schedule marketing campaigns
- Target specific customer segments
- Campaign status tracking
- Recipient count management
- Template-based campaign creation

## 🚀 Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite for fast development
- **Styling**: Tailwind CSS for responsive design
- **Icons**: Lucide React for beautiful iconography
- **Database**: Supabase (PostgreSQL) for cloud data storage
- **Real-time**: Supabase real-time subscriptions
- **State Management**: React hooks for local state

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- A Supabase account (free tier available)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/barberkit.git
cd barberkit
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase
Follow the detailed setup guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

**Quick Setup:**
1. Create a Supabase project at https://supabase.com
2. Copy `.env.example` to `.env`
3. Add your Supabase URL and API key to `.env`
4. Run the SQL schema from `supabase-schema.sql` in Supabase SQL Editor

### 4. Start Development Server
```bash
npm run dev
```

Open http://localhost:5173 to view the application.

## 📚 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx     # Analytics dashboard
│   ├── CustomerManagement.tsx
│   ├── Communication.tsx # WhatsApp messaging
│   ├── Marketing.tsx     # Campaign management
│   └── Layout.tsx        # App layout & navigation
│
├── services/           # Database services
│   └── database.ts       # Supabase operations
│
├── lib/               # Configuration
│   └── supabase.ts       # Supabase client
│
├── types/             # TypeScript definitions
│   └── index.ts          # App interfaces
│
└── App.tsx            # Main application
```

## 💾 Database Schema

The application uses three main tables:

- **customers**: Customer profiles, visits, services, payments
- **campaigns**: Marketing campaigns and scheduling
- **whatsapp_templates**: Reusable message templates

See `supabase-schema.sql` for the complete database structure.

## 🔍 API Integration

All data operations are handled through Supabase services:

```typescript
// Customer operations
import { customerService } from './services/database';

// Create customer
const result = await customerService.create(customerData);

// Get all customers
const customers = await customerService.getAll();

// Update customer
const updated = await customerService.update(id, updates);
```

## 🚑 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure environment variables

## 🔒 Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Security Note**: Never commit `.env` files to version control.

## 🌐 Features in Development

- [ ] User authentication & multi-user support
- [ ] Real-time notifications
- [ ] WhatsApp Business API integration
- [ ] Appointment booking system
- [ ] Inventory management
- [ ] Financial reporting
- [ ] Mobile app (React Native)

## 🐛 Troubleshooting

### Common Issues

1. **Data not loading**: Check Supabase connection and RLS policies
2. **Build errors**: Ensure all environment variables are set
3. **Database errors**: Verify the SQL schema was executed correctly

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed troubleshooting.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Support

For support and questions:
- Create an issue on GitHub
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the troubleshooting guide

---

**Built with ❤️ by developers, for barbers everywhere.**

Transform your barber shop with modern technology! ✂️✨

