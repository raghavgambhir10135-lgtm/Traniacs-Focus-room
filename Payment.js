// src/components/Payment.js
import React from "react";
import axios from "axios";

export default function Payment({ amount, orderId }) {
  const handlePayment = () => {
    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded. Please add the script in public/index.html");
      return;
    }

    const options = {
      key: "YOUR_RAZORPAY_KEY", // replace with your Razorpay key
      amount: amount * 100, // amount in paise
      currency: "INR",
      name: "CU Food Outlets",
      description: "Order Payment",
      handler: async function (response) {
        alert("Payment Successful! ID: " + response.razorpay_payment_id);

        // Update backend payment status
        try {
          await axios.put(`http://localhost:5000/orders/${orderId}/payment`, {
            transactionId: response.razorpay_payment_id,
          });
        } catch (err) {
          console.error("Error updating payment status:", err);
        }
      },
      prefill: {
        name: "Customer Name",
        email: "customer@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#b22222",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <button onClick={handlePayment} className="btn-primary">
      Pay ₹{amount}
    </button>
  );
}
