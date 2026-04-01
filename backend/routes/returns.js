const express = require("express");
const Order = require("../models/Order");
const { auth, admin } = require("../middleware/auth");
const { sendReturnRequestEmail, sendReturnStatusEmail } = require("../utils/emailNotification");
const router = express.Router();

// Request Return/Refund (User)
router.post("/request/:orderId", auth, async (req, res) => {
  try {
    const { reason, description } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.deliveryStatus !== "delivered") {
      return res.status(400).json({ message: "Can only return delivered orders" });
    }

    if (order.returnRequest.status !== "none") {
      return res.status(400).json({ message: "Return request already exists" });
    }

    // Check if order is within return window (7 days)
    const deliveryDate = order.updatedAt;
    const daysSinceDelivery = Math.floor((Date.now() - deliveryDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceDelivery > 7) {
      return res.status(400).json({ message: "Return window expired (7 days)" });
    }

    order.returnRequest = {
      status: "requested",
      reason,
      description,
      requestedAt: new Date(),
      refundAmount: order.totalPrice,
    };

    await order.save();
    
    // Send emails
    await sendReturnRequestEmail({
      customerName: req.user.name,
      customerEmail: req.user.email,
      orderId: order._id,
      reason,
      description,
      amount: order.totalPrice,
    });
    
    res.json({ message: "Return request submitted successfully", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get All Return Requests (Admin)
router.get("/requests", auth, admin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { "returnRequest.status": { $ne: "none" } };
    
    if (status) {
      filter["returnRequest.status"] = status;
    }

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("items.product", "name image price")
      .sort({ "returnRequest.requestedAt": -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Process Return Request (Admin)
router.put("/process/:orderId", auth, admin, async (req, res) => {
  try {
    const { action, adminNote, refundAmount } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.returnRequest.status !== "requested") {
      return res.status(400).json({ message: "Invalid return request status" });
    }

    if (action === "approve") {
      order.returnRequest.status = "approved";
      order.returnRequest.refundAmount = refundAmount || order.totalPrice;
      order.deliveryStatus = "cancelled";
    } else if (action === "reject") {
      order.returnRequest.status = "rejected";
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    order.returnRequest.processedAt = new Date();
    order.returnRequest.adminNote = adminNote;

    await order.save();
    
    // Send email to user
    const populatedOrder = await Order.findById(order._id).populate("user", "name email");
    await sendReturnStatusEmail({
      customerName: populatedOrder.user.name,
      customerEmail: populatedOrder.user.email,
      orderId: order._id,
      status: action === "approve" ? "approved" : "rejected",
      refundAmount: order.returnRequest.refundAmount,
      adminNote,
    });
    
    res.json({ message: `Return request ${action}d successfully`, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Complete Refund (Admin)
router.put("/complete/:orderId", auth, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.returnRequest.status !== "approved") {
      return res.status(400).json({ message: "Return request not approved" });
    }

    order.returnRequest.status = "completed";
    order.paymentStatus = "refunded";

    await order.save();
    
    // Send email to user
    const populatedOrder = await Order.findById(order._id).populate("user", "name email");
    await sendReturnStatusEmail({
      customerName: populatedOrder.user.name,
      customerEmail: populatedOrder.user.email,
      orderId: order._id,
      status: "completed",
      refundAmount: order.returnRequest.refundAmount,
    });
    
    res.json({ message: "Refund completed successfully", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get User's Return Requests
router.get("/my-requests", auth, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
      "returnRequest.status": { $ne: "none" }
    })
      .populate("items.product", "name image price")
      .sort({ "returnRequest.requestedAt": -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
