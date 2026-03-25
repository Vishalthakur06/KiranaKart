import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../redux/slices/cartSlice";
import { useToast } from "../components/Toast";
import api from "../services/api";

export default function Checkout() {
  const { items } = useSelector(s => s.cart);
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "cod",
  });

  const [loading, setLoading] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const delivery = subtotal >= 500 ? 0 : 40;
  const total = subtotal + delivery;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        items: items.map(i => ({ product: i.product._id, qty: i.qty })),
        shippingDetails: {
          name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        paymentStatus: formData.paymentMethod === "cod" ? "pending" : "paid",
        totalPrice: total,
      };

      const { data } = await api.post("/orders", orderData);

      dispatch(clearCart());
      addToast("Order placed successfully! 🎉", "success");
      navigate("/orders");
    } catch (err) {
      addToast(err.response?.data?.message || "Order failed. Try again!", "error");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div style={{ padding: "2rem 0" }}>
      <h1 className="page-heading" style={{ marginBottom: "2rem" }}>Checkout</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "2rem", alignItems: "start" }} className="checkout-layout">
        {/* Address Form */}
        <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-xl)", padding: "2rem", boxShadow: "var(--shadow-md)" }} className="checkout-form-card">
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem" }}>Delivery Address</h2>
          
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="admin-input"
            />
            
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              className="admin-input"
            />
            
            <textarea
              name="address"
              placeholder="Address (House No, Building, Street)"
              value={formData.address}
              onChange={handleChange}
              required
              className="admin-input"
              rows="3"
            />
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                required
                className="admin-input"
              />
              
              <input
                type="text"
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
                required
                className="admin-input"
              />
            </div>
            
            <input
              type="text"
              name="pincode"
              placeholder="Pincode"
              value={formData.pincode}
              onChange={handleChange}
              required
              className="admin-input"
            />

            <div style={{ marginTop: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Payment Method</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", background: formData.paymentMethod === "cod" ? "var(--primary-light)" : "var(--bg-secondary)", border: "2px solid", borderColor: formData.paymentMethod === "cod" ? "var(--primary)" : "var(--border-color)", borderRadius: "var(--radius-md)", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === "cod"}
                    onChange={handleChange}
                  />
                  <span style={{ fontWeight: 600 }}>💵 Cash on Delivery</span>
                </label>
                
                <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", background: formData.paymentMethod === "online" ? "var(--primary-light)" : "var(--bg-secondary)", border: "2px solid", borderColor: formData.paymentMethod === "online" ? "var(--primary)" : "var(--border-color)", borderRadius: "var(--radius-md)", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={formData.paymentMethod === "online"}
                    onChange={handleChange}
                  />
                  <span style={{ fontWeight: 600 }}>💳 Online Payment</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: "1rem", padding: "1rem", fontSize: "1.05rem" }}
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-xl)", padding: "2rem", boxShadow: "var(--shadow-md)", position: "sticky", top: "80px" }} className="checkout-summary-card">
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem" }}>Order Summary</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
            {items.map(item => (
              <div key={item.product._id} style={{ display: "flex", gap: "1rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border-color)" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--primary-light)" }}>
                  {item.product.image ? (
                    <img src={item.product.image} alt={item.product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>🛍️</div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.25rem" }}>{item.product.name}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Qty: {item.qty}</div>
                </div>
                <div style={{ fontWeight: 700, color: "var(--secondary)" }}>₹{item.product.price * item.qty}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", paddingTop: "1rem", borderTop: "2px solid var(--border-color)" }}>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>{delivery === 0 ? "FREE" : `₹${delivery}`}</span>
            </div>
            <div className="summary-divider" />
            <div className="total-row">
              <span>Total</span>
              <span style={{ color: "var(--secondary)" }}>₹{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
