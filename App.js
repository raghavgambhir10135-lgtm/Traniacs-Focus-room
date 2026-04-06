// src/App.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Cart from "./components/Cart";
import Reviews from "./components/Reviews";
import AdminDashboard from "./components/AdminDashboard";
import OrderStatus from "./components/OrderStatus";
import Payment from "./components/Payment";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./App.css";

function App() {
  const [outlets, setOutlets] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/outlets")
      .then(res => setOutlets(res.data))
      .catch(err => console.error("Error fetching outlets:", err));

    axios.get("http://localhost:5000/orders")
      .then(res => setOrders(res.data))
      .catch(err => console.error("Error fetching orders:", err));
  }, []);

  const addToCart = (item) => {
    setCart([...cart, { ...item, quantity: 1 }]);
  };

  const placeOrder = async (outletId) => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = { outletId, items: cart, total };
    try {
      const res = await axios.post("http://localhost:5000/orders", order);
      setOrders([...orders, res.data]);
      setCart([]);
    } catch (err) {
      console.error("Error placing order:", err);
    }
  };

  return (
    <Router>
      <div className="app-container">
        <nav>
          <Link to="/">Customer View</Link> | <Link to="/admin">Shopkeeper View</Link>
        </nav>

        <Routes>
          {/* Customer view */}
          <Route path="/" element={
            <div>
              <h1 className="title">🍴 CU Food Outlets</h1>

              <h2>Available Outlets</h2>
              {outlets.map((outlet) => (
                <div key={outlet._id} className="outlet-card">
                  <h3>{outlet.name} ({outlet.campus} Campus)</h3>
                  <ul>
                    {outlet.menu.map((item, i) => (
                      <li key={i}>
                        {item.item} - ₹{item.price}
                        <button onClick={() => addToCart(item)} className="btn">Add to Cart</button>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => placeOrder(outlet._id)} className="btn-primary">Place Order</button>
                  <Reviews outletId={outlet._id} />
                </div>
              ))}

              <Cart cartItems={cart} placeOrder={placeOrder} />

              <h2>Orders</h2>
              <ul>
                {orders.map((order) => (
                  <li key={order._id} className="order-item">
                    Order #{order._id} - ₹{order.total} - Status: {order.status} - Payment: {order.paymentStatus}
                    <OrderStatus status={order.status} />
                    {order.paymentStatus === "Pending" && (
                      <Payment amount={order.total} orderId={order._id} />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          } />

          {/* Shopkeeper view */}
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
