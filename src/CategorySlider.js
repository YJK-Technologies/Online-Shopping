import React, { useState } from "react";

export default function CategorySlider({ categories, loading }) {
  const [index, setIndex] = useState(0);
  const ITEMS_VISIBLE = 8;
  const ITEM_WIDTH = 150;

  const move = (direction) => {
    const maxIndex = Math.max(0, categories.length - ITEMS_VISIBLE);
    const newIndex = Math.min(Math.max(index + direction, 0), maxIndex);
    setIndex(newIndex);
  };

  const renderSkeletons = () => (
    <div className="slider-track">
      {Array.from({ length: 8 }).map((_, i) => (
        <div className="slider-item skeleton-cat-item" key={i} style={{ width: 150 }}>
          <div className="skeleton-cat-circle"></div>
          <div className="skeleton-cat-text"></div>
        </div>
      ))}
    </div>
  );

  if (!loading && (!categories || categories.length === 0)) return null;

  return (
    <div className="slider-container">
      {!loading && (
        <button className="slider-btn left" onClick={() => move(-1)} disabled={index === 0}>‹</button>
      )}

      <div className="slider-frame" style={{ width: `${ITEMS_VISIBLE * ITEM_WIDTH}px` }}>
        {loading ? renderSkeletons() : (
        <div
          className="slider-track"
          style={{ transform: `translateX(-${index * ITEM_WIDTH}px)` }}
        >
          {categories.map((cat) => (
            <div className="slider-item" key={cat.id} style={{ width: ITEM_WIDTH }}>
              <img src={cat.image} width="80" height="80" alt={cat.name} />
              <div>{cat.name}</div>
            </div>
          ))}
        </div>
        )}
      </div>

      {!loading && (
        <button className="slider-btn right" onClick={() => move(1)}>›</button>
      )}
    </div>
  );
}