import express from "express";
import * as controller from "../controllers/UserController.js";

const router = express.Router();
router.get("/", controller.get);

export { router as userRoute };
