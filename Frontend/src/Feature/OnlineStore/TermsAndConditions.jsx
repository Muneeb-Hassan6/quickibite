import React from "react";
import "./styles/StaticPages.css";

const TermsAndConditions = () => {
  return (
    <div className="static-page-container">
      <div className="static-page-header">
        <h1>Terms & Conditions</h1>
        <p>Please read these terms carefully before using our service.</p>
      </div>
      <div className="static-page-content">
        <h2>General Terms</h2>
        <p>
          By accessing and placing an order with Big Bite, you confirm that you are in agreement with and bound by the 
          terms of service contained in the Terms & Conditions outlined below.
        </p>
        <h2>Orders and Delivery</h2>
        <p>
          We strive to deliver your orders as quickly as possible. However, delivery times may vary based on weather, 
          traffic, and order volume. We reserve the right to cancel or refuse any order at our discretion.
        </p>
      </div>
    </div>
  );
};

export default TermsAndConditions;
