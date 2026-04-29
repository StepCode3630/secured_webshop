import express from "express";
import controller from "../controllers/AdminController.js";
import authenticateToken from "../middleware/auth.js";
const router = express.Router();

router.get("/users", authenticateToken, controller.getUsers);

export default router;
