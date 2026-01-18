import { HighCalorieFoodSuggestion } from '../models/MealPlan';
import { NutritionEntry } from '../models/NutritionEntry';
import { getNutritionEntriesByDateRange, getHighCalorieEntries } from './nutritionService';
import { getStartOfDay, getEndOfDay, subDays } from '../utils/dateUtils';

/**
 * High-calorie foods database with growth benefits
 */
const HIGH_CALORIE_FOODS: HighCalorieFoodSuggestion[] = [
  {
    foodName: 'Avocado',
    caloriesPer100g: 160,
    recommendedQuantity: 100,
    unit: 'g',
    reason: 'Rich in healthy fats and essential nutrients for growth',
    category: 'fruits',
    benefits: ['Healthy fats', 'Vitamin E', 'Folate', 'High in calories'],
  },
  {
    foodName: 'Peanut Butter',
    caloriesPer100g: 588,
    recommendedQuantity: 30,
    unit: 'g',
    reason: 'Excellent source of protein and healthy fats',
    category: 'nuts',
    benefits: ['High protein', 'Healthy fats', 'Vitamin E', 'Very high calories'],
  },
  {
    foodName: 'Whole Milk',
    caloriesPer100g: 61,
    recommendedQuantity: 250,
    unit: 'ml',
    reason: 'Complete protein source with calcium for bone growth',
    category: 'dairy',
    benefits: ['Complete protein', 'Calcium', 'Vitamin D', 'Good for growth'],
  },
  {
    foodName: 'Cheese',
    caloriesPer100g: 402,
    recommendedQuantity: 50,
    unit: 'g',
    reason: 'High in calories, protein, and calcium',
    category: 'dairy',
    benefits: ['High calories', 'Protein', 'Calcium', 'Easy to add to meals'],
  },
  {
    foodName: 'Banana',
    caloriesPer100g: 89,
    recommendedQuantity: 100,
    unit: 'g',
    reason: 'Natural sugars and potassium for energy',
    category: 'fruits',
    benefits: ['Natural sugars', 'Potassium', 'Easy to eat', 'Good for snacks'],
  },
  {
    foodName: 'Sweet Potato',
    caloriesPer100g: 86,
    recommendedQuantity: 150,
    unit: 'g',
    reason: 'Complex carbs and beta-carotene for growth',
    category: 'vegetables',
    benefits: ['Complex carbs', 'Beta-carotene', 'Fiber', 'Nutritious'],
  },
  {
    foodName: 'Eggs',
    caloriesPer100g: 155,
    recommendedQuantity: 50,
    unit: 'g',
    reason: 'Complete protein with all essential amino acids',
    category: 'protein',
    benefits: ['Complete protein', 'Choline', 'Vitamin B12', 'Versatile'],
  },
  {
    foodName: 'Salmon',
    caloriesPer100g: 206,
    recommendedQuantity: 100,
    unit: 'g',
    reason: 'Omega-3 fatty acids essential for brain development',
    category: 'protein',
    benefits: ['Omega-3', 'High protein', 'Vitamin D', 'Brain development'],
  },
  {
    foodName: 'Almonds',
    caloriesPer100g: 579,
    recommendedQuantity: 30,
    unit: 'g',
    reason: 'High in healthy fats and protein',
    category: 'nuts',
    benefits: ['Healthy fats', 'Protein', 'Vitamin E', 'High calories'],
  },
  {
    foodName: 'Oats',
    caloriesPer100g: 389,
    recommendedQuantity: 50,
    unit: 'g',
    reason: 'Complex carbs and fiber for sustained energy',
    category: 'grains',
    benefits: ['Complex carbs', 'Fiber', 'Protein', 'Filling'],
  },
  {
    foodName: 'Full Fat Yogurt',
    caloriesPer100g: 59,
    recommendedQuantity: 200,
    unit: 'g',
    reason: 'Probiotics and protein for digestive health and growth',
    category: 'dairy',
    benefits: ['Probiotics', 'Protein', 'Calcium', 'Easy to digest'],
  },
  {
    foodName: 'Olive Oil',
    caloriesPer100g: 884,
    recommendedQuantity: 15,
    unit: 'ml',
    reason: 'Healthy monounsaturated fats, easy to add to meals',
    category: 'fats',
    benefits: ['Healthy fats', 'Very high calories', 'Easy to add', 'Anti-inflammatory'],
  },
];

/**
 * Get AI-based suggestions for high-calorie foods
 * In a production app, this would call an actual AI service
 */
export const getAIHighCalorieSuggestions = async (
  userId: string,
  targetCalories: number,
  currentCalories: number = 0,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'breakfast'
): Promise<HighCalorieFoodSuggestion[]> => {
  const caloriesNeeded = targetCalories - currentCalories;
  
  // Get user's recent nutrition history to personalize suggestions
  const recentEntries = await getNutritionEntriesByDateRange(
    userId,
    subDays(new Date(), 7),
    new Date()
  );

  // Analyze what foods they've been eating
  const frequentlyUsedFoods = getFrequentlyUsedFoods(recentEntries);
  const underusedCategories = identifyUnderusedCategories(frequentlyUsedFoods);

  // Filter and rank suggestions based on:
  // 1. Calorie needs
  // 2. Meal type appropriateness
  // 3. Underused food categories
  // 4. Variety (avoid suggesting same foods too often)

  let suggestions = HIGH_CALORIE_FOODS.filter((food) => {
    // Filter by meal type appropriateness
    if (mealType === 'breakfast') {
      return ['grains', 'dairy', 'fruits', 'protein'].includes(food.category);
    } else if (mealType === 'lunch' || mealType === 'dinner') {
      return ['protein', 'grains', 'vegetables', 'dairy'].includes(food.category);
    } else {
      // snack
      return ['nuts', 'fruits', 'dairy'].includes(food.category);
    }
  });

  // Boost suggestions from underused categories
  suggestions = suggestions.map((food) => {
    if (underusedCategories.includes(food.category)) {
      return {
        ...food,
        reason: `${food.reason} (Try adding variety with ${food.category})`,
      };
    }
    return food;
  });

  // Sort by calories (descending) and relevance
  suggestions.sort((a, b) => {
    const aRelevance = calculateRelevance(a, frequentlyUsedFoods, caloriesNeeded);
    const bRelevance = calculateRelevance(b, frequentlyUsedFoods, caloriesNeeded);
    return bRelevance - aRelevance;
  });

  // Take top 6 suggestions
  return suggestions.slice(0, 6).map((food) => ({
    ...food,
    recommendedQuantity: adjustQuantityForCalories(food, caloriesNeeded),
    reason: generatePersonalizedReason(food, frequentlyUsedFoods, caloriesNeeded),
  }));
};

