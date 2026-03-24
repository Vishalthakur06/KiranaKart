const express = require("express");
const Product = require("../models/Product");
const { auth, admin } = require("../middleware/auth");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, sort, page = 1, limit = 0 } = req.query;
    const filters = {};

    if (q) {
      const re = new RegExp(q, "i");
      filters.$or = [{ name: re }, { description: re }];
    }

    if (category && category !== "All") {
      filters.category = category;
    }

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    let query = Product.find(filters);

    if (sort) {
      switch (sort) {
        case "price-asc":
          query = query.sort({ price: 1 });
          break;
        case "price-desc":
          query = query.sort({ price: -1 });
          break;
        case "rating-desc":
          query = query.sort({ rating: -1 });
          break;
        case "newest":
          query = query.sort({ createdAt: -1 });
          break;
        case "name-asc":
          query = query.sort({ name: 1 });
          break;
        default:
          break;
      }
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const lim = Math.max(0, Number(limit) || 0);

    if (lim > 0) {
      const total = await Product.countDocuments(filters);
      const pages = Math.ceil(total / lim) || 1;
      const skip = (pageNum - 1) * lim;
      const products = await query.skip(skip).limit(lim).exec();
      return res.json({ products, total, page: pageNum, pages });
    }

    const products = await query.exec();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

router.post("/", auth, admin, async (req, res) => {
  const { name, price, description, image, stock, category } = req.body;
  const product = await Product.create({
    name,
    price,
    description,
    image,
    stock,
    category,
  });
  res.status(201).json(product);
});

router.put("/:id", auth, admin, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

router.delete("/:id", auth, admin, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  await product.remove();
  res.json({ message: "Product removed" });
});

// Add review
router.post("/:id/reviews", auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: "Product already reviewed" });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
