import React, { useState, useEffect } from "react";
import { FaDollarSign, FaSave } from "react-icons/fa";
import Swal from "sweetalert2";

const FinancialSettings = () => {
  // 1. State for Financial Settings
  const [settings, setSettings] = useState({
    tax_rate: "",
    delivery_fee: "",
    accept_cards: false, // Yeh boolean (true/false) hoga
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 2. Fetch Data
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/get_settings.php`,
        );
        const result = await response.json();

        if (result.success) {
          setSettings({
            tax_rate: result.data.tax_rate || "0",
            delivery_fee: result.data.delivery_fee || "0",
            accept_cards: result.data.accept_cards === "true", // String ko Boolean me convert kiya
          });
        }
      } catch (error) {
        console.error("Failed to load financial settings:", error);
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
    return <div style={{ padding: "20px" }}>Loading Financials...</div>;

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
          <FaDollarSign /> Financial & Payments
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
            background: "#10b981",
          }}
        >
          <FaSave style={{ marginRight: "5px" }} />{" "}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="settings-form-grid" style={{ marginBottom: "20px" }}>
        <div className="settings-input-group">
          <label className="settings-label">Tax / GST Rate (%)</label>
          <input
            type="number"
            name="tax_rate"
            className="settings-input"
            value={settings.tax_rate}
            onChange={handleChange}
          />
        </div>
        <div className="settings-input-group">
          <label className="settings-label">Standard Delivery Fee (Rs)</label>
          <input
            type="number"
            name="delivery_fee"
            className="settings-input"
            value={settings.delivery_fee}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="toggles-container">
        <div className="toggle-control-group">
          <div className="toggle-text-area">
            <h4>Accept Credit/Debit Cards</h4>
            <p>Enable online card payments via POS terminal.</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              name="accept_cards"
              checked={settings.accept_cards}
              onChange={handleToggle}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default FinancialSettings;
