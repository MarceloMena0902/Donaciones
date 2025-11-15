import { db } from "../config/firebase.js";

// Crear donación
export const createDonation = async (req, res) => {
  try {
    const { userId, type, description, quantity, unit, location, expirationDate } = req.body;

    if (!userId || !type || !description || !quantity || !unit) {
      return res.status(400).json({ error: "Faltan datos obligatorios para la donación." });
    }

    const donationRef = await db.collection("donations").add({
      userId,
      type, // Perecedero / No perecedero / Preparado
      description,
      quantity,
      unit, // kg, litros, unidades
      location: location || null,
      status: "Disponible",
      expirationDate: expirationDate || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({ id: donationRef.id, message: "Donación registrada correctamente." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todas las donaciones
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

// Obtener donación por ID
export const getDonationById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("donations").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Donación no encontrada." });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar donación
export const updateDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, description, quantity, unit, location, status } = req.body;

    const donationRef = db.collection("donations").doc(id);
    const doc = await donationRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Donación no encontrada." });
    }

    await donationRef.update({
      type: type || doc.data().type,
      description: description || doc.data().description,
      quantity: quantity || doc.data().quantity,
      unit: unit || doc.data().unit,
      location: location || doc.data().location,
      status: status || doc.data().status,
      updatedAt: new Date(),
    });

    res.status(200).json({ message: "Donación actualizada correctamente." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar donación
export const deleteDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const donationRef = db.collection("donations").doc(id);

    await donationRef.delete();

    res.status(200).json({ message: "Donación eliminada correctamente." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
