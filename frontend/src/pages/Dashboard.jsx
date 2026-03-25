import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { ShoppingBag, DollarSign, Heart, TrendingUp, Package, Tag } from "lucide-react";
import api from "../services/api";

export default function Dashboard() {
  const { user } = useSelector(s => s.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    totalSavings: 0,
    wishlistCount: 0,
    categoryBreakdown: {},
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.isAdmin) { navigate("/admin"); return; }
    
    (async () => {
      try {
        const [ordersRes, wishlistRes] = await Promise.all([
          api.get("/orders"),
          api.get("/user/wishlist"),
        ]);

        const orders = ordersRes.data;
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, o) => sum + o.totalPrice, 0);
        
        // Calculate category breakdown
        const categoryBreakdown = {};
        orders.forEach(order => {
          order.items.forEach(item => {
            const cat = item.product?.category || "Other";
            categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + (item.product?.price || 0) * item.quantity;
          });
        });

        // Get recent orders (last 3)
        const recentOrders = orders.slice(0, 3);

        // Calculate savings (example: 10% of total spent as savings from offers)
        const totalSavings = Math.round(totalSpent * 0.1);

        setStats({
          totalOrders,
          totalSpent,
          totalSavings,
          wishlistCount: wishlistRes.data.length,
          categoryBreakdown,
          recentOrders,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, navigate]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <div className="spinner" style={{ margin: "0 auto" }}></div>
      </div>
    );
  }

  const topCategory = Object.entries(stats.categoryBreakdown).sort((a, b) => b[1] - a[1])[0];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "2rem 0" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, background: "linear-gradient(135deg, var(--primary), #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "0.5rem" }}>
          📊 My Dashboard
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Welcome back, {user?.name}! 👋</p>
      </div>

      {/* Main Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {[
          { label: "Total Orders", value: stats.totalOrders, icon: <ShoppingBag size={28} />, color: "#6366F1", bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
          { label: "Total Spent", value: `₹${stats.totalSpent.toLocaleString("en-IN")}`, icon: <DollarSign size={28} />, color: "#F59E0B", bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
          { label: "Total Savings", value: `₹${stats.totalSavings.toLocaleString("en-IN")}`, icon: <Tag size={28} />, color: "#10B981", bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
          { label: "Wishlist Items", value: stats.wishlistCount, icon: <Heart size={28} />, color: "#EF4444", bg: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8, boxShadow: "0 12px 30px rgba(0,0,0,0.15)" }}
            style={{
              background: stat.bg,
              borderRadius: "20px",
              padding: "1.75rem",
              color: "#fff",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: "-20px", right: "-20px", opacity: 0.2, fontSize: "6rem" }}>
              {stat.icon}
            </div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ marginBottom: "0.75rem", opacity: 0.9 }}>{stat.icon}</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.25rem" }}>{stat.value}</div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, opacity: 0.9 }}>{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Category Breakdown & Recent Orders */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        {/* Favorite Category */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            background: "var(--bg-card)",
            borderRadius: "20px",
            padding: "1.75rem",
            border: "1px solid var(--border-color)",
            boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <TrendingUp size={20} />
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Favorite Category</h3>
          </div>

          {topCategory ? (
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)", marginBottom: "0.5rem" }}>
                {topCategory[0]}
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Total spent: ₹{topCategory[1].toLocaleString("en-IN")}
              </div>

              {/* All Categories */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {Object.entries(stats.categoryBreakdown).map(([cat, amount]) => {
                  const percentage = (amount / stats.totalSpent) * 100;
                  return (
                    <div key={cat}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.85rem" }}>
                        <span style={{ fontWeight: 600 }}>{cat}</span>
                        <span style={{ color: "var(--text-secondary)" }}>₹{amount.toLocaleString("en-IN")}</span>
                      </div>
                      <div style={{ height: "6px", background: "var(--bg-secondary)", borderRadius: "10px", overflow: "hidden" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          style={{ height: "100%", background: "linear-gradient(90deg, var(--primary), var(--secondary))", borderRadius: "10px" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🛍️</div>
              <p>No orders yet!</p>
            </div>
          )}
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            background: "var(--bg-card)",
            borderRadius: "20px",
            padding: "1.75rem",
            border: "1px solid var(--border-color)",
            boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <Package size={20} />
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Recent Orders</h3>
          </div>

          {stats.recentOrders.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {stats.recentOrders.map((order, i) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    padding: "1rem",
                    background: "var(--bg-secondary)",
                    borderRadius: "12px",
                    border: "1px solid var(--border-color)",
                    cursor: "pointer",
                  }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate("/orders")}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>ID:</span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--primary)", fontFamily: "monospace", letterSpacing: "0.5px" }}>#{order._id.slice(-6).toUpperCase()}</span>
                    </div>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      background: order.deliveryStatus === "delivered" ? "#DCFCE7" : order.deliveryStatus === "shipped" ? "#DBEAFE" : "#FEF9C3",
                      color: order.deliveryStatus === "delivered" ? "#15803D" : order.deliveryStatus === "shipped" ? "#1D4ED8" : "#A16207",
                    }}>
                      {order.deliveryStatus === "delivered" ? "✅" : order.deliveryStatus === "shipped" ? "🚚" : "⏳"} {order.deliveryStatus}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      {order.items.length} item{order.items.length > 1 ? "s" : ""}
                    </span>
                    <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--primary)" }}>
                      ₹{order.totalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                </motion.div>
              ))}
              <button
                onClick={() => navigate("/orders")}
                className="btn-primary"
                style={{ width: "100%", marginTop: "0.5rem" }}
              >
                View All Orders →
              </button>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>📦</div>
              <p>No orders yet!</p>
              <button onClick={() => navigate("/")} className="btn-primary" style={{ marginTop: "1rem" }}>
                Start Shopping
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ marginTop: "2rem" }}
      >
        <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "1rem" }}>⚡ Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          {[
            { label: "Browse Products", icon: "🛍️", path: "/" },
            { label: "My Orders", icon: "📦", path: "/orders" },
            { label: "Wishlist", icon: "❤️", path: "/wishlist" },
            { label: "Profile", icon: "👤", path: "/profile" },
          ].map((action, i) => (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.path)}
              style={{
                padding: "1.25rem",
                background: "var(--bg-card)",
                border: "2px solid var(--border-color)",
                borderRadius: "16px",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>{action.icon}</span>
              {action.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
