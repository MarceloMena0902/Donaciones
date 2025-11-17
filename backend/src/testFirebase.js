import { db } from "./config/firebase.js";

async function testConnection() {
  try {
    const docRef = await db.collection("test").add({
      message: "Hola Tilín 🔥",
      date: new Date().toISOString(),
    });
    console.log("✅ Firestore funcionando. ID:", docRef.id);
  } catch (error) {
    console.error("❌ Error conectando a Firebase:", error);
  }
}

testConnection();
