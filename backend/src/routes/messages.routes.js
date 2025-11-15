import express from "express";
import { sendMessage, getMessages } from "../controllers/messages.controller.js";

const router = express.Router();

router.post("/", sendMessage);       // Enviar mensaje
router.get("/:chatId", getMessages); // Obtener mensajes de un chat

export default router;
