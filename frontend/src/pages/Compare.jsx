import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Heart, Star } from "lucide-react";
import { addItem } from "../redux/slices/cartSlice";
import { useToast } from "../components/Toast";
import api from "../services/api";

export default function Compare() {
  const { user } = useSelector(s => s.auth);
  const { items: cartItems } = useSelector(s => s.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [compareList, setCompareList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchCompareList();
  }, [user, navigate]);

  const fetchCompareList = async () => {
    try {
      const { data } = await api.get("/user/compare");
      setCompareList(data);
    } catch (err) {
      addToast("Failed to load compare list", "error");
    } finally {
      setLoading(false);
    }
  };

  const removeFromCompare = async (productId) => {
    try {
      await api.delete(`/user/compare/${productId}`);
      setCompareList(compareList.filter(p => p._id !== productId));
      addToast("Removed from compare", "success");
    } catch (err) {
      addToast("Failed to remove", "error");
    }
  };

  const addToCart = (product) => {
    if (product.stock === 0) {
      addToast("Out of stock!", "error");
      return;
    }
    dispatch(addItem({ product, qty: 1 }));
    addToast(`${product.name} added to cart!`, "success");
  };

  const addToWishlist = async (productId) => {
    try {
      await api.post("/user/wishlist", { productId });
      addToast("Added to wishlist!", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to add", "error");
    }
  };

  const isInCart = (productId) => cartItems.some(i => i.product._id === productId);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <div className="spinner" style={{ margin: "0 auto" }}></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "2rem 0" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, background: "linear-gradient(135deg, #3B82F6, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "0.5rem" }}>
          🔄 Compare Products
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          {compareList.length} {compareList.length === 1 ? "product" : "products"} to compare (max 4)
        </p>
      </div>

      {compareList.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border-color)" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔍</div>
          <h3 style={{ marginBottom: "0.5rem" }}>No products to compare</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Add products to compare their features!
          </p>
          <button onClick={() => navigate("/")} className="btn-primary">Start Shopping</button>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${compareList.length}, minmax(280px, 1fr))`, gap: "1.5rem", minWidth: "fit-content" }}>
            <AnimatePresence>
              {compareList.map((product, idx) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.1 }}
                  style={{
                    background: "var(--bg-card)",
                    borderRadius: "16px",
                    border: "2px solid var(--border-color)",
                    overflow: "hidden",
                    boxShadow: "var(--shadow-md)",
                    position: "relative",
                  }}
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCompare(product._id)}
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: "rgba(239, 68, 68, 0.9)",
                      border: "none",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      zIndex: 2,
                      color: "#fff",
                    }}
                  >
                    <X size={18} />
                  </button>

                  {/* Product Image */}
                  <div style={{ position: "relative", aspectRatio: "1", background: "var(--primary-light)" }}>
                    {product.image ? (
                      <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>🛍️</div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div style={{ padding: "1.5rem" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>{product.name}</h3>
                    
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary)", marginBottom: "1rem" }}>
                      ₹{product.price}
                    </div>

                    {/* Comparison Table */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
                      <div style={{ padding: "0.75rem", background: "var(--bg-secondary)", borderRadius: "8px" }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "4px" }}>Category</div>
                        <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{product.category || "N/A"}</div>
                      </div>

                      <div style={{ padding: "0.75rem", background: "var(--bg-secondary)", borderRadius: "8px" }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "4px" }}>Stock</div>
                        <div style={{ fontSize: "0.9rem", fontWeight: 600, color: product.stock > 0 ? "var(--secondary)" : "var(--danger)" }}>
                          {product.stock > 0 ? `${product.stock} available` : "Out of Stock"}
                        </div>
                      </div>

                      {product.rating > 0 && (
                        <div style={{ padding: "0.75rem", background: "var(--bg-secondary)", borderRadius: "8px" }}>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "4px" }}>Rating</div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{ display: "flex", gap: "2px" }}>
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill={i < Math.round(product.rating) ? "#F59E0B" : "none"} color="#F59E0B" />
                              ))}
                            </div>
                            <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{product.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      )}

                      <div style={{ padding: "0.75rem", background: "var(--bg-secondary)", borderRadius: "8px" }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "4px" }}>Description</div>
                        <div style={{ fontSize: "0.85rem", lineHeight: 1.5 }}>{product.description || "No description"}</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0 || isInCart(product._id)}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          background: isInCart(product._id) ? "var(--secondary)" : "var(--gradient-green)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "10px",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          cursor: product.stock === 0 || isInCart(product._id) ? "not-allowed" : "pointer",
                          opacity: product.stock === 0 || isInCart(product._id) ? 0.6 : 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <ShoppingCart size={16} />
                        {isInCart(product._id) ? "In Cart" : "Add to Cart"}
                      </button>

                      <button
                        onClick={() => addToWishlist(product._id)}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          background: "var(--bg-secondary)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "10px",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem",
                          color: "var(--text-primary)",
                        }}
                      >
                        <Heart size={16} />
                        Add to Wishlist
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  );
}
