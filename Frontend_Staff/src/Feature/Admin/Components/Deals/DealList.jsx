import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import {
  FaTrash,
  FaClock,
  FaEdit,
  FaSearch,
  FaFire,
  FaLayerGroup,
  FaTag,
  FaPercent,
} from "react-icons/fa";
import { resolveImageUrl } from "../../../../utils/imageOptimizer";

const DealList = ({ onEdit }) => {
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
          background: "#171717",
          color: "#fff",
        });
      }
    } catch (error) {
      Swal.fire("Error", "Could not update deal status", "error");
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
      background: "#171717",
      color: "#fff",
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
      <div className="text-center py-20 flex flex-col items-center justify-center gap-3 text-[var(--admin-muted,#888)]">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold uppercase tracking-wider">
          Loading Deals Catalog...
        </span>
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-4">
      {/* Header Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white dark:bg-[#161616] p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white shadow-sm">
        <div className="flex items-center gap-2">
          <FaFire className="text-amber-500 text-sm" />
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white font-['Oswald',sans-serif]">
            Active Combos & Deals ({filteredDeals.length})
          </span>
        </div>

        <div className="flex items-center bg-slate-50 dark:bg-[#111111] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/10 focus-within:border-amber-500 transition-colors w-full sm:w-72">
          <FaSearch className="text-slate-400 dark:text-neutral-500 text-xs mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search deals by title or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-slate-900 dark:text-white text-xs outline-none w-full placeholder:text-slate-400 dark:placeholder:text-neutral-500 font-medium"
          />
        </div>
      </div>

      {/* Deals Grid */}
      {filteredDeals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filteredDeals.map((deal) => {
            const isActive = deal.is_active == 1 || deal.is_active === true;
            const isPermanent =
              deal.is_permanent == 1 || deal.is_permanent === true;
            const items = deal.items || [];
            const dealPrice = parseFloat(deal.price) || 0;
            const origPrice = parseFloat(deal.original_price) || 0;
            const discountPercent =
              origPrice > dealPrice
                ? Math.round(((origPrice - dealPrice) / origPrice) * 100)
                : 0;

            return (
              <div
                key={deal.id}
                className="admin-card-surface bg-white dark:bg-[#161616] rounded-2xl border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white overflow-hidden shadow-sm flex flex-col justify-between hover:border-amber-500/40 transition-all group"
              >
                <div>
                  {/* Card Media Banner */}
                  <div className="relative h-44 sm:h-48 bg-slate-100 dark:bg-black/40 overflow-hidden flex items-center justify-center p-3">
                    <img
                      src={resolveImageUrl(deal.img, 400)}
                      alt={deal.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/400x300?text=Deal+Image";
                      }}
                    />

                    {/* Floating Badge Tag */}
                    <div className="absolute top-3 left-3 bg-amber-100/80 dark:bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-300/60 dark:border-amber-500/20 text-xs font-bold uppercase tracking-wider px-3 py-0.5 !rounded-full shadow-sm flex items-center gap-1 backdrop-blur-sm">
                      <FaTag className="text-[10px]" />
                      <span>{deal.badge_tag || deal.tag || "HOT DEAL"}</span>
                    </div>

                    {/* Discount Badge */}
                    {discountPercent > 0 && (
                      <div className="absolute bottom-3 left-3 bg-emerald-500 text-neutral-950 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 !rounded-full shadow-md flex items-center gap-1">
                        <FaPercent className="text-[9px]" />
                        <span>{discountPercent}% OFF</span>
                      </div>
                    )}

                    {/* Status Pill Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(deal.id, deal.is_active)}
                      className={`absolute top-3 right-3 text-xs font-bold uppercase tracking-wider px-3 py-1 !rounded-full border cursor-pointer transition-all shadow-md active:scale-90 ${
                        isActive
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                          : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/25"
                      }`}
                    >
                      {isActive ? "ACTIVE" : "INACTIVE"}
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div>
                      <h4 className="m-0 text-base font-black text-slate-900 dark:text-white uppercase tracking-wide font-['Oswald',sans-serif]">
                        {deal.title}
                      </h4>
                      {deal.description && (
                        <p className="m-0 mt-1 text-xs text-slate-500 dark:text-neutral-400 line-clamp-2">
                          {deal.description}
                        </p>
                      )}
                    </div>

                    {/* Price & Schedule */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 dark:border-white/10">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                          Rs. {dealPrice.toLocaleString()}
                        </span>
                        {origPrice > 0 && (
                          <span className="text-xs text-slate-400 dark:text-neutral-500 line-through font-mono">
                            Rs. {origPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] font-bold text-slate-600 dark:text-neutral-400 flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/5">
                        <FaClock className="text-amber-500 dark:text-amber-400 text-[10px]" />
                        <span>
                          {isPermanent
                            ? "24/7"
                            : `${deal.start_time?.substring(0, 5) || "00:00"} - ${
                                deal.end_time?.substring(0, 5) || "23:59"
                              }`}
                        </span>
                      </div>
                    </div>

                    {/* Bundled Items Overview */}
                    {items.length > 0 && (
                      <div className="p-3 bg-slate-50 dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-white/10 space-y-2">
                        <div className="text-[10px] uppercase font-extrabold text-slate-600 dark:text-neutral-400 flex items-center gap-1 tracking-wider">
                          <FaLayerGroup className="text-amber-500 dark:text-amber-400 text-[10px]" />
                          <span>Includes {items.length} Bundled Items:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {items.map((it, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-medium bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-neutral-200 px-2 py-0.5 rounded-lg flex items-center gap-1"
                            >
                              <span className="text-amber-600 dark:text-amber-400 font-bold">{it.quantity}x</span>
                              <span className="truncate max-w-[130px]">{it.item_title}</span>
                              {it.is_customizable && (
                                <span className="text-[9px] text-amber-600 dark:text-amber-400 font-black bg-amber-500/15 px-1 rounded">
                                Choice
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-3 sm:px-5 sm:py-3.5 bg-slate-50/50 dark:bg-white/[0.01] border-t border-slate-200 dark:border-white/10 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(deal)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-amber-500 hover:text-neutral-950 text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
                  >
                    <FaEdit className="text-xs" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(deal.id, deal.title)}
                    className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
                  >
                    <FaTrash className="text-xs" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center text-[var(--admin-muted,#888)] text-xs sm:text-sm bg-[var(--admin-panel,#171717)] rounded-2xl border border-[var(--admin-border,rgba(255,255,255,0.06))]">
          No combo deals match your search criteria.
        </div>
      )}
    </div>
  );
};

export default DealList;
