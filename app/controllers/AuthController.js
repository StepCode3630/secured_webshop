const db = require("../config/db");
const argon2 = require("argon2");

module.exports = {
  // ----------------------------------------------------------
  // POST /api/auth/login
  // ----------------------------------------------------------
  login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${await hashPassword(password)}'`;

    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message, query: query });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }

      const user = results[0];
      try {
        const valid = await argon2.verify(user.password, password);
        if (!valid) {
          return res.status(401).json({ error: "Email ou mot de passe incorrect" });
        }
      } catch (verifyErr) {
        return res.status(500).json({ error: "Erreur de vérification du mot de passe" });
      }

      res.json({ message: "Connexion réussie", user });
    });
  },

  // ----------------------------------------------------------
  // POST /api/auth/register
  // ----------------------------------------------------------
  register: async (req, res) => {
    const { username, email, password, address } = req.body;
    const photo = req.file;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Nom d'utilisateur, email et mot de passe requis" });
    }

    let hashedPassword;
    try {
      hashedPassword = await argon2.hash(password, {
        type: argon2.argon2id,
        timeCost: 4,
        memoryCost: 2 ** 16,
        parallelism: 1,
      });
    } catch (hashErr) {
      return res.status(500).json({ error: "Erreur de hash du mot de passe" });
    }

    const photoPath = photo ? "/uploads/" + photo.filename : null;
    const query = `INSERT INTO users (username, email, password, address, photo_path) VALUES (?, ?, ?, ?, ?)`;
    db.query(query, [username, email, hashedPassword, address, photoPath], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Utilisateur enregistré" });
    });
  },
};
