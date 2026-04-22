import express from "express";
import multer from "multer";
import path from "path";
//Import de toute la logique métier d'authentification du controller auth
import * as controller from "../controllers/AuthController.js";
import { fileURLToPath } from "url";

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

router.post("/login", controller.login);
router.post("/register", upload.single("photo"), controller.register);

export default router;
