export default function ProductGrid({ products, loading, onSelect, onAdd }) {

  const getSkeletonCount = () => {
    if (products.length > 0) return products.length;
    if (window.innerWidth < 480) return 6;
    if (window.innerWidth < 768) return 8;
    if (window.innerWidth < 1024) return 10;
    return 12;
  };

  const skeletonCount = getSkeletonCount();

  return (
    <div className="products-grid">
      {loading
        ? Array.from({ length: skeletonCount }).map((_, i) => (
          <div className="product-card skeleton" key={i}>
            <div className="skeleton-img"></div>
            <div className="skeleton-text short"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-price"></div>
            <div className="skeleton-btn"></div>
          </div>
        ))
        :
        products.map((p) => {
          const finalPrice =
            p.discountPer > 0
              ? p.price - (p.price * p.discountPer) / 100
              : p.price;

          return (
            <div
              className="product-card"
              key={p.id}
              onClick={() => onSelect(p)}
            >
              <img src={p.image} />
              <h4>{p.name}</h4>

              {p.discountPer > 0 && (
                <span className="discount">{p.discountPer}% OFF</span>
              )}

              <div className="price">
                {p.discountPer > 0 && <s>₹{p.price}</s>}
                <strong>₹{finalPrice.toFixed(2)}</strong>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(p);
                }}
              >
                Add to Cart
              </button>
            </div>
          );
        })}
    </div>
  );
}
