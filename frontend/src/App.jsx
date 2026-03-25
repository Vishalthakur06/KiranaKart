import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import Compare from "./pages/Compare";
import Dashboard from "./pages/Dashboard";
import { ToastProvider } from "./components/Toast";

/* ── Theme Provider Hook ── */
function useTheme() {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark" || false
  );
  
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return { isDark, toggleDark: () => setIsDark(d => !d) };
}

/* ── App Main Router ── */
function App() {
  const { isDark, toggleDark } = useTheme();

  return (
    <ToastProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="app-container">
          <NavBar isDark={isDark} toggleDark={toggleDark} />
          <main className="app-main">
            <Routes>
              <Route path="/"            element={<Home />} />
              <Route path="/product/:id" element={<Product />} />
              <Route path="/cart"        element={<Cart />} />
              <Route path="/checkout"    element={<Checkout />} />
              <Route path="/login"       element={<Login />} />
              <Route path="/admin"       element={<Admin />} />
              <Route path="/orders"      element={<Orders />} />
              <Route path="/wishlist"    element={<Wishlist />} />
              <Route path="/compare"     element={<Compare />} />
              <Route path="/profile"     element={<Profile />} />
              <Route path="/dashboard"   element={<Dashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
