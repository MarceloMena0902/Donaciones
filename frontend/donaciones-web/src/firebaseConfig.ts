// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider 
} from "firebase/auth";

import {
  getDatabase
} from "firebase/database";
import { getFirestore } from "firebase/firestore"; 
const firebaseConfig = {
  apiKey: "AIzaSyCPvr-xCDu92lYvmqLNXLC_fDHk1HQjb-E",
  authDomain: "cochabambacomparte.firebaseapp.com",
  projectId: "cochabambacomparte",
  storageBucket: "cochabambacomparte.firebasestorage.app",
  messagingSenderId: "631789862214",
  appId: "1:631789862214:web:f6fe75438b492d68be7947"
};

const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// ⭐ Realtime DB (LO QUE NECESITAS)
export const realtimeDb = getDatabase(app);
export const firestoreDb = getFirestore(app); 
export default app;
