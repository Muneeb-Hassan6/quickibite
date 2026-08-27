import React from "react";
import { FaChevronRight, FaMapMarkerAlt } from "react-icons/fa";

export default function HeaderMobileDrawer({
  mobileMenuOpen,
  setMobileMenuOpen,
  navItems,
  isNavActive,
  navigate,
}) {
  if (!mobileMenuOpen) return null;

  return (
    <div className="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-[#0d0d0d]/95 backdrop-blur-2xl border-b border-zinc-200 dark:border-white/10 p-4 sm:p-5 shadow-2xl space-y-2.5 animate-in slide-in-from-top-3 duration-200 z-[100]">
      <div className="space-y-1.5">
        {navItems.map((nav) => {
          const active = isNavActive(nav.to);
          return (
            <button
              key={nav.to}
              type="button"
              onClick={() => {
                navigate(nav.to);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-['Oswald',sans-serif] font-bold text-base tracking-wide border cursor-pointer transition-all ${
                active
                  ? "bg-orange-500/10 border-orange-500/30 text-orange-500 dark:bg-amber-400/15 dark:border-amber-400/40 dark:text-amber-400 shadow-sm font-bold"
                  : "bg-zinc-100/70 dark:bg-white/5 hover:bg-orange-500/10 text-zinc-800 dark:text-neutral-200 border-zinc-200/80 dark:border-white/5 hover:border-orange-500/30"
              }`}
            >
              <span className="uppercase">{nav.label}</span>
              <FaChevronRight
                className={`text-xs ${
                  active
                    ? "text-orange-500 dark:text-amber-400"
                    : "text-zinc-400 dark:text-neutral-500"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Quick Helpline Support Button inside Drawer */}
      <div className="pt-2 border-t border-zinc-200 dark:border-white/10">
        <button
          type="button"
          onClick={() => {
            navigate("/track-order");
            setMobileMenuOpen(false);
          }}
          className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-neutral-950 font-['Oswald',sans-serif] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 border-none cursor-pointer"
        >
          <FaMapMarkerAlt className="text-xs" />
          <span>Live Order Tracking</span>
        </button>
      </div>
    </div>
  );
}
