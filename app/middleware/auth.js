// =============================================================
// Middleware d'authentification
// =============================================================
import { jwtVerify } from "jose";

export default async function authenticateToken(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res
        .status(401)
        .json({ error: "Token d'authentification manquant" });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    req.user = payload;
    next(); // passe au middleware suivant ou à la route
  } catch (err) {
    return res.status(403).json({ error: "Token d'authentification invalide" });
  }
}
