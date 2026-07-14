import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FaMotorcycle, FaSave } from "react-icons/fa";
import Swal from "sweetalert2";

const OperationalSettings = () => {
  const queryClient = useQueryClient();
  // 1. State for Operational Settings
  const [settings, setSettings] = useState({
    accept_orders: true, // Boolean for toggle
    min_order: "",
    delivery_radius: "",
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

  // 2. Map Data to State
  useEffect(() => {
    if (settingsData && Object.keys(settingsData).length > 0) {
      setSettings({
        accept_orders: settingsData.accept_orders === "true",
        min_order: settingsData.min_order || "0",
        delivery_radius: settingsData.delivery_radius || "0",
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

  // 5. Save Settings to Database
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/update_settings.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accept_orders: settings.accept_orders ? "true" : "false", // Boolean se wapis string
            min_order: settings.min_order,
            delivery_radius: settings.delivery_radius,
          }),
        },
      );

      const result = await response.json();
      if (result.success) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Operations Updated!",
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
    return <div className="p-[1.25rem] text-[var(--admin-muted)]">Loading Operations...</div>;

  return (
    <div className="bg-[var(--admin-panel)] border border-[var(--admin-border)] rounded-[1rem] p-[1.875rem] shadow-[0_4px_10px_rgba(0,0,0,0.1)] animate-slide-up">
      <div className="flex justify-between items-center mb-[1.563rem] pb-[0.938rem] border-b border-[var(--admin-border)]">
        <div className="flex items-center gap-[0.75rem] text-[1.125rem] font-bold text-white">
          <FaMotorcycle className="text-[var(--admin-orange)] bg-[rgba(239,68,68,0.1)] p-[0.5rem] rounded-[0.5rem] text-[2rem]" /> Operations & Delivery
        </div>

        {/* 🔥 SAVE BUTTON */}
        <button
          className="bg-[#0bf5bb] text-black border-none p-[0.5rem_0.938rem] rounded-[0.5rem] cursor-pointer font-bold shadow-[0_4px_15px_rgba(11,245,187,0.4)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(11,245,187,0.6)] flex items-center w-auto m-0"
          onClick={handleSave}
          disabled={isSaving}
        >
          <FaSave className="mr-[0.313rem]" />{" "}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex flex-col gap-[0.938rem] mb-[1.25rem]">
        <div className="flex items-center justify-between p-[1.25rem] bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-[0.75rem] transition-colors duration-300 hover:border-[var(--admin-orange)]">
          <div>
            <h4 className="m-0 text-[0.938rem] font-bold text-[var(--admin-text)]">Accept New Orders</h4>
            <p className="m-0 mt-[0.313rem] text-[0.813rem] text-[var(--admin-muted)]">Turn off to pause incoming orders temporarily.</p>
          </div>
          <label className="relative inline-block w-[3.25rem] h-[1.75rem]">
            <input
              type="checkbox"
              name="accept_orders"
              checked={settings.accept_orders}
              onChange={handleToggle}
              className="opacity-0 w-0 h-0 peer"
            />
            <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[var(--admin-border)] transition-all duration-400 rounded-[2.125rem] before:absolute before:content-[''] before:h-[1.25rem] before:w-[1.25rem] before:left-[0.25rem] before:bottom-[0.25rem] before:bg-white before:transition-all before:duration-400 before:rounded-full before:shadow-[0_2px_5px_rgba(0,0,0,0.2)] peer-checked:bg-[var(--admin-orange)] peer-checked:before:translate-x-[1.5rem]"></span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1.25rem]">
        <div className="mb-[0.938rem]">
          <label className="block text-[0.75rem] font-bold mb-[0.5rem] text-[var(--admin-muted)] uppercase tracking-[0.5px]">Minimum Order Amount (Rs)</label>
          <input
            type="number"
            name="min_order"
            className="w-full p-[0.875rem_0.938rem] bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-[0.625rem] text-[var(--admin-text)] text-[0.875rem] font-medium outline-none transition-all duration-300 focus:border-[var(--admin-orange)] focus:shadow-[var(--shadow-glow)]"
            value={settings.min_order}
            onChange={handleChange}
          />
        </div>
        <div className="mb-[0.938rem]">
          <label className="block text-[0.75rem] font-bold mb-[0.5rem] text-[var(--admin-muted)] uppercase tracking-[0.5px]">Delivery Radius (KM)</label>
          <input
            type="number"
            name="delivery_radius"
            className="w-full p-[0.875rem_0.938rem] bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-[0.625rem] text-[var(--admin-text)] text-[0.875rem] font-medium outline-none transition-all duration-300 focus:border-[var(--admin-orange)] focus:shadow-[var(--shadow-glow)]"
            value={settings.delivery_radius}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default OperationalSettings;
