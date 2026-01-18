import firestore from '@react-native-firebase/firestore';
import { SymptomEntry } from '../models/SymptomEntry';

const COLLECTION_NAME = 'symptoms';

/**
 * Get the collection reference for a user's symptoms
 */
const getSymptomsCollection = (userId: string) => {
  return firestore().collection('users').doc(userId).collection(COLLECTION_NAME);
};

/**
 * Convert Firestore timestamp to Date
 */
const convertTimestamp = (timestamp: firestore.FirebaseFirestoreTypes.Timestamp | Date): Date => {
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
};

/**
 * Convert SymptomEntry dates for Firestore
 */
const prepareForFirestore = (entry: Omit<SymptomEntry, 'id'>): any => {
  return {
    ...entry,
    date: entry.date instanceof Date ? firestore.Timestamp.fromDate(entry.date) : entry.date,
    createdAt:
      entry.createdAt instanceof Date
        ? firestore.Timestamp.fromDate(entry.createdAt)
        : entry.createdAt,
    updatedAt:
      entry.updatedAt instanceof Date
        ? firestore.Timestamp.fromDate(entry.updatedAt)
        : entry.updatedAt,
  };
};

/**
 * Convert Firestore document to SymptomEntry
 */
const convertFromFirestore = (
  docId: string,
  data: firestore.FirebaseFirestoreTypes.DocumentData
): SymptomEntry => {
  return {
    id: docId,
    ...data,
    date: convertTimestamp(data.date),
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
  } as SymptomEntry;
};

/**
 * Add a new symptom entry
 */
export const addSymptomEntry = async (
  userId: string,
  entry: Omit<SymptomEntry, 'id'>
): Promise<string> => {
  try {
    const symptomsRef = getSymptomsCollection(userId);
    const entryData = prepareForFirestore(entry);
    const docRef = await symptomsRef.add(entryData);
    return docRef.id;
  } catch (error: any) {
    console.error('Error adding symptom entry:', error);
    throw new Error('Failed to add symptom entry');
  }
};

/**
 * Update an existing symptom entry
 */
export const updateSymptomEntry = async (
  userId: string,
  entryId: string,
  updates: Partial<Omit<SymptomEntry, 'id' | 'userId' | 'createdAt'>>
): Promise<void> => {
  try {
    const entryRef = getSymptomsCollection(userId).doc(entryId);
    const updateData: any = {
      ...updates,
      updatedAt: firestore.Timestamp.now(),
    };
    // Convert dates to Timestamps if present
    if (updates.date) {
      updateData.date =
        updates.date instanceof Date
          ? firestore.Timestamp.fromDate(updates.date)
          : updates.date;
    }
    await entryRef.update(updateData);
  } catch (error: any) {
    console.error('Error updating symptom entry:', error);
    throw new Error('Failed to update symptom entry');
  }
};

/**
 * Delete a symptom entry
 */
export const deleteSymptomEntry = async (
  userId: string,
  entryId: string
): Promise<void> => {
  try {
    const entryRef = getSymptomsCollection(userId).doc(entryId);
    await entryRef.delete();
  } catch (error: any) {
    console.error('Error deleting symptom entry:', error);
    throw new Error('Failed to delete symptom entry');
  }
};

/**
 * Get a single symptom entry by ID
 */
export const getSymptomEntry = async (
  userId: string,
  entryId: string
): Promise<SymptomEntry | null> => {
  try {
    const entryRef = getSymptomsCollection(userId).doc(entryId);
    const docSnap = await entryRef.get();
    if (docSnap.exists) {
      return convertFromFirestore(docSnap.id, docSnap.data()!);
    }
    return null;
  } catch (error: any) {
    console.error('Error getting symptom entry:', error);
    throw new Error('Failed to get symptom entry');
  }
};

/**
 * Get all symptom entries for a user
 */
export const getSymptomEntries = async (
  userId: string,
  limit?: number
): Promise<SymptomEntry[]> => {
  try {
    let query = getSymptomsCollection(userId).orderBy('date', 'desc');
    
    if (limit) {
      query = query.limit(limit) as any;
    }
    
    const querySnapshot = await query.get();
    
    const entries: SymptomEntry[] = [];
    querySnapshot.forEach((doc) => {
      entries.push(convertFromFirestore(doc.id, doc.data()));
    });
    
    return entries;
  } catch (error: any) {
    console.error('Error getting symptom entries:', error);
    throw new Error('Failed to get symptom entries');
  }
};

/**
 * Get symptom entries within a date range
 */
export const getSymptomEntriesByDateRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<SymptomEntry[]> => {
  try {
    const startTimestamp = firestore.Timestamp.fromDate(startDate);
    const endTimestamp = firestore.Timestamp.fromDate(endDate);
    
    const querySnapshot = await getSymptomsCollection(userId)
      .where('date', '>=', startTimestamp)
      .where('date', '<=', endTimestamp)
      .orderBy('date', 'desc')
      .get();
    
    const entries: SymptomEntry[] = [];
    querySnapshot.forEach((doc) => {
      entries.push(convertFromFirestore(doc.id, doc.data()));
    });
    
    return entries;
  } catch (error: any) {
    console.error('Error getting symptom entries by date range:', error);
    throw new Error('Failed to get symptom entries by date range');
  }
};
