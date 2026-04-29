import argon2 from "argon2";
// Pepper : constante secrète (idéalement dans .env)
const PEPPER = process.env.PASSWORD_PEPPER;

export async function hashPassword(password) {
  try {
    // Ajouter le pepper au mot de passe avant le hash
    const pepperPassword = password + PEPPER;
    const hash = await argon2.hash(pepperPassword, {
      // Argon2 gère automatiquement le salt unique pour chaque hash
      type: argon2.argon2id,
      timeCost: 4,
      memoryCost: 2 ** 16,
      parallelism: 1,
    });
    return hash;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function verifyPassword(hash, password) {
  try {
    // Ajouter le même pepper avant vérification
    const pepperPassword = password + PEPPER;
    const valid = await argon2.verify(hash, pepperPassword);
    return valid;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export function validatePassword(password) {
  const minLength = 8;

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const isValid =
    password.length >= minLength &&
    hasLower &&
    hasUpper &&
    hasNumber &&
    hasSpecial;

  return {
    isValid,
    score: [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length,
  };
}
