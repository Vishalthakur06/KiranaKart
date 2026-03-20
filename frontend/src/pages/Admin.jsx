import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ShoppingBag, TrendingUp, Plus, X, ChevronDown, ChevronUp, Search } from "lucide-react";
import api from "../services/api";
import { CATEGORIES, CAT_ICONS } from "../utils/constants";

const th = { padding: "12px 16px", textAlign: "left", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", borderBottom: "2px solid var(--border-color)" };
const td = { padding: "14px 16px", verticalAlign: "top", fontSize: "0.9rem", borderBottom: "1px solid var(--border-color)" };

const STATUS_STYLE = {
  paid:    { bg: "#DCFCE7", color: "#15803D", label: "💳 Paid" },
  failed:  { bg: "#FEE2E2", color: "#DC2626", label: "❌ Failed" },
  pending: { bg: "#FEF9C3", color: "#A16207", label: "💵 COD" },
};

export default function Admin() {
  const { user } = useSelector(s => s.auth);
  const navigate = useNavigate();

  const [stats, setStats]         = useState({ products: 0, orders: 0, revenue: 0 });
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [sortDir, setSortDir]     = useState("desc");
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ name: "", price: "", description: "", image: "", stock: "", category: "Grains" });
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState({ text: "", ok: true });
  const [activeTab, setActiveTab] = useState("orders");
  const [updating, setUpdating]   = useState(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    localStorage.setItem("adminLastVisit", new Date().toISOString());
    (async () => {
      try {
        const [p, o] = await Promise.all([api.get("/products"), api.get("/orders")]);
        const rev = o.data.reduce((s, o) => s + (o.totalPrice || 0), 0);
        setStats({ products: p.data.length, orders: o.data.length, revenue: rev.toFixed(0) });
        setOrders(o.data);
      } catch { /* non-admin */ }
      finally { setLoading(false); }
    })();
  }, [user, navigate]);

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const updateDelivery = async (orderId, status) => {
    setUpdating(orderId);
    try {
      const { data } = await api.patch(`/orders/${orderId}/deliver`, { deliveryStatus: status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, deliveryStatus: data.deliveryStatus } : o));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally { setUpdating(null); }
  };
  const onAdd = async e => {
    e.preventDefault(); setSaving(true); setMsg({ text: "", ok: true });
    try {
      await api.post("/products", { ...form, price: Number(form.price), stock: Number(form.stock) });
      setMsg({ text: "✅ Product added successfully!", ok: true });
      setForm({ name: "", price: "", description: "", image: "", stock: "", category: "Grains" });
      const p = await api.get("/products");
      setStats(s => ({ ...s, products: p.data.length }));
      setTimeout(() => setShowForm(false), 1500);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Failed to add product", ok: false });
    } finally { setSaving(false); }
  };

  const filtered = orders
    .filter(o =>
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => sortDir === "desc"
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt)
    );

  const METRICS = [
    { label: "Total Products", value: stats.products, icon: <Package size={24} />, color: "#6366F1", bg: "#EEF2FF" },
    { label: "Total Orders",   value: stats.orders,   icon: <ShoppingBag size={24} />, color: "#F59E0B", bg: "#FFFBEB" },
    { label: "Total Revenue",  value: `₹${Number(stats.revenue).toLocaleString("en-IN")}`, icon: <TrendingUp size={24} />, color: "#10B981", bg: "#ECFDF5" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ padding: "2rem 0" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, background: "linear-gradient(135deg, var(--primary), #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "0.25rem" }}>
            🛠️ Admin Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Welcome back, {user?.name?.split(" ")[0]} 👋</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => { setShowForm(v => !v); setActiveTab("products"); }}
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, var(--primary), #f97316)", color: "#fff", border: "none", borderRadius: "12px", padding: "0.7rem 1.4rem", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", boxShadow: "0 4px 15px rgba(249,115,22,0.35)" }}
        >
          <Plus size={18} /> Add Product
        </motion.button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        {METRICS.map(({ label, value, icon, color, bg }) => (
          <motion.div key={label} whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(0,0,0,0.12)" }}
            style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", border: "1px solid var(--border-color)", transition: "all 0.2s" }}
          >
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "4px" }}>{label}</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>
                {loading ? <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>Loading…</span> : value}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", background: "var(--bg-secondary, #f3f4f6)", borderRadius: "12px", padding: "4px", marginBottom: "1.5rem", width: "fit-content" }}>
        {["orders", "products"].map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); if (tab === "products") setShowForm(true); }}
            style={{ padding: "0.5rem 1.4rem", borderRadius: "10px", border: "none", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
              background: activeTab === tab ? "var(--bg-card)" : "transparent",
              color: activeTab === tab ? "var(--primary)" : "var(--text-secondary)",
              boxShadow: activeTab === tab ? "0 2px 8px rgba(0,0,0,0.1)" : "none"
            }}
          >
            {tab === "orders" ? "📦 Orders" : "🛒 Products"}
          </button>
        ))}
      </div>

      {/* Add Product Form */}
      <AnimatePresence>
        {showForm && activeTab === "products" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: "1.5rem" }}>
            <div style={{ background: "var(--bg-card)", borderRadius: "20px", padding: "2rem", border: "1px solid var(--border-color)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>➕ Add New Product</h2>
                <button onClick={() => setShowForm(false)} style={{ background: "var(--bg-secondary, #f3f4f6)", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}><X size={16} /></button>
              </div>
              {msg.text && (
                <div style={{ padding: "0.75rem 1rem", borderRadius: "10px", marginBottom: "1rem", fontSize: "0.88rem", fontWeight: 600, background: msg.ok ? "#DCFCE7" : "#FEE2E2", color: msg.ok ? "#15803D" : "#DC2626" }}>
                  {msg.text}
                </div>
              )}
              <form onSubmit={onAdd} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                <input name="name" className="admin-input" placeholder="Product name" value={form.name} onChange={onChange} required style={{ gridColumn: "1 / -1" }} />
                <input name="price" className="admin-input" placeholder="Price (₹)" type="number" value={form.price} onChange={onChange} required />
                <input name="stock" className="admin-input" placeholder="Stock quantity" type="number" value={form.stock} onChange={onChange} required />
                <select name="category" className="admin-select" value={form.category} onChange={onChange}>
                  {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
                </select>
                <input name="image" className="admin-input" placeholder="Image URL (optional)" value={form.image} onChange={onChange} />
                <input name="description" className="admin-input" placeholder="Description (optional)" value={form.description} onChange={onChange} style={{ gridColumn: "1 / -1" }} />
                <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={saving}
                  style={{ gridColumn: "1 / -1", padding: "0.85rem", background: "linear-gradient(135deg, var(--primary), #f97316)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "1rem", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "inherit" }}
                >
                  {saving ? "Adding…" : "➕ Add Product"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orders Table */}
      {activeTab === "orders" && (
        <div style={{ background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border-color)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          {/* Table Header */}
          <div style={{ padding: "1.5rem 1.5rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800 }}>📦 All Orders <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginLeft: "6px" }}>({filtered.length})</span></h2>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-secondary, #f3f4f6)", borderRadius: "10px", padding: "0.5rem 1rem", border: "1px solid var(--border-color)" }}>
                <Search size={15} color="var(--text-secondary)" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customer…"
                  style={{ border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: "0.88rem", color: "var(--text-primary)", width: "160px" }} />
              </div>
              <button onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--bg-secondary, #f3f4f6)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "0.5rem 1rem", cursor: "pointer", fontFamily: "inherit", fontSize: "0.88rem", fontWeight: 600, color: "var(--text-secondary)" }}
              >
                Date {sortDir === "desc" ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
            </div>
          </div>

          {orders.length === 0 && !loading ? (
            <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-secondary)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
              <p style={{ fontWeight: 600 }}>No orders yet</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--bg-secondary, #f9fafb)" }}>
                    <th style={th}>#</th>
                    <th style={th}>Customer</th>
                    <th style={th}>Items</th>
                    <th style={th}>Total</th>
                    <th style={th}>Payment</th>
                    <th style={th}>Delivery</th>
                    <th style={th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o, idx) => {
                    const s = STATUS_STYLE[o.paymentStatus] || STATUS_STYLE.pending;
                    return (
                      <motion.tr key={o._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                        style={{ transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-secondary, #f9fafb)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ ...td, color: "var(--text-muted)", fontWeight: 600, fontSize: "0.8rem" }}>#{idx + 1}</td>
                        <td style={td}>
                          <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{o.user?.name || "—"}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>{o.user?.email || "—"}</div>
                        </td>
                        <td style={td}>
                          {o.items.map(i => (
                            <div key={i._id} style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "2px" }}>
                              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{i.product?.name || "Deleted"}</span> × {i.quantity}
                            </div>
                          ))}
                        </td>
                        <td style={{ ...td, fontWeight: 800, color: "#10B981", fontSize: "1rem" }}>₹{o.totalPrice?.toLocaleString("en-IN")}</td>
                        <td style={td}>
                          <span style={{ padding: "4px 12px", borderRadius: "20px", background: s.bg, color: s.color, fontWeight: 700, fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                            {s.label}
                          </span>
                        </td>
                        <td style={td}>
                          <select
                            value={o.deliveryStatus || "processing"}
                            disabled={updating === o._id}
                            onChange={e => updateDelivery(o._id, e.target.value)}
                            style={{
                              padding: "4px 8px", borderRadius: "8px", border: "1.5px solid", fontWeight: 700, fontSize: "0.82rem", cursor: updating === o._id ? "not-allowed" : "pointer", outline: "none", fontFamily: "inherit",
                              opacity: updating === o._id ? 0.5 : 1,
                              background: o.deliveryStatus === "delivered" ? "#DCFCE7" : o.deliveryStatus === "shipped" ? "#DBEAFE" : "#FEF9C3",
                              color: o.deliveryStatus === "delivered" ? "#15803D" : o.deliveryStatus === "shipped" ? "#1D4ED8" : "#A16207",
                              borderColor: o.deliveryStatus === "delivered" ? "#86EFAC" : o.deliveryStatus === "shipped" ? "#93C5FD" : "#FDE68A",
                            }}
                          >
                            <option value="processing">⏳ Processing</option>
                            <option value="shipped">🚚 Shipped</option>
                            <option value="delivered">✅ Delivered</option>
                          </select>
                        </td>
                        <td style={{ ...td, color: "var(--text-secondary)", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                          {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
