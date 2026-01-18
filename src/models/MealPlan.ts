import firestore from '@react-native-firebase/firestore';
type Timestamp = firestore.FirebaseFirestoreTypes.Timestamp;

export interface MealPlanEntry {
  id?: string;
  userId: string;
  date: Timestamp | Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  isSuggested: boolean; // AI-suggested food
  suggestionReason?: string; // Why this food was suggested
  isCompleted: boolean;
  createdAt: Timestamp | Date;
}

export interface MealPlan {
  id?: string;
  userId: string;
  date: Timestamp | Date;
  targetCalories: number;
  plannedCalories: number;
  entries: MealPlanEntry[];
  notes?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface MealPlanFormData {
  date: Date;
  targetCalories: number;
  entries: Omit<MealPlanEntry, 'id' | 'userId' | 'createdAt' | 'date'>[];
  notes?: string;
}

export interface HighCalorieFoodSuggestion {
  foodName: string;
  caloriesPer100g: number;
  recommendedQuantity: number;
  unit: string;
  reason: string; // AI-generated reason
  category: string; // e.g., 'protein', 'dairy', 'grains', 'fruits', 'nuts'
  benefits: string[]; // Growth benefits
}

