import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../../Components/Layout/Header";
import CartPopup from "../Order/Components/CartPopup";
import Footer from "./Components/Footer";

const OnlineLayout = () => {
  return (
    <div className="bg-[var(--web-bg,#0a0a0c)] w-full max-w-full overflow-x-hidden min-h-screen text-[var(--text-main,#fff)] flex flex-col justify-between font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif] relative">
      {/* 1. Header Navbar */}
      <Header />

      {/* 2. Main Content Viewport (Zero gap under sticky navbar) */}
      <div className="flex-1 w-full max-w-full overflow-x-hidden pt-0 mt-0">
        <Outlet />
      </div>

      {/* 3. Cart Popup */}
      <CartPopup />

      {/* 4. Global Persistent Footer across all customer routes */}
      <Footer />
    </div>
  );
};

export default OnlineLayout;
