import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Heart, GitCompare, Eye, Star } from "lucide-react";
import { addItem } from "../redux/slices/cartSlice";
import { CAT_ICONS } from "../utils/constants";
import { useToast } from "./Toast";
import api from "../services/api";

export default function ProductCard({ product, onQuickView }) {
  const dispatch = useDispatch();
  const { user }  = useSelector(s => s.auth);
  const navigate  = useNavigate();
  const { addToast } = useToast();
  const [added, setAdded] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [compare, setCompare] = useState(false);

  const handleAdd = () => {
    if (!user) { navigate("/login"); return; }
    if (user.isAdmin) { addToast("Admins cannot buy products", "error"); return; }
    dispatch(addItem({ product, qty: 1 }));
    setAdded(true);
    addToast(`${product.name} added to cart!`, "success");
    setTimeout(() => setAdded(false), 1500);
  };

  const toggleWishlist = async () => {
    if (!user) { navigate("/login"); return; }
    try {
      if (wishlist) {
        await api.delete(`/user/wishlist/${product._id}`);
        setWishlist(false);
        addToast("Removed from wishlist", "info");
      } else {
        await api.post(`/user/wishlist/${product._id}`);
        setWishlist(true);
        addToast("Added to wishlist", "success");
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Failed", "error");
    }
  };

  const toggleCompare = async () => {
    if (!user) { navigate("/login"); return; }
    try {
      if (compare) {
        await api.delete(`/user/compare/${product._id}`);
        setCompare(false);
        addToast("Removed from compare", "info");
      } else {
        await api.post(`/user/compare/${product._id}`);
        setCompare(true);
        addToast("Added to compare", "success");
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Failed", "error");
    }
  };

  return (
    <motion.div 
      className="product-card"
      whileHover={{ y: -6, boxShadow: "var(--shadow-lg)" }}
      transition={{ duration: 0.2 }}
      style={{ position: "relative" }}
    >
      {/* Action Buttons Overlay */}
      <div style={{ position: "absolute", top: "8px", right: "8px", zIndex: 2, display: "flex", flexDirection: "column", gap: "6px" }}>
        {user && !user.isAdmin && (
          <>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleWishlist}
              style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.95)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
            >
              <Heart size={16} fill={wishlist ? "#EF4444" : "none"} color={wishlist ? "#EF4444" : "var(--text-secondary)"} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleCompare}
              style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.95)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
            >
              <GitCompare size={16} color={compare ? "var(--primary)" : "var(--text-secondary)"} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onQuickView}
              style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.95)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
            >
              <Eye size={16} color="var(--text-secondary)" />
            </motion.button>
          </>
        )}
      </div>

      <Link to={`/product/${product._id}`} className="product-card-img-wrap">
        {product.image
          ? <img src={product.image} alt={product.name} className="product-card-img" />
          : <div className="product-card-img-placeholder">🛍️</div>
        }
        {product.category && (
          <span className="product-cat-badge">{CAT_ICONS[product.category] || "📦"} {product.category}</span>
        )}
        {product.rating > 0 && (
          <div style={{ position: "absolute", bottom: "8px", left: "8px", background: "rgba(255,255,255,0.95)", borderRadius: "12px", padding: "4px 8px", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", fontWeight: 700 }}>
            <Star size={12} fill="#F59E0B" color="#F59E0B" />
            {product.rating.toFixed(1)}
          </div>
        )}
      </Link>
      <div className="product-card-body">
        <Link to={`/product/${product._id}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <p className="product-desc">{product.description || ""}</p>
        <div className="product-card-footer">
          <span className="product-price">₹{Number(product.price).toFixed(0)}</span>
          <motion.button
            className={`add-cart-btn ${added ? "added" : ""}`}
            onClick={handleAdd}
            disabled={product.stock === 0 || user?.isAdmin}
            whileTap={{ scale: 0.95 }}
          >
            {user?.isAdmin ? "Admin view" : added ? "✓ Added" : product.stock === 0 ? "Out of Stock" : "+ Add"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
