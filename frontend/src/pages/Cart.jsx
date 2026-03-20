import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { updateQty, removeItem, placeOrder, clearOrderSuccess } from "../redux/slices/cartSlice";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error, orderSuccess } = useSelector(s => s.cart);
  const { user } = useSelector(s => s.auth);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const delivery = subtotal >= 499 ? 0 : 49;
  const total    = subtotal + delivery;

  const handleCheckout = () => {
    if (!user) { navigate("/login"); return; }
    if (user.isAdmin) { alert("Admins cannot place orders."); return; }
    dispatch(placeOrder({ items: items.map(i => ({ product: i.product._id, qty: i.qty })), totalPrice: total }));
  };

  if (orderSuccess) return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="animate-fade-in state-card" style={{ margin:"4rem auto", maxWidth:"480px" }}>
      <span style={{ fontSize:"4rem" }}>🎉</span>
      <h2>Order Placed!</h2>
      <p>Dhanyavaad! आपका ऑर्डर कन्फर्म हो गया है। Delivery in 2 hours.</p>
      <button className="btn-primary" onClick={() => { dispatch(clearOrderSuccess()); navigate("/"); }}>
        Continue Shopping
      </button>
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cart-wrap animate-fade-in">
      <div className="page-title-row">
        <h1 className="page-heading">🛒 Your Cart</h1>
        <span style={{ color:"var(--text-secondary)" }}>{items.length} {items.length === 1 ? "item" : "items"}</span>
      </div>

      {items.length === 0 ? (
        <div className="state-card">
          <span style={{ fontSize:"4rem" }}>🛒</span>
          <h3>Cart is empty</h3>
          <p>Add some fresh groceries to get started!</p>
          <Link to="/" className="btn-primary">Shop Now</Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            <AnimatePresence>
              {items.map(({ product, qty }) => (
                <motion.div 
                  key={product._id} 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout
                  className="cart-item"
                >
                  <div className="cart-item-img">
                    {product.image ? <img src={product.image} alt={product.name} /> : "🛍️"}
                  </div>
                  <div className="cart-item-info">
                    <h4>{product.name}</h4>
                    <span className="cart-item-price">₹{Number(product.price).toFixed(0)} each</span>
                  </div>
                  <div className="qty-controls">
                    <button className="qty-btn" onClick={() => dispatch(updateQty({ productId: product._id, qty: Math.max(1, qty - 1) }))}>−</button>
                    <span className="qty-val">{qty}</span>
                    <button className="qty-btn" onClick={() => dispatch(updateQty({ productId: product._id, qty: qty + 1 }))}>+</button>
                  </div>
                  <span className="cart-line-total">₹{(product.price * qty).toFixed(0)}</span>
                  <button className="cart-remove-btn" onClick={() => dispatch(removeItem(product._id))}>✕</button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row"><span>Subtotal ({items.length} items)</span><span>₹{subtotal.toFixed(0)}</span></div>
            <div className="summary-row">
              <span>Delivery</span>
              <span style={{ color: delivery === 0 ? "var(--secondary)" : "var(--text-primary)" }}>
                {delivery === 0 ? "FREE 🎉" : `₹${delivery}`}
              </span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row total-row"><span>Total</span><span>₹{total.toFixed(0)}</span></div>
            {delivery > 0 && (
              <p className="free-delivery-hint">🚚 Add ₹{(499 - subtotal).toFixed(0)} more for free delivery!</p>
            )}
            {error && <p style={{ color:"var(--danger)", fontSize:"0.85rem", marginTop:"0.5rem" }}>{error}</p>}
            <motion.button 
              whileTap={{ scale: 0.98 }}
              className="checkout-btn" 
              onClick={handleCheckout} 
              disabled={loading || user?.isAdmin}
            >
              {user?.isAdmin ? "Admins Cannot Order" : loading ? "Placing Order…" : <>Proceed to Checkout <ArrowRight size={18} style={{ display: 'inline', verticalAlign: 'middle' }}/></>}
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
