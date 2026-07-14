import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FaBell, FaSave } from "react-icons/fa";
import Swal from "sweetalert2";

const NotificationSettings = () => {
  const queryClient = useQueryClient();
  // 1. State for Notification Settings
  const [settings, setSettings] = useState({
    sound_alert: true,
    email_notif: false,
    stock_alerts: true,
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
        sound_alert: settingsData.sound_alert === "true",
        email_notif: settingsData.email_notif === "true",
        stock_alerts: settingsData.stock_alerts === "true",
      });
    }
  }, [settingsData]);

  // 3. Handle Toggle (Checkbox)
  const handleToggle = (e) => {
    const { name, checked } = e.target;
    setSettings((prev) => ({ ...prev, [name]: checked }));
  };

  // 4. Save Settings to Database
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/update_settings.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sound_alert: settings.sound_alert ? "true" : "false",
            email_notif: settings.email_notif ? "true" : "false",
            stock_alerts: settings.stock_alerts ? "true" : "false",
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Notifications Updated!",
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
    return <div className="p-[1.25rem] text-[var(--admin-muted)]">Loading Notifications...</div>;

  return (
    <div className="bg-[var(--admin-panel)] border border-[var(--admin-border)] rounded-[1rem] p-[1.875rem] shadow-[0_4px_10px_rgba(0,0,0,0.1)] animate-slide-up">
      <div className="flex justify-between items-center mb-[1.563rem] pb-[0.938rem] border-b border-[var(--admin-border)]">
        <div className="flex items-center gap-[0.75rem] text-[1.125rem] font-bold text-white">
          <FaBell className="text-[var(--admin-orange)] bg-[rgba(239,68,68,0.1)] p-[0.5rem] rounded-[0.5rem] text-[2rem]" /> Notifications & Alerts
        </div>

        {/* 🔥 SAVE BUTTON */}
        <button
          className="bg-[#3b82f6] text-white border-none p-[0.5rem_0.938rem] rounded-[0.5rem] cursor-pointer font-bold shadow-[0_4px_15px_rgba(59,130,246,0.4)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(59,130,246,0.6)] flex items-center w-auto m-0"
          onClick={handleSave}
          disabled={isSaving}
        >
          <FaSave className="mr-[0.313rem]" />{" "}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex flex-col gap-[0.938rem]">
        <div className="flex items-center justify-between p-[1.25rem] bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-[0.75rem] transition-colors duration-300 hover:border-[var(--admin-orange)]">
          <div>
            <h4 className="m-0 text-[0.938rem] font-bold text-[var(--admin-text)]">Dashboard Sound Alerts</h4>
            <p className="m-0 mt-[0.313rem] text-[0.813rem] text-[var(--admin-muted)]">Play a sound when a new order arrives.</p>
          </div>
          <label className="relative inline-block w-[3.25rem] h-[1.75rem]">
            <input
              type="checkbox"
              name="sound_alert"
              checked={settings.sound_alert}
              onChange={handleToggle}
              className="opacity-0 w-0 h-0 peer"
            />
            <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[var(--admin-border)] transition-all duration-400 rounded-[2.125rem] before:absolute before:content-[''] before:h-[1.25rem] before:w-[1.25rem] before:left-[0.25rem] before:bottom-[0.25rem] before:bg-white before:transition-all before:duration-400 before:rounded-full before:shadow-[0_2px_5px_rgba(0,0,0,0.2)] peer-checked:bg-[var(--admin-orange)] peer-checked:before:translate-x-[1.5rem]"></span>
          </label>
        </div>

        <div className="flex items-center justify-between p-[1.25rem] bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-[0.75rem] transition-colors duration-300 hover:border-[var(--admin-orange)]">
          <div>
            <h4 className="m-0 text-[0.938rem] font-bold text-[var(--admin-text)]">Email Receipts</h4>
            <p className="m-0 mt-[0.313rem] text-[0.813rem] text-[var(--admin-muted)]">Automatically send receipts to customers via email.</p>
          </div>
          <label className="relative inline-block w-[3.25rem] h-[1.75rem]">
            <input
              type="checkbox"
              name="email_notif"
              checked={settings.email_notif}
              onChange={handleToggle}
              className="opacity-0 w-0 h-0 peer"
            />
            <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[var(--admin-border)] transition-all duration-400 rounded-[2.125rem] before:absolute before:content-[''] before:h-[1.25rem] before:w-[1.25rem] before:left-[0.25rem] before:bottom-[0.25rem] before:bg-white before:transition-all before:duration-400 before:rounded-full before:shadow-[0_2px_5px_rgba(0,0,0,0.2)] peer-checked:bg-[var(--admin-orange)] peer-checked:before:translate-x-[1.5rem]"></span>
          </label>
        </div>

        <div className="flex items-center justify-between p-[1.25rem] bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-[0.75rem] transition-colors duration-300 hover:border-[var(--admin-orange)]">
          <div>
            <h4 className="m-0 text-[0.938rem] font-bold text-[var(--admin-text)]">Low Stock Warnings</h4>
            <p className="m-0 mt-[0.313rem] text-[0.813rem] text-[var(--admin-muted)]">Get notified when inventory items are running low.</p>
          </div>
          <label className="relative inline-block w-[3.25rem] h-[1.75rem]">
            <input
              type="checkbox"
              name="stock_alerts"
              checked={settings.stock_alerts}
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

export default NotificationSettings;
