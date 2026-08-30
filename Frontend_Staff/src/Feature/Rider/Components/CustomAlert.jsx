import React from "react";
import {
  FaInfoCircle,
  FaExclamationTriangle,
  FaTimesCircle,
} from "react-icons/fa";

export default function CustomAlert({
  isOpen,
  message,
  onClose,
  type = "info",
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    if (type === "warning") return <FaExclamationTriangle className="text-amber-500 text-2xl" />;
    if (type === "danger") return <FaTimesCircle className="text-red-500 text-2xl" />;
    return <FaInfoCircle className="text-blue-500 text-2xl" />;
  };

  const getTitle = () => {
    if (type === "warning") return "Attention!";
    if (type === "danger") return "Error!";
    return "Notification";
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex justify-center items-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 p-6 sm:p-7 rounded-3xl w-full max-w-sm text-center text-stone-900 dark:text-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-full flex justify-center items-center mx-auto mb-4 bg-stone-100 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 shadow-xs">
          {getIcon()}
        </div>

        <h3 className="m-0 mb-2 text-lg font-bold font-['Oswald',sans-serif] uppercase tracking-wide">
          {getTitle()}
        </h3>

        <p className="text-stone-600 dark:text-neutral-400 mb-5 leading-relaxed text-xs sm:text-sm">
          {message}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] bg-amber-500 hover:bg-amber-600 active:scale-95 text-neutral-950 border-none py-2.5 px-6 rounded-xl font-bold text-xs uppercase font-['Oswald',sans-serif] tracking-wider w-full cursor-pointer shadow-md transition-all"
        >
          Okay, Got It
        </button>
      </div>
    </div>
  );
}