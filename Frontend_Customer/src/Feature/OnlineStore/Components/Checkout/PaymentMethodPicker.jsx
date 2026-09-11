import React from "react";
import {
  LuBanknote,
  LuSmartphone,
  LuCreditCard,
  LuCheck,
} from "react-icons/lu";

export default function PaymentMethodPicker({
  paymentMethod = "Cash on Delivery",
  setPaymentMethod,
}) {
  const methods = [
    {
      id: "Cash on Delivery",
      name: "Cash on Delivery",
      desc: "Pay in cash when rider arrives at your doorstep",
      icon: <LuBanknote className="w-5 h-5 text-emerald-500" />,
    },
    {
      id: "JazzCash",
      name: "JazzCash (Sandbox)",
      desc: "Instant digital payment with JazzCash mobile wallet",
      icon: <LuSmartphone className="w-5 h-5 text-red-500" />,
    },
    {
      id: "EasyPaisa",
      name: "EasyPaisa (Sandbox)",
      desc: "Direct payment with EasyPaisa mobile account",
      icon: <LuSmartphone className="w-5 h-5 text-emerald-500" />,
    },
    {
      id: "Credit / Debit Card",
      name: "Debit / Credit Card (Sandbox)",
      desc: "Visa / Mastercard 256-bit encrypted transaction",
      icon: <LuCreditCard className="w-5 h-5 text-blue-500" />,
    },
  ];

  return (
    <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
      <h3 className="font-['Oswald',sans-serif] font-bold text-lg uppercase tracking-wide text-neutral-900 dark:text-white m-0 flex items-center gap-2">
        <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
        4. Select Payment Method
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {methods.map((pm) => (
          <div
            key={pm.id}
            onClick={() => setPaymentMethod(pm.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
              paymentMethod === pm.id
                ? "bg-amber-400/10 dark:bg-amber-400/15 border-amber-500 ring-2 ring-amber-400/30"
                : "bg-gray-50 dark:bg-neutral-800/60 border-gray-200 dark:border-neutral-800 hover:border-amber-400"
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-neutral-800 flex items-center justify-center shrink-0 shadow-xs">
              {pm.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-['Oswald',sans-serif] font-bold text-sm uppercase text-neutral-900 dark:text-white">
                  {pm.name}
                </span>
                {paymentMethod === pm.id && (
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center">
                    <LuCheck className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed m-0">
                {pm.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
