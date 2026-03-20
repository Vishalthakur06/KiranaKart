import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProducts } from "../redux/slices/productSlice";
import ProductCard from "../components/ProductCard";
import { CATEGORIES, CAT_ICONS, OFFERS } from "../utils/constants";

export default function Home() {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector(s => s.products);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => { dispatch(fetchProducts()); }, [dispatch]);

  const filtered = products.filter(p => {
    const matchCat   = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        (p.description || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="animate-fade-in"
    >
      {/* Hero Banner */}
      <motion.div 
        className="hero-banner" 
        initial={{ y: -50, opacity: 0, scale: 0.9 }} 
        animate={{ y: 0, opacity: 1, scale: 1 }} 
        transition={{ type: "spring", duration: 0.9, bounce: 0.5 }}
      >
        <div className="hero-content">
          <motion.div 
            className="hero-tag"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            🎉 Grand Opening Sale
          </motion.div>
          <motion.h1 
            className="hero-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            ताज़ा सामान,<br />बेस्ट कीमत!
          </motion.h1>
          <motion.p 
            className="hero-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Fresh groceries · Household essentials · Daily needs
          </motion.p>
          <motion.div 
            className="hero-coupon"
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
          >
            🏷️ Code <strong>KIRANA10</strong> — 10% off first order!
          </motion.div>
        </div>
        <motion.div 
          className="hero-emoji"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 15 }}
          whileHover={{ rotate: 15, scale: 1.1 }}
        >
          🛒<br />🥦🧅🥬
        </motion.div>
      </motion.div>

      {/* Marquee Offers */}
      <motion.div 
        className="offers-strip"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="offers-inner">
          {[...OFFERS, ...OFFERS].map((o, i) => (
            <span key={i} className="offer-item">{o}</span>
          ))}
        </div>
      </motion.div>

      {/* Search */}
      <motion.div 
        className="search-wrap" 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: 0.4, type: "spring" }}
      >
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder="Search for rice, dal, oil, biscuits…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <AnimatePresence>
          {search && (
            <motion.button 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="search-clear" 
              onClick={() => setSearch("")}
            >
              ✕
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Category Chips */}
      <motion.div 
        className="cat-chips-wrap" 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
      >
        {CATEGORIES.map((cat, i) => (
          <motion.button
            key={cat}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + (i * 0.05), type: "spring", bounce: 0.6 }}
            whileHover={{ scale: 1.1, y: -4 }}
            whileTap={{ scale: 0.95 }}
            className={`cat-chip ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {CAT_ICONS[cat]} {cat}
          </motion.button>
        ))}
      </motion.div>

      {/* Products Header */}
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="section-title">{activeCategory === "All" ? "All Products" : activeCategory}</h2>
        {!loading && (
          <motion.span 
            className="product-count"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            {filtered.length} items
          </motion.span>
        )}
      </motion.div>

      {loading && <div className="loader-wrap"><div className="spinner" /><p>Loading fresh stock…</p></div>}
      {error   && <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="state-card error"><span>⚠️</span><p>{error}</p></motion.div>}

      {!loading && !error && filtered.length === 0 && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="state-card"
        >
          <motion.span 
            style={{ fontSize: "3rem" }}
            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
          >
            🛒
          </motion.span>
          <h3>No products found</h3>
          <p>{products.length === 0 ? "Run the seed script to populate products." : "Try a different search or category."}</p>
        </motion.div>
      )}

      {/* Product Grid */}
      <motion.div className="product-grid" layout>
        <AnimatePresence mode="popLayout">
          {filtered.map((p, i) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 60, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, delay: i * 0.1, type: "spring", bounce: 0.5 }}
              layout
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
