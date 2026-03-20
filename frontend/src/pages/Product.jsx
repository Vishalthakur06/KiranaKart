import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { fetchProductById, clearSelectedProduct } from "../redux/slices/productSlice";
import { addItem } from "../redux/slices/cartSlice";
import { CAT_ICONS } from "../utils/constants";

export default function Product() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedProduct: product, loading, error } = useSelector(s => s.products);
  const { user } = useSelector(s => s.auth);
  const [qty, setQty]   = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => dispatch(clearSelectedProduct());
  }, [dispatch, id]);

  const handleAdd = () => {
    if (!user) { navigate("/login"); return; }
    if (user.isAdmin) { alert("Admins cannot buy products."); return; }
    dispatch(addItem({ product, qty }));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div className="loader-wrap" style={{ marginTop: "4rem" }}><div className="spinner" /></div>;
  if (error)   return (
    <div className="state-card error" style={{ marginTop: "3rem" }}>
      <span>⚠️</span><p>{error}</p>
      <Link to="/" className="btn-primary">← Back to Shop</Link>
    </div>
  );
  if (!product) return null;

  return (
    <motion.div 
      className="product-detail-wrap animate-fade-in"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="product-detail-img">
        {product.image
          ? <img src={product.image} alt={product.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          : <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", fontSize:"6rem" }}>🛍️</div>
        }
      </div>
      <div className="product-detail-info">
        {product.category && (
          <span className="product-cat-badge" style={{ position:"static", display:"inline-block", marginBottom:"0.5rem" }}>
            {CAT_ICONS[product.category]} {product.category}
          </span>
        )}
        <h1 style={{ fontSize:"1.8rem", fontWeight:"700" }}>{product.name}</h1>
        <p style={{ color:"var(--text-secondary)" }}>{product.description}</p>
        <div className="detail-price">₹{Number(product.price).toFixed(0)}</div>
        <div className="detail-stock" style={{ color: product.stock > 10 ? "var(--secondary)" : product.stock > 0 ? "var(--accent)" : "var(--danger)" }}>
          {product.stock > 10 ? "✅ In Stock" : product.stock > 0 ? `⚠️ Only ${product.stock} left!` : "❌ Out of Stock"}
        </div>
        <div className="qty-row">
          <span style={{ color:"var(--text-secondary)" }}>Qty:</span>
          <div className="qty-controls">
            <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
            <span className="qty-val">{qty}</span>
            <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
          </div>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          className={`btn-add-large ${added ? "added" : ""}`} 
          onClick={handleAdd} 
          disabled={product.stock === 0 || user?.isAdmin}
        >
          {user?.isAdmin ? "Admin view" : added ? "✓ Added to Cart!" : product.stock === 0 ? "Out of Stock" : "🛒 Add to Cart"}
        </motion.button>
        <Link to="/" className="btn-back">← Continue Shopping</Link>
      </div>
    </motion.div>
  );
}
