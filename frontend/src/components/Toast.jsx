import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const ICONS = {
  success: <CheckCircle size={20} />,
  error: <XCircle size={20} />,
  info: <Info size={20} />,
  warning: <AlertTriangle size={20} />,
};

const STYLES = {
  success: { bg: "#DCFCE7", color: "#15803D", border: "#86EFAC", darkBg: "rgba(22, 163, 74, 0.2)", darkColor: "#4ADE80", darkBorder: "#16A34A" },
  error: { bg: "#FEE2E2", color: "#DC2626", border: "#FCA5A5", darkBg: "rgba(239, 68, 68, 0.2)", darkColor: "#FCA5A5", darkBorder: "#EF4444" },
  info: { bg: "#DBEAFE", color: "#1D4ED8", border: "#93C5FD", darkBg: "rgba(59, 130, 246, 0.2)", darkColor: "#93C5FD", darkBorder: "#3B82F6" },
  warning: { bg: "#FEF9C3", color: "#A16207", border: "#FDE68A", darkBg: "rgba(234, 179, 8, 0.2)", darkColor: "#FCD34D", darkBorder: "#EAB308" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{ position: "fixed", top: "80px", right: "20px", zIndex: 9999, display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "400px" }}>
        <AnimatePresence>
          {toasts.map((toast) => {
            const style = STYLES[toast.type];
            const isDark = document.documentElement.classList.contains("dark");
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.8 }}
                style={{
                  background: isDark ? style.darkBg : style.bg,
                  color: isDark ? style.darkColor : style.color,
                  border: `2px solid ${isDark ? style.darkBorder : style.border}`,
                  borderRadius: "12px",
                  padding: "1rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                {ICONS[toast.type]}
                <span style={{ flex: 1 }}>{toast.message}</span>
                <button
                  onClick={() => removeToast(toast.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", color: isDark ? style.darkColor : style.color, opacity: 0.7 }}
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
