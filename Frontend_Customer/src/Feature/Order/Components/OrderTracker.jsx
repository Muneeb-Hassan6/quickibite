import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaBoxOpen,
  FaClock,
  FaCheckCircle,
  FaCircle,
  FaSearch,
  FaTimes,
  FaSync,
} from "react-icons/fa";
import toast from "react-hot-toast";

const OrderTracker = () => {
  const [searchId, setSearchId] = useState("");
  const { data: liveOrders = [], isLoading, refetch: fetchLiveOrders, isRefetching } = useQuery({
    queryKey: ['public_orders'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/track_public_orders.php`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 10000,
  });

  // Get my locally placed orders
  const mySavedOrders = JSON.parse(localStorage.getItem("myOrders") || "[]");
  const myOrderIds = mySavedOrders
    .map(o => o?.id?.toString())
    .filter(Boolean);

  const filteredOrders = liveOrders.filter((order) => {
    // If user is searching manually, show the searched order
    if (searchId.trim() !== "") {
      return order?.id?.toString().includes(searchId.replace("#", "").trim());
    }
    // Otherwise, only show their own orders saved in localStorage
    return myOrderIds.includes(order?.id?.toString());
  });

  const ProgressStep = ({ status, currentStatus, label, icon }) => {
    let mappedStatus = currentStatus;
    if (mappedStatus === "Completed" || mappedStatus === "Delivered") {
      mappedStatus = "Ready";
    }

    const steps = ["Pending", "Cooking", "Ready"];
    const currentIndex = steps.indexOf(mappedStatus);
    const stepIndex = steps.indexOf(status);

    const safeIndex = currentIndex === -1 ? 0 : currentIndex;

    const isActive = stepIndex <= safeIndex;
    const isCurrent = stepIndex === safeIndex;

    let iconBgColor = "#1a1a1a";
    let iconBorderColor = "#333";
    let iconTextColor = "#666";
    let labelColor = "#777";
    let animationClass = "";
    let shadow = "";

    if (isActive) {
      iconTextColor = "#fff";
      labelColor = "#ffffff";
      if (status === "Pending") {
        iconBgColor = "#f59e0b";
        iconBorderColor = "#f59e0b";
      }
      if (status === "Cooking") {
        iconBgColor = "#ef4444";
        iconBorderColor = "#ef4444";
      }
      if (status === "Ready") {
        iconBgColor = "#10b981";
        iconBorderColor = "#10b981";
      }
    }

    if (isCurrent) {
      if (status === "Pending") {
        shadow = "0 0 1.25rem rgba(245,158,11,0.5)";
        animationClass = "animate-currentPulse";
      }
      if (status === "Cooking") {
        shadow = "0 0 1.25rem rgba(239,68,68,0.5)";
        animationClass = "animate-currentPulse";
      }
      if (status === "Ready") {
        shadow = "0 0 1.25rem rgba(16,185,129,0.5)";
        animationClass = "animate-pulseReady";
      }
    }

    return (
      <div className="flex flex-col items-center w-[5rem] max-md:w-[3.125rem] group z-[2]">
        <div 
          className={`w-[3.125rem] h-[3.125rem] max-md:w-[1.874rem] max-md:h-[1.874rem] max-md:text-[0.75rem] max-md:border-[2px] border-[3px] rounded-full flex items-center justify-center transition-all duration-400 text-[1rem] ${animationClass}`}
          style={{ backgroundColor: iconBgColor, borderColor: iconBorderColor, color: iconTextColor, boxShadow: shadow }}
        >
          {icon}
        </div>
        <span 
          className="mt-[0.75rem] max-md:mt-[0.5rem] text-[0.75rem] max-md:text-[0.563rem] font-bold uppercase tracking-[0.5px] transition-all duration-300"
          style={{ color: labelColor }}
        >
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-[53.125rem] mx-auto px-[1.25rem] my-[3.125rem] min-h-[70vh] font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]">
      {/* INJECTING CUSTOM KEYFRAMES FOR EXACT DESIGN */}
      <style>{`
        @keyframes pulseDotRed {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 0.5rem rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes currentPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes pulseReady {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          50% { transform: scale(1.1); box-shadow: 0 0 0 0.5rem rgba(16, 185, 129, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .animate-pulseDotRed { animation: pulseDotRed 1.5s infinite; }
        .animate-currentPulse { animation: currentPulse 2s infinite; }
        .animate-pulseReady { animation: pulseReady 2s infinite; }
      `}</style>

      {/* HEADER & SEARCH SECTION */}
      <div className="flex justify-between items-center mb-[1.563rem] border-b border-[#2a2a2a] pb-[0.937rem] max-md:flex-col max-md:items-start max-md:gap-[0.625rem]">
        <h2 className="font-['Oswald',sans-serif] text-[2.125rem] uppercase text-white flex items-center gap-[0.937rem] m-0 tracking-[1px] max-md:text-[1.375rem] max-md:gap-[0.625rem]">
          <FaBoxOpen className="text-[#ef4444]" /> Track Order

          <button
            onClick={fetchLiveOrders}
            className="bg-transparent border-none text-[#888] cursor-pointer text-[1rem] mt-[0.313rem] p-[0.313rem] transition-all duration-300 hover:text-[#ef4444]"
            title="Refresh Status"
          >
            <FaSync className={isLoading ? "animate-spin" : ""} />
          </button>
        </h2>

        <div className="flex items-center bg-[#111] border border-[#333] rounded-[1.875rem] p-[0.25rem] transition-all duration-300 w-[21.875rem] focus-within:border-[#ef4444] focus-within:shadow-[0_0_15px_rgba(239,68,68,0.2)] max-md:w-full max-md:box-border max-md:px-[0.625rem]">
          <FaSearch className="text-[#ef4444] ml-[0.937rem]" />
          <input
            type="text"
            className="flex-1 bg-transparent border-none text-white px-[0.937rem] py-[0.625rem] text-[0.875rem] outline-none"
            placeholder="Type Order ID..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          {searchId && (
            <FaTimes
              className="text-[#888] cursor-pointer mr-[0.937rem] p-[0.313rem]"
              onClick={() => setSearchId("")}
            />
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div>
        {isLoading && liveOrders.length === 0 ? (
          <div className="text-center p-[5rem_1.25rem] bg-[linear-gradient(145deg,#111111,#181818)] border border-dashed border-[#444] rounded-[1.25rem]">
            <h3 className="text-white text-[1.5rem] mb-[0.625rem]">Loading live status...</h3>
          </div>
        ) : !filteredOrders || filteredOrders.length === 0 ? (
          <div className="text-center p-[5rem_1.25rem] bg-[linear-gradient(145deg,#111111,#181818)] border border-dashed border-[#444] rounded-[1.25rem]">
            <div className="w-[5rem] h-[5rem] bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-[1.25rem] text-[2.188rem] text-[#444]">
              <FaBoxOpen />
            </div>
            <h3 className="text-white text-[1.5rem] mb-[0.625rem]">{searchId ? "Order Not Found" : "No Active Orders"}</h3>
            <p className="text-[#aaaaaa] text-[1rem]">
              {searchId
                ? `We couldn't find any order matching #${searchId}.`
                : "Hungry? Head over to our menu and place an order!"}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            let currentStat = order.status;
            if (currentStat === "Completed" || currentStat === "Delivered")
              currentStat = "Ready";

            let barWidth = "15%";
            let barColor = "#f59e0b"; // Yellow
            let glowColor = "rgba(245, 158, 11, 0.4)";
            
            let badgeBg = "rgba(255,215,0,0.1)";
            let badgeBorder = "rgba(255,215,0,0.2)";
            let badgeText = "#ffd700";
            let dotColor = "#ffd700";
            let dotAnim = "";

            if (currentStat === "Cooking") {
                barWidth = "50%";
                barColor = "#ef4444"; // Red
                glowColor = "rgba(239, 68, 68, 0.4)";
                
                badgeBg = "rgba(239,68,68,0.1)";
                badgeBorder = "rgba(239,68,68,0.2)";
                badgeText = "#ef4444";
                dotColor = "#ef4444";
                dotAnim = "animate-pulseDotRed";
            }
            if (currentStat === "Ready") {
                barWidth = "100%";
                barColor = "#10b981"; // Green
                glowColor = "rgba(16, 185, 129, 0.4)";
                
                badgeBg = "rgba(46,204,113,0.1)";
                badgeBorder = "rgba(46,204,113,0.2)";
                badgeText = "#2ecc71";
                dotColor = "#2ecc71";
            }

            return (
              <div key={order.id} className="bg-[linear-gradient(145deg,#111111,#181818)] border border-[#2a2a2a] rounded-[1.25rem] mb-[2.188rem] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-[0.313rem] hover:border-[#444] hover:shadow-[0_15px_40px_rgba(239,68,68,0.1)]">
                {/* CARD HEADER */}
                <div className="bg-[rgba(0,0,0,0.4)] p-[1.25rem_1.563rem] flex justify-between items-center border-b border-[#2a2a2a] max-md:flex-row max-md:flex-wrap max-md:gap-[0.625rem] max-md:p-[0.75rem_0.938rem]">
                  <div className="flex flex-col gap-[0.313rem] max-md:gap-[2px]">
                    <span className="font-['Oswald',sans-serif] text-[1.375rem] font-bold text-white tracking-[1px] max-md:text-[1rem]">ORDER #{order.id}</span>
                    <span className="text-[#aaaaaa] text-[0.812rem] flex items-center gap-[0.375rem] max-md:text-[0.688rem]">
                      <FaClock /> {order.time}
                    </span>
                    <span className="text-[0.75rem] border border-[#ffc107] p-[2px_0.375rem] rounded-[0.25rem] text-[#ffc107] inline-block w-max mt-[0.25rem] max-md:text-[0.625rem]">
                      {order.order_type
                        ? order.order_type.replace("_", " ").toUpperCase()
                        : "N/A"}
                    </span>
                  </div>

                  <div
                    className="p-[0.5rem_1.125rem] rounded-[1.875rem] text-[0.75rem] font-[900] uppercase tracking-[1px] flex items-center gap-[0.5rem] max-md:self-center max-md:p-[0.251rem_0.625rem] max-md:text-[0.625rem] border"
                    style={{ backgroundColor: badgeBg, borderColor: badgeBorder, color: badgeText }}
                  >
                    <span className={`w-[0.5rem] h-[0.5rem] rounded-full ${dotAnim}`} style={{ backgroundColor: dotColor }}></span>
                    {order.status}
                  </div>
                </div>

                {/* PROGRESS TRACKER */}
                <div className="p-[2.188rem_1.563rem_1.563rem] border-b border-dashed border-[#333] max-md:p-[0.938rem_0.625rem]">
                  <div className="relative">
                    <div className="absolute top-[1.375rem] left-[2.5rem] right-[2.5rem] h-[0.375rem] bg-[#222] rounded-[0.625rem] z-[1] max-md:top-[0.875rem] max-md:left-[0.938rem] max-md:right-[0.938rem] max-md:h-[0.251rem]">
                      <div
                        className="h-full rounded-[0.625rem] transition-all duration-[1.2s] ease-[cubic-bezier(0.4,0,0.2,1)]"
                        style={{ 
                          width: barWidth, 
                          background: barColor, 
                          boxShadow: `0 0 0.938rem ${glowColor}` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between relative z-[2]">
                      <ProgressStep
                        status="Pending"
                        currentStatus={currentStat}
                        label="Confirmed"
                        icon={<FaCheckCircle size={14} />}
                      />
                      <ProgressStep
                        status="Cooking"
                        currentStatus={currentStat}
                        label="Cooking"
                        icon={<FaCircle size={12} />}
                      />
                      <ProgressStep
                        status="Ready"
                        currentStatus={currentStat}
                        label="Ready"
                        icon={<FaCheckCircle size={14} />}
                      />
                    </div>
                  </div>
                </div>

                {/* RECEIPT / BILLING */}
                <div className="p-[1.563rem] bg-[rgba(0,0,0,0.2)] max-md:p-[0.75rem_0.938rem]">
                  <h4 className="font-['Oswald',sans-serif] text-white uppercase text-[1.125rem] mt-0 mb-[1.25rem] tracking-[1px] max-md:text-[0.875rem] max-md:mb-[0.625rem]">Order Details</h4>
                  <div className="flex flex-col gap-[0.937rem] mb-[1.25rem] max-md:gap-[0.5rem] max-md:mb-[0.625rem]">
                    {order.cart &&
                      order.cart.map((i, idx) => (
                        <div key={idx} className="flex justify-between items-center border-b border-[#222] pb-[0.937rem] last:border-none last:pb-0 max-md:pb-[0.5rem] max-md:mb-0">
                          <div className="flex items-center gap-[0.937rem]">
                            <span className="bg-[#222] text-[#ef4444] w-[2rem] h-[2rem] rounded-[0.5rem] flex items-center justify-center font-[900] text-[0.875rem] max-md:w-[1.5rem] max-md:h-[1.5rem] max-md:text-[0.688rem] max-md:rounded-[0.376rem]">{i.qty}x</span>
                            <span className="text-white font-[600] text-[1rem] max-md:text-[0.812rem]">
                              {i.name || i.title}
                            </span>
                          </div>
                          <span className="text-white font-bold max-md:text-[0.812rem]">
                            Rs. {i.price * i.qty}
                          </span>
                        </div>
                      ))}
                  </div>

                  <div className="flex justify-between items-center bg-[#111] p-[1.25rem] rounded-[0.75rem] border border-[#333] max-md:p-[0.625rem_0.75rem] max-md:flex-row">
                    <span className="text-white text-[1.125rem] font-bold uppercase max-md:text-[0.875rem]">Total Paid</span>
                    <span className="text-[#ef4444] text-[1.5rem] font-[900] max-md:text-[1.126rem]">Rs. {order.total}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrderTracker;