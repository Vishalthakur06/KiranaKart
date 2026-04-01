const express = require("express");
const Order = require("../models/Order");
const { auth } = require("../middleware/auth");
const { generateInvoice } = require("../utils/invoiceGenerator");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Generate and download invoice
router.get("/download/:orderId", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("user", "name email")
      .populate("items.product", "name price");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns this order
    if (order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Prepare invoice data
    const invoiceData = {
      orderId: order._id,
      invoiceNumber: `INV-${order._id.toString().slice(-8).toUpperCase()}`,
      orderDate: order.createdAt,
      customerName: order.user.name,
      customerEmail: order.user.email,
      shippingAddress: order.shippingDetails,
      items: order.items.map(item => ({
        name: item.product?.name || "Product",
        quantity: item.quantity,
        price: item.product?.price || 0,
      })),
      paymentMethod: order.paymentStatus === "paid" ? "Online Payment" : "Cash on Delivery",
      paymentStatus: order.paymentStatus,
      deliveryStatus: order.deliveryStatus,
    };

    // Generate PDF
    const result = await generateInvoice(invoiceData);

    // Send file
    res.download(result.filePath, result.fileName, (err) => {
      if (err) {
        console.error("Download error:", err);
        res.status(500).json({ message: "Error downloading invoice" });
      }
    });

  } catch (error) {
    console.error("Invoice generation error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Email invoice
router.post("/email/:orderId", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("user", "name email")
      .populate("items.product", "name price");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Prepare invoice data
    const invoiceData = {
      orderId: order._id,
      invoiceNumber: `INV-${order._id.toString().slice(-8).toUpperCase()}`,
      orderDate: order.createdAt,
      customerName: order.user.name,
      customerEmail: order.user.email,
      shippingAddress: order.shippingDetails,
      items: order.items.map(item => ({
        name: item.product?.name || "Product",
        quantity: item.quantity,
        price: item.product?.price || 0,
      })),
      paymentMethod: order.paymentStatus === "paid" ? "Online Payment" : "Cash on Delivery",
      paymentStatus: order.paymentStatus,
      deliveryStatus: order.deliveryStatus,
    };

    // Generate PDF
    const result = await generateInvoice(invoiceData);

    // Send email with attachment
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      return res.status(500).json({ message: "Email not configured" });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: emailUser, pass: emailPass },
    });

    await transporter.sendMail({
      from: `"E-Commerce Store" <${emailUser}>`,
      to: order.user.email,
      subject: `Invoice for Order #${order._id.toString().slice(-6).toUpperCase()}`,
      html: `
        <h2>Your Invoice is Ready!</h2>
        <p>Hi ${order.user.name},</p>
        <p>Thank you for your order. Please find your invoice attached.</p>
        <p><strong>Order ID:</strong> #${order._id.toString().slice(-6).toUpperCase()}</p>
        <p><strong>Invoice Number:</strong> ${invoiceData.invoiceNumber}</p>
        <p>If you have any questions, feel free to contact us.</p>
        <br>
        <p>Best regards,<br>E-Commerce Store Team</p>
      `,
      attachments: [
        {
          filename: result.fileName,
          path: result.filePath,
        },
      ],
    });

    res.json({ message: "Invoice sent to your email successfully!" });

  } catch (error) {
    console.error("Email invoice error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
