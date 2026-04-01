const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const controller = require("../controllers/AuthController");

// Configuration de multer pour l'upload de photos
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../public/uploads"),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post("/login", controller.login);
router.post("/register", upload.single("photo"), controller.register);

const argon2 = require("argon2");

async function hashPassword(password) {
  try {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      timeCost: 4,
      memoryCost: 2 ** 16,
      parallelism: 1,
    });
    return hash;
  } catch (err) {
    console.error(err);
  }
}

async function verifyPassword(hash, password) {
  try {
    const valid = await argon2.verify(hash, password);
    return valid;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

module.exports = router;
module.exports.hashPassword = hashPassword;
module.exports.verifyPassword = verifyPassword;
