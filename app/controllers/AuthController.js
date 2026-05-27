import db from "../config/db.js";
import {
  hashPassword,
  verifyPassword,
  validatePassword,
} from "../services/authService.js";
import { SignJWT } from "jose";
import {
  encryptToString,
  decryptFromString,
} from "../services/cryptoService.js";

// ----------------------------------------------------------
// POST /api/auth/login
// ----------------------------------------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN START", { email });

    if (!email || !password) {
      return res.status(400).json({
        code: "MISSING_FIELDS",
        error: "Email et mot de passe requis",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const query = "SELECT * FROM users";

    db.query(query, async (err, results) => {
      if (err) {
        console.log("DB ERROR:", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }

      const user = results.find((row) => {
        const dbEmail = decryptFromString(row.email);
        return (
          typeof dbEmail === "string" &&
          dbEmail.trim().toLowerCase() === normalizedEmail
        );
      });

      if (!user) {
        console.log("NO USER FOUND");
        return res.status(401).json({
          code: "INVALID_CREDENTIALS",
          error: "Identifiants invalides",
        });
      }

      console.log("User object:", user);
      console.log("Provided password:", password);

      // verifyPassword expects (hash, plainPassword)
      const valid = await verifyPassword(user.password, password);

      console.log("PASSWORD VALID:", valid);

      if (!valid) {
        return res.status(401).json({
          code: "INVALID_CREDENTIALS",
          error: "Identifiants invalides",
        });
      }

      const secret = new TextEncoder().encode(process.env.JWT_SECRET);

      const token = await new SignJWT({
        role: user.role, //Affichage du role dans le paylod du token
        email: decryptFromString(user.email),
      })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(String(user.id))
        .setIssuedAt()
        .setExpirationTime(process.env.JWT_EXPIRATION || "15m")
        .sign(secret);

      res.cookie("token", token, {
        httpOnly: true, // 🔥 empêche accès JS
        secure: false, // true en HTTPS (prod)
        sameSite: "Strict",
        maxAge: 15 * 60 * 1000, // 15min
      });

      res.json({ message: "Connexion réussie" });
    });
  } catch (err) {
    console.error("LOGIN CRASH:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ----------------------------------------------------------
// POST /api/auth/register
// ----------------------------------------------------------
export const register = async (req, res) => {
  const { username, email, password, address } = req.body;
  const photo = req.file;
  const isValid = validatePassword(password);

  if (!isValid.isValid) {
    return res.status(400).json({
      error: "Le mot de passe ne respecte pas les critères de sécurité",
    });
  }

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "Nom d'utilisateur, email et mot de passe requis" });
  }

  let hashedPassword;
  try {
    hashedPassword = await hashPassword(password);
  } catch (hashErr) {
    return res.status(500).json({ error: "Impossible de créer le compte" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const photoPath = photo ? "/uploads/" + photo.filename : null;
  const encryptedEmailJson = encryptToString(normalizedEmail);
  const encryptedAddressJson = address ? encryptToString(address) : null;

  db.query("SELECT email FROM users", (err, rows) => {
    if (err) {
      console.log("DB ERROR:", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    const emailExists = rows.some((row) => {
      const dbEmail = decryptFromString(row.email);
      return (
        typeof dbEmail === "string" &&
        dbEmail.trim().toLowerCase() === normalizedEmail
      );
    });

    if (emailExists) {
      return res.status(409).json({
        error: "Cet email existe déjà. Utilise un autre email.",
      });
    }

    // Empêche une injection SQL en utilisant des requêtes préparées
    const query = `INSERT INTO users (username, email, password, address, photo_path) VALUES (?, ?, ?, ?, ?)`;
    db.query(
      query,
      [
        username,
        encryptedEmailJson,
        hashedPassword,
        encryptedAddressJson,
        photoPath,
      ],
      (err) => {
        if (err) {
          return res.status(500).json({ error: "Erreur serveur" });
        }
        res.json({ message: "Utilisateur enregistré" });
      },
    );
  });
};
