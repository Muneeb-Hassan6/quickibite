import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import OnlineNavbar from "./Components/OnlineNavbar";
import CartPopup from "../Order/Components/CartPopup";
import Footer from "./Components/Footer";

const OnlineLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMenuPage = location.pathname.toLowerCase() === "/menu";

  return (
    <div className="bg-[var(--web-bg,#0a0a0c)] min-h-screen text-[var(--text-main,#fff)] flex flex-col font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]">
      {/* 1. Navbar */}
      <OnlineNavbar />

      {/* 2. Main Content */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* 3. Cart Popup */}
      <CartPopup />

      {/* 4. Footer */}
      {!isMenuPage && <Footer />}
    </div>
  );
};

export default OnlineLayout;
