import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Trash2, GitCompare, Eye } from "lucide-react";
import { addItem } from "../redux/slices/cartSlice";
import { useToast } from "../components/Toast";
import api from "../services/api";

export default function Wishlist() {
  const { user } = useSelector(s => s.auth);
  const { items: cartItems } = useSelector(s => s.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchWishlist();
  }, [user, navigate]);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get("/user/wishlist");
      setWishlist(data);
    } catch (err) {
      addToast("Failed to load wishlist", "error");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/user/wishlist/${productId}`);
      setWishlist(wishlist.filter(p => p._id !== productId));
      addToast("Removed from wishlist", "success");
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

  const addToCompare = async (productId) => {
    try {
      await api.post("/user/compare", { productId });
      addToast("Added to compare list!", "success");
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
        <h1 style={{ fontSize: "2rem", fontWeight: 800, background: "linear-gradient(135deg, #EF4444, #F97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "0.5rem" }}>
          ❤️ My Wishlist
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border-color)" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>💔</div>
          <h3 style={{ marginBottom: "0.5rem" }}>Your wishlist is empty</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Save your favorite products here!
          </p>
          <button onClick={() => navigate("/")} className="btn-primary">Start Shopping</button>
        </div>
      ) : (
        <div className="product-grid">
          <AnimatePresence>
            {wishlist.map((product, idx) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: idx * 0.05 }}
                className="product-card"
                style={{ position: "relative" }}
              >
                {/* Remove Button */}
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
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
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
                  onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                >
                  <Trash2 size={16} />
                </button>

                <a href={`/product/${product._id}`} className="product-card-img-wrap">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="product-card-img" />
                  ) : (
                    <div className="product-card-img-placeholder">🛍️</div>
                  )}
                  {product.category && <span className="product-cat-badge">{product.category}</span>}
                </a>

                <div className="product-card-body">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-desc">{product.description || "No description"}</p>

                  <div className="product-card-footer">
                    <span className="product-price">₹{product.price}</span>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0 || isInCart(product._id)}
                      className="add-cart-btn"
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                    >
                      <ShoppingCart size={16} />
                      {isInCart(product._id) ? "In Cart" : "Add to Cart"}
                    </button>
                    <button
                      onClick={() => addToCompare(product._id)}
                      style={{
                        padding: "0.4rem 0.8rem",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--text-primary)",
                      }}
                    >
                      <GitCompare size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
