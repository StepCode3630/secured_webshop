// =============================================================
// Middleware d'authentification
// =============================================================

module.exports = (_req, _res, next) => {
  next();
  const jwt = require("jsonwebtoken");

  function authenticateToken(req, res, next) {
    const token = req.cookies.token; // Chope le token JWT depuis les cookies

    if (!token) {
      return res
        .status(401)
        .json({ error: "Token d'authentification manquant" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res
          .status(403)
          .json({ error: "Token d'authentification invalide" });
      }

      req.user = user; // Ajoute les infos utilisateur à la requête
      next();
    });
  }
};
