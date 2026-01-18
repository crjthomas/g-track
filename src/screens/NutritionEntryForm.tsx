import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppContext } from '../context/AppContext';
import {
  addNutritionEntry,
  updateNutritionEntry,
  getNutritionEntry,
} from '../services/nutritionService';
import {
  NutritionEntryFormData,
  createNutritionEntry,
  validateNutritionEntry,
} from '../models/NutritionEntry';
import FoodEntryForm from '../components/FoodEntryForm';
import { RootStackParamList } from '../navigation/AppNavigator';

type NutritionEntryFormNavigationProp = StackNavigationProp<RootStackParamList>;
type NutritionEntryFormRouteProp = {
  key: string;
  name: 'NutritionEntryForm';
  params: { 
    entryId?: string;
    prefill?: {
      mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      foodName?: string;
      quantity?: number;
      unit?: string;
      calories?: number;
      isHighCalorie?: boolean;
    };
  };
};

const NutritionEntryFormScreen: React.FC = () => {
  const navigation = useNavigation<NutritionEntryFormNavigationProp>();
  const route = useRoute<NutritionEntryFormRouteProp>();
  const { user } = useAppContext();
  const [initialData, setInitialData] = useState<NutritionEntryFormData | undefined>();
  const [loading, setLoading] = useState(false);

  const entryId = route.params?.entryId;
  const prefill = route.params?.prefill;

  useEffect(() => {
    if (entryId && user) {
      loadEntry();
    } else if (prefill && user) {
      // Prefill form with meal plan suggestion
      setInitialData({
        date: new Date(),
        mealType: prefill.mealType || 'breakfast',
        foodName: prefill.foodName || '',
        quantity: prefill.quantity || 0,
        unit: prefill.unit || 'g',
        calories: prefill.calories || 0,
        isHighCalorie: prefill.isHighCalorie || false,
        notes: '',
      });
    }
  }, [entryId, user, prefill]);

  const loadEntry = async () => {
    if (!user || !entryId) return;

    try {
      setLoading(true);
      const entry = await getNutritionEntry(user.uid, entryId);
      if (entry) {
        setInitialData({
          date: entry.date instanceof Date ? entry.date : entry.date.toDate(),
          mealType: entry.mealType,
          foodName: entry.foodName,
          quantity: entry.quantity,
          unit: entry.unit,
          calories: entry.calories,
          isHighCalorie: entry.isHighCalorie,
          notes: entry.notes,
        });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load entry');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: NutritionEntryFormData) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save entries');
      return;
    }

    const errors = validateNutritionEntry(data);
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    try {
      if (entryId) {
        // Update existing entry
        await updateNutritionEntry(user.uid, entryId, {
          date: data.date,
          mealType: data.mealType,
          foodName: data.foodName,
          quantity: data.quantity,
          unit: data.unit,
          calories: data.calories,
          isHighCalorie: data.isHighCalorie,
          notes: data.notes,
        });
        Alert.alert('Success', 'Nutrition entry updated successfully');
      } else {
        // Create new entry
        const entry = createNutritionEntry(user.uid, data);
        await addNutritionEntry(user.uid, entry);
        Alert.alert('Success', 'Nutrition entry saved successfully');
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save nutrition entry');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <FoodEntryForm
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

export default NutritionEntryFormScreen;

