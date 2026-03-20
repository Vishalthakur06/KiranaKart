import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { addItem } from "../redux/slices/cartSlice";
import { CAT_ICONS } from "../utils/constants";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { user }  = useSelector(s => s.auth);
  const navigate  = useNavigate();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!user) { navigate("/login"); return; }
    if (user.isAdmin) { alert("Admins cannot buy products."); return; }
    dispatch(addItem({ product, qty: 1 }));
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div 
      className="product-card"
      whileHover={{ y: -6, boxShadow: "var(--shadow-lg)" }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/product/${product._id}`} className="product-card-img-wrap">
        {product.image
          ? <img src={product.image} alt={product.name} className="product-card-img" />
          : <div className="product-card-img-placeholder">🛍️</div>
        }
        {product.category && (
          <span className="product-cat-badge">{CAT_ICONS[product.category] || "📦"} {product.category}</span>
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
