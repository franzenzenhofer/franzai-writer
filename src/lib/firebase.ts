
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
// Removed: import * as firebaseui from "firebaseui";
import firebase from 'firebase/compat/app'; // Added for firebase.auth namespace
import 'firebase/compat/auth'; // Required for firebase.auth.GoogleAuthProvider, etc.

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // You might want to store additional user data in Firestore here
    await addDoc(collection(db, "users"), {
      uid: user.uid,
      email: user.email,
      createdAt: new Date(),
    });
    return user;
  } catch (error) {
    throw error;
  }
};

// FirebaseUI configuration - REMOVED from here
// export const uiConfig: firebaseui.auth.Config = { ... };

const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return user;
  } catch (error) {
    throw error;
  }
};

export { app, auth, db, signUp, signIn };
