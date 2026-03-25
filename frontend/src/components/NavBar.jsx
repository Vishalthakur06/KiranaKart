import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, ShoppingCart, User as UserIcon, LogOut, LayoutDashboard, Package, Search, X, Home, Menu, Heart, GitCompare } from "lucide-react";
import { logoutUser } from "../redux/slices/authSlice";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function NavBar({ isDark, toggleDark }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const { items } = useSelector(s => s.cart);
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const [newOrders, setNewOrders] = useState(0);
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const onSearch = e => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?q=${encodeURIComponent(search.trim())}`);
    }
  };

  useEffect(() => {
    if (!user?.isAdmin) return;
    const fetch = async () => {
      try {
        const { data } = await api.get("/orders");
        const lastVisit = localStorage.getItem("adminLastVisit");
        const unseen = lastVisit
          ? data.filter(o => o.deliveryStatus === "processing" && new Date(o.createdAt) > new Date(lastVisit)).length
          : data.filter(o => o.deliveryStatus === "processing").length;
        setNewOrders(unseen);
      } catch {}
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <header className="app-header">
      <Link to="/" className="nav-brand">
        <motion.img src="/logo.png" alt="KiranaKart Logo" style={{ height: "36px", width: "auto", marginRight: "4px" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} />
        KiranaKart
      </Link>
      <span className="nav-tagline">आपका अपना दुकान</span>

      {/* Search Bar */}
      {!user?.isAdmin && (
        <form onSubmit={onSearch} className="nav-search-form" style={{ flex: 1, maxWidth: "400px", margin: "0 1rem", display: "flex", alignItems: "center", background: "rgba(255,255,255,0.15)", borderRadius: "999px", padding: "0 1rem", height: "38px", border: `1.5px solid ${focused ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)"}`, transition: "border 0.2s" }}>
          <Search size={15} color="rgba(255,255,255,0.8)" style={{ flexShrink: 0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder="Search products…" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "0.88rem", padding: "0 0.5rem", fontFamily: "inherit", minWidth: 0 }} />
          <AnimatePresence>
            {search && (
              <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} type="button" onClick={() => { setSearch(""); navigate("/"); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", cursor: "pointer", padding: 0, display: "flex" }}>
                <X size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </form>
      )}

      {/* Hamburger */}
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMenuOpen(!menuOpen)} className="nav-hamburger" style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", cursor: "pointer", width: "36px", height: "36px", borderRadius: "8px", display: "none", alignItems: "center", justifyContent: "center", marginLeft: "auto" }}>
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </motion.button>

      <div className="nav-actions">
        <NavLink to="/" className={({isActive}) => `nav-cart-btn ${isActive ? 'active' : ''}`} end><Home size={18} /> Home</NavLink>

        {user?.isAdmin ? (
          <NavLink to="/admin" className={({isActive}) => `nav-cart-btn ${isActive ? 'active' : ''}`} style={{ position: "relative" }} onClick={() => localStorage.setItem("adminLastVisit", new Date().toISOString())}>
            <LayoutDashboard size={18} /> Dashboard
            {newOrders > 0 && (
              <span style={{ position: "absolute", top: "-6px", right: "-6px", background: "#EF4444", color: "#fff", fontSize: "0.65rem", fontWeight: 800, minWidth: "18px", height: "18px", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{newOrders}</span>
            )}
          </NavLink>
        ) : (
          <>
            <NavLink to="/cart" className={({isActive}) => `nav-cart-btn ${isActive ? 'active' : ''}`}>
              <ShoppingCart size={18} /> Cart {totalQty > 0 && <span className="cart-badge">{totalQty}</span>}
            </NavLink>
            {user && (
              <>
                <NavLink to="/wishlist" className={({isActive}) => `nav-cart-btn ${isActive ? 'active' : ''}`}><Heart size={18} /> Wishlist</NavLink>
                <NavLink to="/compare" className={({isActive}) => `nav-cart-btn ${isActive ? 'active' : ''}`}><GitCompare size={18} /> Compare</NavLink>
                <NavLink to="/orders" className={({isActive}) => `nav-cart-btn ${isActive ? 'active' : ''}`}><Package size={18} /> Orders</NavLink>
              </>
            )}
          </>
        )}

        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleDark} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", cursor: "pointer", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </motion.button>

        {user ? (
          <div className="nav-user-info">
            <NavLink to="/profile" className={({isActive}) => `nav-profile-link ${isActive ? 'active' : ''}`} style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", overflow: "hidden", background: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid rgba(255,255,255,0.6)" }}>
                {user.avatar
                  ? <img src={user.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#fff" }}>{user.name.charAt(0).toUpperCase()}</span>}
              </div>
              <span className="nav-username">{user.name.split(" ")[0]}</span>
            </NavLink>
            {user.isAdmin && <span className="nav-admin-pill">Admin</span>}
            <button className="nav-logout-btn" onClick={() => dispatch(logoutUser())}><LogOut size={14} style={{ marginRight: "4px" }} />Logout</button>
          </div>
        ) : (
            <NavLink to="/login" className={({isActive}) => `nav-login-btn ${isActive ? 'active' : ''}`}><UserIcon size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} /> Login</NavLink>
        )}
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }} transition={{ type: "tween", duration: 0.3 }} className="nav-mobile-menu"
            style={{ position: "fixed", top: "62px", right: 0, bottom: 0, width: "280px", background: "var(--bg-card)", boxShadow: "-4px 0 20px rgba(0,0,0,0.15)", zIndex: 99, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem", overflowY: "auto" }}>
            <NavLink to="/" onClick={() => setMenuOpen(false)} className={({isActive}) => `nav-mobile-item ${isActive ? 'active' : ''}`} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "12px", background: "var(--bg-secondary)", color: "var(--text-primary)", fontWeight: 600, fontSize: "0.95rem" }}>
              <Home size={20} /> Home
            </NavLink>

            {user?.isAdmin ? (
              <NavLink to="/admin" onClick={() => { setMenuOpen(false); localStorage.setItem("adminLastVisit", new Date().toISOString()); }} className={({isActive}) => `nav-mobile-item ${isActive ? 'active' : ''}`} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "12px", background: "var(--bg-secondary)", color: "var(--text-primary)", fontWeight: 600, fontSize: "0.95rem", position: "relative" }}>
                <LayoutDashboard size={20} /> Dashboard
                {newOrders > 0 && <span style={{ marginLeft: "auto", background: "#EF4444", color: "#fff", fontSize: "0.7rem", fontWeight: 800, minWidth: "20px", height: "20px", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px" }}>{newOrders}</span>}
              </NavLink>
            ) : (
              <>
                <NavLink to="/cart" onClick={() => setMenuOpen(false)} className={({isActive}) => `nav-mobile-item ${isActive ? 'active' : ''}`} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "12px", background: "var(--bg-secondary)", color: "var(--text-primary)", fontWeight: 600, fontSize: "0.95rem" }}>
                  <ShoppingCart size={20} /> Cart
                  {totalQty > 0 && <span style={{ marginLeft: "auto", background: "var(--primary)", color: "#fff", fontSize: "0.7rem", fontWeight: 800, minWidth: "20px", height: "20px", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px" }}>{totalQty}</span>}
                </NavLink>
                {user && (
                  <>
                    <NavLink to="/wishlist" onClick={() => setMenuOpen(false)} className={({isActive}) => `nav-mobile-item ${isActive ? 'active' : ''}`} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "12px", background: "var(--bg-secondary)", color: "var(--text-primary)", fontWeight: 600, fontSize: "0.95rem" }}>
                      <Heart size={20} /> Wishlist
                    </NavLink>
                    <NavLink to="/compare" onClick={() => setMenuOpen(false)} className={({isActive}) => `nav-mobile-item ${isActive ? 'active' : ''}`} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "12px", background: "var(--bg-secondary)", color: "var(--text-primary)", fontWeight: 600, fontSize: "0.95rem" }}>
                      <GitCompare size={20} /> Compare
                    </NavLink>
                    <NavLink to="/orders" onClick={() => setMenuOpen(false)} className={({isActive}) => `nav-mobile-item ${isActive ? 'active' : ''}`} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "12px", background: "var(--bg-secondary)", color: "var(--text-primary)", fontWeight: 600, fontSize: "0.95rem" }}>
                      <Package size={20} /> Orders
                    </NavLink>
                  </>
                )}
              </>
            )}

            <button onClick={toggleDark} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "12px", background: "var(--bg-secondary)", color: "var(--text-primary)", fontWeight: 600, fontSize: "0.95rem", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />} {isDark ? "Light Mode" : "Dark Mode"}
            </button>

            <div style={{ borderTop: "1px solid var(--border-color)", marginTop: "0.5rem", paddingTop: "1rem" }}>
              {user ? (
                <>
                  <NavLink to="/profile" onClick={() => setMenuOpen(false)} className={({isActive}) => `nav-mobile-item ${isActive ? 'active' : ''}`} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", marginBottom: "0.75rem", textDecoration: "none" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid var(--primary)" }}>
                      {user.avatar
                        ? <img src={user.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <span style={{ fontSize: "1rem", fontWeight: 800, color: "var(--primary)" }}>{user.name.charAt(0).toUpperCase()}</span>}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>{user.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{user.email}</div>
                    </div>
                  </NavLink>
                  {user.isAdmin && (
                    <div style={{ padding: "0.5rem 1rem", background: "var(--accent-light)", color: "var(--accent)", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.75rem", textAlign: "center" }}>
                      🔑 Admin Access
                    </div>
                  )}
                  <button onClick={() => { dispatch(logoutUser()); setMenuOpen(false); }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: "12px", background: "var(--danger)", color: "#fff", fontWeight: 600, fontSize: "0.95rem", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <NavLink to="/login" onClick={() => setMenuOpen(false)} className={({isActive}) => `nav-mobile-item ${isActive ? 'active' : ''}`} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: "12px", background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>
                  <UserIcon size={18} /> Login
                </NavLink>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
