import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ShoppingBag, TrendingUp, Plus, X, ChevronDown, ChevronUp, Search, Upload, Download, Edit2, Trash2, BarChart3, Users, DollarSign, Calendar, AlertTriangle, TrendingDown } from "lucide-react";
import * as XLSX from "xlsx";
import api from "../services/api";
import { CATEGORIES, CAT_ICONS } from "../utils/constants";
import { useToast } from "../components/Toast";

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
  const { addToast } = useToast();

  const [stats, setStats]         = useState({ products: 0, orders: 0, revenue: 0 });
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders]       = useState([]);
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [sortDir, setSortDir]     = useState("desc");
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ name: "", price: "", description: "", image: "", stock: "", category: "Grains" });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [activeTab, setActiveTab] = useState("analytics");
  const [stockFilter, setStockFilter] = useState("all");
  const [updatingStock, setUpdatingStock] = useState(null);
  const [updating, setUpdating]   = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting]   = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    localStorage.setItem("adminLastVisit", new Date().toISOString());
    (async () => {
      try {
        const [p, o, a] = await Promise.all([api.get("/products"), api.get("/orders"), api.get("/orders/analytics")]);
        const rev = o.data.reduce((s, o) => s + (o.totalPrice || 0), 0);
        setStats({ products: p.data.length, orders: o.data.length, revenue: rev.toFixed(0) });
        setOrders(o.data);
        setProducts(Array.isArray(p.data) ? p.data : p.data.products || []);
        setAnalytics(a.data);
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
      addToast("Delivery status updated", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update status", "error");
    } finally { setUpdating(null); }
  };

  const onAdd = async e => {
    e.preventDefault(); setSaving(true);
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, { ...form, price: Number(form.price), stock: Number(form.stock) });
        addToast("Product updated successfully!", "success");
        setProducts(prev => prev.map(p => p._id === editingId ? { ...p, ...form, price: Number(form.price), stock: Number(form.stock) } : p));
        setEditingId(null);
      } else {
        const { data } = await api.post("/products", { ...form, price: Number(form.price), stock: Number(form.stock) });
        addToast("Product added successfully!", "success");
        setProducts(prev => [...prev, data]);
        setStats(s => ({ ...s, products: s.products + 1 }));
      }
      setForm({ name: "", price: "", description: "", image: "", stock: "", category: "Grains" });
      setTimeout(() => setShowForm(false), 1500);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to save product", "error");
    } finally { setSaving(false); }
  };

  const onEdit = (product) => {
    setForm({ name: product.name, price: product.price, description: product.description || "", image: product.image || "", stock: product.stock, category: product.category });
    setEditingId(product._id);
    setShowForm(true);
    setActiveTab("products");
  };

  const onDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setDeleting(id);
    try {
      await api.delete(`/products/${id}`);
      addToast("Product deleted successfully!", "success");
      setProducts(prev => prev.filter(p => p._id !== id));
      setStats(s => ({ ...s, products: s.products - 1 }));
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to delete product", "error");
    } finally { setDeleting(null); }
  };

  const downloadTemplate = () => {
    const template = [
      { name: "Basmati Rice", price: 120, description: "Premium quality basmati rice", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c", stock: 100, category: "Grains" },
      { name: "Wheat Flour", price: 45, description: "Fresh wheat flour", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b", stock: 200, category: "Grains" },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "products_template.xlsx");
    addToast("Template downloaded", "success");
  };

  const handleBulkUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    addToast("Uploading products...", "info");
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const products = XLSX.utils.sheet_to_json(ws);
      
      if (products.length === 0) {
        addToast("No products found in file", "error");
        setUploading(false);
        return;
      }

      const { data: result } = await api.post("/products/bulk", { products });
      const msg = result.skipped > 0 
        ? `🎉 ${result.products.length} products added, ${result.skipped} duplicates skipped!`
        : `🎉 ${result.products.length} products successfully added to store!`;
      addToast(msg, "success", 4000);
      const p = await api.get("/products");
      setProducts(Array.isArray(p.data) ? p.data : p.data.products || []);
      setStats(s => ({ ...s, products: (Array.isArray(p.data) ? p.data : p.data.products || []).length }));
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to upload products", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, background: "linear-gradient(135deg, var(--primary), #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "0.25rem" }}>
            🛠️ Admin Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Welcome back, {user?.name?.split(" ")[0]} 👋</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={downloadTemplate}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-card)", color: "var(--primary)", border: "2px solid var(--primary)", borderRadius: "12px", padding: "0.7rem 1.4rem", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer" }}
          >
            <Download size={18} /> Template
          </motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "#10B981", color: "#fff", border: "none", borderRadius: "12px", padding: "0.7rem 1.4rem", fontWeight: 700, fontSize: "0.95rem", cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.7 : 1 }}
          >
            <Upload size={18} /> {uploading ? "Uploading..." : "Bulk Upload"}
          </motion.button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleBulkUpload} style={{ display: "none" }} />
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setShowForm(v => !v); setActiveTab("products"); }}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, var(--primary), #f97316)", color: "#fff", border: "none", borderRadius: "12px", padding: "0.7rem 1.4rem", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", boxShadow: "0 4px 15px rgba(249,115,22,0.35)" }}
          >
            <Plus size={18} /> Add Product
          </motion.button>
        </div>
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
        {["analytics", "inventory", "orders", "products"].map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); if (tab === "products") setShowForm(true); }}
            style={{ padding: "0.5rem 1.4rem", borderRadius: "10px", border: "none", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
              background: activeTab === tab ? "var(--bg-card)" : "transparent",
              color: activeTab === tab ? "var(--primary)" : "var(--text-secondary)",
              boxShadow: activeTab === tab ? "0 2px 8px rgba(0,0,0,0.1)" : "none"
            }}
          >
            {tab === "analytics" ? "📊 Analytics" : tab === "inventory" ? "📦 Inventory" : tab === "orders" ? "🚚 Orders" : "🛒 Products"}
          </button>
        ))}
      </div>

      {/* Add Product Form */}
      <AnimatePresence>
        {showForm && activeTab === "products" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: "1.5rem" }}>
            <div style={{ background: "var(--bg-card)", borderRadius: "20px", padding: "2rem", border: "1px solid var(--border-color)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>{editingId ? "✏️ Edit Product" : "➕ Add New Product"}</h2>
                <button onClick={() => { setShowForm(false); setEditingId(null); setForm({ name: "", price: "", description: "", image: "", stock: "", category: "Grains" }); }} style={{ background: "var(--bg-secondary, #f3f4f6)", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}><X size={16} /></button>
              </div>
              <form onSubmit={onAdd} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.85rem" }}>
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
                  {saving ? (editingId ? "Updating…" : "Adding…") : (editingId ? "✏️ Update Product" : "➕ Add Product")}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analytics Dashboard */}
      {activeTab === "analytics" && analytics && (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {/* Revenue & Orders Chart */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {/* Monthly Revenue */}
            <div style={{ background: "var(--bg-card)", borderRadius: "20px", padding: "1.5rem", border: "1px solid var(--border-color)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BarChart3 size={20} color="#fff" />
                </div>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "2px" }}>Monthly Revenue</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Last 6 months</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {Object.entries(analytics.monthlyData).slice(-6).map(([month, revenue]) => {
                  const maxRev = Math.max(...Object.values(analytics.monthlyData));
                  const width = (revenue / maxRev) * 100;
                  return (
                    <div key={month}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "0.85rem" }}>
                        <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{month}</span>
                        <span style={{ fontWeight: 800, color: "#10B981" }}>₹{revenue.toLocaleString("en-IN")}</span>
                      </div>
                      <div style={{ height: "8px", background: "var(--bg-secondary, #f3f4f6)", borderRadius: "4px", overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: 0.8, delay: 0.1 }}
                          style={{ height: "100%", background: "linear-gradient(90deg, #667eea, #764ba2)", borderRadius: "4px" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Sales */}
            <div style={{ background: "var(--bg-card)", borderRadius: "20px", padding: "1.5rem", border: "1px solid var(--border-color)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #f093fb, #f5576c)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Package size={20} color="#fff" />
                </div>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "2px" }}>Sales by Category</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Top performing</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {Object.entries(analytics.categoryData).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cat, sales]) => {
                  const maxSales = Math.max(...Object.values(analytics.categoryData));
                  const width = (sales / maxSales) * 100;
                  return (
                    <div key={cat}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "0.85rem" }}>
                        <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{CAT_ICONS[cat]} {cat}</span>
                        <span style={{ fontWeight: 800, color: "#F59E0B" }}>₹{sales.toLocaleString("en-IN")}</span>
                      </div>
                      <div style={{ height: "8px", background: "var(--bg-secondary, #f3f4f6)", borderRadius: "4px", overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: 0.8, delay: 0.1 }}
                          style={{ height: "100%", background: "linear-gradient(90deg, #f093fb, #f5576c)", borderRadius: "4px" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <motion.div whileHover={{ y: -4 }}
              style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: "16px", padding: "1.5rem", color: "#fff", boxShadow: "0 8px 24px rgba(102,126,234,0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <DollarSign size={24} />
                <span style={{ fontSize: "0.85rem", opacity: 0.9, fontWeight: 600 }}>Total Revenue</span>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800 }}>₹{analytics.totalRevenue.toLocaleString("en-IN")}</div>
            </motion.div>

            <motion.div whileHover={{ y: -4 }}
              style={{ background: "linear-gradient(135deg, #f093fb, #f5576c)", borderRadius: "16px", padding: "1.5rem", color: "#fff", boxShadow: "0 8px 24px rgba(240,147,251,0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <ShoppingBag size={24} />
                <span style={{ fontSize: "0.85rem", opacity: 0.9, fontWeight: 600 }}>Total Orders</span>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800 }}>{analytics.totalOrders}</div>
            </motion.div>

            <motion.div whileHover={{ y: -4 }}
              style={{ background: "linear-gradient(135deg, #4facfe, #00f2fe)", borderRadius: "16px", padding: "1.5rem", color: "#fff", boxShadow: "0 8px 24px rgba(79,172,254,0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <TrendingUp size={24} />
                <span style={{ fontSize: "0.85rem", opacity: 0.9, fontWeight: 600 }}>Avg Order Value</span>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800 }}>₹{(analytics.totalRevenue / analytics.totalOrders || 0).toFixed(0)}</div>
            </motion.div>

            <motion.div whileHover={{ y: -4 }}
              style={{ background: "linear-gradient(135deg, #fa709a, #fee140)", borderRadius: "16px", padding: "1.5rem", color: "#fff", boxShadow: "0 8px 24px rgba(250,112,154,0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <Package size={24} />
                <span style={{ fontSize: "0.85rem", opacity: 0.9, fontWeight: 600 }}>Total Products</span>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800 }}>{stats.products}</div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <div style={{ background: "var(--bg-card)", borderRadius: "20px", padding: "1.5rem", border: "1px solid var(--border-color)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #4facfe, #00f2fe)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Calendar size={20} color="#fff" />
              </div>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "2px" }}>Recent Orders</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Last 5 orders</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {orders.slice(0, 5).map((o, i) => (
                <motion.div key={o._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "var(--bg-secondary, #f9fafb)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "0.9rem" }}>
                      #{i + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{o.user?.name || "Customer"}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{o.items.length} items • {new Date(o.createdAt).toLocaleDateString("en-IN")}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, color: "#10B981", fontSize: "1rem" }}>₹{o.totalPrice.toLocaleString("en-IN")}</div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: o.deliveryStatus === "delivered" ? "#10B981" : "#F59E0B", marginTop: "2px" }}>
                      {o.deliveryStatus === "delivered" ? "✅ Delivered" : o.deliveryStatus === "shipped" ? "🚚 Shipped" : "⏳ Processing"}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inventory Management */}
      {activeTab === "inventory" && (
        <div>
          {/* Low Stock Alert */}
          {products.filter(p => p.stock < 10).length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: "linear-gradient(135deg, #FEF3C7, #FDE68A)", border: "2px solid #F59E0B", borderRadius: "16px", padding: "1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <AlertTriangle size={24} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#92400E", marginBottom: "4px" }}>⚠️ Low Stock Alert!</h3>
                <p style={{ fontSize: "0.9rem", color: "#78350F" }}>
                  {products.filter(p => p.stock < 10).length} products are running low on stock. Restock soon to avoid stockouts!
                </p>
              </div>
            </motion.div>
          )}

          {/* Stock Filter Chips */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            {["all", "low", "out", "good"].map(filter => (
              <motion.button key={filter} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setStockFilter(filter)}
                style={{
                  padding: "0.5rem 1.25rem", borderRadius: "12px", border: "2px solid", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                  background: stockFilter === filter ? "var(--primary)" : "var(--bg-card)",
                  color: stockFilter === filter ? "#fff" : "var(--text-secondary)",
                  borderColor: stockFilter === filter ? "var(--primary)" : "var(--border-color)"
                }}>
                {filter === "all" ? "🔍 All Products" : filter === "low" ? "⚠️ Low Stock (<10)" : filter === "out" ? "❌ Out of Stock" : "✅ Good Stock (≥10)"}
              </motion.button>
            ))}
          </div>

          {/* Inventory Table */}
          <div style={{ background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border-color)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "1.5rem 1.5rem 1rem" }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800 }}>📦 Product Inventory
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginLeft: "6px" }}>
                  ({products.filter(p => 
                    stockFilter === "all" ? true :
                    stockFilter === "low" ? p.stock < 10 && p.stock > 0 :
                    stockFilter === "out" ? p.stock === 0 :
                    p.stock >= 10
                  ).length} items)
                </span>
              </h2>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--bg-secondary, #f9fafb)" }}>
                    <th style={th}>Product</th>
                    <th style={th}>Category</th>
                    <th style={th}>Price</th>
                    <th style={th}>Current Stock</th>
                    <th style={th}>Status</th>
                    <th style={th}>Quick Update</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .filter(p => 
                      stockFilter === "all" ? true :
                      stockFilter === "low" ? p.stock < 10 && p.stock > 0 :
                      stockFilter === "out" ? p.stock === 0 :
                      p.stock >= 10
                    )
                    .map((p, idx) => (
                      <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                        style={{ transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-secondary, #f9fafb)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <img src={p.image || "https://via.placeholder.com/50"} alt={p.name} 
                              style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }} />
                            <div>
                              <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem" }}>{p.name}</div>
                              {p.description && <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                                {p.description.slice(0, 40)}{p.description.length > 40 ? "..." : ""}
                              </div>}
                            </div>
                          </div>
                        </td>
                        <td style={td}>
                          <span style={{ padding: "4px 10px", borderRadius: "6px", background: "var(--bg-secondary, #f3f4f6)", fontSize: "0.8rem", fontWeight: 600 }}>
                            {CAT_ICONS[p.category]} {p.category}
                          </span>
                        </td>
                        <td style={{ ...td, fontWeight: 800, color: "#10B981", fontSize: "0.95rem" }}>₹{p.price?.toLocaleString("en-IN")}</td>
                        <td style={td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: p.stock === 0 ? "#DC2626" : p.stock < 10 ? "#F59E0B" : "#10B981" }}>
                              {p.stock}
                            </div>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>units</span>
                          </div>
                        </td>
                        <td style={td}>
                          {p.stock === 0 ? (
                            <span style={{ padding: "6px 12px", borderRadius: "8px", background: "#FEE2E2", color: "#DC2626", fontWeight: 700, fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              ❌ Out of Stock
                            </span>
                          ) : p.stock < 10 ? (
                            <span style={{ padding: "6px 12px", borderRadius: "8px", background: "#FEF3C7", color: "#92400E", fontWeight: 700, fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <TrendingDown size={14} /> Low Stock
                            </span>
                          ) : (
                            <span style={{ padding: "6px 12px", borderRadius: "8px", background: "#DCFCE7", color: "#15803D", fontWeight: 700, fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              ✅ In Stock
                            </span>
                          )}
                        </td>
                        <td style={td}>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              disabled={updatingStock === p._id}
                              onClick={async () => {
                                setUpdatingStock(p._id);
                                try {
                                  const newStock = p.stock + 10;
                                  await api.put(`/products/${p._id}`, { ...p, stock: newStock });
                                  setProducts(prev => prev.map(prod => prod._id === p._id ? { ...prod, stock: newStock } : prod));
                                  addToast("Stock updated +10", "success");
                                } catch (err) {
                                  addToast("Failed to update stock", "error");
                                } finally {
                                  setUpdatingStock(null);
                                }
                              }}
                              style={{ padding: "6px 10px", background: "#DCFCE7", color: "#15803D", border: "none", borderRadius: "6px", cursor: updatingStock === p._id ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "0.75rem", opacity: updatingStock === p._id ? 0.5 : 1 }}>
                              +10
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              disabled={updatingStock === p._id}
                              onClick={async () => {
                                setUpdatingStock(p._id);
                                try {
                                  const newStock = p.stock + 50;
                                  await api.put(`/products/${p._id}`, { ...p, stock: newStock });
                                  setProducts(prev => prev.map(prod => prod._id === p._id ? { ...prod, stock: newStock } : prod));
                                  addToast("Stock updated +50", "success");
                                } catch (err) {
                                  addToast("Failed to update stock", "error");
                                } finally {
                                  setUpdatingStock(null);
                                }
                              }}
                              style={{ padding: "6px 10px", background: "#DBEAFE", color: "#1D4ED8", border: "none", borderRadius: "6px", cursor: updatingStock === p._id ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "0.75rem", opacity: updatingStock === p._id ? 0.5 : 1 }}>
              +50
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => onEdit(p)}
                              style={{ padding: "6px 10px", background: "var(--bg-secondary, #f3f4f6)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", borderRadius: "6px", cursor: "pointer", fontWeight: 700, fontSize: "0.75rem" }}>
                              <Edit2 size={12} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {activeTab === "orders" && (
        <div style={{ background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border-color)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", overflow: "hidden" }}>
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
                    <th style={th}>Shipping Details</th>
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
                          {o.shippingDetails ? (
                            <div style={{ fontSize: "0.82rem", lineHeight: 1.6, minWidth: "200px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", padding: "6px 10px", background: "linear-gradient(135deg, #667eea15, #764ba215)", borderRadius: "8px", border: "1px solid var(--primary)" }}>
                                <span style={{ fontSize: "1rem" }}>👤</span>
                                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{o.shippingDetails.name}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: "var(--bg-secondary, #f9fafb)", borderRadius: "6px", marginBottom: "4px" }}>
                                <span style={{ fontSize: "0.95rem" }}>📱</span>
                                <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{o.shippingDetails.phone}</span>
                              </div>
                              <div style={{ padding: "6px 10px", background: "var(--bg-secondary, #f9fafb)", borderRadius: "6px", marginTop: "4px" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                                  <span style={{ fontSize: "0.95rem", marginTop: "1px" }}>📍</span>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: "2px" }}>{o.shippingDetails.address}</div>
                                    <div style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}>
                                      {o.shippingDetails.city}, {o.shippingDetails.state} - <span style={{ fontWeight: 700 }}>{o.shippingDetails.pincode}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No details</span>
                          )}
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

      {/* Products Table */}
      {activeTab === "products" && (
        <div style={{ background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border-color)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "1.5rem 1.5rem 1rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800 }}>🛒 All Products <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginLeft: "6px" }}>({products.length})</span></h2>
          </div>
          {products.length === 0 && !loading ? (
            <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-secondary)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</div>
              <p style={{ fontWeight: 600 }}>No products yet</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--bg-secondary, #f9fafb)" }}>
                    <th style={th}>Image</th>
                    <th style={th}>Name</th>
                    <th style={th}>Category</th>
                    <th style={th}>Price</th>
                    <th style={th}>Stock</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, idx) => (
                    <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                      style={{ transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-secondary, #f9fafb)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={td}>
                        <img src={p.image || "https://via.placeholder.com/60"} alt={p.name} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }} />
                      </td>
                      <td style={td}>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{p.name}</div>
                        {p.description && <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>{p.description.slice(0, 50)}{p.description.length > 50 ? "..." : ""}</div>}
                      </td>
                      <td style={td}>
                        <span style={{ padding: "4px 10px", borderRadius: "6px", background: "var(--bg-secondary, #f3f4f6)", fontSize: "0.82rem", fontWeight: 600 }}>
                          {CAT_ICONS[p.category]} {p.category}
                        </span>
                      </td>
                      <td style={{ ...td, fontWeight: 800, color: "#10B981", fontSize: "1rem" }}>₹{p.price?.toLocaleString("en-IN")}</td>
                      <td style={td}>
                        <span style={{ padding: "4px 10px", borderRadius: "6px", fontWeight: 700, fontSize: "0.82rem", background: p.stock < 10 ? "#FEE2E2" : "#DCFCE7", color: p.stock < 10 ? "#DC2626" : "#15803D" }}>
                          {p.stock} units
                        </span>
                      </td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => onEdit(p)}
                            style={{ padding: "6px 12px", background: "#DBEAFE", color: "#1D4ED8", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600, fontSize: "0.82rem" }}
                          >
                            <Edit2 size={14} /> Edit
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => onDelete(p._id)}
                            disabled={deleting === p._id}
                            style={{ padding: "6px 12px", background: "#FEE2E2", color: "#DC2626", border: "none", borderRadius: "8px", cursor: deleting === p._id ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600, fontSize: "0.82rem", opacity: deleting === p._id ? 0.5 : 1 }}
                          >
                            <Trash2 size={14} /> {deleting === p._id ? "Deleting..." : "Delete"}
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Products Table */}
      {activeTab === "products" && (
        <div style={{ background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border-color)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "1.5rem 1.5rem 1rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800 }}>🛒 All Products <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginLeft: "6px" }}>({products.length})</span></h2>
          </div>
          {products.length === 0 && !loading ? (
            <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-secondary)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</div>
              <p style={{ fontWeight: 600 }}>No products yet</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--bg-secondary, #f9fafb)" }}>
                    <th style={th}>Image</th>
                    <th style={th}>Name</th>
                    <th style={th}>Category</th>
                    <th style={th}>Price</th>
                    <th style={th}>Stock</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, idx) => (
                    <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                      style={{ transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-secondary, #f9fafb)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={td}>
                        <img src={p.image || "https://via.placeholder.com/60"} alt={p.name} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }} />
                      </td>
                      <td style={td}>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{p.name}</div>
                        {p.description && <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>{p.description.slice(0, 50)}{p.description.length > 50 ? "..." : ""}</div>}
                      </td>
                      <td style={td}>
                        <span style={{ padding: "4px 10px", borderRadius: "6px", background: "var(--bg-secondary, #f3f4f6)", fontSize: "0.82rem", fontWeight: 600 }}>
                          {CAT_ICONS[p.category]} {p.category}
                        </span>
                      </td>
                      <td style={{ ...td, fontWeight: 800, color: "#10B981", fontSize: "1rem" }}>₹{p.price?.toLocaleString("en-IN")}</td>
                      <td style={td}>
                        <span style={{ padding: "4px 10px", borderRadius: "6px", fontWeight: 700, fontSize: "0.82rem", background: p.stock < 10 ? "#FEE2E2" : "#DCFCE7", color: p.stock < 10 ? "#DC2626" : "#15803D" }}>
                          {p.stock} units
                        </span>
                      </td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => onEdit(p)}
                            style={{ padding: "6px 12px", background: "#DBEAFE", color: "#1D4ED8", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600, fontSize: "0.82rem" }}
                          >
                            <Edit2 size={14} /> Edit
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => onDelete(p._id)}
                            disabled={deleting === p._id}
                            style={{ padding: "6px 12px", background: "#FEE2E2", color: "#DC2626", border: "none", borderRadius: "8px", cursor: deleting === p._id ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600, fontSize: "0.82rem", opacity: deleting === p._id ? 0.5 : 1 }}
                          >
                            <Trash2 size={14} /> {deleting === p._id ? "Deleting..." : "Delete"}
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
