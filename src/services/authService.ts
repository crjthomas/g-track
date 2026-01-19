import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '../config/googleSignIn';

export interface AuthState {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
}

// Initialize Google Sign-In
let googleSignInConfigured = false;

const configureGoogleSignIn = async () => {
  if (googleSignInConfigured) return;
  
  try {
    if (!GOOGLE_WEB_CLIENT_ID) {
      console.warn('Google Web Client ID not configured. Please add it in src/config/googleSignIn.ts');
      return;
    }
    
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });
    googleSignInConfigured = true;
  } catch (error) {
    console.error('Error configuring Google Sign-In:', error);
  }
};

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
    console.error('Registration error:', error);
    // Provide user-friendly error messages
    let errorMessage = 'Failed to register user';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered. Please sign in instead.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please use a stronger password.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    throw new Error(errorMessage);
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
    console.error('Sign in error:', error);
    // Provide user-friendly error messages
    let errorMessage = 'Failed to sign in';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email. Please sign up first.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    } else if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Invalid email or password. Please try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<FirebaseAuthTypes.User> => {
  try {
    await configureGoogleSignIn();
    
    if (!GOOGLE_WEB_CLIENT_ID) {
      throw new Error('Google Web Client ID is not configured. Please add it in src/config/googleSignIn.ts');
    }
    
    // Check if Google Play Services are available
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Sign in with Google
    await GoogleSignin.signIn();
    
    // Get the ID token (this is required for Firebase Auth)
    const tokens = await GoogleSignin.getTokens();
    console.log('Google Sign-In tokens:', tokens ? 'Received' : 'None');
    
    if (!tokens || !tokens.idToken) {
      console.error('No idToken in tokens:', tokens);
      throw new Error('Failed to get Google ID token. Please ensure SHA-1 fingerprints are added to Firebase Console.');
    }
    
    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(tokens.idToken);
    
    // Sign in the user with the credential
    const userCredential = await auth().signInWithCredential(googleCredential);
    
    return userCredential.user;
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    let errorMessage = 'Failed to sign in with Google';
    
    if (error.code === 'auth/account-exists-with-different-credential') {
      errorMessage = 'An account already exists with this email. Please sign in with email/password.';
    } else if (error.code === 'sign_in_cancelled' || error.code === '12501') {
      errorMessage = 'Google Sign-In was cancelled.';
      return Promise.reject(new Error(errorMessage)); // Don't show error for cancellation
    } else if (error.code === 'in_progress' || error.code === '10') {
      errorMessage = 'Google Sign-In is already in progress.';
    } else if (error.code === 'play_services_not_available' || error.code === 'SERVICE_MISSING') {
      errorMessage = 'Google Play Services are not available. Please install Google Play Services.';
    } else if (error.code === '12500' || error.message?.includes('DEVELOPER_ERROR')) {
      errorMessage = 'Developer error: Please add SHA-1 fingerprints to Firebase Console. See GOOGLE_SIGNIN_SETUP.md for instructions.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
};

/**
 * Sign out the current user
 */
export const signOutUser = async (): Promise<void> => {
  try {
    // Sign out from Firebase
    await auth().signOut();
    
    // Sign out from Google (if signed in)
    // Wrap in try-catch since isSignedIn() may not be available in all versions
    // and signOut() will fail gracefully if user isn't signed in with Google
    try {
      await configureGoogleSignIn();
      await GoogleSignin.signOut();
    } catch (googleError) {
      // Ignore Google sign-out errors - user may not be signed in with Google
      console.log('Google sign-out skipped (not signed in or error):', googleError);
    }
  } catch (error: any) {
    console.error('Sign out error:', error);
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
