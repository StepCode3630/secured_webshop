import "dotenv/config.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dotenv.config({
//   path: path.resolve(__dirname, "../.env"),
// });

import cookieParser from "cookie-parser";
import express from "express";

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

// Middleware pour parser les cookies
app.use(cookieParser());

// Middleware pour parser le corps des requêtes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// ---------------------------------------------------------------
// Routes API (retournent du JSON)
// ---------------------------------------------------------------

import authRoute from "./routes/Auth.js";
import profileRoute from "./routes/Profile.js";
import adminRoute from "./routes/Admin.js";

app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);
app.use("/api/admin", adminRoute);

// ---------------------------------------------------------------
// Routes pages (retournent du HTML)
// ---------------------------------------------------------------
import { homeRoute } from "./routes/Home.js";
import { userRoute } from "./routes/User.js";

app.use("/", homeRoute);
app.use("/user", userRoute);

app.get("/login", (_req, res) =>
  res.sendFile(path.join(__dirname, "views", "login.html")),
);
app.get("/register", (_req, res) =>
  res.sendFile(path.join(__dirname, "views", "register.html")),
);
app.get("/profile", (_req, res) =>
  res.sendFile(path.join(__dirname, "views", "profile.html")),
);
app.get("/admin", (_req, res) =>
  res.sendFile(path.join(__dirname, "views", "admin.html")),
);

// Démarrage du serveur
app.get("/test", (_req, res) => res.send("db admin: root, pwd : root"));
