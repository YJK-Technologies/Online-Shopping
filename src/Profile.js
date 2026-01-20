import { useEffect, useState } from "react";
import "./App.css"; // Save this CSS separately

export default function Profile() {
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const data = sessionStorage.getItem("customerProfile");
    if (data) setCustomer(JSON.parse(data));
  }, []);

  if (!customer) return <div className="loading-state">Loading Account...</div>;

  return (
    <div className="account-layout">
      <div className="account-container">
        
        {/* Top Header Section */}
        <div className="account-header">
          <div className="user-profile-meta">
            <div className="user-avatar-large">
              {customer.customer_name?.charAt(0)}
            </div>
            <div className="user-text">
              <h2>{customer.customer_name}</h2>
              <p>{customer.customer_email_id} | {customer.customer_mobile_no}</p>
            </div>
          </div>
          <button className="logout-top-btn" onClick={() => {
            sessionStorage.clear();
            window.location.href = "/login";
          }}>Logout</button>
        </div>

        {/* Dashboard Grid */}
        <div className="account-grid">
          
          {/* Section 1: Personal Info */}
          <div className="account-card">
            <h3 className="card-title">Personal Information</h3>
            <div className="card-content">
              <div className="data-row">
                <span className="label">Customer Code</span>
                <span className="value">{customer.customer_code}</span>
              </div>
              <div className="data-row">
                <span className="label">Mobile</span>
                <span className="value">{customer.customer_mobile_no}</span>
              </div>
              <div className="data-row">
                <span className="label">Company</span>
                <span className="value">{customer.company_code}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Financial/Credit Info */}
          <div className="account-card highlight-card">
            <h3 className="card-title">Wallet & Credit</h3>
            <div className="credit-display">
              <span className="credit-label">Available Credit Limit</span>
              <h2 className="credit-amount">₹{customer.customer_credit_limit}</h2>
              <div className="status-indicator">Active Account</div>
            </div>
          </div>

          {/* Section 3: Address Info (Full Width) */}
          <div className="account-card full-width">
            <h3 className="card-title">Registered Address</h3>
            <div className="address-content">
              <p>{customer.customer_addr_1}</p>
              <p>{customer.customer_state}, India</p>
            </div>
          </div>

        </div>

        {/* Action Buttons for Mobile */}
        <div className="mobile-actions">
           <a href="/home" className="secondary-btn">Continue Shopping</a>
        </div>

      </div>
    </div>
  );
}