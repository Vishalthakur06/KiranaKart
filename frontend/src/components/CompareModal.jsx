import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../redux/slices/cartSlice";
import { useToast } from "./Toast";

export default function CompareModal({ products, onClose, onRemove }) {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { items } = useSelector(s => s.cart);

  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      addToast("Out of stock!", "error");
      return;
    }
    const isInCart = items.some(i => i.product._id === product._id);
    if (isInCart) {
      addToast("Already in cart!", "info");
      return;
    }
    dispatch(addItem({ product, qty: 1 }));
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
            maxWidth: "1200px",
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}
        >
          {/* Header */}
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--bg-card)", zIndex: 1 }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Compare Products ({products.length})</h2>
            <button onClick={onClose} style={{ background: "var(--bg-secondary)", border: "none", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={20} />
            </button>
          </div>

          {products.length === 0 ? (
            <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-secondary)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
              <p style={{ fontWeight: 600 }}>No products to compare</p>
              <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>Add products to compare their features</p>
            </div>
          ) : (
            <div style={{ padding: "2rem", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "1rem 0" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>Feature</th>
                    {products.map(p => (
                      <th key={p._id} style={{ padding: "1rem", minWidth: "200px" }}>
                        <div style={{ position: "relative" }}>
                          <button
                            onClick={() => onRemove(p._id)}
                            style={{ position: "absolute", top: "-8px", right: "-8px", background: "var(--danger)", color: "#fff", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem" }}
                          >
                            ×
                          </button>
                          <div style={{ width: "100%", aspectRatio: "1", borderRadius: "12px", overflow: "hidden", background: "var(--primary-light)", marginBottom: "0.75rem" }}>
                            {p.image ? (
                              <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>🛍️</div>
                            )}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.25rem" }}>{p.name}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{p.category}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: "var(--bg-secondary)" }}>
                    <td style={{ padding: "1rem", fontWeight: 600, borderRadius: "8px 0 0 8px" }}>Price</td>
                    {products.map(p => (
                      <td key={p._id} style={{ padding: "1rem", textAlign: "center", fontSize: "1.5rem", fontWeight: 800, color: "var(--secondary)" }}>₹{p.price}</td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ padding: "1rem", fontWeight: 600 }}>Rating</td>
                    {products.map(p => (
                      <td key={p._id} style={{ padding: "1rem", textAlign: "center" }}>
                        {p.rating > 0 ? (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                            <Star size={16} fill="#F59E0B" color="#F59E0B" />
                            <span style={{ fontWeight: 700 }}>{p.rating.toFixed(1)}</span>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>({p.numReviews})</span>
                          </div>
                        ) : (
                          <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>No reviews</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr style={{ background: "var(--bg-secondary)" }}>
                    <td style={{ padding: "1rem", fontWeight: 600, borderRadius: "8px 0 0 8px" }}>Stock</td>
                    {products.map(p => (
                      <td key={p._id} style={{ padding: "1rem", textAlign: "center", fontWeight: 600, color: p.stock > 0 ? "var(--secondary)" : "var(--danger)" }}>
                        {p.stock > 0 ? `${p.stock} available` : "Out of stock"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ padding: "1rem", fontWeight: 600 }}>Description</td>
                    {products.map(p => (
                      <td key={p._id} style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        {p.description || "No description"}
                      </td>
                    ))}
                  </tr>
                  <tr style={{ background: "var(--bg-secondary)" }}>
                    <td style={{ padding: "1rem", fontWeight: 600, borderRadius: "8px 0 0 8px" }}>Action</td>
                    {products.map(p => (
                      <td key={p._id} style={{ padding: "1rem", textAlign: "center" }}>
                        <button
                          onClick={() => handleAddToCart(p)}
                          disabled={p.stock === 0}
                          style={{
                            padding: "0.6rem 1.2rem",
                            background: p.stock === 0 ? "#D1D5DB" : "var(--gradient-green)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            cursor: p.stock === 0 ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            margin: "0 auto",
                          }}
                        >
                          <ShoppingCart size={16} />
                          Add to Cart
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
