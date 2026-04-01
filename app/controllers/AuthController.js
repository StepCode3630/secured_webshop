const db = require("../config/db");
const { hashPassword, verifyPassword } = require("../routes/Auth");
const jwt = require("jsonwebtoken");

module.exports = {
  // ----------------------------------------------------------
  // POST /api/auth/login
  // ----------------------------------------------------------
  login: async (req, res) => {
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
          res.json({ message: "Connexion réussie", user });
        } catch (verifyErr) {
          return res
            .status(500)
            .json({ error: "Erreur de vérification du mot de passe" });
        }

        // Générer un JWT pour l'authentification future
        const token = jwt.sign(
          {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
          },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN },
        );

        // Envoie le token et les infos utilisateur (sans le mot de passe) au client (naviguateur)
        res.cookie("token", token, {
          httpOnly: true, // Empêche l'accès au token via JavaScript côté client contre les attaques XSS
          secure: true, // Assure que le cookie est envoyé uniquement sur HTTPS
          sameSite: "Strict", // Empêche le cookie d'être envoyé dans les requêtes cross-site contre les attaques CSRF
          maxAge: process.env.JWT_EXPIRES_IN, // Durée de vie du cookie
        });

        res.json({
          message: "Connexion réussie",
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
          },
        });
      },
    );
  },

  // ----------------------------------------------------------
  // POST /api/auth/register
  // ----------------------------------------------------------
  register: async (req, res) => {
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
  },
};
