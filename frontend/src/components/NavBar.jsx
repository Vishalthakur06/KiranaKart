import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Sun, Moon, ShoppingCart, User as UserIcon, LogOut } from "lucide-react";
import { logoutUser } from "../redux/slices/authSlice";

export default function NavBar({ isDark, toggleDark }) {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { items } = useSelector(s => s.cart);
  const totalQty = items.reduce((s, i) => s + i.qty, 0);

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
        <Link to="/" style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.95rem", marginRight: "6px" }}>
          Home
        </Link>
        <motion.button 
          whileHover={{ scale: 1.1 }} 
          whileTap={{ scale: 0.9 }} 
          onClick={toggleDark}
          style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", cursor: "pointer", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </motion.button>
        
        <Link to="/cart" className="nav-cart-btn">
          <ShoppingCart size={18} /> Cart {totalQty > 0 && <span className="cart-badge">{totalQty}</span>}
        </Link>
        
        {user ? (
          <div className="nav-user-info">
            <span className="nav-username">👋 {user.name.split(" ")[0]}</span>
            {user.isAdmin && <Link to="/admin" className="nav-admin-pill">Admin</Link>}
            <button className="nav-logout-btn" onClick={() => dispatch(logoutUser())}><LogOut size={14} style={{ marginRight: '4px' }}/>Logout</button>
          </div>
        ) : (
          <Link to="/login" className="nav-login-btn"><UserIcon size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> Login</Link>
        )}
      </div>
    </header>
  );
}
