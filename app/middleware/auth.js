// =============================================================
// Middleware d'authentification
// =============================================================
import { jwtVerify } from "jose";

export default async function authenticateToken(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.redirect("/wp-admin");
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    req.user = payload; //Stock user dans req
    next(); // passe au middleware suivant ou à la route
  } catch (err) {
    return res.status(403).json({ error: "Authentification invalide" });
  }
}

export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Utilisateur non authentifié" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
};
