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
    <div className="admin-card-surface bg-white dark:bg-[#161616] rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white shadow-sm space-y-6 animate-slide-up">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5 text-sm sm:text-base font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
          Footer Branding & Social Links
        </div>

        <button 
          className="btn-brand-cta px-5 py-2.5 flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer border-none disabled:opacity-50 active:scale-95"
          onClick={handleSave}
          disabled={isSaving}
        >
          <FaSave className="text-xs" />
          <span>{isSaving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">Footer Tagline</label>
          <textarea
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 resize-y"
            name="footer_tagline"
            value={settings.footer_tagline}
            onChange={handleChange}
            placeholder="E.g. Fresh Food, Delivered Hot & Fast..."
            rows="3"
          ></textarea>
        </div>

        <div>
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">Contact Phone</label>
          <input
            type="text"
            className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 ${errors.footer_phone ? "border-red-500" : "border-slate-300 dark:border-white/10"}`}
            name="footer_phone"
            value={settings.footer_phone}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9\+\-\s\(\)]/g, "");
              handleChange({ target: { name: "footer_phone", value: val } });
            }}
            placeholder="+1 234 567 8900"
          />
          {errors.footer_phone && <span className="text-rose-500 text-xs mt-1 block font-bold">{errors.footer_phone}</span>}
        </div>

        <div>
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">Contact Email</label>
          <input
            type="email"
            className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 ${errors.footer_email ? "border-red-500" : "border-slate-300 dark:border-white/10"}`}
            name="footer_email"
            value={settings.footer_email}
            onChange={handleChange}
            placeholder="support@bigbite.com"
          />
          {errors.footer_email && <span className="text-rose-500 text-xs mt-1 block font-bold">{errors.footer_email}</span>}
        </div>

        <div>
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">Facebook URL</label>
          <input
            type="text"
            className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 ${errors.footer_facebook ? "border-red-500" : "border-slate-300 dark:border-white/10"}`}
            name="footer_facebook"
            value={settings.footer_facebook}
            onChange={handleChange}
            placeholder="https://facebook.com/..."
          />
          {errors.footer_facebook && <span className="text-rose-500 text-xs mt-1 block font-bold">{errors.footer_facebook}</span>}
        </div>

        <div>
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">Twitter URL</label>
          <input
            type="text"
            className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 ${errors.footer_twitter ? "border-red-500" : "border-slate-300 dark:border-white/10"}`}
            name="footer_twitter"
            value={settings.footer_twitter}
            onChange={handleChange}
            placeholder="https://twitter.com/..."
          />
          {errors.footer_twitter && <span className="text-rose-500 text-xs mt-1 block font-bold">{errors.footer_twitter}</span>}
        </div>

        <div>
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">Instagram URL</label>
          <input
            type="text"
            className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 ${errors.footer_instagram ? "border-red-500" : "border-slate-300 dark:border-white/10"}`}
            name="footer_instagram"
            value={settings.footer_instagram}
            onChange={handleChange}
            placeholder="https://instagram.com/..."
          />
          {errors.footer_instagram && <span className="text-rose-500 text-xs mt-1 block font-bold">{errors.footer_instagram}</span>}
        </div>

        <div>
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">YouTube URL</label>
          <input
            type="text"
            className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 ${errors.footer_youtube ? "border-red-500" : "border-slate-300 dark:border-white/10"}`}
            name="footer_youtube"
            value={settings.footer_youtube}
            onChange={handleChange}
            placeholder="https://youtube.com/..."
          />
          {errors.footer_youtube && <span className="text-rose-500 text-xs mt-1 block font-bold">{errors.footer_youtube}</span>}
        </div>
      </div>
    </div>
  );
};

export default FooterSettings;
