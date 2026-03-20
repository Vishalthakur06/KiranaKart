const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    description: { type: String },
    image: { type: String },
    stock: { type: Number, required: true, default: 0 },
    category: { type: String, default: "Other" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
