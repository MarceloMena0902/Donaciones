import express from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} from "../controllers/users.controller.js";

const router = express.Router();

// Endpoints base
router.post("/", createUser);      // Crear usuario
router.get("/", getUsers);         // Obtener todos
router.get("/:id", getUserById);   // Obtener por ID
router.put("/:id", updateUser);    // Actualizar
router.delete("/:id", deleteUser); // Eliminar

export default router;
