import db from "../config/db.js";
import { decryptFromString } from "../services/cryptoService.js";

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

        const decryptedResults = results.map((user) => ({
          ...user,
          email: decryptFromString(user.email),
          address: decryptFromString(user.address),
        }));

        res.json(decryptedResults);
      },
    );
  },
};
