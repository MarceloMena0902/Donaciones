import { db } from "../config/firebase.js";
import { Timestamp } from "firebase-admin/firestore";

export const createRequest = async (req, res) => {
  try {
    const { donorId, requesterId, donationId, message } = req.body;

    if (!donorId || !requesterId || !donationId || !message) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // 1️⃣ Registrar el mensaje de solicitud
    await db.collection("messages").add({
      donorId,
      requesterId,
      donationId,
      message,
      type: "request",
      createdAt: Timestamp.now(),
    });



    return res.status(201).json({ message: "Solicitud enviada" });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
