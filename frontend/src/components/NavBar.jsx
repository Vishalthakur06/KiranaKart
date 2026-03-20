import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Sun, Moon, ShoppingCart, User as UserIcon, LogOut, LayoutDashboard } from "lucide-react";
import { logoutUser } from "../redux/slices/authSlice";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function NavBar({ isDark, toggleDark }) {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { items } = useSelector(s => s.cart);
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const [newOrders, setNewOrders] = useState(0);

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
        <motion.img 
          src="/logo.png" 
          alt="KiranaKart Logo" 
          style={{ height: "36px", width: "auto", marginRight: "4px" }} 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        />
        KiranaKart
      </Link>
      <span className="nav-tagline">आपका अपना दुकान</span>
      
      <div className="nav-actions">
        <Link to="/" style={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem" }}>Home</Link>

        {user?.isAdmin ? (
          <Link 
            to="/admin" 
            className="nav-cart-btn" 
            style={{ position: "relative" }}
            onClick={() => localStorage.setItem("adminLastVisit", new Date().toISOString())}
          >
            <LayoutDashboard size={18} /> Dashboard
            {newOrders > 0 && (
              <span style={{ position: "absolute", top: "-6px", right: "-6px", background: "#EF4444", color: "#fff", fontSize: "0.65rem", fontWeight: 800, minWidth: "18px", height: "18px", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                {newOrders}
              </span>
            )}
          </Link>
        ) : (
          <Link to="/cart" className="nav-cart-btn">
            <ShoppingCart size={18} /> Cart {totalQty > 0 && <span className="cart-badge">{totalQty}</span>}
          </Link>
        )}

        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={toggleDark}
          style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", cursor: "pointer", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </motion.button>

        {user ? (
          <div className="nav-user-info">
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", overflow: "hidden", background: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid rgba(255,255,255,0.6)" }}>
              {user.avatar
                ? <img src={user.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#fff" }}>{user.name.charAt(0).toUpperCase()}</span>
              }
            </div>
            <span className="nav-username">{user.name.split(" ")[0]}</span>
            {user.isAdmin && <span className="nav-admin-pill">Admin</span>}
            <button className="nav-logout-btn" onClick={() => dispatch(logoutUser())}><LogOut size={14} style={{ marginRight: "4px" }}/>Logout</button>
          </div>
        ) : (
          <Link to="/login" className="nav-login-btn"><UserIcon size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }}/> Login</Link>
        )}
      </div>
    </header>
  );
}
