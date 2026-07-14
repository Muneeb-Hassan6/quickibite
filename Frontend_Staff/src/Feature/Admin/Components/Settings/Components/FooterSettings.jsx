import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { FaSave } from "react-icons/fa";

const FooterSettings = () => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    footer_tagline: "",
    footer_facebook: "",
    footer_twitter: "",
    footer_instagram: "",
    footer_youtube: "",
    footer_phone: "",
    footer_email: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const { data: settingsData = {}, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_settings.php`);
      const result = await response.json();
      return result.success ? result.data : {};
    }
  });

  useEffect(() => {
    if (settingsData && Object.keys(settingsData).length > 0) {
      setSettings({
        footer_tagline: settingsData.footer_tagline || "",
        footer_facebook: settingsData.footer_facebook || "",
        footer_twitter: settingsData.footer_twitter || "",
        footer_instagram: settingsData.footer_instagram || "",
        footer_youtube: settingsData.footer_youtube || "",
        footer_phone: settingsData.footer_phone || "",
        footer_email: settingsData.footer_email || ""
      });
    }
  }, [settingsData]);

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
        queryClient.invalidateQueries({ queryKey: ['settings'] });
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
    <div className="bg-[var(--admin-panel)] rounded-[1rem] p-[1.875rem] shadow-[0_4px_10px_rgba(0,0,0,0.1)] animate-slide-up">
      <div className="flex justify-between items-center mb-[1.563rem] pb-[0.938rem] border-b border-[var(--admin-border)]">
        <div className="flex items-center gap-[0.75rem] text-[1.125rem] font-bold text-[var(--admin-text)]">
          Footer Settings
        </div>

        <button 
          className="bg-[var(--admin-orange)] text-white border-none p-[0.75rem_1.25rem] rounded-[0.5rem] cursor-pointer font-bold shadow-[var(--shadow-glow)] transition-all duration-200 hover:-translate-y-[2px] flex items-center w-auto m-0"
          onClick={handleSave}
          disabled={isSaving}
        >
          <FaSave className="mr-[0.5rem]" />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1.25rem]">
        <div className="sm:col-span-2">
          <label className="block text-[0.75rem] font-bold mb-[0.5rem] text-[var(--admin-muted)] uppercase tracking-[0.5px]">Footer Tagline</label>
          <textarea
            className="w-full p-[0.875rem_0.938rem] bg-[var(--admin-bg)] rounded-[0.625rem] text-[var(--admin-text)] text-[0.875rem] font-medium outline-none transition-all duration-300 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
            name="footer_tagline"
            value={settings.footer_tagline}
            onChange={handleChange}
            placeholder="E.g. Fresh Food, Delivered Hot & Fast..."
            rows="3"
            style={{ resize: "vertical" }}
          ></textarea>
        </div>

        <div>
          <label className="block text-[0.75rem] font-bold mb-[0.5rem] text-[var(--admin-muted)] uppercase tracking-[0.5px]">Contact Phone</label>
          <input
            type="text"
            className={`w-full p-[0.875rem_0.938rem] bg-[var(--admin-bg)] rounded-[0.625rem] text-[var(--admin-text)] text-[0.875rem] font-medium outline-none transition-all duration-300 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)] ${errors.footer_phone ? "border border-red-500" : ""}`}
            name="footer_phone"
            value={settings.footer_phone}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9\+\-\s\(\)]/g, "");
              handleChange({ target: { name: "footer_phone", value: val } });
            }}
            placeholder="+1 234 567 8900"
          />
          {errors.footer_phone && <span className="text-[#ef4444] text-[0.75rem] mt-[0.313rem] inline-block">{errors.footer_phone}</span>}
        </div>

        <div>
          <label className="block text-[0.75rem] font-bold mb-[0.5rem] text-[var(--admin-muted)] uppercase tracking-[0.5px]">Contact Email</label>
          <input
            type="email"
            className={`w-full p-[0.875rem_0.938rem] bg-[var(--admin-bg)] rounded-[0.625rem] text-[var(--admin-text)] text-[0.875rem] font-medium outline-none transition-all duration-300 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)] ${errors.footer_email ? "border border-red-500" : ""}`}
            name="footer_email"
            value={settings.footer_email}
            onChange={handleChange}
            placeholder="support@bigbite.com"
          />
          {errors.footer_email && <span className="text-[#ef4444] text-[0.75rem] mt-[0.313rem] inline-block">{errors.footer_email}</span>}
        </div>

        <div>
          <label className="block text-[0.75rem] font-bold mb-[0.5rem] text-[var(--admin-muted)] uppercase tracking-[0.5px]">Facebook URL</label>
          <input
            type="text"
            className={`w-full p-[0.875rem_0.938rem] bg-[var(--admin-bg)] rounded-[0.625rem] text-[var(--admin-text)] text-[0.875rem] font-medium outline-none transition-all duration-300 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)] ${errors.footer_facebook ? "border border-red-500" : ""}`}
            name="footer_facebook"
            value={settings.footer_facebook}
            onChange={handleChange}
            placeholder="https://facebook.com/..."
          />
          {errors.footer_facebook && <span className="text-[#ef4444] text-[0.75rem] mt-[0.313rem] inline-block">{errors.footer_facebook}</span>}
        </div>

        <div>
          <label className="block text-[0.75rem] font-bold mb-[0.5rem] text-[var(--admin-muted)] uppercase tracking-[0.5px]">Twitter URL</label>
          <input
            type="text"
            className={`w-full p-[0.875rem_0.938rem] bg-[var(--admin-bg)] rounded-[0.625rem] text-[var(--admin-text)] text-[0.875rem] font-medium outline-none transition-all duration-300 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)] ${errors.footer_twitter ? "border border-red-500" : ""}`}
            name="footer_twitter"
            value={settings.footer_twitter}
            onChange={handleChange}
            placeholder="https://twitter.com/..."
          />
          {errors.footer_twitter && <span className="text-[#ef4444] text-[0.75rem] mt-[0.313rem] inline-block">{errors.footer_twitter}</span>}
        </div>

        <div>
          <label className="block text-[0.75rem] font-bold mb-[0.5rem] text-[var(--admin-muted)] uppercase tracking-[0.5px]">Instagram URL</label>
          <input
            type="text"
            className={`w-full p-[0.875rem_0.938rem] bg-[var(--admin-bg)] rounded-[0.625rem] text-[var(--admin-text)] text-[0.875rem] font-medium outline-none transition-all duration-300 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)] ${errors.footer_instagram ? "border border-red-500" : ""}`}
            name="footer_instagram"
            value={settings.footer_instagram}
            onChange={handleChange}
            placeholder="https://instagram.com/..."
          />
          {errors.footer_instagram && <span className="text-[#ef4444] text-[0.75rem] mt-[0.313rem] inline-block">{errors.footer_instagram}</span>}
        </div>

        <div>
          <label className="block text-[0.75rem] font-bold mb-[0.5rem] text-[var(--admin-muted)] uppercase tracking-[0.5px]">YouTube URL</label>
          <input
            type="text"
            className={`w-full p-[0.875rem_0.938rem] bg-[var(--admin-bg)] rounded-[0.625rem] text-[var(--admin-text)] text-[0.875rem] font-medium outline-none transition-all duration-300 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)] ${errors.footer_youtube ? "border border-red-500" : ""}`}
            name="footer_youtube"
            value={settings.footer_youtube}
            onChange={handleChange}
            placeholder="https://youtube.com/..."
          />
          {errors.footer_youtube && <span className="text-[#ef4444] text-[0.75rem] mt-[0.313rem] inline-block">{errors.footer_youtube}</span>}
        </div>
      </div>
    </div>
  );
};

export default FooterSettings;
