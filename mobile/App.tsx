import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { LocalStorageService } from './src/services/LocalStorageService';
import { SyncService } from './src/services/SyncService';
import { LoadingSpinner } from './src/components/common/LoadingSpinner';
import 'react-native-url-polyfill/auto';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync({
          // Add custom fonts here if needed
        });

        // Initialize local database
        await LocalStorageService.initDatabase();
        
        // Initialize sync service
        await SyncService.initialize();
        
        console.log('App initialized successfully');
      } catch (error) {
        console.error('Error initializing app:', error);
        Alert.alert(
          'Initialization Error',
          'Failed to initialize the app. Please restart the application.',
          [{ text: 'OK' }]
        );
      } finally {
        // Tell the application to render
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return <LoadingSpinner message="Initializing BarberPro..." />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor="white" />
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App;