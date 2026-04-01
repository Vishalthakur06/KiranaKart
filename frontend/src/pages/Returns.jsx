import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import "./Returns.css";

function Returns() {
  const [orders, setOrders] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnForm, setReturnForm] = useState({
    reason: "",
    description: ""
  });
  const [unreadUpdates, setUnreadUpdates] = useState(0);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    fetchOrders();
    fetchReturnRequests();
    // Clear badge when user visits Returns page
    localStorage.setItem("lastReturnCheck", Date.now().toString());
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5002/api/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      console.log("All Orders:", data);
      const deliveredOrders = data.filter(order => {
        console.log(`Order ${order._id}: deliveryStatus = ${order.deliveryStatus}, returnRequest.status = ${order.returnRequest?.status}`);
        return order.deliveryStatus === "delivered" && order.returnRequest?.status === "none";
      });
      console.log("Eligible Orders:", deliveredOrders);
      setOrders(deliveredOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchReturnRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5002/api/returns/my-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setReturnRequests(data);
      
      // Count unread updates (approved/rejected/completed)
      const lastCheck = localStorage.getItem("lastReturnCheck");
      const lastCheckTime = lastCheck ? parseInt(lastCheck) : 0;
      
      const unreadCount = data.filter(req => {
        const status = req.returnRequest.status;
        const processedAt = req.returnRequest.processedAt;
        return (status === "approved" || status === "rejected" || status === "completed") &&
               processedAt && new Date(processedAt).getTime() > lastCheckTime;
      }).length;
      
      setUnreadUpdates(unreadCount);
    } catch (error) {
      console.error("Error fetching return requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnRequest = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const submitReturnRequest = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5002/api/returns/request/${selectedOrder._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(returnForm)
      });

      const data = await response.json();
      
      if (response.ok) {
        addToast("Return request submitted successfully! 🎉", "success");
        setShowModal(false);
        setReturnForm({ reason: "", description: "" });
        fetchOrders();
        fetchReturnRequests();
      } else {
        addToast(data.message || "Failed to submit return request", "error");
      }
    } catch (error) {
      console.error("Error submitting return:", error);
      addToast("Error submitting return request. Please try again.", "error");
    }
  };

  if (loading) {
    return (
      <div className="returns-container">
        <div className="loader-wrap">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="returns-container">
      <div className="page-header">
        <div style={{display: "flex", alignItems: "center", gap: "1rem"}}>
          <h1 className="page-title">🔄 Returns & Refunds</h1>
          {unreadUpdates > 0 && (
            <span style={{
              background: "#EF4444",
              color: "#fff",
              fontSize: "0.75rem",
              fontWeight: 800,
              minWidth: "24px",
              height: "24px",
              borderRadius: "9999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 8px",
              boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)",
              animation: "pulse 2s infinite"
            }}>
              {unreadUpdates}
            </span>
          )}
        </div>
        <p style={{color: "var(--text-secondary)"}}>Manage your return requests</p>
      </div>

      <div className="section">
        <h2 className="section-title">Eligible for Return</h2>
        {orders.length > 0 ? (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <span className="order-id">Order #{order._id.slice(-6).toUpperCase()}</span>
                  <span className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="order-items">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <div className="item-image">
                        {item.product?.image ? (
                          <img src={item.product.image} alt={item.product.name} />
                        ) : (
                          <span>📦</span>
                        )}
                      </div>
                      <div className="item-info">
                        <h4>{item.product?.name || "Product"}</h4>
                        <p>Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="order-footer">
                  <span className="order-total">Total: ₹{order.totalPrice}</span>
                  <button 
                    className="btn-return"
                    onClick={() => handleReturnRequest(order)}
                  >
                    Request Return
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="state-card">
            <p style={{fontSize: "2rem"}}>📦</p>
            <h3>No Eligible Orders</h3>
            <p>You don't have any delivered orders eligible for return</p>
          </div>
        )}
      </div>

      {returnRequests.length > 0 && (
        <div className="section">
          <h2 className="section-title">Your Return Requests</h2>
          <div className="return-requests-list">
            {returnRequests.map((order) => (
              <div key={order._id} className="return-card">
                <div className="return-header">
                  <div>
                    <span className="order-id">Order #{order._id.slice(-6).toUpperCase()}</span>
                    <span className={`return-status status-${order.returnRequest.status}`}>
                      {order.returnRequest.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="return-amount">₹{order.totalPrice}</span>
                </div>
                <div className="return-details">
                  <p><strong>Reason:</strong> {order.returnRequest.reason}</p>
                  <p><strong>Description:</strong> {order.returnRequest.description}</p>
                  <p><strong>Requested:</strong> {new Date(order.returnRequest.requestedAt).toLocaleDateString()}</p>
                  {order.returnRequest.adminNote && (
                    <p><strong>Admin Note:</strong> {order.returnRequest.adminNote}</p>
                  )}
                  {order.returnRequest.status === "approved" && (
                    <p className="refund-info">✅ Refund Amount: ₹{order.returnRequest.refundAmount}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Return</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={submitReturnRequest} className="return-form">
              <div className="form-group">
                <label>Reason for Return *</label>
                <select
                  value={returnForm.reason}
                  onChange={(e) => setReturnForm({...returnForm, reason: e.target.value})}
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="Defective Product">Defective Product</option>
                  <option value="Wrong Item">Wrong Item Received</option>
                  <option value="Not as Described">Not as Described</option>
                  <option value="Changed Mind">Changed Mind</option>
                  <option value="Better Price Available">Better Price Available</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={returnForm.description}
                  onChange={(e) => setReturnForm({...returnForm, description: e.target.value})}
                  placeholder="Please provide details about your return request..."
                  rows="4"
                  required
                />
              </div>
              <div className="return-policy">
                <p>📋 Return Policy:</p>
                <ul>
                  <li>Returns accepted within 7 days of delivery</li>
                  <li>Product must be unused and in original packaging</li>
                  <li>Refund will be processed within 5-7 business days</li>
                </ul>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Returns;
