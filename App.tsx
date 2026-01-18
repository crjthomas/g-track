/**
 * Allergy Tracker App
 * Track nutritional intake, allergy symptoms, and growth metrics
 *
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { AppProvider, useAppContext } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import AuthScreen from './src/screens/AuthScreen';

const theme = {
  colors: {
    primary: '#2196F3',
    accent: '#03A9F4',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#000000',
    disabled: '#BDBDBD',
    placeholder: '#757575',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

function AppContent() {
  const { isAuthenticated, loading } = useAppContext();
  const isDarkMode = useColorScheme() === 'dark';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {isAuthenticated ? <AppNavigator /> : <AuthScreen />}
    </>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default App;
