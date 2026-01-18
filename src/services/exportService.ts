import {
  getSymptomEntriesByDateRange,
  getSymptomEntries,
} from './symptomService';
import {
  getNutritionEntriesByDateRange,
  getNutritionEntries,
} from './nutritionService';
import {
  getGrowthEntriesByDateRange,
  getGrowthEntries,
} from './growthService';
import {
  exportSymptomsToCSV,
  exportNutritionToCSV,
  exportGrowthToCSV,
  exportAllToCSV,
  shareFile,
  generateExportFilename,
} from '../utils/exportUtils';
import { SymptomEntry } from '../models/SymptomEntry';
import { NutritionEntry } from '../models/NutritionEntry';
import { GrowthEntry } from '../models/GrowthEntry';

export type ExportDataType = 'symptoms' | 'nutrition' | 'growth' | 'all';
export type ExportFormat = 'csv' | 'pdf' | 'both';

export interface ExportOptions {
  userId: string;
  dataType: ExportDataType;
  format: ExportFormat;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Export data based on options
 */
export const exportData = async (options: ExportOptions): Promise<void> => {
  const { userId, dataType, format, startDate, endDate } = options;

  let symptoms: SymptomEntry[] = [];
  let nutrition: NutritionEntry[] = [];
  let growth: GrowthEntry[] = [];

  // Fetch data based on date range
  if (startDate && endDate) {
    if (dataType === 'symptoms' || dataType === 'all') {
      symptoms = await getSymptomEntriesByDateRange(userId, startDate, endDate);
    }
    if (dataType === 'nutrition' || dataType === 'all') {
      nutrition = await getNutritionEntriesByDateRange(
        userId,
        startDate,
        endDate
      );
    }
    if (dataType === 'growth' || dataType === 'all') {
      growth = await getGrowthEntriesByDateRange(userId, startDate, endDate);
    }
  } else {
    // Fetch all data
    if (dataType === 'symptoms' || dataType === 'all') {
      symptoms = await getSymptomEntries(userId);
    }
    if (dataType === 'nutrition' || dataType === 'all') {
      nutrition = await getNutritionEntries(userId);
    }
    if (dataType === 'growth' || dataType === 'all') {
      growth = await getGrowthEntries(userId);
    }
  }

  // Export CSV
  if (format === 'csv' || format === 'both') {
    let filePath: string;

    if (dataType === 'symptoms') {
      const filename = generateExportFilename('symptoms');
      filePath = await exportSymptomsToCSV(symptoms, filename);
      await shareFile(filePath, 'Symptoms Export');
    } else if (dataType === 'nutrition') {
      const filename = generateExportFilename('nutrition');
      filePath = await exportNutritionToCSV(nutrition, filename);
      await shareFile(filePath, 'Nutrition Export');
    } else if (dataType === 'growth') {
      const filename = generateExportFilename('growth');
      filePath = await exportGrowthToCSV(growth, filename);
      await shareFile(filePath, 'Growth Export');
    } else {
      const filename = generateExportFilename('all_data');
      filePath = await exportAllToCSV(symptoms, nutrition, growth, filename);
      await shareFile(filePath, 'Complete Data Export');
    }
  }

  // TODO: PDF export implementation
  // if (format === 'pdf' || format === 'both') {
  //   // Implement PDF generation
  // }
};

