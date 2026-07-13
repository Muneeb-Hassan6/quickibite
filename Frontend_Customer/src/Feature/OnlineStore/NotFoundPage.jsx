import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaSearch } from "react-icons/fa";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[var(--bg-body,#0a0a0a)] text-white p-[1.25rem] relative overflow-hidden">
      <div className="text-center max-w-[37.5rem] z-10 bg-[rgba(20,20,20,0.6)] p-[3.125rem_1.875rem] rounded-[1.5rem] border border-[rgba(255,255,255,0.05)] backdrop-blur-[0.625rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
        <h1 className="text-[7.5rem] font-[900] m-0 bg-gradient-to-br from-[#ef4444] to-[#ff8a00] bg-clip-text text-transparent leading-[1] drop-shadow-[0_10px_30px_rgba(239,68,68,0.3)]">404</h1>
        <h2 className="text-[2rem] font-[700] mt-[0.625rem] mb-[0.937rem] text-[#f8fafc]">Oops! Page Not Found</h2>
        <p className="text-[1rem] text-[#94a3b8] mb-[2.188rem] leading-[1.6]">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <div className="flex gap-[0.937rem] justify-center flex-wrap">
          <button 
            className="flex items-center justify-center p-[0.75rem_1.5rem] bg-[#ef4444] text-white border-none rounded-[0.5rem] text-[1rem] font-[600] cursor-pointer transition-all duration-300 shadow-[0_4px_14px_rgba(239,68,68,0.4)] hover:-translate-y-[2px]" 
            onClick={() => navigate("/")}
          >
            <FaHome className="mr-[0.5rem]" /> Return to Home
          </button>
          <button 
            className="flex items-center justify-center p-[0.75rem_1.5rem] bg-transparent text-white border border-[rgba(255,255,255,0.2)] rounded-[0.5rem] text-[1rem] font-[600] cursor-pointer transition-all duration-300 hover:bg-[rgba(255,255,255,0.05)] hover:-translate-y-[2px]" 
            onClick={() => navigate("/menu")}
          >
            <FaSearch className="mr-[0.5rem]" /> Browse Menu
          </button>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[18.75rem] h-[18.75rem] rounded-full bg-[radial-gradient(circle,rgba(239,68,68,0.15)_0%,rgba(0,0,0,0)_70%)] z-[1] blur-[2.5rem]"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[25rem] h-[25rem] rounded-full bg-[radial-gradient(circle,rgba(255,138,0,0.1)_0%,rgba(0,0,0,0)_70%)] z-[1] blur-[3.125rem]"></div>
    </div>
  );
};

export default NotFoundPage;
