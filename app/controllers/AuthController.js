import db from "../config/db.js";
import { hashPassword, verifyPassword } from "../services/authService.js";
import { SignJWT } from "jose";

// ----------------------------------------------------------
// POST /api/auth/login
// ----------------------------------------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN START", { email });

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const query = "SELECT * FROM users WHERE email = ?";

    db.query(query, [email], async (err, results) => {
      if (err) {
        console.log("DB ERROR:", err);
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        console.log("NO USER FOUND");
        return res.status(401).json({ error: "Identifiants invalides" });
      }

      const user = results[0];

      console.log("User object:", user);
      console.log("Provided password:", password);

      // verifyPassword expects (hash, plainPassword)
      const valid = await verifyPassword(user.password, password);

      console.log("PASSWORD VALID:", valid);

      if (!valid) {
        return res.status(401).json({ error: "Identifiants invalides" });
      }

      const secret = new TextEncoder().encode(process.env.JWT_SECRET);

      const token = await new SignJWT({
        role: user.role,
        email: user.email,
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

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "Nom d'utilisateur, email et mot de passe requis" });
  }

  let hashedPassword;
  try {
    hashedPassword = await hashPassword(password);
  } catch (hashErr) {
    return res.status(500).json({ error: "Erreur de hash du mot de passe" });
  }

  const photoPath = photo ? "/uploads/" + photo.filename : null;
  //Empeche une injection SQL en utilisant des requetes préparées
  const query = `INSERT INTO users (username, email, password, address, photo_path) VALUES (?, ?, ?, ?, ?)`;
  db.query(
    query,
    [username, email, hashedPassword, address, photoPath],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Utilisateur enregistré" });
    },
  );
};
