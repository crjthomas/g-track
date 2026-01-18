import firestore from '@react-native-firebase/firestore';
type Timestamp = firestore.FirebaseFirestoreTypes.Timestamp;

export interface SymptomEntry {
  id?: string;
  userId: string;
  date: Timestamp | Date;
  heartburnSeverity: number; // 1-10 scale
  nausea: boolean;
  nauseaSeverity: number; // 1-10 scale, only relevant if nausea is true
  vomitingEpisodes: number;
  vomitingFrequency: 'hourly' | 'daily' | 'weekly' | 'none';
  vomitColor: 'clear' | 'white' | 'yellow' | 'green' | 'brown' | 'red' | 'none';
  triggers: {
    foods: string[]; // Array of food names
    stress: boolean;
    coldFlu: boolean;
  };
  notes?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface SymptomEntryFormData {
  date: Date;
  heartburnSeverity: number;
  nausea: boolean;
  nauseaSeverity: number;
  vomitingEpisodes: number;
  vomitingFrequency: 'hourly' | 'daily' | 'weekly' | 'none';
  vomitColor: 'clear' | 'white' | 'yellow' | 'green' | 'brown' | 'red' | 'none';
  triggers: {
    foods: string[];
    stress: boolean;
    coldFlu: boolean;
  };
  notes?: string;
}

/**
 * Validate symptom entry data
 */
export const validateSymptomEntry = (data: SymptomEntryFormData): string[] => {
  const errors: string[] = [];

  if (data.heartburnSeverity < 0 || data.heartburnSeverity > 10) {
    errors.push('Heartburn severity must be between 0 and 10');
  }

  if (data.nausea && (data.nauseaSeverity < 0 || data.nauseaSeverity > 10)) {
    errors.push('Nausea severity must be between 0 and 10');
  }

  if (data.vomitingEpisodes < 0) {
    errors.push('Vomiting episodes cannot be negative');
  }

  if (data.vomitingEpisodes > 0 && data.vomitColor === 'none') {
    errors.push('Please specify vomit color if vomiting occurred');
  }

  return errors;
};

/**
 * Convert form data to SymptomEntry
 */
export const createSymptomEntry = (
  userId: string,
  formData: SymptomEntryFormData
): Omit<SymptomEntry, 'id'> => {
  const now = new Date();
  return {
    userId,
    date: formData.date,
    heartburnSeverity: formData.heartburnSeverity,
    nausea: formData.nausea,
    nauseaSeverity: formData.nauseaSeverity,
    vomitingEpisodes: formData.vomitingEpisodes,
    vomitingFrequency: formData.vomitingFrequency,
    vomitColor: formData.vomitColor,
    triggers: formData.triggers,
    notes: formData.notes || '',
    createdAt: now,
    updatedAt: now,
  };
};

