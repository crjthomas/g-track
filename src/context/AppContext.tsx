import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppContextType {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (currentUser) => {
      try {
        setUser(currentUser);
        setLoading(false);
        
        // Store user ID in AsyncStorage for offline access
        if (currentUser) {
          try {
            await AsyncStorage.setItem('userId', currentUser.uid);
          } catch (storageError) {
            console.error('Error storing userId:', storageError);
            // Don't throw - this is not critical
          }
        } else {
          try {
            await AsyncStorage.removeItem('userId');
          } catch (storageError) {
            console.error('Error removing userId:', storageError);
            // Don't throw - this is not critical
          }
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setLoading(false);
        // Don't crash the app - just set loading to false
      }
    });

    return unsubscribe;
  }, []);

  const value: AppContextType = {
    user,
    loading,
    isAuthenticated: !!user,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
