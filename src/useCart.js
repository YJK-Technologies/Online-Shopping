import { useMemo, useState } from "react";

export default function useCart() {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart((prev) => {
      const exist = prev.find((i) => i.id === product.id);
      if (exist) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const increaseQty = (id) =>
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i))
    );

  const decreaseQty = (id) =>
    setCart((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i
      )
    );

  const removeFromCart = (item) =>
    setCart((prev) => prev.filter((i) => i.id !== item.id));

  const subtotal = useMemo(
    () => cart.reduce((s, i) => s + i.price * i.qty, 0),
    [cart]
  );

  const discountAmount = useMemo(
    () =>
      cart.reduce(
        (s, i) =>
          s + (i.price * i.qty * (i.discountPer || 0)) / 100,
        0
      ),
    [cart]
  );

  const total = subtotal - discountAmount;

  return {
    cart,
    setCart,
    addToCart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    subtotal,
    discountAmount,
    total,
  };
}
