import { db } from "../config/firebase.js";

// ✅ Crear notificación
export const sendNotification = async (req, res) => {
  try {
    const { userId, content, donationId, requesterId, preview, type } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId es obligatorio." });
    }

    // Siempre asegurar un mensaje visible
    const safeContent =
      content ||
      preview ||
      "Tienes una nueva notificación";

    const notifRef = await db.collection("notifications").add({
      userId,
      content: safeContent,
      donationId: donationId || null,
      requesterId: requesterId || null,
      preview: preview || null,
      type: type || "info",
      read: false,
      createdAt: new Date(),
    });

    res.status(201).json({
      id: notifRef.id,
      message: "Notificación enviada correctamente.",
    });
  } catch (error) {
    console.error("❌ Error al crear notificación:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Obtener notificaciones de un usuario
export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;


    // 🚨 Protección absoluta contra undefined/null/"undefined"
    if (!userId || userId === "undefined" || userId === "null") {
      return res.status(400).json({
        error: "userId inválido en la petición",
        userIdRecibido: userId
      });
    }

    const snapshot = await db
      .collection("notifications")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const notifications = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter(n => n.content || n.preview);

    res.status(200).json(notifications);

  } catch (error) {
    console.error("❌ Error al obtener notificaciones:", error);
    res.status(500).json({ error: error.message });
  }
};


// ✅ Marcar como leída
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("notifications").doc(id).update({
      read: true,
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("❌ Error al marcar como leída:", error);
    res.status(500).json({ error: error.message });
  }
};
