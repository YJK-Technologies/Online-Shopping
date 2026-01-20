import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(sessionStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  const removeFromCart = (item) => {
    const updatedCart = cart.filter((i) => i.id !== item.id);
    setCart(updatedCart);
    sessionStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Your Cart</h2>

      <button
        onClick={() => navigate("/")}
        style={{ marginBottom: 20, padding: "8px 16px" }}
      >
        ⬅ Back to Shop
      </button>

      {cart.length === 0 ? (
        <p>No items in cart</p>
      ) : (
        cart.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              borderBottom: "1px solid #ddd",
              padding: "15px 0",
            }}
          >
            <img src={item.image} width="80" alt="" />
            <div>
              <h4>{item.name}</h4>
              <p>₹{item.price}</p>
            </div>
            <button onClick={() => removeFromCart(item)}>Remove</button>
          </div>
        ))
      )}
    </div>
  );
}
