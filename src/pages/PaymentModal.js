import { useState, useEffect } from "react";
import "../PaymentModal.css";
import { toast } from "react-toastify";

const config = require("../Apiconfig");

export default function PaymentModal({
  total,
  paymentOpen,
  setPaymentOpen,
  onConfirmOrder
}) {
  const [selectedMethod, setSelectedMethod] = useState("COD");
  const [upiOptions, setUpiOptions] = useState([]);
  const totalAmount = Number(total || 0).toFixed(2);

  useEffect(() => {
    if (!sessionStorage.getItem("selectedCompanyCode")) {
      sessionStorage.setItem("selectedCompanyCode", "YJKT");
    }

    const company_code = sessionStorage.getItem("selectedCompanyCode");

    const fetchUPIOptions = async () => {
      try {
        const res = await fetch(`${config.apiBaseUrl}/getPay`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company_code })
        });

        const data = await res.json();
        setUpiOptions(data || []);
      } catch (err) {
        console.error("Error fetching UPI options:", err);
      }
    };

    fetchUPIOptions();
  }, []);

  if (!paymentOpen) return null;

  const handleConfirmOrder = () => {
    onConfirmOrder();
    setPaymentOpen(false);
  };

  // PaymentModal.js stays mostly the same, but ensure classNames match
return (
  <div className="payment-overlay">
    <div className="payment-sheet">
      <div className="sheet-handle"></div> {/* Mobile decoration */}
      
      <button className="close-circle" onClick={() => setPaymentOpen(false)}>×</button>

      <div className="payment-header-new">
        <h2>Secure Checkout</h2>
        <p>Choose your preferred payment method</p>
      </div>

      <div className="amount-banner">
        <span className="amt-label">Payable Amount</span>
        <h1 className="amt-value">₹{totalAmount}</h1>
      </div>

      <div className="payment-list">
        {/* UPI Option */}
        <div className={`pay-card ${selectedMethod === "UPI" ? "selected" : ""}`} 
             onClick={() => setSelectedMethod("UPI")}>
          <div className="pay-card-main">
            <span className="pay-icon">⚡</span>
            <div className="pay-info">
              <span className="pay-title">UPI Payment</span>
              <span className="pay-sub">Google Pay, PhonePe, Paytm</span>
            </div>
            <div className="selection-dot"></div>
          </div>
          
          {selectedMethod === "UPI" && (
            <div className="pay-expanded">
              <div className="upi-grid-new">
                {upiOptions.map((item, index) => (
                  <button key={index} className="upi-app-btn">
                    {item.attributedetails_name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Card Option */}
        <div className={`pay-card ${selectedMethod === "CARD" ? "selected" : ""}`}
             onClick={() => setSelectedMethod("CARD")}>
          <div className="pay-card-main">
            <span className="pay-icon">💳</span>
            <div className="pay-info">
              <span className="pay-title">Credit / Debit Card</span>
              <span className="pay-sub">Visa, Mastercard, RuPay</span>
            </div>
            <div className="selection-dot"></div>
          </div>
        </div>

        {/* COD Option */}
        <div className={`pay-card ${selectedMethod === "COD" ? "selected" : ""}`}
             onClick={() => setSelectedMethod("COD")}>
          <div className="pay-card-main">
            <span className="pay-icon">🚚</span>
            <div className="pay-info">
              <span className="pay-title">Cash on Delivery</span>
              <span className="pay-sub">Pay at your doorstep</span>
            </div>
            <div className="selection-dot"></div>
          </div>
        </div>
      </div>

      <div className="payment-footer">
        <button className="confirm-pay-btn" onClick={handleConfirmOrder}>
          Place Order & Pay
        </button>
        <p className="secure-text">🔒 100% Secure SSL Encrypted Payments</p>
      </div>
    </div>
  </div>
);
}