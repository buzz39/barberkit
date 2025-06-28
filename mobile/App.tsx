import React, { useEffect, useState } from 'react';
import { StatusBar, Alert } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { LocalStorageService } from './src/services/LocalStorageService';
import { SyncService } from './src/services/SyncService';
import { LoadingSpinner } from './src/components/common/LoadingSpinner';

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize local database
      await LocalStorageService.initDatabase();
      
      // Initialize sync service
      await SyncService.initialize();
      
      console.log('App initialized successfully');
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert(
        'Initialization Error',
        'Failed to initialize the app. Please restart the application.',
        [{ text: 'OK' }]
      );
    }
  };

  if (!isInitialized) {
    return <LoadingSpinner message="Initializing BarberPro..." />;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <AppNavigator />
    </>
  );
};

export default App;