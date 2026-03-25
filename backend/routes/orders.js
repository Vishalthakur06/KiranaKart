const express = require("express");
const Order = require("../models/Order");
const User = require("../models/User");
const { auth, admin } = require("../middleware/auth");
const { sendOrderNotifications, sendDeliveryStatusEmail } = require("../utils/emailNotification");
const router = express.Router();

router.post("/", auth, async (req, res) => {
  if (req.user.isAdmin) {
    return res.status(403).json({ message: "Admins are not allowed to place orders." });
  }

  const { items, totalPrice, paymentStatus, shippingDetails } = req.body;
  
  if (!shippingDetails || !shippingDetails.name || !shippingDetails.phone || !shippingDetails.address || !shippingDetails.city || !shippingDetails.state || !shippingDetails.pincode) {
    return res.status(400).json({ message: "All shipping details are required" });
  }

  const order = await Order.create({
    user: req.user._id,
    items,
    totalPrice,
    shippingDetails,
    paymentStatus: paymentStatus || "pending",
  });

  // Send Email notifications to both admin and customer
  await sendOrderNotifications({
    orderId: order._id.toString().slice(-8).toUpperCase(),
    customerName: shippingDetails.name,
    customerEmail: req.user.email,
    customerPhone: shippingDetails.phone,
    totalAmount: totalPrice,
    paymentMethod: paymentStatus === "paid" ? "Online" : "COD",
    address: shippingDetails.address,
    city: shippingDetails.city,
    state: shippingDetails.state,
    pincode: shippingDetails.pincode,
    itemCount: items.length,
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

    // Send email to customer only if status is shipped or delivered
    if (req.body.deliveryStatus === "shipped" || req.body.deliveryStatus === "delivered") {
      await sendDeliveryStatusEmail({
        orderId: order._id.toString().slice(-8).toUpperCase(),
        customerEmail: order.user.email,
        status: req.body.deliveryStatus,
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/analytics", auth, admin, async (req, res) => {
  try {
    const orders = await Order.find().populate("items.product", "name category");
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const monthlyData = {};
    const categoryData = {};
    
    orders.forEach(o => {
      const month = new Date(o.createdAt).toLocaleDateString("en-IN", { month: "short" });
      monthlyData[month] = (monthlyData[month] || 0) + o.totalPrice;
      
      o.items.forEach(item => {
        const cat = item.product?.category || "Other";
        categoryData[cat] = (categoryData[cat] || 0) + (item.product?.price || 0) * item.quantity;
      });
    });
    
    res.json({ totalRevenue, monthlyData, categoryData, totalOrders: orders.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
