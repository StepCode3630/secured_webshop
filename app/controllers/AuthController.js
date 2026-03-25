const db = require("../config/db");

module.exports = {
  // ----------------------------------------------------------
  // POST /api/auth/login
  // ----------------------------------------------------------
  login: (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;

    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message, query: query });
      }

      if (results.length === 0) {
        return res
          .status(401)
          .json({ error: "Email ou mot de passe incorrect" });
      }

      res.json({ message: "Connexion réussie", user: results[0] });
    });
  },

  // ----------------------------------------------------------
  // POST /api/auth/register
  // ----------------------------------------------------------
  register: (req, res) => {
    const { username, email, password, address } = req.body;
    const photo = req.file;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Nom d'utilisateur, email et mot de passe requis" });
    }

    const photoPath = photo ? "/uploads/" + photo.filename : null;

    const query = `INSERT INTO users (username, email, password, address, photo_path) VALUES (?, ?, ?, ?, ?)`;

    db.query(query, [username, email, password, address, photoPath], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: "Utilisateur enregistré" });
    });
  },
};
