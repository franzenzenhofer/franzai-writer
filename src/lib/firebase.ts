import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { FirebaseErrorHandler } from './firebase-error-handler';
// Removed: import * as firebaseui from "firebaseui";
// Removed compat imports to avoid bundling issues

// Firebase configuration - FAIL HARD if not properly configured
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Check if we're in demo mode
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Validate configuration - log warnings instead of throwing at module level
if (!isDemoMode && (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'demo-api-key')) {
  console.error('FATAL: Firebase API key not configured');
}
if (!isDemoMode && (!firebaseConfig.projectId || firebaseConfig.projectId === 'demo-project')) {
  console.error('FATAL: Firebase project ID not configured');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(app);

// Log Firebase configuration status
console.log('[FIREBASE INIT] Configuration loaded:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  useEmulator: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR,
  isServer: typeof window === 'undefined',
  timestamp: new Date().toISOString()
});

// Connect to emulators if in development
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  console.log('[FIREBASE INIT] Emulator mode enabled');
  
  if (typeof window !== 'undefined') {
    console.log('[FIREBASE INIT] Running in browser, connecting to emulators...');
    
    const { connectAuthEmulator } = require('firebase/auth');
    const { connectFirestoreEmulator } = require('firebase/firestore');
    const { connectStorageEmulator } = require('firebase/storage');
    
    // Connect to auth emulator
    const authEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';
    if (!auth.emulatorConfig) {
      console.log('[FIREBASE INIT] Connecting to Auth emulator at:', authEmulatorHost);
      connectAuthEmulator(auth, `http://${authEmulatorHost}`);
      console.log('[FIREBASE INIT] Auth emulator connected');
    } else {
      console.log('[FIREBASE INIT] Auth emulator already connected');
    }
    
    // Connect to Firestore emulator
    try {
      console.log('[FIREBASE INIT] Connecting to Firestore emulator at: localhost:8080');
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('[FIREBASE INIT] Firestore emulator connected');
    } catch (e) {
      console.log('[FIREBASE INIT] Firestore emulator already connected');
    }
    
    // Connect to Storage emulator
    try {
      console.log('[FIREBASE INIT] Connecting to Storage emulator at: localhost:9199');
      connectStorageEmulator(storage, 'localhost', 9199);
      console.log('[FIREBASE INIT] Storage emulator connected');
    } catch (e) {
      console.log('[FIREBASE INIT] Storage emulator already connected');
    }
  } else {
    console.log('[FIREBASE INIT] Running on server, skipping emulator connection');
  }
} else {
  console.warn('[FIREBASE INIT] WARNING: Using PRODUCTION Firebase!');
}

const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // NOTE: User data storage moved to document persistence layer
    // No direct Firestore operations here
    
    return user;
  } catch (error) {
    const errorInfo = FirebaseErrorHandler.handleFirebaseError(error, 'Account creation');
    FirebaseErrorHandler.logError('signUp', errorInfo, error);
    throw FirebaseErrorHandler.createDetailedError(errorInfo, error);
  }
};

// FirebaseUI configuration - REMOVED from here
// export const uiConfig: firebaseui.auth.Config = { ... };

const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return user;
  } catch (error) {
    const errorInfo = FirebaseErrorHandler.handleFirebaseError(error, 'Sign in');
    FirebaseErrorHandler.logError('signIn', errorInfo, error);
    throw FirebaseErrorHandler.createDetailedError(errorInfo, error);
  }
};

// Google Sign In
const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // NOTE: User data storage moved to document persistence layer
    // No direct Firestore operations here
    
    return user;
  } catch (error) {
    const errorInfo = FirebaseErrorHandler.handleFirebaseError(error, 'Google sign in');
    FirebaseErrorHandler.logError('signInWithGoogle', errorInfo, error);
    throw FirebaseErrorHandler.createDetailedError(errorInfo, error);
  }
};

// Password Reset
const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    const errorInfo = FirebaseErrorHandler.handleFirebaseError(error, 'Password reset');
    FirebaseErrorHandler.logError('resetPassword', errorInfo, error);
    throw FirebaseErrorHandler.createDetailedError(errorInfo, error);
  }
};

// Sign Out
const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    const errorInfo = FirebaseErrorHandler.handleFirebaseError(error, 'Sign out');
    FirebaseErrorHandler.logError('logOut', errorInfo, error);
    throw FirebaseErrorHandler.createDetailedError(errorInfo, error);
  }
};

// Auth State Observer
const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { app, auth, db, storage, signUp, signIn, signInWithGoogle, resetPassword, logOut, onAuthStateChange };
