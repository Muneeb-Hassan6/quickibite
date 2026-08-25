import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FaStore, FaSave, FaCloudUploadAlt, FaTrash, FaClock, FaSpinner } from "react-icons/fa";
import Swal from "sweetalert2";
import imageCompression from "browser-image-compression";

const GeneralSettings = () => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    store_name: "",
    contact_phone: "",
    admin_email: "",
    store_address: "",
    store_logo: "",
    original_logo: "",
    restaurant_open_time: "10:00",
    restaurant_close_time: "23:59",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const fileInputRef = useRef(null);

  const CLOUD_NAME = "dovuegkwa";
  const UPLOAD_PRESET = "ml_default";

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
        store_name: settingsData.store_name || "",
        contact_phone: settingsData.contact_phone || "",
        admin_email: settingsData.admin_email || "",
        store_address: settingsData.store_address || "",
        store_logo: settingsData.store_logo || "",
        original_logo: settingsData.store_logo || "",
        restaurant_open_time: settingsData.restaurant_open_time || "10:00",
        restaurant_close_time: settingsData.restaurant_close_time || "23:59",
      });
    }
  }, [settingsData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
    }
  };

  const handleRemoveLogo = (e) => {
    e.stopPropagation();
    setLogoFile(null);
    setSettings((prev) => ({ ...prev, store_logo: "" }));
  };

  const uploadToCloudinary = async (file) => {
    if (!file) return null;
    try {
      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json();

      if (data.error) throw new Error(data.error.message);
      return data.secure_url;
    } catch (err) {
      console.error("Upload Error:", err);
      return null;
    }
  };

  const handleSave = async () => {
    if (settings.contact_phone && !/^03\d{9}$/.test(settings.contact_phone)) {
      setPhoneError("Phone number must be exactly 11 digits starting with 03.");
      Swal.fire({
        icon: "error",
        title: "Invalid Mobile Number",
        text: "Please enter exactly 11 digits starting with 03 (e.g. 03001234567).",
        background: "#171717",
        color: "#fff",
      });
      return;
    }

    setIsSaving(true);
    let finalLogoUrl = settings.store_logo;

    if (logoFile) {
      const uploadedUrl = await uploadToCloudinary(logoFile);
      if (uploadedUrl) {
        finalLogoUrl = uploadedUrl;
      } else {
        setIsSaving(false);
        Swal.fire("Error", "Logo upload failed. Try again.", "error");
        return;
      }
    }

    const payload = {
      ...settings,
      store_logo: finalLogoUrl,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/update_settings.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (result.success) {
        setSettings((prev) => ({ ...prev, original_logo: finalLogoUrl }));
        setLogoFile(null);
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Settings Saved!",
          showConfirmButton: false,
          timer: 1500,
          background: "#171717",
          color: "#fff",
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
    return (
      <div className="py-12 text-center text-xs text-[var(--admin-muted,#888)] font-bold uppercase tracking-wider">
        Loading General Settings...
      </div>
    );

  return (
    <div className="admin-card-surface bg-white dark:bg-[#161616] rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white shadow-sm space-y-6 animate-slide-up">
      {/* Card Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <FaStore className="text-amber-500 text-sm" />
          <h3 className="m-0 text-sm sm:text-base font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
            Restaurant Identity & Business Hours
          </h3>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="btn-brand-cta px-5 py-2.5 flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer border-none disabled:opacity-50 active:scale-95"
        >
          {isSaving ? <FaSpinner className="animate-spin text-xs" /> : <FaSave className="text-xs" />}
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Store Logo Dropzone */}
        <div className="sm:col-span-2 space-y-2">
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block">
            Store Brand Logo
          </label>
          <div className="flex items-center gap-4 flex-wrap">
            <div
              className="w-32 h-32 rounded-2xl bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-white/10 cursor-pointer relative overflow-hidden group flex items-center justify-center p-2 shadow-inner"
              onClick={() => fileInputRef.current.click()}
            >
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleLogoChange}
              />
              {logoFile || settings.store_logo ? (
                <>
                  <img
                    src={
                      logoFile
                        ? URL.createObjectURL(logoFile)
                        : settings.store_logo
                    }
                    alt="Store Logo"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/80 flex flex-col justify-center items-center text-white opacity-0 transition-opacity group-hover:opacity-100 p-2 text-center">
                    <FaCloudUploadAlt className="text-xl text-amber-400 mb-1" />
                    <span className="text-[10px] font-bold uppercase">Change Logo</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center text-slate-400 dark:text-neutral-500 p-2">
                  <FaCloudUploadAlt className="text-2xl mb-1 text-amber-500" />
                  <span className="text-[10px] font-bold">Upload Logo</span>
                  <span className="text-[8px] text-slate-400 dark:text-neutral-600">PNG, JPG</span>
                </div>
              )}
            </div>

            {(logoFile || settings.store_logo) && (
              <button
                type="button"
                className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
                onClick={handleRemoveLogo}
              >
                <FaTrash className="text-xs" />
                <span>Remove Logo</span>
              </button>
            )}
          </div>
        </div>

        {/* Restaurant Name */}
        <div>
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
            Restaurant Legal Name *
          </label>
          <input
            type="text"
            name="store_name"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
            value={settings.store_name}
            onChange={handleChange}
          />
        </div>

        {/* Contact Phone */}
        <div>
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
            Contact Helpline Phone *
          </label>
          <input
            type="tel"
            name="contact_phone"
            maxLength="11"
            className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 ${
              phoneError ? "border-red-500" : "border-slate-300 dark:border-white/10"
            }`}
            value={settings.contact_phone}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, "");
              setSettings((prev) => ({ ...prev, contact_phone: val }));
              if (val.length > 0 && val.length < 11) {
                setPhoneError("Please enter all 11 digits.");
              } else if (val.length === 11 && !/^03\d{9}$/.test(val)) {
                setPhoneError("Number must start with 03 (e.g. 03001234567).");
              } else {
                setPhoneError("");
              }
            }}
            placeholder="03001234567"
          />
          {phoneError && (
            <span className="text-[10px] text-rose-500 font-bold block mt-1">
              {phoneError}
            </span>
          )}
        </div>

        {/* Admin Email */}
        <div>
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
            Store Management Email *
          </label>
          <input
            type="email"
            name="admin_email"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
            value={settings.admin_email}
            onChange={handleChange}
          />
        </div>

        {/* Physical Address */}
        <div>
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
            Physical Outlet Address *
          </label>
          <input
            type="text"
            name="store_address"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
            value={settings.store_address}
            onChange={handleChange}
          />
        </div>

        {/* Opening Time */}
        <div>
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
            Opening Time
          </label>
          <div className="relative flex items-center">
            <input
              type="time"
              name="restaurant_open_time"
              value={settings.restaurant_open_time}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Closing Time */}
        <div>
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
            Closing Time
          </label>
          <div className="relative flex items-center">
            <input
              type="time"
              name="restaurant_close_time"
              value={settings.restaurant_close_time}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
