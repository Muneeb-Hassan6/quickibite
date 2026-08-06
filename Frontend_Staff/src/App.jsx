import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style/App.css";
import { Toaster } from "react-hot-toast";



// 🏠 HOME & MENU IMPORTS (Aapke original folders se)

// 👨‍💼 STAFF PANELS IMPORTS
import KitchenDashboard from "./Feature/Kitchen/KitchenDashboard";
import CashierPortal from "./Feature/Cashier/CashierPortal";
import AdminDashboard from "./Feature/Admin/AdminDashboard";
import LoginForm from "./Feature/Auth/LoginForm";
import RiderPortal from "./Feature/Rider/RiderPortal";
import DispatchPortal from "./Feature/Dispatcher/DispatchPortal";

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
        {/* 🔓 LOGIN ROUTE (Default) */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />

        {/* ==========================================
            🔒 PROTECTED STAFF ROUTES (Role-based access)
            ========================================== */}

        <Route
          path="/kitchen"
          element={
            <ProtectedRoute
              allowedRoles={["Chef", "Kitchen", "Admin", "Manager"]}
            >
              <KitchenDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cashier"
          element={
            <ProtectedRoute allowedRoles={["Cashier", "Admin", "Manager"]}>
              <CashierPortal />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rider"
          element={
            <ProtectedRoute allowedRoles={["Rider", "Admin", "Manager"]}>
              <RiderPortal />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dispatcher"
          element={
            <ProtectedRoute allowedRoles={["Dispatcher", "Admin", "Manager"]}>
              <DispatchPortal />
            </ProtectedRoute>
          }
        />
      </Routes>
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
