// Firebase configuration and initialization for the IMADEL frontend
// Docs: https://firebase.google.com/docs/web/setup
//
// We primarily read configuration from Vite environment variables.
// If they are not set (e.g. in local dev), we fall back to the
// provided Firebase config values from your Firebase console.

import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyANLoErOZlS2mTUJCIkbSOZa795Ccg1_NI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'imadelml.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'imadelml',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'imadelml.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '857621693294',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:857621693294:web:258cd7130f37c7e249f77f',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-0BM6VXTJTY',
};

// Initialize Firebase app (safe to call once in the frontend)
export const firebaseApp = initializeApp(firebaseConfig);

// Initialize Analytics only in supported/browser environments
export let analytics: Analytics | null = null;

if (typeof window !== 'undefined') {
  // Analytics is only available in browser contexts
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(firebaseApp);
      }
    })
    .catch(() => {
      // Ignore analytics init errors; app can work without it
      analytics = null;
    });
}


