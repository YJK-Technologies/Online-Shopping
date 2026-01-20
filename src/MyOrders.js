import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import PaymentModal from "./pages/PaymentModal";
import { useNavigate } from "react-router-dom";
const config = require("./Apiconfig");

export default function MyOrders() {
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerProfile, setCustomerProfile] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCustomer = sessionStorage.getItem("customerProfile");
    if (storedCustomer) {
      setCustomerProfile(JSON.parse(storedCustomer));
    }
  }, []);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN");

  const bufferToBase64 = (buffer) => {
    if (!buffer?.data) return null;
    const binary = buffer.data.map((b) => String.fromCharCode(b)).join("");
    return `data:image/jpeg;base64,${window.btoa(binary)}`;
  };

  useEffect(() => {
    if (!customerProfile?.customer_code) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);

        const company_code =
          sessionStorage.getItem("selectedCompanyCode") || "YJKT";

        const res = await fetch(`${config.apiBaseUrl}/getSalesOrder`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_code,
            customer_code: customerProfile.customer_code,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          const formatted = data.map((item) => {
            const mrp = Number(item.MRP_Price) || 0;
            const discountPercent = Number(item.discount_Percentage) || 0;
            const discountAmount = (mrp * discountPercent) / 100;
            const sellingPrice = mrp - discountAmount;

            return {
              soNo: item.bill_no,
              item_code: item.item_code,
              productName: item.item_name,
              qty: Number(item.bill_qty),
              MRP_Price: mrp,
              discount_Percentage: discountPercent,
              discount_amount: discountAmount,
              price: sellingPrice,
              date: formatDate(item.bill_date),
              image: item.item_images
                ? bufferToBase64(item.item_images)
                : "https://via.placeholder.com/150",
            };
          });

          setSalesOrders(formatted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    const interval = setInterval(() => {
      const updated = sessionStorage.getItem("ordersUpdated");
      if (updated) {
        fetchOrders();
        sessionStorage.removeItem("ordersUpdated");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [customerProfile]);

  const increaseQty = (index) => {
    const updated = [...salesOrders];
    updated[index].qty += 1;
    setSalesOrders(updated);
  };

  const decreaseQty = (index) => {
    const updated = [...salesOrders];
    if (updated[index].qty > 1) {
      updated[index].qty -= 1;
      setSalesOrders(updated);
    }
  };

  const handleReOrder = (order) => {
    setSelectedOrder(order);
    setPaymentOpen(true);
  };

  const handleConfirmOrder = () => {
    toast.success("Order placed successfully");
    setPaymentOpen(false);
  };

  const handleReOrderSave = async () => {
    if (!selectedOrder) {
      toast.warning("No order selected");
      return;
    }

    try {
      const headerUrl = `${config.apiBaseUrl}/addSalesOrderHdr`;

      const totalAmount = selectedOrder.price * selectedOrder.qty;

      const Header = {
        company_code: "YJKT",
        customer_code: customerProfile?.customer_code,
        customer_name: "Walk-in Customer",
        pay_type: "Cash",
        sales_type: "otherState",
        order_type: "Online",
        bill_date: new Date().toISOString().split("T")[0],
        sale_amt: totalAmount,
        tax_amount: 0,
        bill_amt: totalAmount,
        roff_amt: 0,
        dely_chlno: "",
        sales_mode: "Counter",
        paid_amount: totalAmount,
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
        throw new Error("Re-Order Header insert failed");
      }

      const [{ transaction_no }] = await response.json();

      await saveReOrderDetails(transaction_no);

      toast.success(`Your Re-Order Number is ${transaction_no}`);

      sessionStorage.setItem("ordersUpdated", Date.now());

      setPaymentOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error(error);
      toast.error("Error saving re-order");
    }
  };

  const saveReOrderDetails = async (transaction_no) => {
    try {
      const url = `${config.apiBaseUrl}/addSalesOrderDetail`;

      const Details = {
        company_code: "YJKT",
        bill_no: transaction_no,
        item_code: selectedOrder.item_code,
        item_name: selectedOrder.productName,
        warehouse_code: "PON",
        bill_qty: selectedOrder.qty,
        item_amt: selectedOrder.price,
        bill_rate: selectedOrder.price * selectedOrder.qty,
        customer_code: customerProfile?.customer_code,
        customer_name: "Walk-in Customer",
        pay_type: "Cash",
        sales_type: "otherState",
        bill_date: new Date().toISOString().split("T")[0],
        ItemSNo: 1,
        tax_amt: 0,
        discount: selectedOrder.discount_Percentage || 0,
        discount_amount:
          (selectedOrder.price *
            selectedOrder.qty *
            (selectedOrder.discount_Percentage || 0)) / 100,

        created_by: "HK",
      };

      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Details),
      });
    } catch (error) {
      console.error(error);
      toast.error("Error saving re-order details");
    }
  };


  return (
    <div className="container">
      <div className="orders-top-bar">
        <h3>My Orders</h3>

        <button
          className="cancel-btn"
          onClick={() => navigate(-1)}
        >
          ✕
        </button>
      </div>

      {loading ? (
        <div className="skeleton-container">
          {[1, 2, 3, 4, 5].map((n) => (
            <div className="big-order-card skeleton-card" key={n}>
              <div className="skeleton-img"></div>
              <div className="big-order-details">
                <div className="skeleton-text skeleton-title"></div>
                <div className="skeleton-text skeleton-price"></div>
                <div className="skeleton-text skeleton-qty"></div>
              </div>
              <div className="order-action">
                <div className="skeleton-text skeleton-total"></div>
                <div className="skeleton-btn"></div>
              </div>
            </div>
          ))}
        </div>
      ) : salesOrders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        salesOrders.map((order, index) => (
          <div className="big-order-card" key={index}>
            <img
              src={order.image}
              alt={order.productName}
              className="big-order-img"
            />

            <div className="big-order-details">
              <h4>{order.productName}</h4>

              <div className="price-row">
                <span className="mrp">₹{order.MRP_Price}</span>
                <span className="selling">₹{order.price.toFixed(2)}</span>
                <span className="discount">
                  {order.discount_Percentage}% OFF
                </span>
              </div>

              <div className="discount-text">
                You saved ₹{(order.discount_amount * order.qty).toFixed(2)}
              </div>

              <div className="qty-row">
                <button onClick={() => decreaseQty(index)}>-</button>
                <span>{order.qty}</span>
                <button onClick={() => increaseQty(index)}>+</button>
              </div>

              <div className="order-date">Ordered on {order.date}</div>
            </div>

            <div className="order-action">
              <div className="total-price">
                ₹{(order.price * order.qty).toFixed(2)}
              </div>

              <button
                className="reorder-btn-big"
                onClick={() => handleReOrder(order)}
              >
                Re-Order
              </button>

            </div>
          </div>
        ))
      )}

      {selectedOrder && paymentOpen && (
        <PaymentModal
          total={selectedOrder.price * selectedOrder.qty}
          paymentOpen={paymentOpen}
          setPaymentOpen={setPaymentOpen}
          onConfirmOrder={handleReOrderSave}
        />
      )}
    </div>
  );
}