import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppContext } from '../context/AppContext';
import {
  addGrowthEntry,
  updateGrowthEntry,
  getGrowthEntry,
} from '../services/growthService';
import {
  GrowthEntryFormData,
  createGrowthEntry,
  validateGrowthEntry,
} from '../models/GrowthEntry';
import GrowthEntryForm from '../components/GrowthEntryForm';
import { RootStackParamList } from '../navigation/AppNavigator';

type GrowthEntryFormNavigationProp = StackNavigationProp<RootStackParamList>;
type GrowthEntryFormRouteProp = {
  key: string;
  name: 'GrowthEntryForm';
  params: { entryId?: string };
};

const GrowthEntryFormScreen: React.FC = () => {
  const navigation = useNavigation<GrowthEntryFormNavigationProp>();
  const route = useRoute<GrowthEntryFormRouteProp>();
  const { user } = useAppContext();
  const [initialData, setInitialData] = useState<GrowthEntryFormData | undefined>();
  const [loading, setLoading] = useState(false);

  const entryId = route.params?.entryId;

  useEffect(() => {
    if (entryId && user) {
      loadEntry();
    }
  }, [entryId, user]);

  const loadEntry = async () => {
    if (!user || !entryId) return;

    try {
      setLoading(true);
      const entry = await getGrowthEntry(user.uid, entryId);
      if (entry) {
        setInitialData({
          date: entry.date instanceof Date ? entry.date : entry.date.toDate(),
          weight: entry.weight,
          weightUnit: entry.weightUnit,
          height: entry.height,
          heightUnit: entry.heightUnit,
        });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load entry');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: GrowthEntryFormData) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save entries');
      return;
    }

    const errors = validateGrowthEntry(data);
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    try {
      if (entryId) {
        // Update existing entry
        await updateGrowthEntry(user.uid, entryId, {
          date: data.date,
          weight: data.weight,
          weightUnit: data.weightUnit,
          height: data.height,
          heightUnit: data.heightUnit,
        });
        Alert.alert('Success', 'Growth entry updated successfully');
      } else {
        // Create new entry
        const entry = createGrowthEntry(user.uid, data);
        await addGrowthEntry(user.uid, entry);
        Alert.alert('Success', 'Growth entry saved successfully');
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save growth entry');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <GrowthEntryForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default GrowthEntryFormScreen;