/**
 * Get frequently used foods from recent entries
 */
const getFrequentlyUsedFoods = (entries: NutritionEntry[]): string[] => {
  const foodCount: { [key: string]: number } = {};
  
  entries.forEach((entry) => {
    const foodName = entry.foodName.toLowerCase();
    foodCount[foodName] = (foodCount[foodName] || 0) + 1;
  });

  return Object.keys(foodCount)
    .sort((a, b) => foodCount[b] - foodCount[a])
    .slice(0, 10);
};

/**
 * Identify food categories that are underused
 */
const identifyUnderusedCategories = (frequentlyUsedFoods: string[]): string[] => {
  const usedCategories = new Set<string>();
  
  frequentlyUsedFoods.forEach((foodName) => {
    const food = HIGH_CALORIE_FOODS.find(
      (f) => f.foodName.toLowerCase() === foodName
    );
    if (food) {
      usedCategories.add(food.category);
    }
  });

  const allCategories = new Set(HIGH_CALORIE_FOODS.map((f) => f.category));
  return Array.from(allCategories).filter((cat) => !usedCategories.has(cat));
};

/**
 * Calculate relevance score for a food suggestion
 */
const calculateRelevance = (
  food: HighCalorieFoodSuggestion,
  frequentlyUsedFoods: string[],
  caloriesNeeded: number
): number => {
  let score = 0;

  // Prefer foods that provide significant calories
  const foodCalories = (food.caloriesPer100g / 100) * food.recommendedQuantity;
  score += foodCalories * 0.3;

  // Prefer foods not recently used
  const isRecentlyUsed = frequentlyUsedFoods.some(
    (f) => f.toLowerCase() === food.foodName.toLowerCase()
  );
  if (!isRecentlyUsed) {
    score += 100;
  }

  // Prefer foods that match calorie needs
  if (foodCalories <= caloriesNeeded * 1.5) {
    score += 50;
  }

  return score;
};

/**
 * Adjust quantity based on calorie needs
 */
const adjustQuantityForCalories = (
  food: HighCalorieFoodSuggestion,
  caloriesNeeded: number
): number => {
  const caloriesPerUnit = food.caloriesPer100g / 100;
  const baseQuantity = food.recommendedQuantity;
  const baseCalories = baseQuantity * caloriesPerUnit;

  if (caloriesNeeded > 0 && caloriesNeeded < baseCalories * 2) {
    // Adjust to meet calorie needs but not exceed too much
    return Math.min(
      Math.round((caloriesNeeded / caloriesPerUnit) * 0.8),
      baseQuantity * 2
    );
  }

  return baseQuantity;
};

/**
 * Generate personalized reason for suggestion
 */
const generatePersonalizedReason = (
  food: HighCalorieFoodSuggestion,
  frequentlyUsedFoods: string[],
  caloriesNeeded: number
): string => {
  let reason = food.reason;

  if (caloriesNeeded > 500) {
    reason += `. This food is high in calories (${food.caloriesPer100g} cal/100g) and can help meet your daily target.`;
  }

  if (!frequentlyUsedFoods.some((f) => f.toLowerCase() === food.foodName.toLowerCase())) {
    reason += ` Try adding this to increase variety in your meals.`;
  }

  return reason;
};

/**
 * Get meal planning suggestions for a day
 */
export const getDailyMealPlanSuggestions = async (
  userId: string,
  targetCalories: number,
  date: Date = new Date()
): Promise<{
  breakfast: HighCalorieFoodSuggestion[];
  lunch: HighCalorieFoodSuggestion[];
  dinner: HighCalorieFoodSuggestion[];
  snacks: HighCalorieFoodSuggestion[];
}> => {
  // Get current day's nutrition to calculate remaining calories
  const todayEntries = await getNutritionEntriesByDateRange(
    userId,
    getStartOfDay(date),
    getEndOfDay(date)
  );
  const currentCalories = todayEntries.reduce((sum, entry) => sum + entry.calories, 0);

  const [breakfast, lunch, dinner, snacks] = await Promise.all([
    getAIHighCalorieSuggestions(userId, targetCalories, currentCalories, 'breakfast'),
    getAIHighCalorieSuggestions(userId, targetCalories, currentCalories, 'lunch'),
    getAIHighCalorieSuggestions(userId, targetCalories, currentCalories, 'dinner'),
    getAIHighCalorieSuggestions(userId, targetCalories, currentCalories, 'snack'),
  ]);

  return { breakfast, lunch, dinner, snacks };
};

