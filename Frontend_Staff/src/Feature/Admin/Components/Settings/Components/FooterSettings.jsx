import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaSave } from "react-icons/fa";

const FooterSettings = () => {
  const [settings, setSettings] = useState({
    footer_tagline: "",
    footer_facebook: "",
    footer_twitter: "",
    footer_instagram: "",
    footer_youtube: "",
    footer_phone: "",
    footer_email: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_settings.php`);
        const result = await response.json();

        if (result.success) {
          setSettings({
            footer_tagline: result.data.footer_tagline || "",
            footer_facebook: result.data.footer_facebook || "",
            footer_twitter: result.data.footer_twitter || "",
            footer_instagram: result.data.footer_instagram || "",
            footer_youtube: result.data.footer_youtube || "",
            footer_phone: result.data.footer_phone || "",
            footer_email: result.data.footer_email || ""
          });
        }
      } catch (error) {
        console.error("Failed to load footer settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    let newErrors = {};
    
    // Email Validation
    if (settings.footer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.footer_email)) {
      newErrors.footer_email = "Please enter a valid email address.";
    }

    // Phone Validation (Allows numbers, spaces, plus, dashes)
    if (settings.footer_phone && !/^[\d\s\+\-\(\)]+$/.test(settings.footer_phone)) {
      newErrors.footer_phone = "Please enter a valid phone number.";
    }

    // URL Validation (must start with http:// or https:// if provided)
    const urlRegex = /^https?:\/\/.+/;
    if (settings.footer_facebook && !urlRegex.test(settings.footer_facebook)) {
      newErrors.footer_facebook = "Must be a valid URL (e.g. https://...).";
    }
    if (settings.footer_twitter && !urlRegex.test(settings.footer_twitter)) {
      newErrors.footer_twitter = "Must be a valid URL (e.g. https://...).";
    }
    if (settings.footer_instagram && !urlRegex.test(settings.footer_instagram)) {
      newErrors.footer_instagram = "Must be a valid URL (e.g. https://...).";
    }
    if (settings.footer_youtube && !urlRegex.test(settings.footer_youtube)) {
      newErrors.footer_youtube = "Must be a valid URL (e.g. https://...).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Swal.fire("Validation Error", "Please fix the errors in the form before saving.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/update_settings.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Footer Settings Saved!",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire("Error", result.message, "error");
      }
    } catch (error) {
      console.error("Failed to save footer settings:", error);
      Swal.fire("Error", "Could not connect to server.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="loading-state-text">Loading Settings...</div>;
  }

  return (
    <div className="settings-card fade-in">
      <div className="settings-header-flex">
        <div className="settings-title-left">
          Footer Settings
        </div>

        <button 
          className="btn-save-modal-clean btn-auto-width" 
          onClick={handleSave}
          disabled={isSaving}
        >
          <FaSave className="btn-save-icon" />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="settings-form-grid">
        <div className="settings-input-group" style={{ gridColumn: "1 / -1" }}>
          <label className="settings-label">Footer Tagline</label>
          <textarea
            className="settings-input"
            name="footer_tagline"
            value={settings.footer_tagline}
            onChange={handleChange}
            placeholder="E.g. Fresh Food, Delivered Hot & Fast..."
            rows="3"
            style={{ resize: "vertical" }}
          ></textarea>
        </div>

        <div className="settings-input-group">
          <label className="settings-label">Contact Phone</label>
          <input
            type="text"
            className={`settings-input ${errors.footer_phone ? "border-red-500" : ""}`}
            style={errors.footer_phone ? { borderColor: "#ef4444" } : {}}
            name="footer_phone"
            value={settings.footer_phone}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9\+\-\s\(\)]/g, "");
              handleChange({ target: { name: "footer_phone", value: val } });
            }}
            placeholder="+1 234 567 8900"
          />
          {errors.footer_phone && <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px", display: "inline-block" }}>{errors.footer_phone}</span>}
        </div>

        <div className="settings-input-group">
          <label className="settings-label">Contact Email</label>
          <input
            type="email"
            className={`settings-input ${errors.footer_email ? "border-red-500" : ""}`}
            style={errors.footer_email ? { borderColor: "#ef4444" } : {}}
            name="footer_email"
            value={settings.footer_email}
            onChange={handleChange}
            placeholder="support@bigbite.com"
          />
          {errors.footer_email && <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px", display: "inline-block" }}>{errors.footer_email}</span>}
        </div>

        <div className="settings-input-group">
          <label className="settings-label">Facebook URL</label>
          <input
            type="text"
            className={`settings-input ${errors.footer_facebook ? "border-red-500" : ""}`}
            style={errors.footer_facebook ? { borderColor: "#ef4444" } : {}}
            name="footer_facebook"
            value={settings.footer_facebook}
            onChange={handleChange}
            placeholder="https://facebook.com/..."
          />
          {errors.footer_facebook && <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px", display: "inline-block" }}>{errors.footer_facebook}</span>}
        </div>

        <div className="settings-input-group">
          <label className="settings-label">Twitter URL</label>
          <input
            type="text"
            className={`settings-input ${errors.footer_twitter ? "border-red-500" : ""}`}
            style={errors.footer_twitter ? { borderColor: "#ef4444" } : {}}
            name="footer_twitter"
            value={settings.footer_twitter}
            onChange={handleChange}
            placeholder="https://twitter.com/..."
          />
          {errors.footer_twitter && <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px", display: "inline-block" }}>{errors.footer_twitter}</span>}
        </div>

        <div className="settings-input-group">
          <label className="settings-label">Instagram URL</label>
          <input
            type="text"
            className={`settings-input ${errors.footer_instagram ? "border-red-500" : ""}`}
            style={errors.footer_instagram ? { borderColor: "#ef4444" } : {}}
            name="footer_instagram"
            value={settings.footer_instagram}
            onChange={handleChange}
            placeholder="https://instagram.com/..."
          />
          {errors.footer_instagram && <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px", display: "inline-block" }}>{errors.footer_instagram}</span>}
        </div>

        <div className="settings-input-group">
          <label className="settings-label">YouTube URL</label>
          <input
            type="text"
            className={`settings-input ${errors.footer_youtube ? "border-red-500" : ""}`}
            style={errors.footer_youtube ? { borderColor: "#ef4444" } : {}}
            name="footer_youtube"
            value={settings.footer_youtube}
            onChange={handleChange}
            placeholder="https://youtube.com/..."
          />
          {errors.footer_youtube && <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px", display: "inline-block" }}>{errors.footer_youtube}</span>}
        </div>
      </div>
    </div>
  );
};

export default FooterSettings;
