import firestore from '@react-native-firebase/firestore';
import { GrowthEntry } from '../models/GrowthEntry';

const COLLECTION_NAME = 'growth';

/**
 * Get the collection reference for a user's growth entries
 */
const getGrowthCollection = (userId: string) => {
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
 * Convert GrowthEntry dates for Firestore
 */
const prepareForFirestore = (entry: Omit<GrowthEntry, 'id'>): any => {
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
 * Convert Firestore document to GrowthEntry
 */
const convertFromFirestore = (
  docId: string,
  data: firestore.FirebaseFirestoreTypes.DocumentData
): GrowthEntry => {
  return {
    id: docId,
    ...data,
    date: convertTimestamp(data.date),
    createdAt: convertTimestamp(data.createdAt),
  } as GrowthEntry;
};

/**
 * Add a new growth entry
 */
export const addGrowthEntry = async (
  userId: string,
  entry: Omit<GrowthEntry, 'id'>
): Promise<string> => {
  try {
    const growthRef = getGrowthCollection(userId);
    const entryData = prepareForFirestore(entry);
    const docRef = await growthRef.add(entryData);
    return docRef.id;
  } catch (error: any) {
    console.error('Error adding growth entry:', error);
    throw new Error('Failed to add growth entry');
  }
};

/**
 * Update an existing growth entry
 */
export const updateGrowthEntry = async (
  userId: string,
  entryId: string,
  updates: Partial<Omit<GrowthEntry, 'id' | 'userId' | 'createdAt'>>
): Promise<void> => {
  try {
    const entryRef = getGrowthCollection(userId).doc(entryId);
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
    console.error('Error updating growth entry:', error);
    throw new Error('Failed to update growth entry');
  }
};

/**
 * Delete a growth entry
 */
export const deleteGrowthEntry = async (
  userId: string,
  entryId: string
): Promise<void> => {
  try {
    const entryRef = getGrowthCollection(userId).doc(entryId);
    await entryRef.delete();
  } catch (error: any) {
    console.error('Error deleting growth entry:', error);
    throw new Error('Failed to delete growth entry');
  }
};

/**
 * Get a single growth entry by ID
 */
export const getGrowthEntry = async (
  userId: string,
  entryId: string
): Promise<GrowthEntry | null> => {
  try {
    const entryRef = getGrowthCollection(userId).doc(entryId);
    const docSnap = await entryRef.get();
    if (docSnap.exists) {
      return convertFromFirestore(docSnap.id, docSnap.data()!);
    }
    return null;
  } catch (error: any) {
    console.error('Error getting growth entry:', error);
    throw new Error('Failed to get growth entry');
  }
};

/**
 * Get all growth entries for a user
 */
export const getGrowthEntries = async (
  userId: string,
  limit?: number
): Promise<GrowthEntry[]> => {
  try {
    let query = getGrowthCollection(userId).orderBy('date', 'desc');
    
    if (limit) {
      query = query.limit(limit) as any;
    }
    
    const querySnapshot = await query.get();
    const entries: GrowthEntry[] = [];
    
    querySnapshot.forEach((doc) => {
      entries.push(convertFromFirestore(doc.id, doc.data()));
    });
    
    return entries;
  } catch (error: any) {
    console.error('Error getting growth entries:', error);
    throw new Error('Failed to get growth entries');
  }
};

/**
 * Get growth entries within a date range
 */
export const getGrowthEntriesByDateRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<GrowthEntry[]> => {
  try {
    const startTimestamp = firestore.Timestamp.fromDate(startDate);
    const endTimestamp = firestore.Timestamp.fromDate(endDate);
    
    const querySnapshot = await getGrowthCollection(userId)
      .where('date', '>=', startTimestamp)
      .where('date', '<=', endTimestamp)
      .orderBy('date', 'desc')
      .get();
    
    const entries: GrowthEntry[] = [];
    querySnapshot.forEach((doc) => {
      entries.push(convertFromFirestore(doc.id, doc.data()));
    });
    
    return entries;
  } catch (error: any) {
    console.error('Error getting growth entries by date range:', error);
    throw new Error('Failed to get growth entries by date range');
  }
};

/**
 * Get the most recent growth entry
 */
export const getLatestGrowthEntry = async (
  userId: string
): Promise<GrowthEntry | null> => {
  try {
    const entries = await getGrowthEntries(userId, 1);
    return entries.length > 0 ? entries[0] : null;
  } catch (error: any) {
    console.error('Error getting latest growth entry:', error);
    throw new Error('Failed to get latest growth entry');
  }
};
