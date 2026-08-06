import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import OnlineNavbar from "./Components/OnlineNavbar";
import CartPopup from "../Order/Components/CartPopup";
import Footer from "./Components/Footer";
import "./styles/index.css";

const OnlineLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMenuPage = location.pathname.toLowerCase() === "/menu";

  return (
    <div className="online-store-wrapper">
      {/* 1. Navbar */}
      <OnlineNavbar />

      {/* 2. Main Content */}
      <div className="online-main-content">
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
