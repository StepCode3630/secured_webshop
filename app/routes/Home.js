import express from "express";
import * as controller from "../controllers/HomeController.js";

const router = express.Router();

router.get("/", controller.index);

export { router as homeRoute };
