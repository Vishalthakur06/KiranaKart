const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { auth } = require("../middleware/auth");
const router = express.Router();

// Valid coupons
const COUPONS = {
  KIRANA10: { discount: 10, type: "percent", minOrder: 200, maxDiscount: 150 },
  SAVE50: { discount: 50, type: "flat", minOrder: 500 },
  FRESH20: { discount: 20, type: "percent", minOrder: 300, maxDiscount: 200 },
};

// Validate coupon
router.post("/coupon/validate", auth, (req, res) => {
  const { code, subtotal } = req.body;
  const coupon = COUPONS[code?.toUpperCase()];
  if (!coupon) return res.status(400).json({ message: "Invalid coupon code" });
  if (subtotal < coupon.minOrder) return res.status(400).json({ message: `Minimum order ₹${coupon.minOrder} required` });

  let discount = coupon.type === "percent"
    ? Math.min(subtotal * coupon.discount / 100, coupon.maxDiscount || Infinity)
    : coupon.discount;

  res.json({ discount: Math.round(discount), code: code.toUpperCase(), type: coupon.type, value: coupon.discount });
});

// Get profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update profile
router.put("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, avatar, currentPassword, newPassword } = req.body;

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: "Current password required" });
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    res.json({ id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get wishlist
router.get("/wishlist", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.json(user.wishlist || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add to wishlist
router.post("/wishlist/:productId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.wishlist.includes(req.params.productId)) {
      return res.status(400).json({ message: "Already in wishlist" });
    }
    user.wishlist.push(req.params.productId);
    await user.save();
    res.json({ message: "Added to wishlist" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove from wishlist
router.delete("/wishlist/:productId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== req.params.productId
    );
    await user.save();
    res.json({ message: "Removed from wishlist" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get compare list
router.get("/compare", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("compareList");
    res.json(user.compareList || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add to compare
router.post("/compare/:productId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.compareList.length >= 4) {
      return res.status(400).json({ message: "Maximum 4 products can be compared" });
    }
    if (user.compareList.includes(req.params.productId)) {
      return res.status(400).json({ message: "Already in compare list" });
    }
    user.compareList.push(req.params.productId);
    await user.save();
    res.json({ message: "Added to compare" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove from compare
router.delete("/compare/:productId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.compareList = user.compareList.filter(
      (id) => id.toString() !== req.params.productId
    );
    await user.save();
    res.json({ message: "Removed from compare" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
