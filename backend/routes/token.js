const express = require("express");
const { admin } = require("../firebase");

const router = express.Router();

router.post("/auth", async (req, res) => {
  const token = req.body.token;
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    res.status(200).send("Kullanıcı kimliği doğrulandı");
  } catch (error) {
    res.status(401).send("Kullanıcı kimliği doğrulanamadı");
  }
});

module.exports = router;
