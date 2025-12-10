import { db } from "../config/firebase.js";
import admin from "firebase-admin";

// ======================================================
// CREAR DONACIÓN (optimizado para registrar el ID en users/{uid})
// ======================================================
export const createDonation = async (req, res) => {
  try {
    const {
      userId,
      type,
      description,
      quantity,
      unit,
      location,
      expirationDate,
      images
    } = req.body;

    if (!userId || !type || !description || !quantity || !unit) {
      return res.status(400).json({ error: "Faltan datos obligatorios para la donación." });
    }

    // ⏰ Ajuste de zona horaria Bolivia (UTC-4)
    const expirationLocal = expirationDate
      ? new Date(expirationDate + "T23:59:59-04:00")
      : null;

    const donationRef = await db.collection("donations").add({
      userId,
      type,
      description,
      quantity,
      unit,
      location: location || null,
      expirationDate: expirationLocal,
      status: "Disponible",
      images: images || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.collection("users").doc(userId).set(
      {
        donations: admin.firestore.FieldValue.arrayUnion(donationRef.id),
      },
      { merge: true }
    );

    res.status(201).json({ id: donationRef.id, message: "Donación registrada correctamente." });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ======================================================
// OBTENER TODAS LAS DONACIONES
// ======================================================
export const getDonations = async (req, res) => {
  try {
    const snapshot = await db.collection("donations").get();
    const donations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ======================================================
// OBTENER DONACIÓN POR ID
// ======================================================
export const getDonationById = async (req, res) => {
  try {
    const { id } = req.params;
    const docSnap = await db.collection("donations").doc(id).get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Donación no encontrada." });
    }

    res.status(200).json({ id: docSnap.id, ...docSnap.data() });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ======================================================
// ACTUALIZAR DONACIÓN
// ======================================================
export const updateDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      description,
      quantity,
      unit,
      location,
      status,
      expirationDate,
      images
    } = req.body;

    const donationRef = db.collection("donations").doc(id);
    const docSnap = await donationRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Donación no encontrada." });
    }

    const expirationLocal = expirationDate
      ? new Date(expirationDate + "T23:59:59-04:00")
      : null;

    await donationRef.update({
      type,
      description,
      quantity,
      unit,
      location,
      expirationDate: expirationLocal,
      status,
      images,
      updatedAt: new Date(),
    });

    res.status(200).json({ message: "Donación actualizada correctamente." });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ======================================================
// ELIMINAR DONACIÓN
// ======================================================
export const deleteDonation = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("donations").doc(id).delete();

    res.status(200).json({
      message: "Donación eliminada correctamente."
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ======================================================
// 🔥 GET DONATIONS BY USER — ULTRA OPTIMIZADO
// ======================================================
export const getDonationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: "Faltan parámetros: userId es obligatorio."
      });
    }

    // 1️⃣ Leer SOLO el usuario (1 lectura)
    const userSnap = await db.collection("users").doc(userId).get();

    if (!userSnap.exists) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const donationIds = userSnap.data().donations || [];

    if (donationIds.length === 0) {
      return res.status(200).json([]);
    }

    // 2️⃣ Firestore solo permite "in" con máximo 10 IDs
    const chunks = [];
    for (let i = 0; i < donationIds.length; i += 10) {
      chunks.push(donationIds.slice(i, i + 10));
    }

    const results = [];

    // 3️⃣ Hacer consultas por bloques de 10
    for (const chunk of chunks) {
      const snap = await db
        .collection("donations")
        .where(admin.firestore.FieldPath.documentId(), "in", chunk)
        .get();

      snap.forEach(doc => {
        results.push({
          id: doc.id,
          ...doc.data(),
        });
      });
    }

    res.status(200).json(results);

  } catch (error) {
    console.log("❌ ERROR en getDonationsByUser:", error);
    res.status(500).json({ error: error.message });
  }
};
