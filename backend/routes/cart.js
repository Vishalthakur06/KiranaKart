const express = require("express");
const { auth } = require("../middleware/auth");
const router = express.Router();

// In-memory cart prototype; in production, store with user in DB or Redis
const carts = new Map();

router.post("/", auth, (req, res) => {
  const { items } = req.body;
  carts.set(req.user._id.toString(), items);
  res.json({ message: "Cart updated", items });
});

router.get("/", auth, (req, res) => {
  const items = carts.get(req.user._id.toString()) || [];
  res.json({ items });
});

module.exports = router;
