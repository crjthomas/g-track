import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { SymptomEntry } from '../models/SymptomEntry';
import { NutritionEntry } from '../models/NutritionEntry';
import { GrowthEntry } from '../models/GrowthEntry';
import { HighCalorieFoodSuggestion } from '../models/MealPlan';
import { formatDate, formatDateTime } from './dateUtils';

const EXPORTS_DIR = `${RNFS.DocumentDirectoryPath}/exports`;

/**
 * Ensure exports directory exists
 */
const ensureExportsDir = async () => {
  const dirExists = await RNFS.exists(EXPORTS_DIR);
  if (!dirExists) {
    await RNFS.mkdir(EXPORTS_DIR);
  }
};

/**
 * Convert SymptomEntry to CSV row
 */
const symptomToCSVRow = (entry: SymptomEntry): string => {
  const date = formatDateTime(entry.date);
  const triggers = [
    ...entry.triggers.foods,
    entry.triggers.stress ? 'Stress' : '',
    entry.triggers.coldFlu ? 'Cold/Flu' : '',
  ]
    .filter(Boolean)
    .join('; ');

  return [
    date,
    entry.heartburnSeverity.toString(),
    entry.nausea ? 'Yes' : 'No',
    entry.nauseaSeverity.toString(),
    entry.vomitingEpisodes.toString(),
    entry.vomitingFrequency,
    entry.vomitColor,
    triggers,
    entry.notes || '',
  ].join(',');
};

/**
 * Convert NutritionEntry to CSV row
 */
const nutritionToCSVRow = (entry: NutritionEntry): string => {
  const date = formatDate(entry.date);
  return [
    date,
    entry.mealType,
    entry.foodName,
    entry.quantity.toString(),
    entry.unit,
    entry.calories.toString(),
    entry.isHighCalorie ? 'Yes' : 'No',
    entry.notes || '',
  ].join(',');
};

/**
 * Convert GrowthEntry to CSV row
 */
const growthToCSVRow = (entry: GrowthEntry): string => {
  const date = formatDate(entry.date);
  return [
    date,
    entry.weight.toString(),
    entry.weightUnit,
    entry.height.toString(),
    entry.heightUnit,
    entry.bmi?.toString() || '',
  ].join(',');
};

/**
 * Export symptoms to CSV
 */
export const exportSymptomsToCSV = async (
  entries: SymptomEntry[],
  filename: string = 'symptoms_export.csv'
): Promise<string> => {
  await ensureExportsDir();

  const headers = [
    'Date & Time',
    'Heartburn Severity',
    'Nausea',
    'Nausea Severity',
    'Vomiting Episodes',
    'Vomiting Frequency',
    'Vomit Color',
    'Triggers',
    'Notes',
  ];

  const rows = [headers.join(','), ...entries.map(symptomToCSVRow)];
  const csvContent = rows.join('\n');

  const filePath = `${EXPORTS_DIR}/${filename}`;
  await RNFS.writeFile(filePath, csvContent, 'utf8');

  return filePath;
};

/**
 * Export nutrition to CSV
 */
export const exportNutritionToCSV = async (
  entries: NutritionEntry[],
  filename: string = 'nutrition_export.csv'
): Promise<string> => {
  await ensureExportsDir();

  const headers = [
    'Date',
    'Meal Type',
    'Food Name',
    'Quantity',
    'Unit',
    'Calories',
    'High-Calorie',
    'Notes',
  ];

  const rows = [headers.join(','), ...entries.map(nutritionToCSVRow)];
  const csvContent = rows.join('\n');

  const filePath = `${EXPORTS_DIR}/${filename}`;
  await RNFS.writeFile(filePath, csvContent, 'utf8');

  return filePath;
};

/**
 * Export growth to CSV
 */
export const exportGrowthToCSV = async (
  entries: GrowthEntry[],
  filename: string = 'growth_export.csv'
): Promise<string> => {
  await ensureExportsDir();

  const headers = ['Date', 'Weight', 'Weight Unit', 'Height', 'Height Unit', 'BMI'];

  const rows = [headers.join(','), ...entries.map(growthToCSVRow)];
  const csvContent = rows.join('\n');

  const filePath = `${EXPORTS_DIR}/${filename}`;
  await RNFS.writeFile(filePath, csvContent, 'utf8');

  return filePath;
};

/**
 * Export all data to CSV
 */
