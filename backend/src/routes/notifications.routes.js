import express from "express";
import {
  sendNotification,
  getNotifications,
  markAsRead
} from "../controllers/notifications.controller.js";

const router = express.Router();

router.post("/", sendNotification);      // Crear una notificación
router.get("/:userId", getNotifications); // Obtener notificaciones por usuario
router.put("/:id/read", markAsRead);     // Marcar como leída

export default router;
