import React, { useState, useEffect } from "react";
import { FaBell, FaSave } from "react-icons/fa";
import Swal from "sweetalert2";

const NotificationSettings = () => {
  // 1. State for Notification Settings
  const [settings, setSettings] = useState({
    sound_alert: true,
    email_notif: false,
    stock_alerts: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 2. Fetch Data from Database
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/get_settings.php`,
        );
        const result = await response.json();

        if (result.success) {
          setSettings({
            sound_alert: result.data.sound_alert === "true",
            email_notif: result.data.email_notif === "true",
            stock_alerts: result.data.stock_alerts === "true",
          });
        }
      } catch (error) {
        console.error("Failed to load notification settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

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
    return <div style={{ padding: "20px" }}>Loading Notifications...</div>;

  return (
    <div className="settings-card">
      <div
        className="settings-section-title"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <FaBell /> Notifications & Alerts
        </div>

        {/* 🔥 SAVE BUTTON */}
        <button
          className="btn-save-modal-clean"
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: "8px 15px",
            margin: 0,
            width: "auto",
            background: "#3b82f6",
          }}
        >
          <FaSave style={{ marginRight: "5px" }} />{" "}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="toggles-container">
        <div className="toggle-control-group">
          <div className="toggle-text-area">
            <h4>Dashboard Sound Alerts</h4>
            <p>Play a sound when a new order arrives.</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              name="sound_alert"
              checked={settings.sound_alert}
              onChange={handleToggle}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="toggle-control-group">
          <div className="toggle-text-area">
            <h4>Email Receipts</h4>
            <p>Automatically send receipts to customers via email.</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              name="email_notif"
              checked={settings.email_notif}
              onChange={handleToggle}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="toggle-control-group">
          <div className="toggle-text-area">
            <h4>Low Stock Warnings</h4>
            <p>Get notified when inventory items are running low.</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              name="stock_alerts"
              checked={settings.stock_alerts}
              onChange={handleToggle}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
