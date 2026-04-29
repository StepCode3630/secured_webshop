import express from "express";
import controller from "../controllers/AdminController.js";
import authenticateToken from "../middleware/auth.js";
import { adminOnly } from "../middleware/auth.js";
const router = express.Router();

router.get("/users", authenticateToken, adminOnly, controller.getUsers);

export default router;
