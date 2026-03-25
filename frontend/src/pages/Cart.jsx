import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Tag, X } from "lucide-react";
import { updateQty, removeItem, placeOrder, clearOrderSuccess } from "../redux/slices/cartSlice";
import StripePayment from "../components/StripePayment";
import api from "../services/api";
import { useToast } from "../components/Toast";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { items, loading, error, orderSuccess } = useSelector(s => s.cart);
  const { user } = useSelector(s => s.auth);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const delivery = subtotal >= 499 ? 0 : 49;

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Shipping form state
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
    name: user?.name || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });

  const total = subtotal + delivery - couponDiscount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await api.post("/user/coupon/validate", { code: couponCode, subtotal });
      setCouponDiscount(data.discount);
      setAppliedCoupon(data);
      addToast(`Coupon applied! You save ₹${data.discount}`, "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Invalid coupon", "error");
      setCouponDiscount(0);
      setAppliedCoupon(null);
    } finally { setCouponLoading(false); }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponDiscount(0);
    setAppliedCoupon(null);
    addToast("Coupon removed", "info");
  };

  const handleCheckout = () => {
    if (!user) { navigate("/login"); return; }
    if (user.isAdmin) { alert("Admins cannot place orders."); return; }
    setShowShippingForm(true);
  };

  const handlePaymentSuccess = (paymentId) => {
    const isCOD = paymentId.startsWith("COD_");
    dispatch(placeOrder({
      items: items.map(i => ({ product: i.product._id, qty: i.qty })),
      totalPrice: total,
      paymentStatus: isCOD ? "pending" : "paid",
      paymentId,
      shippingDetails
    }));
  };

  const handlePaymentFailure = (error) => {
    alert(`Payment failed: ${error}`);
  };

  if (orderSuccess) return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="animate-fade-in state-card" style={{ margin: "4rem auto", maxWidth: "480px" }}>
      <span style={{ fontSize: "4rem" }}>🎉</span>
      <h2>Order Placed!</h2>
      <p>Dhanyavaad! आपका ऑर्डर कन्फर्म हो गया है। Delivery in 2 hours.</p>
      <button className="btn-primary" onClick={() => { dispatch(clearOrderSuccess()); navigate("/"); }}>
        Continue Shopping
      </button>
    </motion.div>
  );

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cart-wrap animate-fade-in">
        <div className="page-title-row">
          <h1 className="page-heading">🛒 Your Cart</h1>
          <span style={{ color: "var(--text-secondary)" }}>{items.length} {items.length === 1 ? "item" : "items"}</span>
        </div>

        {items.length === 0 ? (
          <div className="state-card">
            <span style={{ fontSize: "4rem" }}>🛒</span>
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
                  <motion.div key={product._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.8 }} layout className="cart-item">
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

              {/* Coupon */}
              <div style={{ margin: "0.75rem 0", padding: "0.75rem", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                {appliedCoupon ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Tag size={14} color="var(--secondary)" />
                      <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--secondary)" }}>{appliedCoupon.code}</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>(-₹{couponDiscount})</span>
                    </div>
                    <button onClick={removeCoupon} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 0, display: "flex" }}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, background: "var(--bg-card)", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border-color)", padding: "0 0.75rem" }}>
                      <Tag size={14} color="var(--text-secondary)" />
                      <input
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Coupon code"
                        style={{ border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: "0.85rem", padding: "0.5rem 0", color: "var(--text-primary)", width: "100%" }}
                        onKeyDown={e => e.key === "Enter" && applyCoupon()}
                      />
                    </div>
                    <button onClick={applyCoupon} disabled={couponLoading} style={{ background: "var(--primary)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", padding: "0.5rem 1rem", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", opacity: couponLoading ? 0.6 : 1 }}>
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                )}
              </div>

              {couponDiscount > 0 && (
                <div className="summary-row" style={{ color: "var(--secondary)" }}>
                  <span>Discount</span><span>-₹{couponDiscount}</span>
                </div>
              )}

              <div className="summary-divider" />
              <div className="summary-row total-row"><span>Total</span><span>₹{total.toFixed(0)}</span></div>
              {delivery > 0 && (
                <p className="free-delivery-hint">🚚 Add ₹{(499 - subtotal).toFixed(0)} more for free delivery!</p>
              )}
              {error && <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginTop: "0.5rem" }}>{error}</p>}
              
              {user && !user.isAdmin ? (
                <motion.button whileTap={{ scale: 0.98 }} className="checkout-btn" onClick={() => navigate("/checkout")} disabled={loading}>
                  {loading ? "Processing…" : <>Proceed to Checkout <ArrowRight size={18} style={{ display: "inline", verticalAlign: "middle" }} /></>}
                </motion.button>
              ) : (
                <motion.button whileTap={{ scale: 0.98 }} className="checkout-btn" onClick={() => navigate("/checkout")} disabled={loading || user?.isAdmin}>
                  {user?.isAdmin ? "Admins Cannot Order" : loading ? "Processing…" : <>Proceed to Checkout <ArrowRight size={18} style={{ display: "inline", verticalAlign: "middle" }} /></>}
                </motion.button>
              )}
            </div>
          </div>
        )}
      </motion.div>
      {/* Shipping Details Modal */}
      <AnimatePresence>
        {showShippingForm && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShippingForm(false)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.6)",
                backdropFilter: "blur(4px)",
                zIndex: 999
              }}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 1000,
                width: "90%",
                maxWidth: "500px",
                maxHeight: "90vh",
                overflowY: "auto",
                background: "var(--bg-card)",
                borderRadius: "24px",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                border: "2px solid var(--primary)"
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                padding: "1.5rem",
                background: "linear-gradient(135deg, var(--primary), #f97316)",
                borderRadius: "22px 22px 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background: "rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem"
                  }}>
                    📦
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: "#fff", fontSize: "1.3rem", fontWeight: 800 }}>Delivery Details</h3>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.9)", fontSize: "0.85rem" }}>Where should we deliver?</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowShippingForm(false)}
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    borderRadius: "10px",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#fff",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => e.target.style.background = "rgba(255, 255, 255, 0.3)"}
                  onMouseLeave={e => e.target.style.background = "rgba(255, 255, 255, 0.2)"}
                >
                  ✕
                </button>
              </div>
              
              {/* Modal Body */}
              <div style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", marginLeft: "4px" }}>Full Name</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "1.2rem" }}>👤</span>
                      <input
                        value={shippingDetails.name}
                        onChange={e => setShippingDetails({...shippingDetails, name: e.target.value})}
                        placeholder="Enter your full name"
                        required
                        style={{
                          width: "100%",
                          padding: "0.85rem 0.85rem 0.85rem 3rem",
                          borderRadius: "12px",
                          border: "2px solid var(--border-color)",
                          outline: "none",
                          fontFamily: "inherit",
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          transition: "all 0.2s",
                          background: "var(--bg-secondary)",
                          boxSizing: "border-box"
                        }}
                        onFocus={e => e.target.style.borderColor = "var(--primary)"}
                        onBlur={e => e.target.style.borderColor = "var(--border-color)"}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", marginLeft: "4px" }}>Phone Number</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "1.2rem" }}>📱</span>
                      <input
                        value={shippingDetails.phone}
                        onChange={e => setShippingDetails({...shippingDetails, phone: e.target.value})}
                        placeholder="Enter your phone number"
                        required
                        type="tel"
                        maxLength={10}
                        style={{
                          width: "100%",
                          padding: "0.85rem 0.85rem 0.85rem 3rem",
                          borderRadius: "12px",
                          border: "2px solid var(--border-color)",
                          outline: "none",
                          fontFamily: "inherit",
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          transition: "all 0.2s",
                          background: "var(--bg-secondary)",
                          boxSizing: "border-box"
                        }}
                        onFocus={e => e.target.style.borderColor = "var(--primary)"}
                        onBlur={e => e.target.style.borderColor = "var(--border-color)"}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", marginLeft: "4px" }}>Complete Address</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "14px", top: "18px", fontSize: "1.2rem" }}>🏠</span>
                      <textarea
                        value={shippingDetails.address}
                        onChange={e => setShippingDetails({...shippingDetails, address: e.target.value})}
                        placeholder="House no, Building, Street, Area"
                        required
                        rows={3}
                        style={{
                          width: "100%",
                          padding: "0.85rem 0.85rem 0.85rem 3rem",
                          borderRadius: "12px",
                          border: "2px solid var(--border-color)",
                          outline: "none",
                          fontFamily: "inherit",
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          transition: "all 0.2s",
                          resize: "none",
                          background: "var(--bg-secondary)",
                          boxSizing: "border-box"
                        }}
                        onFocus={e => e.target.style.borderColor = "var(--primary)"}
                        onBlur={e => e.target.style.borderColor = "var(--border-color)"}
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", marginLeft: "4px" }}>City</label>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "1.2rem" }}>🏙️</span>
                        <input
                          value={shippingDetails.city}
                          onChange={e => setShippingDetails({...shippingDetails, city: e.target.value})}
                          placeholder="City"
                          required
                          style={{
                            width: "100%",
                            padding: "0.85rem 0.85rem 0.85rem 3rem",
                            borderRadius: "12px",
                            border: "2px solid var(--border-color)",
                            outline: "none",
                            fontFamily: "inherit",
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            transition: "all 0.2s",
                            background: "var(--bg-secondary)",
                            boxSizing: "border-box"
                          }}
                          onFocus={e => e.target.style.borderColor = "var(--primary)"}
                          onBlur={e => e.target.style.borderColor = "var(--border-color)"}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", marginLeft: "4px" }}>State</label>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "1.2rem" }}>🗺️</span>
                        <input
                          value={shippingDetails.state}
                          onChange={e => setShippingDetails({...shippingDetails, state: e.target.value})}
                          placeholder="State"
                          required
                          style={{
                            width: "100%",
                            padding: "0.85rem 0.85rem 0.85rem 3rem",
                            borderRadius: "12px",
                            border: "2px solid var(--border-color)",
                            outline: "none",
                            fontFamily: "inherit",
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            transition: "all 0.2s",
                            background: "var(--bg-secondary)",
                            boxSizing: "border-box"
                          }}
                          onFocus={e => e.target.style.borderColor = "var(--primary)"}
                          onBlur={e => e.target.style.borderColor = "var(--border-color)"}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", marginLeft: "4px" }}>Pincode</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "1.2rem" }}>📮</span>
                      <input
                        value={shippingDetails.pincode}
                        onChange={e => setShippingDetails({...shippingDetails, pincode: e.target.value})}
                        placeholder="6-digit pincode"
                        required
                        type="tel"
                        maxLength={6}
                        style={{
                          width: "100%",
                          padding: "0.85rem 0.85rem 0.85rem 3rem",
                          borderRadius: "12px",
                          border: "2px solid var(--border-color)",
                          outline: "none",
                          fontFamily: "inherit",
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          transition: "all 0.2s",
                          background: "var(--bg-secondary)",
                          boxSizing: "border-box"
                        }}
                        onFocus={e => e.target.style.borderColor = "var(--primary)"}
                        onBlur={e => e.target.style.borderColor = "var(--border-color)"}
                      />
                    </div>
                  </div>
                  
                  <div style={{
                    marginTop: "0.5rem",
                    padding: "1rem",
                    background: "rgba(16, 185, 129, 0.1)",
                    borderRadius: "12px",
                    border: "2px solid rgba(16, 185, 129, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    <span style={{ fontSize: "1.5rem" }}>✅</span>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#059669", fontWeight: 700 }}>
                      Your order will be delivered within 2 hours!
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div style={{ padding: "0 1.5rem 1.5rem" }}>
                <StripePayment 
                  amount={total} 
                  onSuccess={handlePaymentSuccess} 
                  onFailure={handlePaymentFailure} 
                  disabled={!shippingDetails.name || !shippingDetails.phone || !shippingDetails.address || !shippingDetails.city || !shippingDetails.state || !shippingDetails.pincode} 
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
