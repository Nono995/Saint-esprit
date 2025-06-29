import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyDDdAP3XGeMRhai2gJ6NXB7ZTZGsUFTC_4",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "church-290ce.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "church-290ce",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "church-290ce.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1045543151176",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:1045543151176:web:860b948249101dba651a7d",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-T4DTGQNT1V"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configuration Firebase Auth avec détection d'environnement améliorée
let auth;

// Fonction pour détecter l'environnement
const isReactNative = () => {
  try {
    // Vérifier si Platform de React Native est disponible
    const { Platform } = require('react-native');
    return Platform.OS !== 'web';
  } catch (error) {
    // Si React Native n'est pas disponible, nous sommes sur le web
    return false;
  }
};

// Singleton pour l'instance d'auth
let _auth: any = null;

export function getAuthInstance() {
  if (_auth) return _auth;
  if (isReactNative()) {
    // Initialisation paresseuse pour éviter l'erreur Hermes
    const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    _auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
      // Important: delay initialization until runtime is ready
      // This prevents Hermes error: 'Component auth has not been registered yet'
      // See: https://github.com/firebase/firebase-js-sdk/issues/7585
      // Solution: pass 'popupRedirectResolver: undefined' to avoid eager registration
      popupRedirectResolver: undefined
    });
  } else {
    const { getAuth } = require('firebase/auth');
    _auth = getAuth(app);
  }
  return _auth;
}

// Pour compatibilité avec l'existant
export { getAuthInstance as auth };
