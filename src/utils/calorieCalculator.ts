/**
 * Common food items with approximate calories per 100g
 * This is a basic lookup table - in production, consider using a nutrition API
 */
const FOOD_CALORIES: { [key: string]: number } = {
  // Fruits
  apple: 52,
  banana: 89,
  orange: 47,
  grapes: 69,
  strawberry: 32,
  watermelon: 30,
  
  // Vegetables
  broccoli: 34,
  carrot: 41,
  tomato: 18,
  cucumber: 16,
  spinach: 23,
  potato: 77,
  
  // Proteins
  chicken: 165,
  beef: 250,
  fish: 206,
  egg: 155,
  tofu: 76,
  
  // Grains
  rice: 130,
  bread: 265,
  pasta: 131,
  oatmeal: 68,
  
  // Dairy
  milk: 42,
  cheese: 402,
  yogurt: 59,
  butter: 717,
  
  // Nuts & Seeds
  almonds: 579,
  peanuts: 567,
  cashews: 553,
  
  // Common foods
  pizza: 266,
  burger: 295,
  fries: 312,
  chocolate: 546,
  ice_cream: 207,
};

/**
 * Get approximate calories for a food item
 * Returns calories per 100g or per unit if specified
 */
export const getFoodCalories = (
  foodName: string,
  quantity: number,
  unit: string = 'g'
): number => {
  const normalizedName = foodName.toLowerCase().trim();
  
  // Try exact match first
  let caloriesPer100g = FOOD_CALORIES[normalizedName];
  
  // Try partial match
  if (!caloriesPer100g) {
    const matchingKey = Object.keys(FOOD_CALORIES).find((key) =>
      normalizedName.includes(key) || key.includes(normalizedName)
    );
    if (matchingKey) {
      caloriesPer100g = FOOD_CALORIES[matchingKey];
    }
  }
  
  // Default calories if not found (average of common foods)
  if (!caloriesPer100g) {
    caloriesPer100g = 200; // Average estimate
  }
  
  // Convert quantity to grams based on unit
  let quantityInGrams = quantity;
  
  switch (unit.toLowerCase()) {
    case 'kg':
      quantityInGrams = quantity * 1000;
      break;
    case 'lbs':
      quantityInGrams = quantity * 453.592;
      break;
    case 'oz':
      quantityInGrams = quantity * 28.3495;
      break;
    case 'ml':
    case 'l':
      // For liquids, approximate 1ml = 1g
      quantityInGrams = unit === 'l' ? quantity * 1000 : quantity;
      break;
    case 'cup':
      // Approximate 1 cup = 240g
      quantityInGrams = quantity * 240;
      break;
    case 'tbsp':
      quantityInGrams = quantity * 15;
      break;
    case 'tsp':
      quantityInGrams = quantity * 5;
      break;
    case 'piece':
    case 'pcs':
      // Assume average piece size of 100g
      quantityInGrams = quantity * 100;
      break;
    default:
      // Assume grams
      break;
  }
  
  // Calculate total calories
  const totalCalories = Math.round((caloriesPer100g / 100) * quantityInGrams);
  
  return totalCalories;
};

/**
 * Check if a food is high-calorie (more than 300 calories per 100g)
 */
export const isHighCalorieFood = (
  foodName: string,
  quantity: number,
  unit: string = 'g'
): boolean => {
  const calories = getFoodCalories(foodName, 100, 'g');
  return calories > 300;
};

/**
 * Get suggested foods based on search query
 */
export const searchFoods = (query: string): string[] => {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) {
    return Object.keys(FOOD_CALORIES).slice(0, 20);
  }
  
  return Object.keys(FOOD_CALORIES)
    .filter((food) => food.includes(normalizedQuery))
    .slice(0, 10);
};

