import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export interface AuthState {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
}

/**
 * Register a new user with email and password
 */
export const registerUser = async (
  email: string,
  password: string
): Promise<FirebaseAuthTypes.User> => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password
    );
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to register user');
  }
};

/**
 * Sign in with email and password
 */
export const signInUser = async (
  email: string,
  password: string
): Promise<FirebaseAuthTypes.User> => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      password
    );
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in');
  }
};

/**
 * Sign out the current user
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await auth().signOut();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign out');
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = (): FirebaseAuthTypes.User | null => {
  return auth().currentUser;
};

/**
 * Listen to authentication state changes
 */
export const onAuthStateChange = (
  callback: (user: FirebaseAuthTypes.User | null) => void
): (() => void) => {
  return auth().onAuthStateChanged(callback);
};
