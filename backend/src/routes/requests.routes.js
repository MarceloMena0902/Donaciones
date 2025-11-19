import { Router } from "express";
import { createRequest } from "../controllers/requests.controller.js";

const router = Router();

router.post("/", createRequest);

export default router;
