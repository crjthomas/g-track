import firestore from '@react-native-firebase/firestore';
type Timestamp = firestore.FirebaseFirestoreTypes.Timestamp;

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface NutritionEntry {
  id?: string;
  userId: string;
  date: Timestamp | Date;
  mealType: MealType;
  foodName: string;
  quantity: number;
  unit: string; // e.g., 'g', 'ml', 'cup', 'piece'
  calories: number;
  isHighCalorie: boolean;
  notes?: string;
  createdAt: Timestamp | Date;
}

export interface NutritionEntryFormData {
  date: Date;
  mealType: MealType;
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  isHighCalorie: boolean;
  notes?: string;
}

/**
 * Validate nutrition entry data
 */
export const validateNutritionEntry = (
  data: NutritionEntryFormData
): string[] => {
  const errors: string[] = [];

  if (!data.foodName || data.foodName.trim().length === 0) {
    errors.push('Food name is required');
  }

  if (data.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }

  if (!data.unit || data.unit.trim().length === 0) {
    errors.push('Unit is required');
  }

  if (data.calories < 0) {
    errors.push('Calories cannot be negative');
  }

  return errors;
};

/**
 * Convert form data to NutritionEntry
 */
export const createNutritionEntry = (
  userId: string,
  formData: NutritionEntryFormData
): Omit<NutritionEntry, 'id'> => {
  const now = new Date();
  return {
    userId,
    date: formData.date,
    mealType: formData.mealType,
    foodName: formData.foodName.trim(),
    quantity: formData.quantity,
    unit: formData.unit.trim(),
    calories: formData.calories,
    isHighCalorie: formData.isHighCalorie,
    notes: formData.notes || '',
    createdAt: now,
  };
};

/**
 * Calculate daily calorie total from nutrition entries
 */
export const calculateDailyCalories = (
  entries: NutritionEntry[]
): number => {
  return entries.reduce((total, entry) => total + entry.calories, 0);
};

/**
 * Get high-calorie foods from entries
 */
export const getHighCalorieFoods = (
  entries: NutritionEntry[]
): NutritionEntry[] => {
  return entries.filter((entry) => entry.isHighCalorie);
};

