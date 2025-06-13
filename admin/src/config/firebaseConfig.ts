import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDDdAP3XGeMRhai2gJ6NXB7ZTZGsUFTC_4",
  authDomain: "church-290ce.firebaseapp.com",
  projectId: "church-290ce",
  storageBucket: "church-290ce.firebasestorage.app",
  messagingSenderId: "1045543151176",
  appId: "1:1045543151176:web:860b948249101dba651a7d",
  measurementId: "G-T4DTGQNT1V"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
