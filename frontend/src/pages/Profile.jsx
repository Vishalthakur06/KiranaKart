import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { User, Mail, Lock, Camera, Save, Shield } from "lucide-react";
import { useToast } from "../components/Toast";
import { updateProfile as updateProfileAction } from "../redux/slices/authSlice";
import api from "../services/api";

export default function Profile() {
  const { user } = useSelector(s => s.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", avatar: "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [showPwForm, setShowPwForm] = useState(false);
  const [stats, setStats] = useState({ orders: 0, wishlist: 0 });

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    setForm({ name: user.name, email: user.email, avatar: user.avatar || "" });
    setPreview(user.avatar || "");
    // Fetch stats
    (async () => {
      try {
        const [orders, wishlist] = await Promise.all([
          api.get("/orders"),
          api.get("/user/wishlist"),
        ]);
        setStats({ orders: orders.data.length, wishlist: wishlist.data.length });
      } catch { /* */ }
    })();
  }, [user, navigate]);

  const onAvatarChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setPreview(reader.result); setForm(f => ({ ...f, avatar: reader.result })); };
    reader.readAsDataURL(file);
  };

  const saveProfile = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/user/profile", { name: form.name, avatar: form.avatar });
      // Update localStorage
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      const updated = { ...stored, name: data.name, avatar: data.avatar };
      localStorage.setItem("user", JSON.stringify(updated));
      dispatch(updateProfileAction(updated));
      addToast("Profile updated!", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update", "error");
    } finally { setSaving(false); }
  };

  const changePassword = async e => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      addToast("Passwords don't match", "error"); return;
    }
    if (pwForm.newPassword.length < 6) {
      addToast("Password must be at least 6 characters", "error"); return;
    }
    setChangingPw(true);
    try {
      await api.put("/user/profile", { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      addToast("Password changed!", "success");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPwForm(false);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed", "error");
    } finally { setChangingPw(false); }
  };

  if (!user) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "2rem 0", maxWidth: 600, margin: "0 auto" }}>
      <h1 className="page-heading" style={{ marginBottom: "2rem" }}>👤 My Profile</h1>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Orders", value: stats.orders, emoji: "📦" },
          { label: "Wishlist", value: stats.wishlist, emoji: "❤️" },
          { label: "Member Since", value: new Date(user.id ? Date.now() : Date.now()).toLocaleDateString("en-IN", { month: "short", year: "numeric" }), emoji: "📅" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", padding: "1.25rem", textAlign: "center", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{s.emoji}</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)" }}>{s.value}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Profile Form */}
      <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-xl)", padding: "2rem", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-md)", marginBottom: "1.5rem" }}>
        <form onSubmit={saveProfile}>
          {/* Avatar */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem" }}>
            <label style={{ cursor: "pointer", position: "relative" }}>
              <div style={{ width: 100, height: 100, borderRadius: "50%", overflow: "hidden", border: "3px solid var(--primary)", boxShadow: "var(--shadow-orange)" }}>
                <img src={preview || `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.name}&backgroundColor=ffb703`} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ position: "absolute", bottom: 0, right: 0, background: "var(--primary)", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", border: "2px solid var(--bg-card)" }}>
                <Camera size={14} />
              </div>
              <input type="file" accept="image/*" onChange={onAvatarChange} style={{ display: "none" }} />
            </label>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>Click to change photo</span>
          </div>

          {/* Name */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <User size={14} /> Full Name
            </label>
            <input className="auth-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required style={{ width: "100%" }} />
          </div>

          {/* Email (read-only) */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <Mail size={14} /> Email
            </label>
            <input className="auth-input" value={form.email} disabled style={{ width: "100%", opacity: 0.6, cursor: "not-allowed" }} />
          </div>

          {user.isAdmin && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.6rem 1rem", background: "var(--accent-light)", borderRadius: "var(--radius-md)", marginBottom: "1rem", fontSize: "0.85rem", fontWeight: 700, color: "var(--accent)" }}>
              <Shield size={16} /> Admin Account
            </div>
          )}

          <motion.button whileTap={{ scale: 0.98 }} type="submit" className="btn-primary" disabled={saving} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
          </motion.button>
        </form>
      </div>

      {/* Password Change */}
      <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-xl)", padding: "2rem", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
        <button onClick={() => setShowPwForm(!showPwForm)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", width: "100%", padding: 0 }}>
          <Lock size={18} /> Change Password
          <span style={{ marginLeft: "auto", color: "var(--text-secondary)", fontSize: "0.85rem" }}>{showPwForm ? "▲" : "▼"}</span>
        </button>

        {showPwForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} onSubmit={changePassword} style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <input className="auth-input" type="password" placeholder="Current password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} required style={{ width: "100%" }} />
            <input className="auth-input" type="password" placeholder="New password (min 6 chars)" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} required style={{ width: "100%" }} />
            <input className="auth-input" type="password" placeholder="Confirm new password" value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} required style={{ width: "100%" }} />
            <motion.button whileTap={{ scale: 0.98 }} type="submit" className="btn-primary" disabled={changingPw} style={{ width: "100%" }}>
              {changingPw ? "Changing..." : "Update Password"}
            </motion.button>
          </motion.form>
        )}
      </div>
    </motion.div>
  );
}
