import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { ShoppingCart, Package } from "lucide-react";
import api from "../services/api";
import { CATEGORIES, CAT_ICONS } from "../utils/constants";

export default function Admin() {
  const { user }   = useSelector(s => s.auth);
  const navigate   = useNavigate();
  const [stats, setStats]   = useState({ products:0, orders:0, revenue:0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [form, setForm]     = useState({ name:"", price:"", description:"", image:"", stock:"", category:"Grains" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState({ text:"", ok:true });

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    (async () => {
      try {
        const [p, o] = await Promise.all([api.get("/products"), api.get("/orders")]);
        const rev = o.data.reduce((s, o) => s + (o.totalPrice || 0), 0);
        setStats({ products: p.data.length, orders: o.data.length, revenue: rev.toFixed(0) });
      } catch { /* non-admin: orders fail silently */ }
      finally { setLoadingStats(false); }
    })();
  }, [user, navigate]);

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const onAdd = async e => {
    e.preventDefault(); setSaving(true); setMsg({ text:"", ok:true });
    try {
      await api.post("/products", { ...form, price: Number(form.price), stock: Number(form.stock) });
      setMsg({ text:"✅ Product added successfully!", ok:true });
      setForm({ name:"", price:"", description:"", image:"", stock:"", category:"Grains" });
      const p = await api.get("/products");
      setStats(s => ({ ...s, products: p.data.length }));
    } catch(err) {
      setMsg({ text: err.response?.data?.message || "Failed to add product", ok:false });
    } finally { setSaving(false); }
  };

  const METRICS = [
    { label:"Total Products", value: stats.products, icon:<Package size={32} color="var(--primary)" /> },
    { label:"Total Orders",   value: stats.orders,   icon:<ShoppingCart size={32} color="var(--primary)" /> },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fade-in" style={{ padding:"1.5rem 0" }}>
      <div className="page-header">
        <h1 className="page-title">🛠️ Admin Dashboard</h1>
        <p style={{ color:"var(--text-secondary)" }}>Manage products, orders and analytics</p>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        {METRICS.map(({ label, value, icon }) => (
          <motion.div whileHover={{ y: -5 }} key={label} className="stat-card">
            <span className="stat-icon">{icon}</span>
            <span className="stat-label">{label}</span>
            <span className="stat-value">{loadingStats ? "…" : value}</span>
          </motion.div>
        ))}
      </div>

      {/* Add Product form (admin only) */}
      {user?.isAdmin && (
        <div className="admin-form-card">
          <h2>➕ Add New Product</h2>
          {msg.text && <div className={msg.ok ? "admin-msg-success" : "admin-msg-error"} style={{ marginBottom:"1rem" }}>{msg.text}</div>}
          <form className="admin-form" onSubmit={onAdd}>
            <input name="name"        className="admin-input" placeholder="Product name" value={form.name}        onChange={onChange} required />
            <input name="price"       className="admin-input" placeholder="Price (₹)" type="number" value={form.price}      onChange={onChange} required />
            <input name="stock"       className="admin-input" placeholder="Stock quantity" type="number" value={form.stock}      onChange={onChange} required />
            <select name="category" className="admin-select" value={form.category} onChange={onChange}>
              {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
            </select>
            <input name="image"       className="admin-input" placeholder="Image URL (optional)" value={form.image}       onChange={onChange} />
            <input name="description" className="admin-input" placeholder="Description (optional)" value={form.description} onChange={onChange} />
            <motion.button whileTap={{ scale: 0.98 }} type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Adding…" : "➕ Add Product"}
            </motion.button>
          </form>
        </div>
      )}
    </motion.div>
  );
}
