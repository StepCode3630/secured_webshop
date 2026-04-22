import db from "../config/db.js";

export default {
  // ----------------------------------------------------------
  // GET /api/admin/users
  // ----------------------------------------------------------
  getUsers: (_req, res) => {
    db.query(
      "SELECT id, username, email, role, address FROM users",
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Erreur serveur" });
        }
        res.json(results);
      },
    );
  },
};
