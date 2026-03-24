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
    "name price image",
  );
  res.json(orders);
});

router.patch("/:id/deliver", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Admins only" });
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { deliveryStatus: req.body.deliveryStatus },
      { new: true }
    ).populate("user", "name email").populate("items.product", "name price");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
