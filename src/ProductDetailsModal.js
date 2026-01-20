export default function ProductDetailsModal({ item, isOpen, onClose, onAdd }) {
  if (!isOpen || !item) return null;

  const finalPrice =
    item.discountPer > 0
      ? item.price - (item.price * item.discountPer) / 100
      : item.price;

  return (
    <div className="center-modal-overlay">
      <div className="center-modal">
        <div className="center-modal-header">
          <h4>{item.name}</h4>
          <button className="center-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="center-modal-body">
          <div className="modal-img-container">
            <img src={item.image} alt={item.name} />
          </div>

          <div className="modal-info mt-3">
            <p>
              <strong>Variant:</strong> {item.description || "N/A"}
            </p>

            {item.descriptionText && (
              <p>
                <strong>Description:</strong>
                <br />
                <span className="text-muted">{item.descriptionText}</span>
              </p>
            )}

            <div className="modal-price-section">
              <strong>Price: </strong>
              {item.discountPer > 0 && (
                <s className="text-muted me-2">₹{item.price}</s>
              )}
              <span className="text-primary">
                ₹{finalPrice.toFixed(2)}
              </span>
              {item.discountPer > 0 && (
                <span className="ms-2 badge bg-success">
                  {item.discountPer}% OFF
                </span>
              )}
            </div>
          </div>

          <button
            className="place-order-btn w-100 mt-3"
            onClick={() => {
              onAdd(item);
              onClose();
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}