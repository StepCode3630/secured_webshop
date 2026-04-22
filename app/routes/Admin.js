import express from "express";
import controller from "../controllers/AdminController.js";
const router = express.Router();

router.get("/users", controller.getUsers);

export default router;
