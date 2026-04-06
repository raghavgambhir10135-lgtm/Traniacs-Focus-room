// src/components/AdminDashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminDashboard.css"; // optional styling

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);

  // Fetch all orders when dashboard loads
  useEffect(() => {
    axios.get("http://localhost:5000/orders")
      .then(res => setOrders(res.data))
      .catch(err => console.error("Error fetching orders:", err));
  }, []);

  // Update order status
  const updateStatus = (id, status) => {
    axios.put(`http://localhost:5000/orders/${id}`, { status })
      .then(res => {
        setOrders(orders.map(o => (o._id === id ? res.data : o)));
      })
      .catch(err => console.error("Error updating status:", err));
  };

  return (
    <div className="app-container">
      <h2>Incoming Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map(order => (
          <div key={order._id} className="outlet-card">
            <p>
              <strong>Order #{order._id}</strong><br />
              Amount: ₹{order.total}<br />
              Status: {order.status}<br />
              Payment: {order.paymentStatus}
            </p>
            <div className="btn-group">
              <button onClick={() => updateStatus(order._id, "Accepted")} className="btn">
                Accept
              </button>
              <button onClick={() => updateStatus(order._id, "Under Making")} className="btn">
                Under Making
              </button>
              <button onClick={() => updateStatus(order._id, "Completed")} className="btn-primary">
                Ready
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
