import { API_BASE } from '../../../utils/apiHelper';
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { FaPrint, FaCalendarAlt, FaStore, FaCheckCircle } from "react-icons/fa";

// Atomic Subcomponents
import ZReportReceipt from "./Shift/ZReportReceipt";

export default function ShiftReport({ ordersData = [] }) {
  const [liveOrders, setLiveOrders] = useState([]);
  const [cashierName, setCashierName] = useState("Cashier");

  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setCashierName(u.name || u.username || "Cashier");
      } catch (e) {
        setCashierName("Cashier");
      }
    }
  }, []);

  const { data: dbOrders = [] } = useQuery({
    queryKey: ["shift_orders"],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/get_orders.php?type=all`
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((o) => ({
          id: o.id,
          total: parseFloat(o.total || o.total_amount || 0),
          paymentStatus: o.payment_status || o.status || "Pending",
          paymentMethod: o.payment_method || "Cash",
          date: o.date || new Date().toISOString().split("T")[0],
          time: o.time || "",
          items:
            typeof o.cart === "string"
              ? JSON.parse(o.cart || "[]")
              : o.cart || [],
        }));
      }
      return [];
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (dbOrders.length > 0) {
      setLiveOrders(dbOrders);
    } else if (ordersData.length > 0) {
      setLiveOrders(ordersData);
    }
  }, [dbOrders, ordersData]);

  // Aggregate Metrics
  const paidOrders = liveOrders.filter((o) => o.paymentStatus === "Paid");
  const totalSales = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const cashSales = paidOrders
    .filter((o) => o.paymentMethod?.toLowerCase() === "cash")
    .reduce((sum, o) => sum + o.total, 0);
  const digitalSales = paidOrders
    .filter((o) => o.paymentMethod?.toLowerCase() !== "cash")
    .reduce((sum, o) => sum + o.total, 0);
  const unpaidOrders = liveOrders.filter((o) => o.paymentStatus !== "Paid");

  const handleCloseShift = () => {
    Swal.fire({
      title: "Close Register / Shift?",
      text: `Total Sales to balance: Rs. ${totalSales.toFixed(2)}. This will finalize the daily Z-Report.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Yes, Close Shift",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: "success",
          title: "Shift Closed!",
          text: "Z-Report generated and shift ended successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const handlePrintZReport = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto font-sans text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800 mb-6">
        <div>
          <h2 className="m-0 font-['Oswald',sans-serif] text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white uppercase tracking-wide">
            Shift & Z-Report
          </h2>
          <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5">
              <FaCalendarAlt className="text-amber-500" />
              {new Date().toDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <FaStore className="text-amber-500" />
              Counter: {cashierName}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handlePrintZReport}
            className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
          >
            <FaPrint className="text-xs text-amber-500" />
            <span>Print Z-Report</span>
          </button>
          <button
            onClick={handleCloseShift}
            className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer border-none active:scale-95"
          >
            <FaCheckCircle className="text-xs" />
            <span>Close Shift</span>
          </button>
        </div>
      </div>

      {/* Printable Z-Report Component */}
      <ZReportReceipt
        cashierName={cashierName}
        totalSales={totalSales}
        cashSales={cashSales}
        digitalSales={digitalSales}
        paidOrders={paidOrders}
        unpaidOrders={unpaidOrders}
        liveOrders={liveOrders}
      />
    </div>
  );
}
