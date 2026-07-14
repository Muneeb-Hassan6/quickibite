import React, { useState } from "react";
import Swal from "sweetalert2";
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
  const [terminalResetTrigger, setTerminalResetTrigger] = useState(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
        return <POSTerminal onPlaceOrder={handlePlaceNewOrder} terminalResetTrigger={terminalResetTrigger} setIsMobileSidebarOpen={setIsMobileSidebarOpen} />;
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
    <div className="flex h-screen w-full bg-[var(--admin-bg)] font-sans text-[var(--admin-text)] overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[90] min-[901px]:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}

      <CashierSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
        onResetTerminal={() => setTerminalResetTrigger((prev) => prev + 1)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">{renderContent()}</div>

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
