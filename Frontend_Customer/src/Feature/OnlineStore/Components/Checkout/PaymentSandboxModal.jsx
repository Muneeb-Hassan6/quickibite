import React, { useState, useEffect } from "react";
import { LuX, LuSmartphone, LuCreditCard, LuShieldCheck, LuCircleAlert } from "react-icons/lu";
import { FaCheckCircle } from "react-icons/fa";

export default function PaymentSandboxModal({
  isOpen = false,
  onClose,
  sandboxMethod = "JazzCash",
  sandboxLoading = false,
  sandboxInput1 = "",
  setSandboxInput1,
  sandboxInput2 = "",
  setSandboxInput2,
  handleSandboxPay,
  total = 0,
}) {
  const [errors, setErrors] = useState({ input1: "", input2: "" });
  const [hasInteracted, setHasInteracted] = useState(false);

  // Normalize method
  const methodStr = sandboxMethod || "JazzCash";
  const isWallet =
    methodStr.toLowerCase().includes("jazz") ||
    methodStr.toLowerCase().includes("easy") ||
    methodStr.toLowerCase().includes("wallet");

  const methodTitle = methodStr.toLowerCase().includes("jazz")
    ? "JazzCash"
    : methodStr.toLowerCase().includes("easy")
    ? "EasyPaisa"
    : "Card Gateway";

  // Reset errors when modal opens or method changes
  useEffect(() => {
    if (isOpen) {
      setErrors({ input1: "", input2: "" });
      setHasInteracted(false);
    }
  }, [isOpen, sandboxMethod]);

  if (!isOpen) return null;

  // Validation rules
  const validate = () => {
    const newErrors = { input1: "", input2: "" };
    const clean1 = (sandboxInput1 || "").replace(/\D/g, "");
    const clean2 = (sandboxInput2 || "").replace(/\D/g, "");

    if (isWallet) {
      if (!clean1) {
        newErrors.input1 = "Please enter your 11-digit mobile account number.";
      } else if (!clean1.startsWith("03")) {
        newErrors.input1 = "Mobile account number must start with 03.";
      } else if (clean1.length !== 11) {
        newErrors.input1 = `Mobile number must be exactly 11 digits (${clean1.length}/11).`;
      }

      if (!clean2) {
        newErrors.input2 = "Please enter your 4-digit MPIN.";
      } else if (clean2.length !== 4) {
        newErrors.input2 = `MPIN must be exactly 4 digits (${clean2.length}/4).`;
      }
    } else {
      if (!clean1) {
        newErrors.input1 = "Please enter your 16-digit card number.";
      } else if (clean1.length !== 16) {
        newErrors.input1 = `Card number must be exactly 16 digits (${clean1.length}/16).`;
      }

      if (!clean2) {
        newErrors.input2 = "Please enter your 3 or 4-digit CVV.";
      } else if (clean2.length < 3 || clean2.length > 4) {
        newErrors.input2 = "CVV must be 3 or 4 digits.";
      }
    }

    setErrors(newErrors);
    return !newErrors.input1 && !newErrors.input2;
  };

  const isFormValid = isWallet
    ? /^03[0-9]{9}$/.test(sandboxInput1.replace(/\D/g, "")) &&
      /^[0-9]{4}$/.test(sandboxInput2.replace(/\D/g, ""))
    : sandboxInput1.replace(/\D/g, "").length === 16 &&
      sandboxInput2.replace(/\D/g, "").length >= 3;

  const handleInput1Change = (e) => {
    const clean = e.target.value.replace(/\D/g, "");
    const maxLen = isWallet ? 11 : 16;
    const truncated = clean.slice(0, maxLen);
    setSandboxInput1(truncated);

    if (hasInteracted) {
      if (isWallet) {
        if (truncated.length > 0 && !truncated.startsWith("03")) {
          setErrors((prev) => ({ ...prev, input1: "Mobile account number must start with 03." }));
        } else if (truncated.length === 11) {
          setErrors((prev) => ({ ...prev, input1: "" }));
        }
      } else if (truncated.length === 16) {
        setErrors((prev) => ({ ...prev, input1: "" }));
      }
    }
  };

  const handleInput2Change = (e) => {
    const clean = e.target.value.replace(/\D/g, "");
    const maxLen = isWallet ? 4 : 4;
    const truncated = clean.slice(0, maxLen);
    setSandboxInput2(truncated);

    if (hasInteracted) {
      if (isWallet && truncated.length === 4) {
        setErrors((prev) => ({ ...prev, input2: "" }));
      } else if (!isWallet && truncated.length >= 3) {
        setErrors((prev) => ({ ...prev, input2: "" }));
      }
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setHasInteracted(true);

    if (!validate()) {
      return;
    }

    // Generate authentic transaction reference
    const txnRef = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(
      100000 + Math.random() * 900000
    )}`;

    handleSandboxPay(txnRef);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          disabled={sandboxLoading}
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 dark:hover:text-white border-none bg-transparent cursor-pointer p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
          aria-label="Close payment modal"
        >
          <LuX className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="p-3 rounded-2xl bg-amber-400/15 text-amber-500 shadow-sm">
            {isWallet ? (
              <LuSmartphone className="w-6 h-6 text-amber-500" />
            ) : (
              <LuCreditCard className="w-6 h-6 text-amber-500" />
            )}
          </span>
          <div>
            <h3 className="font-['Oswald',sans-serif] font-bold text-xl uppercase tracking-wide text-neutral-900 dark:text-white m-0">
              {methodTitle} Gateway
            </h3>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Simulated Sandbox Environment
            </span>
          </div>
        </div>

        {/* Amount Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 mb-5 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Total Amount to Authorize
          </span>
          <div className="text-2xl sm:text-3xl font-black font-['Oswald',sans-serif] text-neutral-900 dark:text-white mt-0.5">
            Rs {Number(total).toLocaleString()}
          </div>
        </div>

        {/* Payment Input Form */}
        <div className="space-y-4 mb-5">
          {/* Field 1: Mobile Account / Card Number */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                {isWallet ? "Mobile Account Number *" : "Card Number (16 Digits) *"}
              </label>
              {isWallet && (
                <span className="text-[10px] text-neutral-400 font-mono font-bold">
                  {sandboxInput1.length}/11 Digits
                </span>
              )}
            </div>

            <div className="relative">
              {isWallet && (
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 text-xs font-mono font-bold">
                  🇵🇰 +92
                </div>
              )}
              <input
                type="tel"
                disabled={sandboxLoading}
                value={sandboxInput1}
                onChange={handleInput1Change}
                onBlur={() => {
                  setHasInteracted(true);
                  validate();
                }}
                placeholder={isWallet ? "03XXXXXXXXX" : "4242 •••• •••• 4242"}
                className={`w-full ${isWallet ? "pl-20" : "px-3.5"} py-3 rounded-xl bg-gray-50 dark:bg-neutral-800 border text-sm text-neutral-900 dark:text-white font-mono tracking-wider focus:outline-none transition-all ${
                  errors.input1
                    ? "border-red-500 bg-red-50/10 ring-1 ring-red-500/40"
                    : isWallet && /^03[0-9]{9}$/.test(sandboxInput1)
                    ? "border-emerald-500/70 ring-1 ring-emerald-500/30"
                    : "border-gray-300 dark:border-neutral-700 focus:border-amber-400"
                }`}
              />
              {isWallet && /^03[0-9]{9}$/.test(sandboxInput1) && (
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-emerald-400 text-sm">
                  <FaCheckCircle />
                </div>
              )}
            </div>

            {errors.input1 && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 font-medium flex items-center gap-1 animate-fade-in m-0">
                <LuCircleAlert className="w-3.5 h-3.5 shrink-0" />
                {errors.input1}
              </p>
            )}
          </div>

          {/* Field 2: MPIN / CVV */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                {isWallet ? "4-Digit Security MPIN *" : "CVV / Security Code *"}
              </label>
              {isWallet && (
                <span className="text-[10px] text-neutral-400 font-mono font-bold">
                  {sandboxInput2.length}/4 Digits
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                disabled={sandboxLoading}
                value={sandboxInput2}
                onChange={handleInput2Change}
                onBlur={() => {
                  setHasInteracted(true);
                  validate();
                }}
                placeholder={isWallet ? "••••" : "•••"}
                className={`w-full px-3.5 py-3 rounded-xl bg-gray-50 dark:bg-neutral-800 border text-sm text-neutral-900 dark:text-white font-mono tracking-widest focus:outline-none transition-all ${
                  errors.input2
                    ? "border-red-500 bg-red-50/10 ring-1 ring-red-500/40"
                    : isWallet && /^[0-9]{4}$/.test(sandboxInput2)
                    ? "border-emerald-500/70 ring-1 ring-emerald-500/30"
                    : "border-gray-300 dark:border-neutral-700 focus:border-amber-400"
                }`}
              />
              {isWallet && /^[0-9]{4}$/.test(sandboxInput2) && (
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-emerald-400 text-sm">
                  <FaCheckCircle />
                </div>
              )}
            </div>

            {errors.input2 && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 font-medium flex items-center gap-1 animate-fade-in m-0">
                <LuCircleAlert className="w-3.5 h-3.5 shrink-0" />
                {errors.input2}
              </p>
            )}
          </div>

          {/* Demo Testing Hint Box */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-neutral-600 dark:text-neutral-300 flex items-start gap-2">
            <span className="text-amber-500 text-xs mt-0.5">💡</span>
            <div>
              <strong className="text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider block">
                Sandbox Demo Credentials:
              </strong>
              {isWallet ? (
                <span>Any valid <strong>03XXXXXXXXX</strong> number with 4-digit MPIN (e.g. <strong>1122</strong>).</span>
              ) : (
                <span>Any 16-digit card number with 3-digit CVV (e.g. <strong>123</strong>).</span>
              )}
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="button"
            onClick={onSubmit}
            disabled={sandboxLoading || !isFormValid}
            className={`w-full py-4 rounded-2xl font-['Oswald',sans-serif] font-black uppercase text-sm tracking-wider shadow-md transition-all flex items-center justify-center gap-2 border-none ${
              !isFormValid || sandboxLoading
                ? "bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60 border border-white/5"
                : "bg-amber-400 hover:bg-amber-500 active:scale-[0.98] text-neutral-950 shadow-amber-400/25 cursor-pointer"
            }`}
          >
            {sandboxLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                <span>Verifying with {methodTitle}...</span>
              </>
            ) : !isFormValid ? (
              <span>Complete Required Fields to Pay</span>
            ) : (
              <span>Pay & Authorize Rs {Number(total).toLocaleString()}</span>
            )}
          </button>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
          <LuShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>Simulated 256-bit TLS Gateway Sandbox Encryption</span>
        </div>
      </div>
    </div>
  );
}
