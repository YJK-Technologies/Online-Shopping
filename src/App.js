import React, { useEffect, useState } from "react";
import useProducts from "./useProducts";
import useCart from "./useCart";
import Header from "./Header";
import ProductGrid from "./ProductGrid";
import CartModal from "./CartModal";
import PaymentModal from "./pages/PaymentModal";
import "./App.css";
import config from './Apiconfig';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { bufferToBase64 } from "./imageUtils";
import CategorySlider from "./CategorySlider";
import RecentlyViewed from "./RecentlyViewed";
import ProductDetailsModal from "./ProductDetailsModal";

export default function App() {
  const { products, setProducts, loading } = useProducts();
  const {
    cart,
    addToCart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    subtotal,
    discountAmount,
    total,
    setCart
  } = useCart();

  const [categories, setCategories] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantOptions, setVariantOptions] = useState([]);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [catLoading, setCatLoading] = useState(true);
  const [rvLoading, setRvLoading] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(false);

  useEffect(() => {
    const storedCustomer = sessionStorage.getItem("customerProfile");
    if (storedCustomer) {
      setCustomerProfile(JSON.parse(storedCustomer));
    }
  }, []);

  useEffect(() => {
    if (selectedItem) {
      saveSelectionOrderDetails();
    }
  }, [selectedItem]);

  const saveSelectionOrderDetails = async () => {
    try {
      if (!selectedItem) return;

      const url = `${config.apiBaseUrl}/Recenty_ViewedInsert`;

      const Details = {
        Date: new Date().toISOString().split("T")[0],
        Customer_code: customerProfile?.customer_code,
        Item_code: selectedItem.id,
        company_code: "YJKT",
        Created_by: "HK",
      };

      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Details),
      });
    } catch (error) {
      console.error("Selection detail save error:", error);
    }
  };

  useEffect(() => {
    if (!customerProfile?.customer_code) {
      setRvLoading(false);
      return;
    }

    const fetchRecentlyViewed = async () => {
      try {
        setRvLoading(true);
        const response = await fetch(`${config.apiBaseUrl}/getCategories`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              Customer_code: customerProfile.customer_code
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          setRecentlyViewed(data || []);
        }
      } catch (err) {
        console.error("Recently viewed fetch error:", err);
      } finally {
        setTimeout(() => {
          setRvLoading(false);
        }, 500);
      }
    };

    fetchRecentlyViewed();
  }, [customerProfile]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCatLoading(true);
        const response = await fetch(`${config.apiBaseUrl}/getCategoriesMaster`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company_code: "YJKT" }),
        });
        const data = await response.json();

        if (response.ok) {
          const formatted = data.map((cat) => ({
            id: cat.Item_Category_Name,
            name: cat.Item_Category_Name,
            image: cat.Item_Category_Image
              ? bufferToBase64(cat.Item_Category_Image)
              : "https://via.placeholder.com/80",
          }));
          setCategories(formatted);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setCatLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const confirmDeleteRecentlyViewed = (id) => {
    const toastId = toast(
      ({ closeToast }) => (
        <div>
          <p style={{ fontWeight: 600, marginBottom: 10 }}>
            Are you sure you want to remove this item?
          </p>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              onClick={() => {
                handleRemoveRecentlyViewed(id);
                toast.dismiss(toastId);
              }}
              style={{
                background: "#d32f2f",
                color: "#fff",
                border: "none",
                padding: "6px 14px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Yes
            </button>

            <button
              onClick={() => toast.dismiss(toastId)}
              style={{
                background: "#e0e0e0",
                border: "none",
                padding: "6px 14px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
      }
    );
  };

  const handleRemoveRecentlyViewed = async (id) => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/Recenty_ViewedDelete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Customer_code: customerProfile.customer_code,
            Item_code: id,
            company_code: "YJKT",
          }),
        }
      );

      if (response.ok) {
        // UI instant update (new code style)
        setRecentlyViewed(prev =>
          prev.filter(item => item.item_code !== id)
        );

        toast.success("Item removed successfully");
      } else {
        toast.error("Failed to remove item");
      }
    } catch (err) {
      console.error("Delete recently viewed error:", err);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const res = await fetch(`${config.apiBaseUrl}/variant`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company_code: "YJKT" }),
        });

        const data = await res.json();

        setVariantOptions([
          { value: "ALL", label: "All" },
          ...data.map((v) => ({
            value: v.attributedetails_name,
            label: v.attributedetails_name,
          })),
        ]);
      } catch (err) {
        console.error(err);
      }
    };

    fetchVariants();
  }, []);

  const handleSearch = async () => {
    if (!selectedVariant) {
      toast.warn("Select a variant");
      return;
    }

    if (selectedVariant.value === "ALL") {
      fetchAllItems();
      return;
    }

    try {
      const res = await fetch(`${config.apiBaseUrl}/getItemVariant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_code: "YJKT",
          Item_variant: selectedVariant.value,
        }),
      });

      const data = await res.json();

      const formatted = data.map((i) => ({
        id: i.Item_code,
        name: i.Item_name,
        price: i.Item_std_sales_price,
        discountPer: Number(i.discount_Percentage) || 0,
        image: i.item_images
          ? bufferToBase64(i.item_images)
          : "https://via.placeholder.com/200",
      }));

      setProducts(formatted);
    } catch (err) {
      toast.error("Search failed");
    }
  };

  const fetchAllItems = async () => {
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
  };

  const handleSelectProduct = (product) => {
    setSelectedItem(product);
    setDetailsOpen(true);
  };

  const handleSaveButtonClick = async () => {
    if (cart.length === 0) {
      toast.warning("Cart is empty");
      return;
    }

    try {
      const screenType = "Sales"; // hard-coded

      const headerUrl = `${config.apiBaseUrl}/addSalesOrderHdr`;

      const Header = {
        company_code: "YJKT",
        customer_code: customerProfile?.customer_code,
        customer_name: "Walk-in Customer",
        pay_type: "Cash",
        sales_type: "otherState",
        order_type: "Online",
        bill_date: new Date().toISOString().split("T")[0],
        sale_amt: subtotal,
        tax_amount: 0,
        bill_amt: total,
        roff_amt: 0,
        dely_chlno: "",
        sales_mode: "Counter",
        paid_amount: total,
        return_amount: 0,
        sales_order_no: null,
        created_by: "HK",
      };

      const response = await fetch(headerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Header),
      });

      if (!response.ok) {
        throw new Error("Header insert failed");
      }

      const [{ transaction_no }] = await response.json();

      await saveInventoryDetails(transaction_no);

      toast.success(`Your Order Number is ${transaction_no}`);

      sessionStorage.setItem("ordersUpdated", Date.now());

      setCart([]);
      setCartOpen(false);
      setPaymentOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Error saving order");
    }
  };

  const saveInventoryDetails = async (transaction_no) => {
    try {
      const url = `${config.apiBaseUrl}/addSalesOrderDetail`;

      let serialNo = 1;

      for (const item of cart) {
        const Details = {
          company_code: "YJKT",
          bill_no: transaction_no,
          item_code: item.id,
          item_name: item.name,
          weight: 0,
          warehouse_code: "PON",
          bill_qty: item.qty,
          total_weight: 0,
          item_amt: item.price,
          bill_rate: item.price * item.qty,
          customer_code: customerProfile?.customer_code,
          customer_name: "Walk-in Customer",
          pay_type: "Cash",
          sales_type: "otherState",
          bill_date: new Date().toISOString().split("T")[0],
          dely_chlno: "",
          ItemSNo: serialNo,
          tax_amt: 0,
          discount: item.discountPer || 0,
          discount_amount:
            (item.price * item.qty * (item.discountPer || 0)) / 100,
          created_by: "HK",
        };

        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Details),
        });

        serialNo++;
      }
    } catch (error) {
      console.error(error);
      toast.error("Error saving sales details");
    }
  };

  return (
    <div className="app-container">
      <ToastContainer position="top-center" className="toast-design" theme="colored" />
      <Header
        cartCount={cart.length}
        cart={cart}
        onCartOpen={() => setCartOpen(true)}
        onCartClose={() => setCartOpen(false)}
        selectedVariant={selectedVariant}
        onVariantChange={setSelectedVariant}
        options={variantOptions}
        onSearch={handleSearch}
      />

      <CategorySlider loading={catLoading} categories={categories} />

      <RecentlyViewed
        items={recentlyViewed}
        loading={rvLoading}
        onAdd={addToCart}
        onRemove={confirmDeleteRecentlyViewed}
      />

      <ProductGrid
        products={products}
        loading={loading}
        onAdd={addToCart}
        onSelect={handleSelectProduct}
      />

      {cartOpen && (
        <CartModal
          cart={cart}
          subtotal={subtotal}
          discountAmount={discountAmount}
          total={total}
          onClose={() => setCartOpen(false)}
          onIncrease={increaseQty}
          onDecrease={decreaseQty}
          onRemove={removeFromCart}
          onPlaceOrder={() => setPaymentOpen(true)}
        />
      )}

      <ProductDetailsModal
        item={selectedItem}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onAdd={addToCart}
      />

      <PaymentModal
        total={total}
        paymentOpen={paymentOpen}
        setPaymentOpen={() => setPaymentOpen(false)}
        onConfirmOrder={handleSaveButtonClick}
      />
    </div>
  );
}
