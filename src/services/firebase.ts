import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Firebase is automatically initialized when google-services.json is present
// No manual initialization needed for React Native Firebase

// Enable offline persistence for Firestore
firestore().settings({
  persistence: true,
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
});

export { auth, firestore };
export default firebase;
