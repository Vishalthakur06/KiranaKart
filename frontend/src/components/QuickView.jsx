import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Heart, GitCompare, Star } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../redux/slices/cartSlice";
import { useToast } from "./Toast";

export default function QuickView({ product, onClose }) {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { user } = useSelector(s => s.auth);
  const { items } = useSelector(s => s.cart);
  const [qty, setQty] = useState(1);
  const [imageZoom, setImageZoom] = useState(false);

  const isInCart = items.some(i => i.product._id === product._id);

  const handleAddToCart = () => {
    if (product.stock === 0) {
      addToast("Out of stock!", "error");
      return;
    }
    dispatch(addItem({ product, qty }));
    addToast(`${product.name} added to cart!`, "success");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 9998,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          backdropFilter: "blur(4px)",
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "var(--bg-card)",
            borderRadius: "24px",
            maxWidth: "900px",
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}
        >
          {/* Header */}
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Quick View</h2>
            <button onClick={onClose} style={{ background: "var(--bg-secondary)", border: "none", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-primary)" }}>
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: "2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            {/* Image */}
            <div
              onMouseEnter={() => setImageZoom(true)}
              onMouseLeave={() => setImageZoom(false)}
              style={{ borderRadius: "16px", overflow: "hidden", background: "var(--primary-light)", aspectRatio: "1", cursor: "zoom-in", position: "relative" }}
            >
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: imageZoom ? "scale(1.5)" : "scale(1)",
                    transition: "transform 0.3s ease",
                  }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>🛍️</div>
              )}
              {product.rating > 0 && (
                <div style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(255,255,255,0.95)", borderRadius: "20px", padding: "4px 12px", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.85rem", fontWeight: 700 }}>
                  <Star size={14} fill="#F59E0B" color="#F59E0B" />
                  {product.rating.toFixed(1)}
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "4px" }}>{product.category}</div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>{product.name}</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{product.description || "No description available"}</p>
              </div>

              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--secondary)" }}>₹{product.price}</div>

              <div style={{ fontSize: "0.9rem", color: product.stock > 0 ? "var(--secondary)" : "var(--danger)", fontWeight: 600 }}>
                {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : "✗ Out of Stock"}
              </div>

              {product.numReviews > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  <div style={{ display: "flex", gap: "2px" }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < Math.round(product.rating) ? "#F59E0B" : "none"} color="#F59E0B" />
                    ))}
                  </div>
                  ({product.numReviews} reviews)
                </div>
              )}

              {/* Quantity */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Quantity:</span>
                <div className="qty-controls">
                  <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                  <span className="qty-val">{qty}</span>
                  <button className="qty-btn" onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isInCart}
                  style={{
                    flex: 1,
                    padding: "0.85rem",
                    background: isInCart ? "var(--secondary)" : "var(--gradient-green)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    cursor: product.stock === 0 || isInCart ? "not-allowed" : "pointer",
                    opacity: product.stock === 0 || isInCart ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <ShoppingCart size={18} />
                  {isInCart ? "In Cart" : "Add to Cart"}
                </button>
                {user && (
                  <>
                    <button style={{ padding: "0.85rem", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-primary)" }}>
                      <Heart size={20} />
                    </button>
                    <button style={{ padding: "0.85rem", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-primary)" }}>
                      <GitCompare size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
