import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";

const stripePromise = loadStripe("pk_test_51TCwahATHVgPx3Ya3ejQ1RRzVLRKEP9hqqOYIHzeST81TBd97BwLJcyxzhOp6cNYXhxT8BLFhJFuLftuUOVopl6R00GSpxcgE3"); // Replace with your actual Stripe publishable key

const CheckoutForm = ({ amount, onSuccess, onFailure }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Create payment intent
      const { data } = await axios.post(
        "http://localhost:5001/api/payment/create-payment-intent",
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Confirm payment
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        onFailure(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        onSuccess(result.paymentIntent.id);
      }
    } catch (error) {
      onFailure(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{
        padding: "12px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "white"
      }}>
        <CardElement options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#424770",
              "::placeholder": { color: "#aab7c4" },
            },
          },
        }} />
      </div>
      <button
        type="submit"
        disabled={!stripe || loading}
        style={{
          padding: "12px 24px",
          backgroundColor: "#635BFF",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: loading || !stripe ? "not-allowed" : "pointer",
          opacity: loading || !stripe ? 0.6 : 1,
        }}
      >
        {loading ? "Processing..." : `Pay ₹${amount}`}
      </button>
    </form>
  );
};

const StripePayment = ({ amount, onSuccess, onFailure, disabled = false }) => {
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  const handleCOD = () => {
    if (disabled) return;
    setLoading(true);
    setTimeout(() => {
      onSuccess("COD_" + Date.now());
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Payment Method Selection */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <input
            type="radio"
            value="cod"
            checked={paymentMethod === "cod"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          <span>💵 Cash on Delivery</span>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <input
            type="radio"
            value="card"
            checked={paymentMethod === "card"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          <span>💳 Card Payment</span>
        </label>
      </div>

      {paymentMethod === "cod" ? (
        <button
          onClick={handleCOD}
          disabled={loading || disabled}
          style={{
            padding: "12px 24px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: (loading || disabled) ? "not-allowed" : "pointer",
            opacity: (loading || disabled) ? 0.6 : 1,
          }}
        >
          {loading ? "Processing..." : disabled ? "Fill Delivery Details" : "Place Order (COD)"}
        </button>
      ) : (
        <Elements stripe={stripePromise}>
          <CheckoutForm amount={amount} onSuccess={onSuccess} onFailure={onFailure} />
        </Elements>
      )}
    </div>
  );
};

export default StripePayment;
