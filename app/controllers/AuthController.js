import db from "../config/db.js";
import { hashPassword, verifyPassword } from "../services/authService.js";
import { SignJWT } from "jose";

// ----------------------------------------------------------
// POST /api/auth/login
// ----------------------------------------------------------
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  // Empeche une injection SQL en utilisant des requetes préparées
  const query = `SELECT * FROM users WHERE email = ? AND password = ?`;

  db.query(
    query,
    [email, await hashPassword(password)],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message, query: query });
      }

      if (results.length === 0) {
        return res
          .status(401)
          .json({ error: "Email ou mot de passe incorrect" });
      }

      const user = results[0];
      try {
        const valid = await verifyPassword(user.password, password);
        if (!valid) {
          return res
            .status(401)
            .json({ error: "Email ou mot de passe incorrect" });
        }
        // Générer un JWT pour l'authentification future
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);

        // Utiliser la bibliothèque jose pour générer un JWT
        const token = await new SignJWT({ role: "user" })
          .setProtectedHeader({ alg: "HS256" })
          .setSubject(String(user.id))
          .setIssuedAt()
          .setExpirationTime("15m")
          .sign(secret);

        console.log("Token généré:", token);

        res.json({ message: "Connexion réussie", user, token });
      } catch (verifyErr) {
        return res
          .status(500)
          .json({ error: "Erreur de vérification du mot de passe" });
      }
    },
  );
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
