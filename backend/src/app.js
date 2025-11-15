import express from "express";
import cors from "cors";
import usersRoutes from "./routes/users.routes.js";
import donationsRoutes from "./routes/donations.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import messagesRoutes from "./routes/messages.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Rutas base
app.get("/", (req, res) => {
  res.send("🚀 Backend Cochabamba Plus funcionando correctamente!");
});
app.use("/api/users", usersRoutes);
app.use("/api/donations", donationsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/auth", authRoutes);

export default app;
