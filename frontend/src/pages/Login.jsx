import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { loginUser, registerUser, clearAuthError } from "../redux/slices/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector(s => s.auth);
  const [tab, setTab]  = useState("login");
  const [form, setForm] = useState({ name:"", email:"", password:"" });

  useEffect(() => {
    if (user) navigate("/");
    return () => dispatch(clearAuthError());
  }, [user, navigate, dispatch]);

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const onSubmit = e => {
    e.preventDefault();
    if (tab === "login") dispatch(loginUser({ email: form.email, password: form.password }));
    else dispatch(registerUser({ name: form.name, email: form.email, password: form.password }));
  };

  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="login-wrap">
      <div className="login-card">
        <div className="login-header">
          <div className="login-brand" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <img src="/logo.png" alt="KiranaKart Logo" style={{ height: "48px", objectFit: "contain" }} />
            <span>KiranaKart</span>
          </div>
          <p>{tab === "login" ? "स्वागत है! Welcome back" : "नया खाता बनाएं · Create your account"}</p>
        </div>

        <div className="auth-tabs">
          {["login", "register"].map(t => (
            <button key={t} className={`auth-tab ${tab === t ? "active" : ""}`}
              onClick={() => { setTab(t); dispatch(clearAuthError()); }}>
              {t === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={onSubmit} className="auth-form">
          <AnimatePresence>
            {tab === "register" && (
              <motion.input 
                initial={{ height: 0, opacity: 0, marginBottom: 0 }} 
                animate={{ height: "auto", opacity: 1, marginBottom: "0.85rem" }} 
                exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                name="name" type="text" placeholder="Your full name" value={form.name}
                onChange={onChange} required className="auth-input" 
              />
            )}
          </AnimatePresence>
          <input name="email" type="email" placeholder="Email address" value={form.email}
            onChange={onChange} required className="auth-input" />
          <input name="password" type="password" placeholder="Password" value={form.password}
            onChange={onChange} required className="auth-input" />
          <motion.button whileTap={{ scale: 0.98 }} type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? "Please wait…" : tab === "login" ? "Sign In" : "Create Account"}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
