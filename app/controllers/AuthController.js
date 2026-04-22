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
      console.log("STEP 1");
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const query = "SELECT * FROM users WHERE email = ?";

    db.query(query, [email], async (err, results) => {
      if (err) {
        console.log("DB ERROR:", err);
        return res.status(500).json({ error: err.message });
      }

      console.log("STEP 2 - USER QUERY DONE");

      if (results.length === 0) {
        console.log("NO USER FOUND");
        return res.status(401).json({ error: "Identifiants invalides" });
      }

      const user = results[0];

      console.log("User object:", user);
      console.log("Provided password:", password);

      const valid = await verifyPassword(password, user.password);

      console.log("PASSWORD VALID:", valid);

      if (!valid) {
        console.log("STEP 3 - INVALID PASSWORD");
        return res.status(401).json({ error: "Identifiants invalides" });
      }

      const secret = new TextEncoder().encode(process.env.JWT_SECRET);

      const token = await new SignJWT({ role: user.role })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(String(user.id))
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(secret);

      console.log("TOKEN GENERATED");

      return res.json({
        message: "Connexion réussie",
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
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
