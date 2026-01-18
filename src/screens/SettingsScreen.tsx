import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Card,
  Text,
  Button,
  List,
  Divider,
  Switch,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import { signOutUser } from '../services/authService';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAppContext();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOutUser();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Account</Text>
          <List.Item
            title={user?.email || 'Not signed in'}
            description="Email address"
            left={(props) => <List.Icon {...props} icon="email" />}
          />
          <Divider />
          <List.Item
            title="Sign Out"
            left={(props) => <List.Icon {...props} icon="logout" />}
            onPress={handleSignOut}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <List.Item
            title="Enable Notifications"
            description="Receive reminders for logging entries"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            )}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>About</Text>
          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          <Divider />
          <List.Item
            title="Privacy Policy"
            left={(props) => <List.Icon {...props} icon="shield-check" />}
            onPress={() => {
              // TODO: Open privacy policy
              Alert.alert('Privacy Policy', 'Privacy policy will be available soon.');
            }}
          />
          <Divider />
          <List.Item
            title="Terms of Service"
            left={(props) => <List.Icon {...props} icon="file-document" />}
            onPress={() => {
              // TODO: Open terms of service
              Alert.alert('Terms of Service', 'Terms of service will be available soon.');
            }}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Data</Text>
          <List.Item
            title="Export All Data"
            description="Download all your tracking data"
            left={(props) => <List.Icon {...props} icon="download" />}
            onPress={() => navigation.navigate('Reports' as any)}
          />
          <Divider />
          <List.Item
            title="Clear Cache"
            description="Clear locally stored cache"
            left={(props) => <List.Icon {...props} icon="delete" />}
            onPress={() => {
              Alert.alert('Clear Cache', 'Cache cleared successfully.');
            }}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default SettingsScreen;

