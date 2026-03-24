import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send } from "lucide-react";
import { fetchProductById, clearSelectedProduct } from "../redux/slices/productSlice";
import { addItem } from "../redux/slices/cartSlice";
import { useToast } from "../components/Toast";
import { CAT_ICONS } from "../utils/constants";
import api from "../services/api";

function StarRating({ value, onChange, size = 24 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          fill={(hover || value) >= i ? "#F59E0B" : "none"}
          color="#F59E0B"
          style={{ cursor: onChange ? "pointer" : "default", transition: "transform 0.15s" }}
          onMouseEnter={() => onChange && setHover(i)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange && onChange(i)}
        />
      ))}
    </div>
  );
}

export default function Product() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { selectedProduct: product, loading, error } = useSelector(s => s.products);
  const { user } = useSelector(s => s.auth);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => dispatch(clearSelectedProduct());
  }, [dispatch, id]);

  const handleAdd = () => {
    if (!user) { navigate("/login"); return; }
    if (user.isAdmin) { addToast("Admins cannot buy products", "error"); return; }
    dispatch(addItem({ product, qty }));
    setAdded(true);
    addToast(`${product.name} added to cart!`, "success");
    setTimeout(() => setAdded(false), 2000);
  };

  const submitReview = async e => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, { rating: reviewRating, comment: reviewComment });
      addToast("Review submitted!", "success");
      setReviewComment("");
      setReviewRating(5);
      dispatch(fetchProductById(id)); // Refresh
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to submit review", "error");
    } finally { setSubmittingReview(false); }
  };

  if (loading) return <div className="loader-wrap" style={{ marginTop: "4rem" }}><div className="spinner" /></div>;
  if (error) return (
    <div className="state-card error" style={{ marginTop: "3rem" }}>
      <span>⚠️</span><p>{error}</p>
      <Link to="/" className="btn-primary">← Back to Shop</Link>
    </div>
  );
  if (!product) return null;

  const hasReviewed = product.reviews?.some(r => r.user === user?.id);

  return (
    <motion.div className="animate-fade-in" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 100 }}>
      {/* Product Detail */}
      <div className="product-detail-wrap">
        <div className="product-detail-img">
          {product.image
            ? <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "6rem" }}>🛍️</div>}
        </div>
        <div className="product-detail-info">
          {product.category && (
            <span className="product-cat-badge" style={{ position: "static", display: "inline-block", marginBottom: "0.5rem" }}>
              {CAT_ICONS[product.category]} {product.category}
            </span>
          )}
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>{product.name}</h1>

          {/* Rating summary */}
          {product.numReviews > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
              <StarRating value={Math.round(product.rating)} size={18} />
              <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{product.rating.toFixed(1)}</span>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>({product.numReviews} reviews)</span>
            </div>
          )}

          <p style={{ color: "var(--text-secondary)" }}>{product.description}</p>
          <div className="detail-price">₹{Number(product.price).toFixed(0)}</div>
          <div className="detail-stock" style={{ color: product.stock > 10 ? "var(--secondary)" : product.stock > 0 ? "var(--accent)" : "var(--danger)" }}>
            {product.stock > 10 ? "✅ In Stock" : product.stock > 0 ? `⚠️ Only ${product.stock} left!` : "❌ Out of Stock"}
          </div>
          <div className="qty-row">
            <span style={{ color: "var(--text-secondary)" }}>Qty:</span>
            <div className="qty-controls">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span className="qty-val">{qty}</span>
              <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} className={`btn-add-large ${added ? "added" : ""}`} onClick={handleAdd} disabled={product.stock === 0 || user?.isAdmin}>
            {user?.isAdmin ? "Admin view" : added ? "✓ Added to Cart!" : product.stock === 0 ? "Out of Stock" : "🛒 Add to Cart"}
          </motion.button>
          <Link to="/" className="btn-back">← Continue Shopping</Link>
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--border-color)" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "1.5rem" }}>
          ⭐ Customer Reviews {product.numReviews > 0 && `(${product.numReviews})`}
        </h2>

        {/* Write Review */}
        {user && !user.isAdmin && !hasReviewed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: "var(--bg-card)", borderRadius: "var(--radius-xl)", padding: "1.5rem", border: "1px solid var(--border-color)", marginBottom: "2rem", boxShadow: "var(--shadow-sm)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Write a Review</h3>
            <form onSubmit={submitReview}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 6 }}>Your Rating</label>
                <StarRating value={reviewRating} onChange={setReviewRating} size={28} />
              </div>
              <textarea
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder="Share your experience with this product..."
                required
                style={{ width: "100%", minHeight: 80, padding: "0.8rem 1rem", border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-md)", fontFamily: "inherit", fontSize: "0.9rem", color: "var(--text-primary)", background: "transparent", outline: "none", resize: "vertical", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "var(--primary)"}
                onBlur={e => e.target.style.borderColor = "var(--border-color)"}
              />
              <motion.button whileTap={{ scale: 0.97 }} type="submit" className="btn-primary" disabled={submittingReview} style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: 8 }}>
                <Send size={16} /> {submittingReview ? "Submitting..." : "Submit Review"}
              </motion.button>
            </form>
          </motion.div>
        )}

        {hasReviewed && (
          <div style={{ padding: "0.75rem 1rem", background: "var(--secondary-light)", borderRadius: "var(--radius-md)", marginBottom: "1.5rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--secondary)" }}>
            ✅ You've already reviewed this product
          </div>
        )}

        {/* Reviews List */}
        {product.reviews?.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <AnimatePresence>
              {product.reviews.map((r, i) => (
                <motion.div key={r._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", padding: "1.25rem", border: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "var(--primary)", fontSize: "0.9rem" }}>
                        {r.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{r.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                        </div>
                      </div>
                    </div>
                    <StarRating value={r.rating} size={14} />
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{r.comment}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📝</div>
            <p style={{ fontWeight: 600 }}>No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
