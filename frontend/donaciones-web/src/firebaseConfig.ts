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

const firebaseConfig = {
  apiKey: "AIzaSyCRRbqkr9AVNPJkb79GfdDcT6gGdQtu2uE",
  authDomain: "donaciones-e6a4f.firebaseapp.com",
  databaseURL: "https://donaciones-e6a4f-default-rtdb.firebaseio.com",
  projectId: "donaciones-e6a4f",
  storageBucket: "donaciones-e6a4f.appspot.com",
  messagingSenderId: "46587410770",
  appId: "1:46587410770:web:640ca308e4dfb2d0da28b",
};

const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// ⭐ Realtime DB (LO QUE NECESITAS)
export const realtimeDb = getDatabase(app);

export default app;
