// src/components/OrderStatus.js
import React from "react";
import "./OrderStatus.css"; 

export default function OrderStatus({ status }) {
  if (status === "Under Making") {
    return <div className="cooking-animation">🍲 Your order is being made...</div>;
  }
  if (status === "Completed") {
    return <div className="ready-alert">✅ Your order is ready!</div>;
  }
  return <div>Status: {status}</div>;
}
