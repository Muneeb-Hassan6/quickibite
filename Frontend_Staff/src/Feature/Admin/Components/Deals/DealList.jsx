import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import {
  FaTrash,
  FaClock,
  FaCheckCircle,
  FaEdit,
  FaSearch,
  FaFire,
  FaUtensils,
  FaLayerGroup,
} from "react-icons/fa";
import { useTheme } from "../../../../Context/ThemeContext";

const DealList = ({ onEdit }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["admin_deals"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_admin_deals.php`
      );
      const data = await response.json();
      return data.success ? data.data : [];
    },
  });

  // Toggle Active/Inactive Status
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 || currentStatus === "1" ? 0 : 1;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/update_deal_status.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, is_active: newStatus }),
        }
      );
      const data = await response.json();

      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["admin_deals"] });
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: newStatus ? "Deal Activated" : "Deal Deactivated",
          showConfirmButton: false,
          timer: 1500,
          background: isDarkMode ? "#141414" : "#ffffff",
          color: isDarkMode ? "#fff" : "#111",
        });
      }
    } catch (error) {
      Swal.fire("Error", "Could not update status", "error");
    }
  };

  // Delete Deal
  const handleDelete = (id, title) => {
    Swal.fire({
      title: `Delete "${title}"?`,
      text: "This combo deal and all its bundled choices will be removed permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Yes, Delete Deal",
      background: isDarkMode ? "#141414" : "#ffffff",
      color: isDarkMode ? "#fff" : "#111",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE}/delete_deal.php`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id }),
            }
          );
          const data = await response.json();
          if (data.success) {
            Swal.fire("Deleted!", "Deal has been removed.", "success");
            queryClient.invalidateQueries({ queryKey: ["admin_deals"] });
          } else {
            Swal.fire(
              "Error",
              data.message || "Could not delete deal",
              "error"
            );
          }
        } catch (error) {
          Swal.fire("Error", "Could not delete deal", "error");
        }
      }
    });
  };

  const filteredDeals = deals.filter(
    (d) =>
      (d.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.badge_tag || d.tag || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (d.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className={`text-center py-20 flex flex-col items-center justify-center gap-3 ${isDarkMode ? "text-neutral-400" : "text-gray-500"}`}>
        <div className="w-9 h-9 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium tracking-wide">
          Loading Combos & Deals...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ═══════════════════════════════════════
          1. SEARCH & FILTER HEADER
      ═══════════════════════════════════════ */}
      <div
        className={`w-full rounded-2xl px-4 py-3 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors ${isDarkMode
            ? "bg-[#18181b] text-white border border-neutral-800"
            : "bg-white text-gray-900 border border-gray-200"
          }`}
      >
        <div className="relative w-full sm:w-88">
          <FaSearch
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-xs ${isDarkMode ? "text-neutral-500" : "text-gray-400"
              }`}
          />
          <input
            type="text"
            placeholder="Search deals by title, tag, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-transparent pl-9 pr-4 py-1 text-xs focus:outline-none ${isDarkMode
                ? "text-white placeholder-neutral-500"
                : "text-gray-900 placeholder-gray-400"
              }`}
          />
        </div>
        <div
          className={`flex items-center gap-2 text-xs font-medium self-end sm:self-center ${isDarkMode ? "text-neutral-400" : "text-gray-600"
            }`}
        >
          <FaLayerGroup className="text-amber-500" />
          <span>
            Total{" "}
            <strong className={isDarkMode ? "text-white" : "text-gray-900"}>
              {deals.length}
            </strong>{" "}
            Deals · Showing{" "}
            <strong className="text-amber-500">{filteredDeals.length}</strong>
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          2. DEAL ROW CARDS
      ═══════════════════════════════════════ */}
      <div className="space-y-3">
        {filteredDeals.length === 0 ? (
          <div
            className={`text-center py-16 px-4 rounded-2xl shadow-sm ${isDarkMode
                ? "bg-[#18181b] border border-neutral-800"
                : "bg-white border border-gray-200"
              }`}
          >
            <FaUtensils
              className={`text-3xl mx-auto mb-2 ${isDarkMode ? "text-neutral-600" : "text-gray-400"
                }`}
            />
            <p
              className={`text-sm font-medium m-0 ${isDarkMode ? "text-neutral-400" : "text-gray-500"
                }`}
            >
              No combo deals match your search.
            </p>
          </div>
        ) : (
          filteredDeals.map((deal) => {
            const originalPrice = deal.original_price
              ? parseFloat(deal.original_price)
              : null;
            const dealPrice = parseFloat(deal.price || 0);
            const savings =
              originalPrice && originalPrice > dealPrice
                ? originalPrice - dealPrice
                : 0;
            const savingsPct =
              originalPrice && originalPrice > dealPrice
                ? Math.round((savings / originalPrice) * 100)
                : 0;
            const isActive = deal.is_active === 1 || deal.is_active === "1";

            return (
              <div
                key={deal.id}
                className={`w-full rounded-2xl p-4 mb-3 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm ${isDarkMode
                    ? "bg-[#18181b] hover:bg-[#202024] text-white border border-neutral-800/80 hover:border-neutral-700"
                    : "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 hover:border-gray-300"
                  } ${isActive
                    ? "opacity-100"
                    : isDarkMode
                      ? "opacity-60 bg-neutral-950/40"
                      : "opacity-60 bg-gray-50"
                  }`}
              >
                {/* Left: Thumbnail & Deal Info */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  {/* Thumbnail container */}
                  <div
                    className={`w-14 h-14 rounded-xl p-1 flex items-center justify-center flex-shrink-0 shadow-inner ${isDarkMode
                        ? "bg-neutral-950 border border-neutral-800"
                        : "bg-gray-50 border border-gray-200"
                      }`}
                  >
                    <img
                      src={deal.img || "https://placehold.co/120x120?text=Deal"}
                      alt={deal.title}
                      className="w-full h-full object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/120x120?text=Deal";
                      }}
                    />
                  </div>

                  {/* Title & Tag Info */}
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`font-black text-base tracking-wide m-0 ${isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                      >
                        {deal.title}
                      </h3>
                      {(deal.badge_tag || deal.tag) && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/25 uppercase tracking-wider">
                          <FaFire className="text-[9px] text-amber-500" />{" "}
                          {deal.badge_tag || deal.tag}
                        </span>
                      )}
                      {deal.is_permanent == 1 ||
                        deal.is_permanent === true ? (
                        <span className="inline-flex items-center gap-1 text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          <FaCheckCircle className="text-[9px]" /> 24/7
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          <FaClock className="text-[9px]" />{" "}
                          {deal.start_time?.slice(0, 5)} -{" "}
                          {deal.end_time?.slice(0, 5)}
                        </span>
                      )}
                    </div>
                    {deal.description && (
                      <p
                        className={`text-xs mt-0.5 line-clamp-1 m-0 ${isDarkMode ? "text-neutral-400" : "text-gray-500"
                          }`}
                      >
                        {deal.description}
                      </p>
                    )}

                    {/* Bundled Item Chips */}
                    {deal.items && deal.items.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {deal.items.map((it, idx) => (
                          <span
                            key={idx}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs ${isDarkMode
                                ? "bg-neutral-950 text-neutral-300 border border-neutral-800/60"
                                : "bg-gray-100 text-gray-800 border border-gray-200"
                              }`}
                            title={
                              it.options?.length
                                ? `Flavor Choices: ${it.options.join(", ")}`
                                : ""
                            }
                          >
                            <span className="font-black text-amber-500">
                              {it.quantity}x
                            </span>
                            <span>{it.item_title}</span>
                            {it.is_customizable && (
                              <span className="text-amber-500 font-bold text-[9px] ml-0.5">
                                (Customizable)
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Pricing, Status & Actions */}
                <div
                  className={`flex items-center justify-between lg:justify-end gap-5 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 flex-shrink-0 ${isDarkMode ? "border-neutral-800" : "border-gray-200"
                    }`}
                >
                  {/* Pricing Column */}
                  <div className="flex flex-col items-start lg:items-end gap-1">
                    <div className="flex items-baseline">
                      <span className="text-amber-500 font-black text-lg tracking-tight">
                        Rs {dealPrice}
                      </span>
                      {originalPrice && originalPrice > dealPrice && (
                        <span
                          className={`line-through text-xs ml-2 font-semibold ${isDarkMode ? "text-neutral-500" : "text-gray-400"
                            }`}
                        >
                          Rs {Math.round(originalPrice)}
                        </span>
                      )}
                    </div>
                    {savings > 0 && (
                      <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md border border-emerald-500/20 font-bold shadow-2xs">
                        Save Rs {Math.round(savings)} ({savingsPct}% OFF)
                      </span>
                    )}
                  </div>

                  {/* Status Toggle Button with Pulsing Dot */}
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleStatus(deal.id, deal.is_active)
                    }
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-2 shadow-xs active:scale-95 ${isActive
                        ? isDarkMode
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
                        : isDarkMode
                          ? "bg-neutral-800/60 text-neutral-400 border-neutral-800 hover:bg-neutral-800"
                          : "bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200"
                      }`}
                  >
                    {isActive ? (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                    ) : (
                      <span
                        className={`inline-flex rounded-full h-2 w-2 ${isDarkMode ? "bg-neutral-500" : "bg-gray-400"
                          }`}
                      />
                    )}
                    <span>{isActive ? "Active" : "Disabled"}</span>
                  </button>

                  {/* Action Buttons (Edit/Delete) */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEdit(deal)}
                      className={`p-2.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-xs ${isDarkMode
                          ? "bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 hover:bg-neutral-700 hover:border-neutral-700"
                          : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 hover:border-gray-300"
                        }`}
                      title="Edit Combo Deal"
                    >
                      <FaEdit className="text-xs" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(deal.id, deal.title)}
                      className={`p-2.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-xs ${isDarkMode
                          ? "bg-neutral-800 text-red-400 border border-neutral-800 hover:bg-red-500/20 hover:border-red-500/30"
                          : "bg-gray-100 text-red-600 border border-gray-200 hover:bg-red-50 hover:border-red-300"
                        }`}
                      title="Delete Combo Deal"
                    >
                      <FaTrash className="text-xs" />
                    </button>
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

export default DealList;
