import React from "react";

const AboutUs = () => {
  return (
    <div className="max-w-[50rem] m-[7.5rem_auto_3.75rem_auto] px-[1.25rem] text-white min-h-[60vh] max-md:mt-[6.25rem]">
      <div className="text-center mb-[3.125rem]">
        <h1 className="text-[2.625rem] font-[800] mb-[0.625rem] text-[#ef4444] uppercase max-md:text-[2rem]">About Us</h1>
        <p className="text-[1.125rem] text-[#a3a3a3]">Discover the story behind Big Bite.</p>
      </div>
      <div className="bg-[#171717] p-[2.5rem] rounded-[1rem] border border-[#333] max-md:p-[1.25rem]">
        <h2 className="text-[1.5rem] font-[700] mb-[0.937rem] mt-[1.875rem] text-white first:mt-0">Our Journey</h2>
        <p className="text-[1rem] leading-[1.8] text-[#d4d4d4] mb-[1.25rem]">
          At Big Bite, we believe in serving fresh, hot, and delicious food to our community. 
          Started with a passion for culinary excellence, we have grown into a beloved local spot 
          known for premium quality ingredients and unforgettable tastes.
        </p>
        <h2 className="text-[1.5rem] font-[700] mb-[0.937rem] mt-[1.875rem] text-white first:mt-0">Our Mission</h2>
        <p className="text-[1rem] leading-[1.8] text-[#d4d4d4] mb-[1.25rem]">
          To provide a delightful dining experience with fast delivery, excellent customer service, 
          and food that makes you smile with every bite.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
