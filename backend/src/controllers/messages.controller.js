import { realtimeDb } from "../config/firebase.js";

// Enviar mensaje
export const sendMessage = async (req, res) => {
  try {
    const { chatId, senderId, receiverId, content } = req.body;

    if (!chatId || !senderId || !receiverId || !content) {
      return res.status(400).json({ error: "Faltan campos obligatorios." });
    }

    const messageRef = realtimeDb.ref(`chats/${chatId}`).push();
    await messageRef.set({
      senderId,
      receiverId,
      content,
      timestamp: Date.now(),
    });

    res.status(200).json({ message: "Mensaje enviado correctamente." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener mensajes del chat
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const snapshot = await realtimeDb.ref(`chats/${chatId}`).once("value");
    res.status(200).json(snapshot.val() || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
