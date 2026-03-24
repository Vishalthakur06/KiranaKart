import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h3>
            <img src="/logo.png" alt="Logo" style={{ height: "28px" }} />
            KiranaKart
          </h3>
          <p>आपका अपना दुकान — Your Neighbourhood Store providing fresh groceries and daily essentials delivered right to your doorstep.</p>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/wishlist">Wishlist</Link></li>
            <li><Link to="/orders">My Orders</Link></li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>My Account</h4>
          <ul>
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/login">Login / Register</Link></li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>Contact Us</h4>
          <ul>
            <li>Email: support@kiranakart.in</li>
            <li>Phone: +91 98765 43210</li>
            <li>Address: Sector 45, Grocery Hub, India</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} KiranaKart. All rights reserved. Built with ❤️ and framer-motion.
      </div>
    </footer>
  );
}
