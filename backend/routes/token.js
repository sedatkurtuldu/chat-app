const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const JWT_SECRET = 'PAZSnm1WxR6SZvX';

router.get('/createToken', (req, res) => {
  const { userId, email } = req.query;

  if (!userId || !email) {
    return res.status(400).json({ error: 'userId and email are required' });
  }

  const payload = { userId, email };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

  console.log("Token: ", token);
  res.json({ token });
});

module.exports = router;
