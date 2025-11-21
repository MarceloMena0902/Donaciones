import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

// Cargar credenciales
const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("../../serviceAccountKey.json", import.meta.url))
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cochabambacomparte-default-rtdb.firebaseio.com",
  });
}

// Admin SDK servicios
export const auth = admin.auth();
export const db = admin.firestore();
export const realtimeDb = admin.database();
