import React from "react";

const TermsAndConditions = () => {
  return (
    <div className="max-w-[50rem] m-[7.5rem_auto_3.75rem_auto] px-[1.25rem] text-white min-h-[60vh] max-md:mt-[6.25rem]">
      <div className="text-center mb-[3.125rem]">
        <h1 className="text-[2.625rem] font-[800] mb-[0.625rem] text-[#ef4444] uppercase max-md:text-[2rem]">Terms & Conditions</h1>
        <p className="text-[1.125rem] text-[#a3a3a3]">Please read these terms carefully before using our service.</p>
      </div>
      <div className="bg-[#171717] p-[2.5rem] rounded-[1rem] border border-[#333] max-md:p-[1.25rem]">
        <h2 className="text-[1.5rem] font-[700] mb-[0.937rem] mt-[1.875rem] text-white first:mt-0">General Terms</h2>
        <p className="text-[1rem] leading-[1.8] text-[#d4d4d4] mb-[1.25rem]">
          By accessing and placing an order with Big Bite, you confirm that you are in agreement with and bound by the 
          terms of service contained in the Terms & Conditions outlined below.
        </p>
        <h2 className="text-[1.5rem] font-[700] mb-[0.937rem] mt-[1.875rem] text-white first:mt-0">Orders and Delivery</h2>
        <p className="text-[1rem] leading-[1.8] text-[#d4d4d4] mb-[1.25rem]">
          We strive to deliver your orders as quickly as possible. However, delivery times may vary based on weather, 
          traffic, and order volume. We reserve the right to cancel or refuse any order at our discretion.
        </p>
      </div>
    </div>
  );
};

export default TermsAndConditions;
