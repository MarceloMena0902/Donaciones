import express from "express";
import { registerUser, verifyToken } from "../controllers/auth.controller.js";
import { loginWithFirebase } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify", verifyToken);
router.post("/firebase", loginWithFirebase);

export default router;
