import firestore from '@react-native-firebase/firestore';
type Timestamp = firestore.FirebaseFirestoreTypes.Timestamp;

export type WeightUnit = 'kg' | 'lbs';
export type HeightUnit = 'cm' | 'inches';

export interface GrowthEntry {
  id?: string;
  userId: string;
  date: Timestamp | Date;
  weight: number;
  weightUnit: WeightUnit;
  height: number;
  heightUnit: HeightUnit;
  bmi?: number;
  createdAt: Timestamp | Date;
}

export interface GrowthEntryFormData {
  date: Date;
  weight: number;
  weightUnit: WeightUnit;
  height: number;
  heightUnit: HeightUnit;
}

/**
 * Convert weight from lbs to kg
 */
export const convertWeightToKg = (weight: number, unit: WeightUnit): number => {
  return unit === 'lbs' ? weight * 0.453592 : weight;
};

/**
 * Convert height from inches to cm
 */
export const convertHeightToCm = (
  height: number,
  unit: HeightUnit
): number => {
  return unit === 'inches' ? height * 2.54 : height;
};

/**
 * Calculate BMI
 */
export const calculateBMI = (
  weight: number,
  weightUnit: WeightUnit,
  height: number,
  heightUnit: HeightUnit
): number => {
  const weightKg = convertWeightToKg(weight, weightUnit);
  const heightM = convertHeightToCm(height, heightUnit) / 100;
  
  if (heightM === 0) return 0;
  
  return parseFloat((weightKg / (heightM * heightM)).toFixed(2));
};

/**
 * Validate growth entry data
 */
export const validateGrowthEntry = (
  data: GrowthEntryFormData
): string[] => {
  const errors: string[] = [];

  if (data.weight <= 0) {
    errors.push('Weight must be greater than 0');
  }

  if (data.height <= 0) {
    errors.push('Height must be greater than 0');
  }

  // Reasonable bounds check
  if (data.weightUnit === 'kg' && (data.weight < 1 || data.weight > 200)) {
    errors.push('Weight seems unrealistic. Please check the value.');
  }

  if (data.weightUnit === 'lbs' && (data.weight < 2 || data.weight > 440)) {
    errors.push('Weight seems unrealistic. Please check the value.');
  }

  if (data.heightUnit === 'cm' && (data.height < 30 || data.height > 250)) {
    errors.push('Height seems unrealistic. Please check the value.');
  }

  if (
    data.heightUnit === 'inches' &&
    (data.height < 12 || data.height > 98)
  ) {
    errors.push('Height seems unrealistic. Please check the value.');
  }

  return errors;
};

/**
 * Convert form data to GrowthEntry
 */
export const createGrowthEntry = (
  userId: string,
  formData: GrowthEntryFormData
): Omit<GrowthEntry, 'id'> => {
  const now = new Date();
  const bmi = calculateBMI(
    formData.weight,
    formData.weightUnit,
    formData.height,
    formData.heightUnit
  );

  return {
    userId,
    date: formData.date,
    weight: formData.weight,
    weightUnit: formData.weightUnit,
    height: formData.height,
    heightUnit: formData.heightUnit,
    bmi,
    createdAt: now,
  };
};

