const express = require("express");
const Order = require("../models/Order");
const { auth, admin } = require("../middleware/auth");
const router = express.Router();

router.post("/", auth, async (req, res) => {
  if (req.user.isAdmin) {
    return res.status(403).json({ message: "Admins are not allowed to place orders." });
  }

  const { items, totalPrice, paymentStatus } = req.body;
  const order = await Order.create({
    user: req.user._id,
    items,
    totalPrice,
    paymentStatus: paymentStatus || "pending",
  });
  res.status(201).json(order);
});

router.get("/", auth, async (req, res) => {
  if (req.user.isAdmin) {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name price");
    return res.json(orders);
  }

  const orders = await Order.find({ user: req.user._id }).populate(
    "items.product",
    "name price",
  );
  res.json(orders);
});

module.exports = router;
