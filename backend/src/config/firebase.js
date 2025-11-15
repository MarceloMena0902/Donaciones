import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
import { getDatabase } from "firebase-admin/database";

dotenv.config();

// Cargar credenciales
const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("../../serviceAccountKey.json", import.meta.url))
);

// Inicializar Firebase solo una vez
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://donaciones-e6a4f-default-rtdb.firebaseio.com",
  });
}

//  Exportar servicios principales
const auth = admin.auth();
const db = admin.firestore();
const realtimeDb = getDatabase();

export { auth, db, realtimeDb };
