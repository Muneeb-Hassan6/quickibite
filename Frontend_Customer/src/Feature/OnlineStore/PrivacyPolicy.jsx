import React from "react";
import "./styles/StaticPages.css";

const PrivacyPolicy = () => {
  return (
    <div className="static-page-container">
      <div className="static-page-header">
        <h1>Privacy Policy</h1>
        <p>How we handle and protect your data.</p>
      </div>
      <div className="static-page-content">
        <h2>Data Collection</h2>
        <p>
          We collect personal information such as your name, contact details, and address when you place an order with us. 
          This information is solely used to ensure accurate and timely delivery of your food.
        </p>
        <h2>Data Protection</h2>
        <p>
          Your privacy is important to us. We implement strict security measures to ensure that your personal information 
          is kept safe and is not shared with third parties without your consent.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
