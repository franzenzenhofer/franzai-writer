import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
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
// Removed: import * as firebaseui from "firebaseui";
import firebase from 'firebase/compat/app'; // Added for firebase.auth namespace
import 'firebase/compat/auth'; // Required for firebase.auth.GoogleAuthProvider, etc.

// Firebase configuration - FAIL HARD if not properly configured
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Validate configuration - FAIL HARD if missing
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'demo-api-key') {
  throw new Error('FATAL: Firebase API key not configured');
}
if (!firebaseConfig.projectId || firebaseConfig.projectId === 'demo-project') {
  throw new Error('FATAL: Firebase project ID not configured');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Connect to emulators if in development
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' && typeof window !== 'undefined') {
  const { connectAuthEmulator } = require('firebase/auth');
  const { connectFirestoreEmulator } = require('firebase/firestore');
  
  // Connect to auth emulator
  if (!auth.emulatorConfig) {
    connectAuthEmulator(auth, `http://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099'}`);
  }
  
  // Connect to Firestore emulator
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (e) {
    console.log('Firestore emulator already connected');
  }
}

const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // NOTE: User data storage moved to document persistence layer
    // No direct Firestore operations here
    
    return user;
  } catch (error) {
    throw error;
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
    throw error;
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
    throw error;
  }
};

// Password Reset
const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

// Sign Out
const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// Auth State Observer
const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { app, auth, db, signUp, signIn, signInWithGoogle, resetPassword, logOut, onAuthStateChange };
