import express from "express";
import {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  deleteDonation
} from "../controllers/donations.controller.js";

const router = express.Router();

// Endpoints
router.post("/", createDonation);      // Crear donación
router.get("/", getDonations);         // Ver todas
router.get("/:id", getDonationById);   // Ver una
router.put("/:id", updateDonation);    // Actualizar
router.delete("/:id", deleteDonation); // Eliminar

export default router;
