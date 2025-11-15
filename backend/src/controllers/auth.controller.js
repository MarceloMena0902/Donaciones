import admin from "firebase-admin";
import { auth, db } from "../config/firebase.js";

// Registro con correo y contraseña
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address, photoUrl } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: "Nombre, correo y contraseña son obligatorios.",
      });
    }

    // Crear usuario en Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
      photoURL: photoUrl || null,
    });

    // Guardar datos extra en Firestore
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      name,
      email,
      phone: phone || "",
      address: address || "",
      photoUrl: photoUrl || "",
      provider: "email",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json({
      message: "Usuario registrado correctamente.",
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
      },
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Verificar token (desde frontend)
export const verifyToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token)
      return res.status(400).json({ error: "Token no proporcionado." });

    const decoded = await auth.verifyIdToken(token);
    return res.status(200).json({ message: "Token válido.", user: decoded });
  } catch (error) {
    console.error("Error al verificar token:", error);
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
};

// Login con Google o Facebook
export const loginWithFirebase = async (req, res) => {
  try {
    const { idToken, provider } = req.body; // provider = "google" | "facebook"

    if (!idToken || !provider) {
      return res
        .status(400)
        .json({ error: "Faltan datos (idToken o provider)." });
    }

    // 1️Verificar token
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 2️Obtener datos del usuario
    const userRecord = await auth.getUser(uid);
    const { email, displayName, photoURL } = userRecord;

    // 3️Guardar/actualizar Firestore
    const userRef = db.collection("users").doc(uid);
    await userRef.set(
      {
        uid,
        email,
        name: displayName || "Usuario",
        photoUrl: photoURL || "",
        provider,
        lastLogin: new Date(),
      },
      { merge: true }
    );

    const userData = (await userRef.get()).data();

    return res.status(200).json({
      message: `Inicio de sesión exitoso con ${provider}`,
      user: userData,
    });
  } catch (error) {
    console.error("Error en loginWithFirebase:", error);
    return res.status(500).json({ error: "Error al verificar el token." });
  }
};
