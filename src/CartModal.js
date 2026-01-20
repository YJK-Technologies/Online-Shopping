// CartModal.js
export default function CartModal({
  cart,
  subtotal,
  discountAmount,
  total,
  onClose,
  onIncrease,
  onDecrease,
  onRemove,
  onPlaceOrder,
}) {
  
  return (
    <div className="cart-overlay">
      <div className="cart-box">
        <div className="cart-header">
          <h3>Your Cart</h3>
          <button className="cart-close-btn" onClick={onClose}>×</button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <p>No items added yet</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => {
                const offerPrice = item.discountPer > 0
                  ? item.price - (item.price * item.discountPer) / 100
                  : item.price;
                const itemTotal = offerPrice * item.qty;

                return (
                  <div className="cart-item" key={item.id}>
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-details">
                      <p className="cart-item-name">{item.name}</p>

                      {item.discountPer > 0 && (
                        <span className="cart-item-mrp">
                          ₹{item.price.toFixed(2)}
                        </span>
                      )}

                      <span className="cart-item-price">
                        ₹{offerPrice.toFixed(2)}
                      </span>

                      <div className="qty-controls">
                        <button title="Remove One Quantity" onClick={() => onDecrease(item.id)}>-</button>
                        <span>{item.qty}</span>
                        <button title="Add One Quantity" onClick={() => onIncrease(item.id)}>+</button>
                      </div>
                    </div>
                    <div className="cart-item-total">
                      ₹{itemTotal.toFixed(2)}
                    </div>

                    <button
                      className="remove-item-btn"
                      onClick={() => onRemove(item)}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary">
              <div className="summary-row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="summary-row"><span>Discount</span><span>-₹{discountAmount.toFixed(2)}</span></div>
              <div className="summary-total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
            </div>

            <button className="place-order-btn" onClick={onPlaceOrder}>
              Place Order
            </button>
          </>
        )}
      </div>
    </div>
  );
}