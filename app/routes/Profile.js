import express from "express";
import multer from "multer";
import path from "path";
import * as controller from "../controllers/ProfileController.js";
import { fileURLToPath } from "url";
import authenticateToken from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Configuration de multer pour l'upload de photos
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../public/uploads"),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.get("/:id?", authenticateToken, controller.get);
router.post("/:id", authenticateToken, controller.update);
router.post(
  "/:id/photo",
  authenticateToken,
  upload.single("photo"),
  controller.uploadPhoto,
);

// app.get()

export default router;
