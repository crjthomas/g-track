import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppContext } from '../context/AppContext';
import {
  addSymptomEntry,
  updateSymptomEntry,
  getSymptomEntry,
} from '../services/symptomService';
import {
  SymptomEntryFormData,
  createSymptomEntry,
  validateSymptomEntry,
} from '../models/SymptomEntry';
import SymptomEntryForm from '../components/SymptomEntryForm';
import { RootStackParamList } from '../navigation/AppNavigator';

type SymptomEntryFormNavigationProp = StackNavigationProp<RootStackParamList>;
type SymptomEntryFormRouteProp = {
  key: string;
  name: 'SymptomEntryForm';
  params: { entryId?: string };
};

const SymptomEntryFormScreen: React.FC = () => {
  const navigation = useNavigation<SymptomEntryFormNavigationProp>();
  const route = useRoute<SymptomEntryFormRouteProp>();
  const { user } = useAppContext();
  const [initialData, setInitialData] = useState<SymptomEntryFormData | undefined>();
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
      const entry = await getSymptomEntry(user.uid, entryId);
      if (entry) {
        setInitialData({
          date: entry.date instanceof Date ? entry.date : entry.date.toDate(),
          heartburnSeverity: entry.heartburnSeverity,
          nausea: entry.nausea,
          nauseaSeverity: entry.nauseaSeverity,
          vomitingEpisodes: entry.vomitingEpisodes,
          vomitingFrequency: entry.vomitingFrequency,
          vomitColor: entry.vomitColor,
          triggers: entry.triggers,
          notes: entry.notes,
        });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load entry');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: SymptomEntryFormData) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save entries');
      return;
    }

    const errors = validateSymptomEntry(data);
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    try {
      if (entryId) {
        // Update existing entry
        await updateSymptomEntry(user.uid, entryId, {
          date: data.date,
          heartburnSeverity: data.heartburnSeverity,
          nausea: data.nausea,
          nauseaSeverity: data.nauseaSeverity,
          vomitingEpisodes: data.vomitingEpisodes,
          vomitingFrequency: data.vomitingFrequency,
          vomitColor: data.vomitColor,
          triggers: data.triggers,
          notes: data.notes,
        });
        Alert.alert('Success', 'Symptom entry updated successfully');
      } else {
        // Create new entry
        const entry = createSymptomEntry(user.uid, data);
        await addSymptomEntry(user.uid, entry);
        Alert.alert('Success', 'Symptom entry saved successfully');
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save symptom entry');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <SymptomEntryForm
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

export default SymptomEntryFormScreen;