export const exportAllToCSV = async (
  symptoms: SymptomEntry[],
  nutrition: NutritionEntry[],
  growth: GrowthEntry[],
  filename: string = 'all_data_export.csv'
): Promise<string> => {
  await ensureExportsDir();

  const sections: string[] = [];

  // Symptoms section
  if (symptoms.length > 0) {
    sections.push('SYMPTOMS');
    sections.push(
      [
        'Date & Time',
        'Heartburn Severity',
        'Nausea',
        'Nausea Severity',
        'Vomiting Episodes',
        'Vomiting Frequency',
        'Vomit Color',
        'Triggers',
        'Notes',
      ].join(',')
    );
    sections.push(...symptoms.map(symptomToCSVRow));
    sections.push('');
  }

  // Nutrition section
  if (nutrition.length > 0) {
    sections.push('NUTRITION');
    sections.push(
      [
        'Date',
        'Meal Type',
        'Food Name',
        'Quantity',
        'Unit',
        'Calories',
        'High-Calorie',
        'Notes',
      ].join(',')
    );
    sections.push(...nutrition.map(nutritionToCSVRow));
    sections.push('');
  }

  // Growth section
  if (growth.length > 0) {
    sections.push('GROWTH');
    sections.push(
      ['Date', 'Weight', 'Weight Unit', 'Height', 'Height Unit', 'BMI'].join(',')
    );
    sections.push(...growth.map(growthToCSVRow));
  }

  const csvContent = sections.join('\n');
  const filePath = `${EXPORTS_DIR}/${filename}`;
  await RNFS.writeFile(filePath, csvContent, 'utf8');

  return filePath;
};

/**
 * Share file
 */
export const shareFile = async (filePath: string, title: string = 'Export') => {
  try {
    const shareOptions = {
      title,
      url: `file://${filePath}`,
      type: 'text/csv',
    };
    await Share.open(shareOptions);
  } catch (error: any) {
    if (error.message !== 'User did not share') {
      throw error;
    }
  }
};

/**
 * Export meal plan to CSV
 */
export const exportMealPlanToCSV = async (
  mealPlan: {
    breakfast: HighCalorieFoodSuggestion[];
    lunch: HighCalorieFoodSuggestion[];
    dinner: HighCalorieFoodSuggestion[];
    snacks: HighCalorieFoodSuggestion[];
  },
  date: Date,
  targetCalories: number,
  currentCalories: number,
  filename: string = 'meal_plan_export.csv'
): Promise<string> => {
  await ensureExportsDir();

  const sections: string[] = [];
  
  // Ensure date is at local midnight to avoid timezone issues
  const localDate = new Date(date);
  localDate.setHours(0, 0, 0, 0);
  
  // Header
  sections.push('AI-GENERATED MEAL PLAN');
  sections.push(`Date: ${formatDate(localDate)}`);
  sections.push(`Target Calories: ${targetCalories} kcal`);
  sections.push(`Current Calories: ${currentCalories} kcal`);
  sections.push(`Remaining: ${targetCalories - currentCalories} kcal`);
  sections.push('');
  
  // Helper to format meal suggestions
  const formatMealSuggestions = (
    mealType: string,
    suggestions: HighCalorieFoodSuggestion[]
  ): string[] => {
    const mealSection: string[] = [];
    mealSection.push(mealType.toUpperCase());
    mealSection.push('Food Name,Quantity,Unit,Calories per 100g,Total Calories,Category,Reason,Benefits');
    
    suggestions.forEach((suggestion) => {
      const totalCalories = Math.round(
        (suggestion.caloriesPer100g / 100) * suggestion.recommendedQuantity
      );
      const benefits = suggestion.benefits ? suggestion.benefits.join('; ') : '';
      
      mealSection.push([
        `"${suggestion.foodName}"`,
        suggestion.recommendedQuantity.toString(),
        suggestion.unit,
        suggestion.caloriesPer100g.toString(),
        totalCalories.toString(),
        suggestion.category || '',
        `"${suggestion.reason}"`,
        `"${benefits}"`,
      ].join(','));
    });
    
    mealSection.push('');
    return mealSection;
  };
  
  // Add each meal type
  if (mealPlan.breakfast.length > 0) {
    sections.push(...formatMealSuggestions('Breakfast', mealPlan.breakfast));
  }
  if (mealPlan.lunch.length > 0) {
    sections.push(...formatMealSuggestions('Lunch', mealPlan.lunch));
  }
  if (mealPlan.dinner.length > 0) {
    sections.push(...formatMealSuggestions('Dinner', mealPlan.dinner));
  }
  if (mealPlan.snacks.length > 0) {
    sections.push(...formatMealSuggestions('Snacks', mealPlan.snacks));
  }
  
  const csvContent = sections.join('\n');
  const filePath = `${EXPORTS_DIR}/${filename}`;
  await RNFS.writeFile(filePath, csvContent, 'utf8');
  
  return filePath;
};

/**
 * Generate filename with timestamp
 */
export const generateExportFilename = (
  prefix: string,
  extension: string = 'csv'
): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${prefix}_${timestamp}.${extension}`;
};

