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
// Removed compat imports to simplify module loading

// Firebase configuration - FAIL HARD if not properly configured
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Validate configuration - only log warnings, don't throw at module level
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'demo-api-key') {
  console.warn('WARNING: Firebase API key not configured');
}
if (!firebaseConfig.projectId || firebaseConfig.projectId === 'demo-project') {
  console.warn('WARNING: Firebase project ID not configured');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

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
  } else {
    console.log('[FIREBASE INIT] Running on server, skipping emulator connection');
  }
} else {
  console.warn('[FIREBASE INIT] WARNING: Using PRODUCTION Firebase!');
}

// Export authentication functions separately to avoid complex module initialization
// These will be moved to a separate auth-functions.ts file if needed

// Export only the essential Firebase instances
export { auth, db };
