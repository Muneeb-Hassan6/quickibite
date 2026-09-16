import React, { useState, useEffect } from "react";
import { FaDownload, FaTimes, FaDesktop } from "react-icons/fa";

export default function StaffPWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    ) {
      setIsStandalone(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = sessionStorage.getItem("staff_pwa_dismissed");
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      console.log("QuickiBite Staff POS App Installed!");
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("staff_pwa_dismissed", "true");
  };

  if (isStandalone || !isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-down">
      <div className="bg-slate-900/95 border border-slate-700 backdrop-blur-md text-white rounded-xl px-4 py-2.5 shadow-2xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <FaDesktop className="text-sm" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-200">Install POS Desktop/Tablet App</p>
          <p className="text-[10px] text-slate-400">Launch fullscreen without browser bar</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstall}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <FaDownload className="text-[10px]" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
}
