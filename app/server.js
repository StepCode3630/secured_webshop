import "dotenv/config.js";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dotenv.config({
//   path: path.resolve(__dirname, "../.env"),
// });

import cookieParser from "cookie-parser";
import express from "express";
import https from "https";
import fs from "fs";
import { honeypot } from "express-admin-honeypot";

const app = express();
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 5, // max 5 requêtes par IP
  message: {
    code: "TOO_MANY_REQUESTS",
    message: "Trop de tentatives, réessaye dans une minute",
    retryAfter: 60, // en secondes
  },
});
app.use("/api/auth/login", limiter);
const PORT = process.env.PORT || 8080;

const sslOptions = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
};

const server = https.createServer(sslOptions, app);
server.listen(PORT, () => {
  console.log(`Serveur HTTPS démarré sur https://localhost:${PORT}`);
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
import authenticateToken, { adminOnly } from "./middleware/auth.js";
import MiddlePot from "./middleware/honeypot.js";

app.use("/api/admin", authenticateToken, adminOnly, adminRoute);

app.get(
  "/admin",
  authenticateToken,
  (req, res, next) => {
    if (req.user.role !== "admin") {
      return res.redirect("/wp-admin");
    }

    next();
  },
  (_req, res) => {
    res.sendFile(path.join(__dirname, "views/admin.html"));
  },
);

app.get("/wp-admin", MiddlePot);
app.get("/admin.php", MiddlePot);
app.get("/administrator", MiddlePot);

app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);

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

// // Démarrage du serveur
// app.get("/test", (_req, res) =>
//   res.send(
//     "db admin: root, pwd : root, url " +
//       process.env.DB_HOST +
//       ", port " +
//       process.env.DB_PORT,
//   ),
// );
