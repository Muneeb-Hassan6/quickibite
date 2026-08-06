import React, { useState } from "react";
import Swal from "sweetalert2";
import "./styles/index.css";

// Components
import CashierSidebar from "./Components/CashierSidebar";
import POSTerminal from "./Components/POSTerminal";
import OrderHistory from "./Components/OrderHistory";
// import ShiftReport from "./Components/ShiftReport";
import CashierReceiptModal from "./Components/CashierReceiptModal";

const CashierPortal = () => {
  const [activeTab, setActiveTab] = useState("terminal");
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedOrderToView, setSelectedOrderToView] = useState(null);

  // Shift Report ke liye local state
  const [ordersData, setOrdersData] = useState([]);

  // 🔥 Naya order place hone par directly Modal open hoga
  const handlePlaceNewOrder = (fullOrderData) => {
    setOrdersData([fullOrderData, ...ordersData]);
    // Order place hote hi automatically Receipt Modal open kardo
    setSelectedOrderToView(fullOrderData);
    setIsReceiptModalOpen(true);
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to exit the POS?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      customClass: {
        popup: "my-custom-popup",
        confirmButton: "my-custom-btn-error",
        cancelButton: "my-custom-btn-cancel",
      },
    });
  };

  // ==========================================
  // 🔥 MISSING FUNCTIONS ADDED HERE
  // ==========================================

  // View Button Logic
  const handleViewClick = (order) => {
    setSelectedOrderToView(order);
    setIsReceiptModalOpen(true);
  };

  // Print Button Logic
  const handlePrintClick = (order) => {
    setSelectedOrderToView(order);
    setIsReceiptModalOpen(true);
    // Yahan Receipt Modal open hoga jahan user direct Print kar sakega!
  };

  const renderContent = () => {
    switch (activeTab) {
      case "terminal":
        return <POSTerminal onPlaceOrder={handlePlaceNewOrder} />;
      case "history":
        return (
          <OrderHistory
            onViewClick={handleViewClick}
            onPrintClick={handlePrintClick}
          />
        );
      // case "shift":
      //   return <ShiftReport ordersData={ordersData} />;
      default:
        return null;
    }
  };

  return (
    <div className="pos-dashboard-container">
      <CashierSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      <div className="pos-content-area">{renderContent()}</div>

      {/* Receipt Modal */}
      <CashierReceiptModal
        isOpen={isReceiptModalOpen}
        order={selectedOrderToView}
        onClose={() => setIsReceiptModalOpen(false)}
      />
    </div>
  );
};

export default CashierPortal;
