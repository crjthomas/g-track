import firestore from '@react-native-firebase/firestore';
import { NutritionEntry } from '../models/NutritionEntry';

const COLLECTION_NAME = 'nutrition';

/**
 * Get the collection reference for a user's nutrition entries
 */
const getNutritionCollection = (userId: string) => {
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
 * Convert NutritionEntry dates for Firestore
 */
const prepareForFirestore = (entry: Omit<NutritionEntry, 'id'>): any => {
  return {
    ...entry,
    date: entry.date instanceof Date ? firestore.Timestamp.fromDate(entry.date) : entry.date,
    createdAt:
      entry.createdAt instanceof Date
        ? firestore.Timestamp.fromDate(entry.createdAt)
        : entry.createdAt,
  };
};

/**
 * Convert Firestore document to NutritionEntry
 */
const convertFromFirestore = (
  docId: string,
  data: firestore.FirebaseFirestoreTypes.DocumentData
): NutritionEntry => {
  return {
    id: docId,
    ...data,
    date: convertTimestamp(data.date),
    createdAt: convertTimestamp(data.createdAt),
  } as NutritionEntry;
};

/**
 * Add a new nutrition entry
 */
export const addNutritionEntry = async (
  userId: string,
  entry: Omit<NutritionEntry, 'id'>
): Promise<string> => {
  try {
    const nutritionRef = getNutritionCollection(userId);
    const entryData = prepareForFirestore(entry);
    const docRef = await nutritionRef.add(entryData);
    return docRef.id;
  } catch (error: any) {
    console.error('Error adding nutrition entry:', error);
    throw new Error('Failed to add nutrition entry');
  }
};

/**
 * Update an existing nutrition entry
 */
export const updateNutritionEntry = async (
  userId: string,
  entryId: string,
  updates: Partial<Omit<NutritionEntry, 'id' | 'userId' | 'createdAt'>>
): Promise<void> => {
  try {
    const entryRef = getNutritionCollection(userId).doc(entryId);
    const updateData: any = { ...updates };
    // Convert dates to Timestamps if present
    if (updates.date) {
      updateData.date =
        updates.date instanceof Date
          ? firestore.Timestamp.fromDate(updates.date)
          : updates.date;
    }
    await entryRef.update(updateData);
  } catch (error: any) {
    console.error('Error updating nutrition entry:', error);
    throw new Error('Failed to update nutrition entry');
  }
};

/**
 * Delete a nutrition entry
 */
export const deleteNutritionEntry = async (
  userId: string,
  entryId: string
): Promise<void> => {
  try {
    const entryRef = getNutritionCollection(userId).doc(entryId);
    await entryRef.delete();
  } catch (error: any) {
    console.error('Error deleting nutrition entry:', error);
    throw new Error('Failed to delete nutrition entry');
  }
};

/**
 * Get a single nutrition entry by ID
 */
export const getNutritionEntry = async (
  userId: string,
  entryId: string
): Promise<NutritionEntry | null> => {
  try {
    const entryRef = getNutritionCollection(userId).doc(entryId);
    const docSnap = await entryRef.get();
    if (docSnap.exists) {
      return convertFromFirestore(docSnap.id, docSnap.data()!);
    }
    return null;
  } catch (error: any) {
    console.error('Error getting nutrition entry:', error);
    throw new Error('Failed to get nutrition entry');
  }
};

/**
 * Get all nutrition entries for a user
 */
export const getNutritionEntries = async (
  userId: string,
  limit?: number
): Promise<NutritionEntry[]> => {
  try {
    let query = getNutritionCollection(userId).orderBy('date', 'desc');
    
    if (limit) {
      query = query.limit(limit) as any;
    }
    
    const querySnapshot = await query.get();
    const entries: NutritionEntry[] = [];
    
    querySnapshot.forEach((doc) => {
      entries.push(convertFromFirestore(doc.id, doc.data()));
    });
    
    return entries;
  } catch (error: any) {
    console.error('Error getting nutrition entries:', error);
    throw new Error('Failed to get nutrition entries');
  }
};

/**
 * Get nutrition entries within a date range
 */
export const getNutritionEntriesByDateRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<NutritionEntry[]> => {
  try {
    const startTimestamp = firestore.Timestamp.fromDate(startDate);
    const endTimestamp = firestore.Timestamp.fromDate(endDate);
    
    const querySnapshot = await getNutritionCollection(userId)
      .where('date', '>=', startTimestamp)
      .where('date', '<=', endTimestamp)
      .orderBy('date', 'desc')
      .get();
    
    const entries: NutritionEntry[] = [];
    querySnapshot.forEach((doc) => {
      entries.push(convertFromFirestore(doc.id, doc.data()));
    });
    
    return entries;
  } catch (error: any) {
    console.error('Error getting nutrition entries by date range:', error);
    throw new Error('Failed to get nutrition entries by date range');
  }
};

/**
 * Get nutrition entries for a specific date
 */
export const getNutritionEntriesByDate = async (
  userId: string,
  date: Date
): Promise<NutritionEntry[]> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return getNutritionEntriesByDateRange(userId, startOfDay, endOfDay);
};

/**
 * Get high-calorie nutrition entries
 */
export const getHighCalorieEntries = async (
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<NutritionEntry[]> => {
  try {
    const allEntries = startDate && endDate
      ? await getNutritionEntriesByDateRange(userId, startDate, endDate)
      : await getNutritionEntries(userId);
    
    return allEntries.filter((entry) => entry.isHighCalorie);
  } catch (error: any) {
    console.error('Error getting high-calorie entries:', error);
    throw new Error('Failed to get high-calorie entries');
  }
};
