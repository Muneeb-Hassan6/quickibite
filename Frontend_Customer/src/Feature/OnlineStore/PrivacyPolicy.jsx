import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-[50rem] m-[7.5rem_auto_3.75rem_auto] px-[1.25rem] text-white min-h-[60vh] max-md:mt-[6.25rem]">
      <div className="text-center mb-[3.125rem]">
        <h1 className="text-[2.625rem] font-[800] mb-[0.625rem] text-[#ef4444] uppercase max-md:text-[2rem]">Privacy Policy</h1>
        <p className="text-[1.125rem] text-[#a3a3a3]">How we handle and protect your data.</p>
      </div>
      <div className="bg-[#171717] p-[2.5rem] rounded-[1rem] border border-[#333] max-md:p-[1.25rem]">
        <h2 className="text-[1.5rem] font-[700] mb-[0.937rem] mt-[1.875rem] text-white first:mt-0">Data Collection</h2>
        <p className="text-[1rem] leading-[1.8] text-[#d4d4d4] mb-[1.25rem]">
          We collect personal information such as your name, contact details, and address when you place an order with us. 
          This information is solely used to ensure accurate and timely delivery of your food.
        </p>
        <h2 className="text-[1.5rem] font-[700] mb-[0.937rem] mt-[1.875rem] text-white first:mt-0">Data Protection</h2>
        <p className="text-[1rem] leading-[1.8] text-[#d4d4d4] mb-[1.25rem]">
          Your privacy is important to us. We implement strict security measures to ensure that your personal information 
          is kept safe and is not shared with third parties without your consent.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
