import React, { useRef } from "react";
import { bufferToBase64 } from "./imageUtils";

export default function RecentlyViewed({ items, onAdd, loading, onRemove }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = dir === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

const skeletonArray = Array.from({ length: 6 });

  if (items.length === 0) return null;

  return (
    <div className="rv-container">
      <div className="rv-header">
        <h4 className="rv-title">Recently Viewed</h4>
        {items.length > 0 && <span className="rv-count">{items.length} items</span>}
      </div>

      <div className="rv-scroll-track">
        {loading ? (
          skeletonArray.map((_, i) => (
            <div className="rv-card rv-skeleton" key={i}>
              <div className="rv-skeleton-img"></div>
              <div className="rv-skeleton-line short"></div>
              <div className="rv-skeleton-line"></div>
              <div className="rv-skeleton-btn"></div>
            </div>
          ))
        ) : items.length === 0 ? (
          <p className="rv-empty">No recently viewed items yet.</p>
        ) : (
          items.map((item) => {
            const mrp = Number(item.MRP_price) || 0;
            const discount = Number(item.discount_percentage) || 0;
            const finalPrice = discount > 0 ? mrp - (mrp * discount) / 100 : mrp;

            const productForCart = {
              id: item.item_code,
              name: item.item_name,
              price: mrp,
              discountPer: discount,
              image: item.item_images ? bufferToBase64(item.item_images) : "https://via.placeholder.com/200",
            };

            return (
              <div className="rv-card" key={item.item_code}>
                <button className="rv-remove-btn" onClick={() => onRemove(item.item_code)} title="Remove">
                  ×
                </button>
                <div className="rv-img-box">
                  <img src={productForCart.image} alt={item.item_name} />
                </div>
                <div className="rv-info">
                  <h4 className="rv-name">{item.item_name}</h4>
                  <div className="rv-price-box">
                    <span className="rv-final">₹{finalPrice.toFixed(0)}</span>
                    {discount > 0 && <span className="rv-mrp">₹{mrp}</span>}
                  </div>
                  <button className="rv-add-btn" onClick={() => onAdd(productForCart)}>
                    Add
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}