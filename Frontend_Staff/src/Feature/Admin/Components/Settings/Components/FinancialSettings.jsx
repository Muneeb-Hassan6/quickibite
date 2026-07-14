import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FaDollarSign, FaSave } from "react-icons/fa";
import Swal from "sweetalert2";

const FinancialSettings = () => {
  const queryClient = useQueryClient();
  // 1. State for Financial Settings
  const [settings, setSettings] = useState({
    tax_rate: "",
    delivery_fee: "",
    accept_cards: false, // Yeh boolean (true/false) hoga
  });
  const [isSaving, setIsSaving] = useState(false);

  const { data: settingsData = {}, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_settings.php`);
      const result = await response.json();
      return result.success ? result.data : {};
    }
  });

  // 2. Fetch Data
  useEffect(() => {
    if (settingsData && Object.keys(settingsData).length > 0) {
      setSettings({
        tax_rate: settingsData.tax_rate || "0",
        delivery_fee: settingsData.delivery_fee || "0",
        accept_cards: settingsData.accept_cards === "true", // String ko Boolean me convert kiya
      });
    }
  }, [settingsData]);

  // 3. Handle Inputs (Number fields)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  // 4. Handle Toggle (Checkbox)
  const handleToggle = (e) => {
    const { name, checked } = e.target;
    setSettings((prev) => ({ ...prev, [name]: checked }));
  };

  // 5. Save to Database
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/update_settings.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tax_rate: settings.tax_rate,
            delivery_fee: settings.delivery_fee,
            accept_cards: settings.accept_cards ? "true" : "false", // Boolean ko wapis string banaya DB ke liye
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Financials Updated!",
          showConfirmButton: false,
          timer: 1500,
        });
        queryClient.invalidateQueries({ queryKey: ['settings'] });
      } else {
        Swal.fire("Error", result.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Network Connection Failed", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return <div className="p-[1.25rem] text-[var(--admin-muted)]">Loading Financials...</div>;

  return (
    <div className="bg-[var(--admin-panel)] border border-[var(--admin-border)] rounded-[1rem] p-[1.875rem] shadow-[0_4px_10px_rgba(0,0,0,0.1)] animate-slide-up">
      <div className="flex justify-between items-center mb-[1.563rem] pb-[0.938rem] border-b border-[var(--admin-border)]">
        <div className="flex items-center gap-[0.75rem] text-[1.125rem] font-bold text-white">
          <FaDollarSign className="text-[var(--admin-orange)] bg-[rgba(239,68,68,0.1)] p-[0.5rem] rounded-[0.5rem] text-[2rem]" /> Financial & Payments
        </div>

        {/* 🔥 SAVE BUTTON */}
        <button
          className="bg-[#10b981] text-white border-none p-[0.5rem_0.938rem] rounded-[0.5rem] cursor-pointer font-bold shadow-[0_4px_15px_rgba(16,185,129,0.4)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(16,185,129,0.6)] flex items-center w-auto m-0"
          onClick={handleSave}
          disabled={isSaving}
        >
          <FaSave className="mr-[0.313rem]" />{" "}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1.25rem] mb-[1.25rem]">
        <div className="mb-[0.938rem]">
          <label className="block text-[0.75rem] font-bold mb-[0.5rem] text-[var(--admin-muted)] uppercase tracking-[0.5px]">Tax / GST Rate (%)</label>
          <input
            type="number"
            name="tax_rate"
            className="w-full p-[0.875rem_0.938rem] bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-[0.625rem] text-[var(--admin-text)] text-[0.875rem] font-medium outline-none transition-all duration-300 focus:border-[var(--admin-orange)] focus:shadow-[var(--shadow-glow)]"
            value={settings.tax_rate}
            onChange={handleChange}
          />
        </div>
        <div className="mb-[0.938rem]">
          <label className="block text-[0.75rem] font-bold mb-[0.5rem] text-[var(--admin-muted)] uppercase tracking-[0.5px]">Standard Delivery Fee (Rs)</label>
          <input
            type="number"
            name="delivery_fee"
            className="w-full p-[0.875rem_0.938rem] bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-[0.625rem] text-[var(--admin-text)] text-[0.875rem] font-medium outline-none transition-all duration-300 focus:border-[var(--admin-orange)] focus:shadow-[var(--shadow-glow)]"
            value={settings.delivery_fee}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex flex-col gap-[0.938rem]">
        <div className="flex items-center justify-between p-[1.25rem] bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-[0.75rem] transition-colors duration-300 hover:border-[var(--admin-orange)]">
          <div>
            <h4 className="m-0 text-[0.938rem] font-bold text-[var(--admin-text)]">Accept Credit/Debit Cards</h4>
            <p className="m-0 mt-[0.313rem] text-[0.813rem] text-[var(--admin-muted)]">Enable online card payments via POS terminal.</p>
          </div>
          <label className="relative inline-block w-[3.25rem] h-[1.75rem]">
            <input
              type="checkbox"
              name="accept_cards"
              checked={settings.accept_cards}
              onChange={handleToggle}
              className="opacity-0 w-0 h-0 peer"
            />
            <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[var(--admin-border)] transition-all duration-400 rounded-[2.125rem] before:absolute before:content-[''] before:h-[1.25rem] before:w-[1.25rem] before:left-[0.25rem] before:bottom-[0.25rem] before:bg-white before:transition-all before:duration-400 before:rounded-full before:shadow-[0_2px_5px_rgba(0,0,0,0.2)] peer-checked:bg-[var(--admin-orange)] peer-checked:before:translate-x-[1.5rem]"></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default FinancialSettings;
