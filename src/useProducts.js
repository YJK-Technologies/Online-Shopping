import { useEffect, useState } from "react";
import { bufferToBase64 } from "./imageUtils";
const config = require("./Apiconfig");

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllItems = async () => {
    setLoading(true);
    const res = await fetch(`${config.apiBaseUrl}/ItemBrandData`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_code: "YJKT" }),
    });
    const data = await res.json();

    setProducts(
      data.map((item) => ({
        id: item.Item_code,
        name: item.Item_name,
        price: item.MRP_Price,
        discountPer: Number(item.discount_Percentage) || 0,
        descriptionText: item.Item_Description,
        description: `${item.Item_variant} | ${item.Item_sales_tax_type}`,
        image: item.item_images
          ? bufferToBase64(item.item_images)
          : "https://via.placeholder.com/200",
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchAllItems();
  }, []);

  return { products, loading, setProducts, fetchAllItems };
}
