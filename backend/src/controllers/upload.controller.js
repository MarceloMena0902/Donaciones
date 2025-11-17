import { uploadImage } from "../config/cloudinary.js";
import fs from "fs";

export const uploadFile = async (req, res) => {
  try {
    const result = await uploadImage(req.file.path);
    fs.unlinkSync(req.file.path); // eliminar el archivo temporal
    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
