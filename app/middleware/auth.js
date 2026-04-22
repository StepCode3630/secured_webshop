// =============================================================
// Middleware d'authentification
// =============================================================
const jwt = require("jsonwebtoken");

module.exports = (_req, _res, next) => {
  next();

  function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Chope le token JWT depuis les cookies

    if (!token) {
      return res
        .status(401)
        .json({ error: "Token d'authentification manquant" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ error: "Token d'authentification invalide" });
      }

      req.user = decoded; // Ajoute les infos utilisateur à la requête
      next();
    });
  }
};
