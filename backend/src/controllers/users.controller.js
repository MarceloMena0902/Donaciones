import { db } from "../config/firebase.js";

// Crear un usuario
export const createUser = async (req, res) => {
  try {
    const { name, email, phone, address, photoUrl } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Nombre y correo son obligatorios." });
    }

    const userRef = await db.collection("users").add({
      name,
      email,
      phone: phone || null,
      address: address || null,
      photoUrl: photoUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({ id: userRef.id, message: "Usuario creado correctamente." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un usuario por ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("users").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar usuario
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, photoUrl } = req.body;

    const userRef = db.collection("users").doc(id);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    await userRef.update({
      name: name || doc.data().name,
      email: email || doc.data().email,
      phone: phone || doc.data().phone,
      address: address || doc.data().address,
      photoUrl: photoUrl || doc.data().photoUrl,
      updatedAt: new Date(),
    });

    res.status(200).json({ message: "Usuario actualizado correctamente." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userRef = db.collection("users").doc(id);

    await userRef.delete();

    res.status(200).json({ message: "Usuario eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
