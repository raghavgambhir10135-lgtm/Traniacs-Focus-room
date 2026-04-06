import React, { useState } from "react";

export default function Cart({ cartItems, placeOrder }) {
  const [selectedItems, setSelectedItems] = useState([]);

  const toggleItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handlePlaceOrder = () => {
    const orderItems = cartItems.filter((item) => selectedItems.includes(item.id));
    placeOrder(orderItems);
  };

  return (
    <div className="outlet-card">
      <h2>Cart</h2>
      {cartItems.map((item, i) => (
        <div key={i}>
          <input
            type="checkbox"
            checked={selectedItems.includes(item.id)}
            onChange={() => toggleItem(item.id)}
          />
          {item.item} – ₹{item.price}
        </div>
      ))}
      <button onClick={handlePlaceOrder} className="btn-primary">Place Selected Order</button>
    </div>
  );
}
