import { db } from "../config/firebase.js";
import admin from "firebase-admin";

// ======================================================
// Helpers de fecha
// ======================================================
const normalizeExpiration = (expirationDate) => {
  if (!expirationDate) return null;

  // Caso: viene solo "YYYY-MM-DD" desde el front
  if (/^\d{4}-\d{2}-\d{2}$/.test(expirationDate)) {
    // válido TODO el día en Bolivia
    return new Date(expirationDate + "T23:59:59-04:00");
  }

  // Caso: viene completo con hora
  return new Date(expirationDate);
};

// 👉 NUEVO: formatear lo que se envía al cliente
const formatExpirationForClient = (exp) => {
  if (!exp) return null;

  let dateObj;

  if (exp instanceof admin.firestore.Timestamp) {
    dateObj = exp.toDate();
  } else if (exp instanceof Date) {
    dateObj = exp;
  } else {
    // ya es string tipo "2025-12-09" → lo devolvemos tal cual
    return exp;
  }

  const laPazString = dateObj.toLocaleDateString("en-CA", {
    timeZone: "America/La_Paz",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // "2025-12-09"
  return laPazString.slice(0, 10);
};

// ======================================================
// FUNCIÓN REUTILIZABLE — NORMALIZAR FECHA A UTC-4
// ======================================================


// ======================================================
// CREAR DONACIÓN
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

    const expirationLocal = normalizeExpiration(expirationDate);

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

    // Registrar ID en el usuario
    await db.collection("users").doc(userId).set(
      {
        donations: admin.firestore.FieldValue.arrayUnion(donationRef.id),
      },
      { merge: true }
    );

    res.status(201).json({ id: donationRef.id, message: "Donación registrada correctamente." });

  } catch (error) {
    console.error("❌ ERROR CREATE:", error);
    res.status(500).json({ error: error.message });
  }
};

// ======================================================
// OBTENER TODAS LAS DONACIONES
// ======================================================
export const getDonations = async (req, res) => {
  try {
    const snapshot = await db.collection("donations").get();

    const donations = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        expirationDate: formatExpirationForClient(data.expirationDate),
      };
    });

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

    const data = docSnap.data();

    res.status(200).json({
      id: docSnap.id,
      ...data,
      expirationDate: formatExpirationForClient(data.expirationDate),
    });
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

    const expirationLocal = normalizeExpiration(expirationDate);

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
    console.error("❌ ERROR UPDATE:", error);
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
// 🔥 GET DONATIONS BY USER — OPTIMIZADO
// ======================================================
export const getDonationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "Faltan parámetros: userId es obligatorio." });
    }

    const userSnap = await db.collection("users").doc(userId).get();

    if (!userSnap.exists) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const donationIds = userSnap.data().donations || [];

    if (donationIds.length === 0) {
      return res.status(200).json([]);
    }

    // Dividir en paquetes de máximo 10 IDs (límite Firestore)
    const chunks = [];
    for (let i = 0; i < donationIds.length; i += 10) {
      chunks.push(donationIds.slice(i, i + 10));
    }

    const results = [];

    for (const chunk of chunks) {
      const snap = await db
        .collection("donations")
        .where(admin.firestore.FieldPath.documentId(), "in", chunk)
        .get();

        snap.forEach((docSnap) => {
          const data = docSnap.data();
          results.push({
            id: docSnap.id,
            ...data,
            expirationDate: formatExpirationForClient(data.expirationDate),
          });
        });
    }

    res.status(200).json(results);

  } catch (error) {
    console.error("❌ ERROR getDonationsByUser:", error);
    res.status(500).json({ error: error.message });
  }
};
