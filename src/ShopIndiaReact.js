import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ShopIndiaBootstrap() {
  const [cart, setCart] = useState([]);

  const products = [
    { id: 1, name: "Shirt", price: 500, image: "https://via.placeholder.com/150" },
    { id: 2, name: "Shoes", price: 1200, image: "https://via.placeholder.com/150" },
    { id: 3, name: "Watch", price: 800, image: "https://via.placeholder.com/150" },
  ];

  const addToCart = (item) => {
    setCart([...cart, item]);
  };







  return (
    <div className="bg-light min-vh-100">
      {/* Header */}
      <header className="bg-primary text-white text-center py-3 fs-3 fw-bold">
        Shop
      </header>

      {/* Products */}
      <div className="container py-4">
        <div className="row g-4">
          {products.map((item) => (
            <div className="col-12 col-sm-6 col-md-4" key={item.id}>
              <div className="card shadow-sm h-100 text-center p-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="card-img-top rounded"
                  style={{ height: "180px", objectFit: "cover" }}
                />
                <h5 className="mt-3 fw-semibold">{item.name}</h5>
                <p className="text-muted">₹{item.price}</p>
                <button
                  className="btn btn-primary mt-auto"
                  onClick={() => addToCart(item)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Footer */}
      <footer className="bg-white border-top py-3 text-center position-fixed bottom-0 w-100 shadow">
        <h5 className="fw-bold m-0">Cart Items: {cart.length}</h5>
      </footer>
    </div>
  );
}
