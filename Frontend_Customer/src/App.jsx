import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style/App.css";
import { Toaster } from "react-hot-toast";

// 🛒 COMPONENTS & POPUPS (Order Folder se)
import CartPopup from "./Feature/Order/Components/CartPopup";

// 🌍 ONLINE STORE IMPORTS (OnlineStore Folder se)
import OnlineLayout from "./Feature/OnlineStore/OnlineLayout";
import CartPage from "./Feature/OnlineStore/CartPage";
import CheckoutPage from "./Feature/OnlineStore/CheckoutPage";

// 🏠 HOME & MENU IMPORTS (Aapke original folders se)
import Home from "./Feature/Home/Home";
import MenuPage from "./Feature/Menu/MenuPage";
import CategoryItemPage from "./Feature/Menu/Components/CategoryItemPage";
import OrderTracker from "./Feature/Order/Components/OrderTracker";
import DealsPage from "./Feature/Home/Components/DealsPage"; 
import AboutUs from "./Feature/OnlineStore/AboutUs";
import PrivacyPolicy from "./Feature/OnlineStore/PrivacyPolicy";
import TermsAndConditions from "./Feature/OnlineStore/TermsAndConditions";

// 👨‍💼 STAFF PANELS IMPORTS
import LoginForm from "./Feature/Auth/LoginForm";

// 🔥 NAYA: PROTECTED ROUTE IMPORT (Path apne hisaab se adjust kar lijiyega)
import ProtectedRoute from "./Components/ProtectedRoute";

// LIBRARIES
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

// ✅ CONTEXT IMPORTS (Aapke image k mutabiq capital 'C' wale folder se)
import { CartProvider, useCart } from "./Context/CartContext";
import { OrderProvider } from "./Context/OrderContext";

const MainContent = () => {
  const { toggleCart, cartItems, isCartOpen } = useCart();

  // Cart quantity calculation
  const totalQty = cartItems
    ? cartItems.reduce((total, item) => total + (item.qty || 1), 0)
    : 0;

  const location = useLocation();
  const currentPath = location.pathname;

  // Capture QR Code parameters (mode=dine_in&table=X)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get("mode");
    const table = params.get("table");
    
    if (mode === "dine_in") {
      sessionStorage.setItem("orderMode", "Dine-In");
      if (table) {
        sessionStorage.setItem("tableNumber", table);
      }
    }
  }, [location.search]);

  // Routes Logic (Taa ke staff pages par customer UI hide ho)
  const isKitchenPage = currentPath.startsWith("/kitchen");
  const isCashierPage = currentPath.startsWith("/cashier");
  const isAdminRoute = currentPath.startsWith("/admin");
  const isLoginPage = currentPath === "/login";

  // Cart aur Checkout page pe floating button chupane k liye logic
  const isOnlineCartFlow =
    currentPath === "/cart" || currentPath === "/checkout";

  // Helper boolean to hide operational UI
  const shouldHideUI =
    isKitchenPage || isCashierPage || isAdminRoute || isLoginPage;

  return (
    <div
      className="App"
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-body, #0a0a0a)",
        transition: "0.3s",
      }}
    >
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        {/* ==========================================
            🛍️ CUSTOMER ROUTES (Koi bhi access kar sakta hai)
            ========================================== */}
        <Route element={<OnlineLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route
            path="/category/:categoryName"
            element={<CategoryItemPage />}
          />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/track-order" element={<OrderTracker />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
        </Route>

        {/* 🔓 LOGIN ROUTE (Open for all) */}
        <Route path="/login" element={<LoginForm />} />

      </Routes>

      {/* 🛒 AAPKA PURANA CART POPUP */}
      {!shouldHideUI && !isOnlineCartFlow && <CartPopup />}
    </div>
  );
};

function App() {
  return (
    <CartProvider>
      <OrderProvider>
        <Router>
          <MainContent />
        </Router>
      </OrderProvider>
    </CartProvider>
  );
}

export default App;
