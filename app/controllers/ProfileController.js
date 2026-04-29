import path from "path";
import db from "../config/db.js";
import { userInfo } from "os";
import { jwtVerify } from "jose";

// ----------------------------------------------------------
// GET /api/profile
// ----------------------------------------------------------
export const get = async (req, res) => {
  try {
    console.log("COOKIES:", req.cookies);
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ error: "Token d'authentification manquant" });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.sub;

    db.query(
      "SELECT id, username, email, role, address, photo_path FROM users WHERE id = ?",
      [userId],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Erreur serveur" });
        }
        if (results.length === 0) {
          return res.status(404).json({ error: "Utilisateur introuvable" });
        }
        res.json(results[0]);
      },
    );
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    return res.status(401).json({ error: "Token invalide" });
  }
};

// ----------------------------------------------------------
// POST /api/profile
// ----------------------------------------------------------
export const update = (req, res) => {
  const userId = req.params.id || req.body.id;
  const { address } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "ID utilisateur requis" });
  }

  db.query(
    "UPDATE users SET address = ? WHERE id = ?",
    [address, userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: "Erreur serveur" });
      }
      res.json({ message: "Profil mis à jour" });
    },
  );
};

// ----------------------------------------------------------
// POST /api/profile/photo
// ----------------------------------------------------------
export const uploadPhoto = (req, res) => {
  const userId = req.params.id || req.body.id; // TODO exercice 5 : remplacer par req.user.id

  if (!userId) {
    return res.status(400).json({ error: "ID utilisateur requis" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier reçu" });
  }

  const photoPath = "/uploads/" + req.file.filename;

  db.query(
    "UPDATE users SET photo_path = ? WHERE id = ?",
    [photoPath, userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: "Erreur serveur" });
      }
      res.json({ message: "Photo mise à jour", photo_path: photoPath });
    },
  );
};
