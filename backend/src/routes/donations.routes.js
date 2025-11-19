import express from "express";
import {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  deleteDonation
} from "../controllers/donations.controller.js";
import { getDonationsByUser } from "../controllers/donations.controller.js";
import multer from "multer";
import { uploadFile } from "../controllers/upload.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });
// Endpoints
router.post("/", createDonation);      // Crear donación
router.get("/", getDonations);         // Ver todas
router.get("/:id", getDonationById);   // Ver una
router.put("/:id", updateDonation);    // Actualizar
router.delete("/:id", deleteDonation); // Eliminar
router.post("/upload-image", upload.single("image"), uploadFile);
router.get("/user/:userId", getDonationsByUser);

export default router;
