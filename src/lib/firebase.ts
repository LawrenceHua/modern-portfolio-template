import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app
let app;
try {
  app =
    firebaseConfig.apiKey && firebaseConfig.projectId
      ? !getApps().length
        ? initializeApp(firebaseConfig)
        : getApp()
      : null;
} catch (error) {
  console.error('Firebase initialization failed:', error);
  app = null;
}

// Initialize Firestore
export const db = app ? getFirestore(app) : null;

// Check if Firebase is properly initialized
export const isFirebaseInitialized = () => {
  return db !== null && typeof window !== 'undefined';
};
