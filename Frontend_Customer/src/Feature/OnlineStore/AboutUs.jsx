import React from "react";
import "./styles/StaticPages.css"; // We will create a simple CSS file for these

const AboutUs = () => {
  return (
    <div className="static-page-container">
      <div className="static-page-header">
        <h1>About Us</h1>
        <p>Discover the story behind Big Bite.</p>
      </div>
      <div className="static-page-content">
        <h2>Our Journey</h2>
        <p>
          At Big Bite, we believe in serving fresh, hot, and delicious food to our community. 
          Started with a passion for culinary excellence, we have grown into a beloved local spot 
          known for premium quality ingredients and unforgettable tastes.
        </p>
        <h2>Our Mission</h2>
        <p>
          To provide a delightful dining experience with fast delivery, excellent customer service, 
          and food that makes you smile with every bite.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
