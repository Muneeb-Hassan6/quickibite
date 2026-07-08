import React, { useState, useEffect } from "react";
import { FaMotorcycle, FaSave } from "react-icons/fa";
import Swal from "sweetalert2";

const OperationalSettings = () => {
  // 1. State for Operational Settings
  const [settings, setSettings] = useState({
    accept_orders: true, // Boolean for toggle
    min_order: "",
    delivery_radius: "",
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
            // Agar database mein "true" string hai toh boolean true banayen
            accept_orders: result.data.accept_orders === "true",
            min_order: result.data.min_order || "0",
            delivery_radius: result.data.delivery_radius || "0",
          });
        }
      } catch (error) {
        console.error("Failed to load operational settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

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
    return <div style={{ padding: "20px" }}>Loading Operations...</div>;

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
          <FaMotorcycle /> Operations & Delivery
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
            background: "#0bf5bb",
          }}
        >
          <FaSave style={{ marginRight: "5px" }} />{" "}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="toggles-container" style={{ marginBottom: "20px" }}>
        <div className="toggle-control-group">
          <div className="toggle-text-area">
            <h4>Accept New Orders</h4>
            <p>Turn off to pause incoming orders temporarily.</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              name="accept_orders"
              checked={settings.accept_orders}
              onChange={handleToggle}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-form-grid">
        <div className="settings-input-group">
          <label className="settings-label">Minimum Order Amount (Rs)</label>
          <input
            type="number"
            name="min_order"
            className="settings-input"
            value={settings.min_order}
            onChange={handleChange}
          />
        </div>
        <div className="settings-input-group">
          <label className="settings-label">Delivery Radius (KM)</label>
          <input
            type="number"
            name="delivery_radius"
            className="settings-input"
            value={settings.delivery_radius}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default OperationalSettings;
