import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Package, Clock, Truck, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import api from "../services/api";

const DELIVERY_ICONS = {
  processing: <Clock size={20} />,
  shipped: <Truck size={20} />,
  delivered: <CheckCircle size={20} />,
};

const DELIVERY_STYLE = {
  processing: { bg: "#FEF9C3", color: "#A16207", label: "⏳ Processing" },
  shipped: { bg: "#DBEAFE", color: "#1D4ED8", label: "🚚 Shipped" },
  delivered: { bg: "#DCFCE7", color: "#15803D", label: "✅ Delivered" },
};

const PAYMENT_STYLE = {
  paid: { bg: "#DCFCE7", color: "#15803D", label: "💳 Paid" },
  failed: { bg: "#FEE2E2", color: "#DC2626", label: "❌ Failed" },
  pending: { bg: "#FEF9C3", color: "#A16207", label: "💵 COD" },
};

export default function Orders() {
  const { user } = useSelector(s => s.auth);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [expandedItems, setExpandedItems] = useState(null);
  const [expandedTimeline, setExpandedTimeline] = useState(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.isAdmin) { navigate("/admin"); return; }
    (async () => {
      try {
        const { data } = await api.get("/orders");
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, navigate]);

  const filtered = filter === "all" 
    ? orders 
    : orders.filter(o => o.deliveryStatus === filter);

  const stats = {
    total: orders.length,
    processing: orders.filter(o => o.deliveryStatus === "processing").length,
    shipped: orders.filter(o => o.deliveryStatus === "shipped").length,
    delivered: orders.filter(o => o.deliveryStatus === "delivered").length,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "2rem 0" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, background: "linear-gradient(135deg, var(--primary), #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "0.5rem" }}>
          📦 My Orders
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Track and manage your orders</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total", value: stats.total, color: "#6366F1", bg: "#EEF2FF", key: "all" },
          { label: "Processing", value: stats.processing, color: "#F59E0B", bg: "#FFFBEB", key: "processing" },
          { label: "Shipped", value: stats.shipped, color: "#3B82F6", bg: "#EFF6FF", key: "shipped" },
          { label: "Delivered", value: stats.delivered, color: "#10B981", bg: "#ECFDF5", key: "delivered" },
        ].map(({ label, value, color, bg, key }) => (
          <motion.div
            key={key}
            whileHover={{ y: -4, boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }}
            onClick={() => setFilter(key)}
            style={{
              background: filter === key ? "linear-gradient(135deg, var(--primary), #f97316)" : "var(--bg-card)",
              borderRadius: "16px",
              padding: "1.25rem",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              border: filter === key ? "none" : "1px solid var(--border-color)",
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: 600, marginBottom: "6px", color: filter === key ? "rgba(255,255,255,0.9)" : "var(--text-secondary)" }}>
              {label}
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: filter === key ? "#fff" : color }}>
              {loading ? "..." : value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
          <div className="spinner" style={{ margin: "0 auto 1rem" }}></div>
          <p>Loading orders...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border-color)" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📭</div>
          <h3 style={{ marginBottom: "0.5rem" }}>No orders found</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            {filter === "all" ? "Start shopping to see your orders here!" : `No ${filter} orders`}
          </p>
          <button onClick={() => navigate("/")} className="btn-primary">Start Shopping</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {filtered.map((order, idx) => {
            const deliveryStyle = DELIVERY_STYLE[order.deliveryStatus] || DELIVERY_STYLE.processing;
            const paymentStyle = PAYMENT_STYLE[order.paymentStatus] || PAYMENT_STYLE.pending;
            
            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  background: "var(--bg-card)",
                  borderRadius: "20px",
                  border: "1px solid var(--border-color)",
                  overflow: "hidden",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                {/* Order Header */}
                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }} className="order-header">
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <Package size={18} color="var(--primary)" />
                      <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Order #{order._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }} className="order-badges">
                    <span style={{ padding: "6px 14px", borderRadius: "20px", background: deliveryStyle.bg, color: deliveryStyle.color, fontWeight: 700, fontSize: "0.85rem" }}>
                      {deliveryStyle.label}
                    </span>
                    <span style={{ padding: "6px 14px", borderRadius: "20px", background: paymentStyle.bg, color: paymentStyle.color, fontWeight: 700, fontSize: "0.85rem" }}>
                      {paymentStyle.label}
                    </span>
                  </div>
                </div>

                {/* Order Items - Collapsible */}
                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
                  <button
                    onClick={() => setExpandedItems(expandedItems === order._id ? null : order._id)}
                    style={{
                      width: "100%",
                      padding: "1rem",
                      background: "var(--bg-secondary)",
                      border: "2px solid var(--border-color)",
                      borderRadius: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontFamily: "inherit",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "1.2rem" }}>🛍️</span>
                      <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        Order Items ({order.items.length})
                      </span>
                    </div>
                    {expandedItems === order._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>

                  {expandedItems === order._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ marginTop: "0.75rem" }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {order.items.map((item) => (
                          <div key={item._id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", background: "var(--bg-secondary)", borderRadius: "12px" }} className="order-item-row">
                            <div style={{ width: "60px", height: "60px", borderRadius: "12px", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }} className="order-item-img">
                              {item.product?.image ? (
                                <img src={item.product.image} alt={item.product.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }} />
                              ) : (
                                "🛍️"
                              )}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "2px" }}>
                                {item.product?.name || "Product Deleted"}
                              </div>
                              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                Quantity: {item.quantity} × ₹{item.product?.price || 0}
                              </div>
                            </div>
                            <div style={{ fontWeight: 700, color: "var(--secondary)", fontSize: "1rem" }}>
                              ₹{((item.product?.price || 0) * item.quantity).toLocaleString("en-IN")}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Order Total */}
                  <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-secondary)" }}>Total Amount</span>
                    <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)" }}>
                      ₹{order.totalPrice?.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Shipping Address - Collapsible */}
                <div style={{ padding: "0 1.5rem 1.5rem" }}>
                  {order.shippingDetails && (
                    <div>
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                        style={{
                          width: "100%",
                          padding: "1rem",
                          background: "linear-gradient(135deg, #667eea10 0%, #764ba210 100%)",
                          border: "2px solid var(--primary)",
                          borderRadius: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontFamily: "inherit",
                          transition: "all 0.2s",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "1.2rem" }}>📦</span>
                          <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>Delivery Address</span>
                        </div>
                        {expandedOrder === order._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      
                      {expandedOrder === order._id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ marginTop: "0.75rem", padding: "1rem", background: "var(--bg-secondary)", borderRadius: "12px", border: "1px solid var(--border-color)" }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <span style={{ fontSize: "1.1rem" }}>👤</span>
                              <div>
                                <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 600 }}>Name</div>
                                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>{order.shippingDetails.name}</div>
                              </div>
                            </div>
                            
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <span style={{ fontSize: "1.1rem" }}>📱</span>
                              <div>
                                <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 600 }}>Phone</div>
                                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>{order.shippingDetails.phone}</div>
                              </div>
                            </div>
                            
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                              <span style={{ fontSize: "1.1rem", marginTop: "2px" }}>📍</span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 600 }}>Address</div>
                                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.5 }}>
                                  {order.shippingDetails.address}<br/>
                                  {order.shippingDetails.city}, {order.shippingDetails.state}<br/>
                                  PIN: {order.shippingDetails.pincode}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Delivery Timeline - Collapsible */}
                  <div style={{ marginTop: "1rem" }}>
                    <button
                      onClick={() => setExpandedTimeline(expandedTimeline === order._id ? null : order._id)}
                      style={{
                        width: "100%",
                        padding: "1rem",
                        background: "var(--bg-secondary)",
                        border: "2px solid var(--border-color)",
                        borderRadius: "12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontFamily: "inherit",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "1.2rem" }}>📍</span>
                        <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>Delivery Status</span>
                      </div>
                      {expandedTimeline === order._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    {expandedTimeline === order._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ marginTop: "0.75rem", padding: "1rem", background: "var(--bg-secondary)", borderRadius: "12px", border: "1px solid var(--border-color)" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", overflowX: "auto" }}>
                          {["processing", "shipped", "delivered"].map((status, i) => {
                            const isActive = ["processing", "shipped", "delivered"].indexOf(order.deliveryStatus) >= i;
                            const isCurrent = order.deliveryStatus === status;
                            return (
                              <div key={status} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                                <div style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  background: isActive ? (isCurrent ? "var(--primary)" : "var(--secondary)") : "var(--border-color)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: isActive ? "#fff" : "var(--text-muted)",
                                  fontSize: "0.85rem",
                                  fontWeight: 700,
                                  transition: "all 0.3s",
                                }}>
                                  {isActive ? (status === "delivered" ? "✓" : i + 1) : i + 1}
                                </div>
                                {i < 2 && (
                                  <div style={{
                                    flex: 1,
                                    height: "3px",
                                    background: isActive && !isCurrent ? "var(--secondary)" : "var(--border-color)",
                                    marginLeft: "4px",
                                    transition: "all 0.3s",
                                  }} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 600 }}>Processing</span>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 600 }}>Shipped</span>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 600 }}>Delivered</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
