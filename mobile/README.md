# BarberPro Mobile App - Expo Version

A comprehensive React Native mobile application for barber shop management, built with Expo for easy deployment and distribution.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g @expo/cli`)
- EAS CLI (`npm install -g eas-cli`)

### Installation

1. **Install Dependencies**
   ```bash
   cd mobile
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

## 📱 Development

### Running on Device/Simulator

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

### Testing on Physical Device

1. Install Expo Go app on your phone
2. Scan the QR code from the terminal
3. The app will load on your device

## 🏗️ Building for Production

### Setup EAS Build

1. **Login to Expo**
   ```bash
   eas login
   ```

2. **Configure Project**
   ```bash
   eas build:configure
   ```

3. **Update Project ID**
   - Go to https://expo.dev
   - Create a new project or use existing
   - Update `extra.eas.projectId` in `app.json`

### Build Commands

```bash
# Build for Android (APK for testing)
npm run preview

# Build for Android (AAB for Play Store)
npm run build:android

# Build for iOS (for App Store)
npm run build:ios

# Build for both platforms
npm run build:all
```

### Build Profiles

- **Development**: For development builds with debugging
- **Preview**: For internal testing (APK/IPA files)
- **Production**: For app store submission

## 📦 Deployment

### Android Deployment

1. **Build Production APK/AAB**
   ```bash
   eas build --platform android --profile production
   ```

2. **Submit to Google Play Store**
   ```bash
   npm run submit:android
   ```

### iOS Deployment

1. **Build Production IPA**
   ```bash
   eas build --platform ios --profile production
   ```

2. **Submit to App Store**
   ```bash
   npm run submit:ios
   ```

### Over-the-Air Updates

```bash
# Push updates without rebuilding
npm run update
```

## 🔧 Configuration

### App Configuration (`app.json`)

Key settings:
- App name, version, and identifiers
- Platform-specific configurations
- Permissions and capabilities
- Build and submission settings

### Environment Variables

Required environment variables:
- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Build Configuration (`eas.json`)

- Development builds for testing
- Preview builds for internal distribution
- Production builds for app stores

## 📱 Features

### Core Functionality
- ✅ Offline-first customer management
- ✅ Real-time data synchronization
- ✅ SQLite local database
- ✅ Supabase cloud integration
- ✅ Push notifications ready
- ✅ Camera integration for photos
- ✅ Contact integration
- ✅ WhatsApp deep linking

### Mobile Optimizations
- ✅ Responsive design for all screen sizes
- ✅ Native navigation with React Navigation
- ✅ Optimized performance with Expo
- ✅ Automatic updates via EAS Update
- ✅ Cross-platform compatibility

## 🔐 Security & Permissions

### Android Permissions
- Camera access for customer photos
- Contacts access for importing customers
- Storage access for data management
- Network access for synchronization
- Biometric authentication support

### iOS Permissions
- Camera usage description
- Photo library access
- Contacts access
- Network access

## 🧪 Testing

### Development Testing
```bash
# Run on Expo Go
npm start

# Build development client
eas build --profile development
```

### Internal Testing
```bash
# Build preview version
npm run preview

# Share with team via Expo dashboard
```

## 📊 Analytics & Monitoring

- Expo Analytics for app usage
- Crash reporting via Expo
- Performance monitoring
- User engagement tracking

## 🚀 Distribution

### Internal Distribution
- Share builds via Expo dashboard
- Direct APK/IPA download links
- TestFlight for iOS beta testing

### Public Distribution
- Google Play Store for Android
- Apple App Store for iOS
- Progressive Web App for web

## 🔄 Updates

### Code Push Updates
```bash
# Push updates instantly
eas update --branch production --message "Bug fixes and improvements"
```

### Binary Updates
- Required for native code changes
- New app store submissions
- Major version updates

## 📱 Platform-Specific Notes

### Android
- Supports Android 5.0+ (API 21+)
- Adaptive icons for modern Android
- Google Play Store optimization
- APK and AAB build formats

### iOS
- Supports iOS 11.0+
- App Store Connect integration
- TestFlight beta testing
- Universal builds for all devices

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check EAS build logs
   - Verify dependencies compatibility
   - Update Expo SDK if needed

2. **Environment Variables**
   - Ensure `.env` file exists
   - Use `EXPO_PUBLIC_` prefix for client-side variables
   - Restart development server after changes

3. **Database Issues**
   - Verify Supabase configuration
   - Check network connectivity
   - Review database permissions

### Getting Help
- Expo Documentation: https://docs.expo.dev
- Expo Discord Community
- GitHub Issues for project-specific problems

## 📈 Performance Optimization

- Bundle size optimization with Metro
- Image optimization and caching
- Lazy loading for better startup time
- Memory management for large datasets
- Network request optimization

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Core app functionality
- ✅ Expo integration
- ✅ Basic deployment setup

### Phase 2 (Next)
- 🔄 Push notifications implementation
- 🔄 Advanced offline capabilities
- 🔄 Enhanced UI/UX improvements

### Phase 3 (Future)
- 📅 Appointment scheduling
- 💳 Payment integration
- 🌐 Multi-language support
- 🔗 Advanced integrations

---

**Built with ❤️ using Expo and React Native** 📱✨