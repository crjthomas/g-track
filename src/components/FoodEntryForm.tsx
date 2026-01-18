import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Chip,
  Portal,
  Dialog,
  Paragraph,
  SegmentedButtons,
} from 'react-native-paper';
import DatePicker from './DatePicker';
import { NutritionEntryFormData } from '../models/NutritionEntry';
import { validateNutritionEntry } from '../models/NutritionEntry';
import { getFoodCalories, isHighCalorieFood, searchFoods } from '../utils/calorieCalculator';

interface FoodEntryFormProps {
  initialData?: NutritionEntryFormData;
  onSubmit: (data: NutritionEntryFormData) => Promise<void>;
  onCancel?: () => void;
}

const MEAL_TYPES = [
  { label: 'Breakfast', value: 'breakfast' as const },
  { label: 'Lunch', value: 'lunch' as const },
  { label: 'Dinner', value: 'dinner' as const },
  { label: 'Snack', value: 'snack' as const },
];

const COMMON_UNITS = ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece', 'oz', 'lbs'];

const FoodEntryForm: React.FC<FoodEntryFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<NutritionEntryFormData>({
    date: initialData?.date || new Date(),
    mealType: initialData?.mealType || 'breakfast',
    foodName: initialData?.foodName || '',
    quantity: initialData?.quantity || 0,
    unit: initialData?.unit || 'g',
    calories: initialData?.calories || 0,
    isHighCalorie: initialData?.isHighCalorie || false,
    notes: initialData?.notes || '',
  });

  const [foodSuggestions, setFoodSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFoodNameChange = (text: string) => {
    setFormData({ ...formData, foodName: text });
    
    if (text.length > 1) {
      const suggestions = searchFoods(text);
      setFoodSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleQuantityChange = (text: string) => {
    const quantity = parseFloat(text) || 0;
    setFormData({ ...formData, quantity });
    
    // Auto-calculate calories if food name is provided
    if (formData.foodName && quantity > 0) {
      const calculatedCalories = getFoodCalories(
        formData.foodName,
        quantity,
        formData.unit
      );
      const isHighCal = isHighCalorieFood(formData.foodName, quantity, formData.unit);
      setFormData({
        ...formData,
        quantity,
        calories: calculatedCalories,
        isHighCalorie: isHighCal,
      });
    }
  };

  const handleUnitChange = (unit: string) => {
    setFormData({ ...formData, unit });
    
    // Recalculate calories with new unit
    if (formData.foodName && formData.quantity > 0) {
      const calculatedCalories = getFoodCalories(
        formData.foodName,
        formData.quantity,
        unit
      );
      const isHighCal = isHighCalorieFood(formData.foodName, formData.quantity, unit);
      setFormData({
        ...formData,
        unit,
        calories: calculatedCalories,
        isHighCalorie: isHighCal,
      });
    }
  };

  const selectFoodSuggestion = (food: string) => {
    setFormData({ ...formData, foodName: food });
    setShowSuggestions(false);
    
    // Auto-calculate calories
    if (formData.quantity > 0) {
      const calculatedCalories = getFoodCalories(
        food,
        formData.quantity,
        formData.unit
      );
      const isHighCal = isHighCalorieFood(food, formData.quantity, formData.unit);
      setFormData({
        ...formData,
        foodName: food,
        calories: calculatedCalories,
        isHighCalorie: isHighCal,
      });
    }
  };

  const handleSubmit = async () => {
    const errors = validateNutritionEntry(formData);
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save nutrition entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <DatePicker
        label="Date"
        value={formData.date}
        onChange={(date) => setFormData({ ...formData, date })}
        mode="date"
      />

      <Text style={styles.sectionLabel}>Meal Type</Text>
      <SegmentedButtons
        value={formData.mealType}
        onValueChange={(value) =>
          setFormData({ ...formData, mealType: value as any })
        }
        buttons={MEAL_TYPES}
        style={styles.segmentedButtons}
      />

      <View style={styles.foodInputContainer}>
        <TextInput
          label="Food Name"
          value={formData.foodName}
          onChangeText={handleFoodNameChange}
          mode="outlined"
          style={styles.input}
          autoCapitalize="words"
        />
        {showSuggestions && foodSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {foodSuggestions.map((food, index) => (
              <Chip
                key={index}
                onPress={() => selectFoodSuggestion(food)}
                style={styles.suggestionChip}>
                {food}
              </Chip>
            ))}
          </View>
        )}
      </View>

      <View style={styles.quantityContainer}>
        <TextInput
          label="Quantity"
          value={formData.quantity.toString()}
          onChangeText={handleQuantityChange}
          keyboardType="decimal-pad"
          mode="outlined"
          style={[styles.input, styles.quantityInput]}
        />
        <View style={styles.unitContainer}>
          <Text style={styles.unitLabel}>Unit</Text>
          <View style={styles.unitChips}>
            {COMMON_UNITS.map((unit) => (
              <Chip
                key={unit}
                selected={formData.unit === unit}
                onPress={() => handleUnitChange(unit)}
                style={styles.unitChip}
                compact>
                {unit}
              </Chip>
            ))}
          </View>
        </View>
      </View>

      <TextInput
        label="Calories"
        value={formData.calories.toString()}
        onChangeText={(text) =>
          setFormData({
            ...formData,
            calories: parseFloat(text) || 0,
          })
        }
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
        right={
          <TextInput.Icon
            icon="calculator"
            onPress={() => {
              if (formData.foodName && formData.quantity > 0) {
                const calculatedCalories = getFoodCalories(
                  formData.foodName,
                  formData.quantity,
                  formData.unit
                );
                setFormData({
                  ...formData,
                  calories: calculatedCalories,
                });
              }
            }}
          />
        }
      />

      <View style={styles.highCalorieContainer}>
        <Chip
          selected={formData.isHighCalorie}
          onPress={() =>
            setFormData({
              ...formData,
              isHighCalorie: !formData.isHighCalorie,
            })
          }
          icon={formData.isHighCalorie ? 'check' : 'close'}
          style={styles.highCalorieChip}>
          High-Calorie Booster
        </Chip>
      </View>

      <TextInput
        label="Notes (Optional)"
        value={formData.notes}
        onChangeText={(text) => setFormData({ ...formData, notes: text })}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.input}
      />

      <View style={styles.buttonContainer}>
        {onCancel && (
          <Button
            mode="outlined"
            onPress={onCancel}
            style={[styles.button, styles.cancelButton]}>
            Cancel
          </Button>
        )}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.button}>
          Save
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginVertical: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  segmentedButtons: {
    marginVertical: 8,
  },
  foodInputContainer: {
    marginVertical: 8,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  suggestionChip: {
    margin: 4,
  },
  quantityContainer: {
    marginVertical: 8,
  },
  quantityInput: {
    marginBottom: 8,
  },
  unitContainer: {
    marginTop: 8,
  },
  unitLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  unitChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  unitChip: {
    margin: 4,
  },
  highCalorieContainer: {
    marginVertical: 16,
    alignItems: 'flex-start',
  },
  highCalorieChip: {
    height: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    marginRight: 8,
  },
});

export default FoodEntryForm;

