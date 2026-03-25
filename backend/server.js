const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payment");
const userRoutes = require("./routes/user");

const app = express();
connectDB();
app.use(cors({
  origin: [
    /https:\/\/kiranakart-.*\.vercel\.app$/,
    "http://localhost:5173"
  ],
  credentials: true
}));
// app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) =>
  res.json({ message: "MERN E-Commerce API running" }),
);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`Port ${PORT} busy, trying ${PORT + 1}...`);
    app.listen(PORT + 1, () => console.log(`Server running on port ${PORT + 1}`));
  } else throw err;
});
