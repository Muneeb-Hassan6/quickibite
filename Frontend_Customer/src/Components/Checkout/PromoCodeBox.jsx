import React, { useState } from "react";
import { LuTag, LuCheck, LuX, LuLoader } from "react-icons/lu";
import { API_BASE } from "../../config/api";

const PromoCodeBox = ({ subtotal = 0, appliedCoupon = null, onApplyCoupon, onRemoveCoupon }) => {
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleApply = async () => {
    const code = inputCode.trim().toUpperCase();
    if (!code) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch(`${API_BASE}/validate_coupon.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await response.json();

      if (data.success) {
        onApplyCoupon && onApplyCoupon(data);
        setInputCode("");
        setErrorMsg("");
      } else {
        setErrorMsg(data.message || "Invalid promo code");
      }
    } catch (err) {
      setErrorMsg("Network error validating promo code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <LuTag className="w-4 h-4" />
        </div>
        <h4 className="text-xs sm:text-sm font-black font-['Oswald',sans-serif] uppercase tracking-wider text-neutral-900 dark:text-white m-0">
          Promo / Coupon Code
        </h4>
      </div>

      {appliedCoupon ? (
        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
              <LuCheck className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <p className="text-xs font-black font-['Oswald',sans-serif] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 m-0">
                {appliedCoupon.code}
              </p>
              <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 m-0">
                Discount applied: <span className="font-bold text-emerald-600 dark:text-emerald-400">-Rs {parseFloat(appliedCoupon.discount_amount).toLocaleString()}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemoveCoupon}
            className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-neutral-800 text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 flex items-center justify-center transition-all border-none cursor-pointer"
            title="Remove Coupon"
            aria-label="Remove Coupon"
          >
            <LuX className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. WELCOME50"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value.toUpperCase());
                if (errorMsg) setErrorMsg("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApply();
                }
              }}
              className="flex-1 bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-neutral-900 dark:text-white uppercase rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono focus:border-amber-500 focus:outline-none placeholder:normal-case placeholder:font-sans"
            />
            <button
              type="button"
              disabled={loading || !inputCode.trim()}
              onClick={handleApply}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-neutral-950 font-['Oswald',sans-serif] font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all border-none cursor-pointer active:scale-95"
            >
              {loading ? <LuLoader className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
            </button>
          </div>
          {errorMsg && (
            <p className="text-xs text-rose-500 font-semibold m-0 animate-shake">
              {errorMsg}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PromoCodeBox;
