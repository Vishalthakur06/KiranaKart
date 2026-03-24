import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, Star } from "lucide-react";
import { addItem } from "../redux/slices/cartSlice";
import { useToast } from "../components/Toast";
import api from "../services/api";

export default function Wishlist() {
  const { user } = useSelector(s => s.auth);
  const { items: cartItems } = useSelector(s => s.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    (async () => {
      try {
        const { data } = await api.get("/user/wishlist");
        setProducts(data);
      } catch { /* */ }
      finally { setLoading(false); }
    })();
  }, [user, navigate]);

  const remove = async (id) => {
    try {
      await api.delete(`/user/wishlist/${id}`);
      setProducts(p => p.filter(x => x._id !== id));
      addToast("Removed from wishlist", "info");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed", "error");
    }
  };

  const addToCart = (product) => {
    if (product.stock === 0) { addToast("Out of stock!", "error"); return; }
    if (cartItems.some(i => i.product._id === product._id)) { addToast("Already in cart!", "info"); return; }
    dispatch(addItem({ product, qty: 1 }));
    addToast(`${product.name} added to cart!`, "success");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "2rem 0" }}>
      <div className="page-title-row">
        <h1 className="page-heading">❤️ My Wishlist</h1>
        <span style={{ color: "var(--text-secondary)" }}>{products.length} items</span>
      </div>

      {loading ? (
        <div className="loader-wrap"><div className="spinner" /><p>Loading wishlist...</p></div>
      ) : products.length === 0 ? (
        <div className="state-card">
          <span style={{ fontSize: "4rem" }}>💝</span>
          <h3>Your wishlist is empty</h3>
          <p>Save items you love to buy them later!</p>
          <Link to="/" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="product-grid">
          <AnimatePresence>
            {products.map((p, i) => {
              const inCart = cartItems.some(x => x.product._id === p._id);
              return (
                <motion.div key={p._id} className="product-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/product/${p._id}`} className="product-card-img-wrap">
                    {p.image ? <img src={p.image} alt={p.name} className="product-card-img" /> : <div className="product-card-img-placeholder">🛍️</div>}
                    {p.rating > 0 && (
                      <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(255,255,255,0.95)", borderRadius: 12, padding: "4px 8px", display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 700 }}>
                        <Star size={12} fill="#F59E0B" color="#F59E0B" />{p.rating.toFixed(1)}
                      </div>
                    )}
                  </Link>
                  <div className="product-card-body">
                    <Link to={`/product/${p._id}`}><h3 className="product-name">{p.name}</h3></Link>
                    <p className="product-desc">{p.description || ""}</p>
                    <div className="product-card-footer">
                      <span className="product-price">₹{Number(p.price).toFixed(0)}</span>
                      <span style={{ fontSize: "0.75rem", color: p.stock > 0 ? "var(--secondary)" : "var(--danger)", fontWeight: 600 }}>
                        {p.stock > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                      <motion.button whileTap={{ scale: 0.95 }} className={`add-cart-btn ${inCart ? "added" : ""}`} onClick={() => addToCart(p)} disabled={p.stock === 0 || inCart} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                        <ShoppingCart size={14} />{inCart ? "In Cart" : "Add"}
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => remove(p._id)} style={{ background: "none", border: "1.5px solid var(--danger)", color: "var(--danger)", borderRadius: "var(--radius-md)", padding: "0.4rem 0.6rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
