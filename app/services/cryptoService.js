import crypto from "crypto";

const secret = process.env.CRYPTO_KEY;
if (!secret) {
  throw new Error("Missing CRYPTO_KEY environment variable");
}

// Assurer une clé de 32 octets pour aes-256-gcm
const key = crypto.createHash("sha256").update(secret, "utf-8").digest();

function encrypt(text) {
  if (typeof text !== "string") {
    throw new Error("Texte invalide");
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf-8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
    tag: tag.toString("hex"),
  };
}

function decrypt(encrypted) {
  const iv = Buffer.from(encrypted.iv, "hex");
  const tag = Buffer.from(encrypted.tag, "hex");
  const content = Buffer.from(encrypted.content, "hex");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(content), decipher.final()]);
  return decrypted.toString("utf-8");
}

function encryptToString(text) {
  return JSON.stringify(encrypt(text));
}

function decryptFromString(encryptedString) {
  if (encryptedString === null || encryptedString === undefined) {
    return null;
  }

  if (typeof encryptedString !== "string") {
    throw new Error("Encrypted value must be a string");
  }

  try {
    const parsed = JSON.parse(encryptedString);
    return decrypt(parsed);
  } catch {
    // Fallback pour les valeurs non chiffrées déjà présentes en base
    return encryptedString;
  }
}

export { encrypt, decrypt, encryptToString, decryptFromString };
