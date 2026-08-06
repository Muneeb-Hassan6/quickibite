// import React from "react";
// import Swal from "sweetalert2";
// import {
//   FaCoins,
//   FaReceipt,
//   FaWallet,
//   FaMoneyBill,
//   FaCreditCard,
//   FaPrint,
// } from "react-icons/fa";

// const ShiftReport = ({ ordersData }) => {
//   const totalOrders = ordersData.length;
//   const cashSales = ordersData
//     .filter((o) => o.status === "Paid")
//     .reduce((sum, order) => sum + order.total, 0);
//   const totalSales = cashSales;
//   const cardSales = 0;

//   const handleCloseShift = () => {
//     Swal.fire({
//       title: "Close Shift?",
//       text: `Expected Cash: Rs ${cashSales}`,
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#ef4444",
//       confirmButtonText: "Yes, Close Shift",
//       background: "var(--admin-panel)",
//       color: "var(--admin-text)",
//     });
//   };

//   return (
//     <div className="shift-container animate-slide-up">
//       <div className="shift-header">
//         <div>
//           <h2
//             className="page-title"
//             style={{ borderLeft: "none", paddingLeft: 0, marginBottom: "5px" }}
//           >
//             Shift Report
//           </h2>
//           <p className="shift-date">
//             {new Date().toDateString()} | Active Cashier Shift
//           </p>
//         </div>
//         <button className="btn-print-report" onClick={() => window.print()}>
//           <FaPrint style={{ marginRight: "8px" }} /> Print Z-Report
//         </button>
//       </div>

//       <div className="shift-stats-grid">
//         <div className="pos-stat-card orange">
//           <div className="sc-icon">
//             <FaCoins />
//           </div>
//           <div className="sc-info">
//             <span>Total Sales</span>
//             <h3>Rs {totalSales}</h3>
//           </div>
//         </div>
//         <div className="pos-stat-card green">
//           <div className="sc-icon">
//             <FaReceipt />
//           </div>
//           <div className="sc-info">
//             <span>Total Orders</span>
//             <h3>{totalOrders}</h3>
//           </div>
//         </div>
//         <div className="pos-stat-card blue">
//           <div className="sc-icon">
//             <FaWallet />
//           </div>
//           <div className="sc-info">
//             <span>Cash in Drawer</span>
//             <h3>Rs {cashSales}</h3>
//           </div>
//         </div>
//       </div>

//       <div className="shift-details-layout">
//         <div className="shift-panel">
//           <h4>Payment Breakdown</h4>
//           <div className="breakdown-row">
//             <span>
//               <FaMoneyBill /> Cash
//             </span>
//             <strong>Rs {cashSales}</strong>
//           </div>
//           <div className="breakdown-row">
//             <span>
//               <FaCreditCard /> Card / Online
//             </span>
//             <strong>Rs {cardSales}</strong>
//           </div>
//           <div className="breakdown-row total-row-shift">
//             <span>Net Revenue</span>
//             <strong>Rs {totalSales}</strong>
//           </div>
//         </div>

//         <div className="shift-panel close-shift-panel">
//           <h4>Shift Management</h4>
//           <p>
//             End your shift and generate the final Z-Report for accounts. This
//             will reset the drawer.
//           </p>
//           <button className="btn-close-shift" onClick={handleCloseShift}>
//             CLOSE SHIFT
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ShiftReport;
