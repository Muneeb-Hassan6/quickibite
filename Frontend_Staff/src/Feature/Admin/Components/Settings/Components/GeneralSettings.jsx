import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FaStore, FaSave, FaCloudUploadAlt, FaTrash, FaClock } from "react-icons/fa";
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
    original_logo: "", // Backend ko batane k liay k purana logo konsa tha
    restaurant_open_time: "10:00",
    restaurant_close_time: "23:59",
  });

  const [logoFile, setLogoFile] = useState(null); // Actual file upload krny k liay
  const [isSaving, setIsSaving] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const fileInputRef = useRef(null);
  const openTimeRef = useRef(null);
  const closeTimeRef = useRef(null);

  const CLOUD_NAME = "dovuegkwa"; // Aapka Cloudinary name
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

  // 🔥 Logo select krny ka handler
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
    }
  };

  // 🔥 Logo remove krny ka handler
  const handleRemoveLogo = (e) => {
    e.stopPropagation(); // Wrapper click trigger na ho
    setLogoFile(null);
    setSettings((prev) => ({ ...prev, store_logo: "" }));
  };

  // 🔥 Cloudinary Upload Function
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
      Swal.fire("Error", "Logo upload failed: " + err.message, "error");
      return null;
    }
  };

  const handleSave = async () => {
    if (settings.contact_phone && !/^03\d{9}$/.test(settings.contact_phone)) {
      setPhoneError("Please enter a valid 11-digit mobile number.");
      Swal.fire({
        icon: "error",
        title: "Invalid Mobile Number",
        text: "Please enter exactly 11 digits starting with 03 (e.g. 03001234567).",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    setIsSaving(true);
    try {
      let finalLogoUrl = settings.store_logo;

      // Agar koi naya logo select kia hy toh pehly usko upload kro
      if (logoFile) {
        const uploadedUrl = await uploadToCloudinary(logoFile);
        if (!uploadedUrl) {
          setIsSaving(false);
          return; // Upload fail hua toh yahi rok do
        }
        finalLogoUrl = uploadedUrl;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/update_settings.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            store_name: settings.store_name,
            contact_phone: settings.contact_phone,
            admin_email: settings.admin_email,
            store_address: settings.store_address,
            store_logo: finalLogoUrl,
            old_logo: settings.original_logo, // Yeh PHP me check kr k delete kr lena
            restaurant_open_time: settings.restaurant_open_time,
            restaurant_close_time: settings.restaurant_close_time,
          }),
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
    return <div className="text-[var(--admin-muted)] text-[1rem] p-[1.25rem]">Loading Settings...</div>;

  return (
    <div className="bg-[var(--admin-panel)] rounded-[1rem] p-[1.875rem] shadow-[0_4px_10px_rgba(0,0,0,0.1)] animate-slide-up">
      <div className="flex justify-between items-center mb-[1.25rem]">
        <div className="flex items-center gap-[0.625rem] text-[1.125rem] font-bold text-white">
          <FaStore /> General Information
        </div>

        <button
          className="bg-[var(--admin-orange)] text-white border-none p-[0.75rem_1.25rem] rounded-[0.5rem] cursor-pointer font-bold shadow-[var(--shadow-glow)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[var(--shadow-glow)] flex items-center w-auto m-0"
          onClick={handleSave}
          disabled={isSaving}
        >
          <FaSave className="mr-[0.5rem]" />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1.25rem]">
        {/* 🔥 NEW LOGO UPLOAD SECTION */}
        <div className="mb-[0.938rem] col-span-1 sm:col-span-2 mb-[1.25rem]">
          <label className="block text-[0.75rem] font-bold mb-[0.5rem] text-[var(--admin-muted)] uppercase tracking-[0.5px]">Store Logo</label>
          <div
            className="w-[12.5rem] h-[12.5rem] rounded-[0.75rem] mb-[0.625rem] bg-[var(--admin-bg)] cursor-pointer relative overflow-hidden group"
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
                  className="w-full h-full object-contain bg-black"
                />
                <div className="absolute top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.7)] flex flex-col justify-center items-center text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <FaCloudUploadAlt size={35} />
                  <span>Change Logo</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[#888]">
                <FaCloudUploadAlt className="text-[2.813rem] mb-[0.625rem]" />
                <p className="m-0">Click to upload logo</p>
                <span className="text-[0.75rem]">PNG, JPG up to 5MB</span>
              </div>
            )}
          </div>

          {(logoFile || settings.store_logo) && (
            <button className="flex items-center gap-[0.5rem] bg-[rgba(239,68,68,0.1)] text-[#ef4444] border border-[#ef4444] p-[0.5rem_0.938rem] rounded-[0.375rem] text-[0.813rem] font-bold cursor-pointer transition-colors duration-200 w-fit hover:bg-[#ef4444] hover:text-white" onClick={handleRemoveLogo}>
              <FaTrash /> Remove Logo
            </button>
          )}
        </div>

        <div className="mb-[0.938rem]">
          <label className="block text-[0.75rem] font-bold mb-[0.5rem] text-[var(--admin-muted)] uppercase tracking-[0.5px]">Restaurant Name</label>
          <input
            type="text"
            name="store_name"
            className="w-full p-[0.875rem_0.938rem] bg-[var(--admin-bg)] rounded-[0.625rem] text-[var(--admin-text)] text-[0.875rem] font-medium outline-none transition-all duration-300 focus:shadow-[var(--shadow-glow)]"
            value={settings.store_name}
            onChange={handleChange}
          />
        </div>
        <div className="mb-[0.938rem]">
          <label className="block text-[0.75rem] font-bold mb-[0.5rem] text-[var(--admin-muted)] uppercase tracking-[0.5px]">Contact Phone</label>
          <input
            type="tel"
            name="contact_phone"
            maxLength="11"
            className={`w-full p-[0.875rem_0.938rem] bg-[var(--admin-bg)] rounded-[0.625rem] text-[var(--admin-text)] text-[0.875rem] font-medium outline-none transition-all duration-300 focus:shadow-[var(--shadow-glow)] ${phoneError ? "border border-red-500" : ""}`}
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
            placeholder="e.g. 03001234567"
          />
          {phoneError && (
            <span className="text-[#ef4444] text-[0.75rem] mt-[0.313rem] inline-block">
              {phoneError}
            </span>
          )}
        </div>
        <div className="mb-[0.938rem]">
          <label className="block text-[0.75rem] font-bold mb-[0.5rem] text-[var(--admin-muted)] uppercase tracking-[0.5px]">Email Address</label>
          <input
            type="email"
            name="admin_email"
            className="w-full p-[0.875rem_0.938rem] bg-[var(--admin-bg)] rounded-[0.625rem] text-[var(--admin-text)] text-[0.875rem] font-medium outline-none transition-all duration-300 focus:shadow-[var(--shadow-glow)]"
            value={settings.admin_email}
            onChange={handleChange}
          />
        </div>
        <div className="mb-[0.938rem]">
          <label className="block text-[0.75rem] font-bold mb-[0.5rem] text-[var(--admin-muted)] uppercase tracking-[0.5px]">Physical Address</label>
          <input
            type="text"
            name="store_address"
            className="w-full p-[0.875rem_0.938rem] bg-[var(--admin-bg)] rounded-[0.625rem] text-[var(--admin-text)] text-[0.875rem] font-medium outline-none transition-all duration-300 focus:shadow-[var(--shadow-glow)]"
            value={settings.store_address}
            onChange={handleChange}
          />
        </div>
        <div className="mb-[0.938rem]">
          <label className="block text-[0.75rem] font-bold mb-[0.5rem] text-[var(--admin-muted)] uppercase tracking-[0.5px]">Opening Time</label>
          <div className="relative flex items-center">
            <input
              type="time"
              name="restaurant_open_time"
              className="w-full p-[0.875rem_0.938rem] bg-[var(--admin-bg)] rounded-[0.625rem] text-[var(--admin-text)] text-[0.875rem] font-medium outline-none transition-all duration-300 focus:shadow-[var(--shadow-glow)] pr-[2.5rem]"
              value={settings.restaurant_open_time}
              onChange={handleChange}
              ref={openTimeRef}
            />
            <FaClock 
              className="absolute right-[0.938rem] text-[#888] cursor-pointer text-[1rem]" 
              onClick={() => {
                if (openTimeRef.current && typeof openTimeRef.current.showPicker === 'function') {
                  openTimeRef.current.showPicker();
                }
              }} 
            />
          </div>
        </div>
        <div className="mb-[0.938rem]">
          <label className="block text-[0.75rem] font-bold mb-[0.5rem] text-[var(--admin-muted)] uppercase tracking-[0.5px]">Closing Time</label>
          <div className="relative flex items-center">
            <input
              type="time"
              name="restaurant_close_time"
              className="w-full p-[0.875rem_0.938rem] bg-[var(--admin-bg)] rounded-[0.625rem] text-[var(--admin-text)] text-[0.875rem] font-medium outline-none transition-all duration-300 focus:shadow-[var(--shadow-glow)] pr-[2.5rem]"
              value={settings.restaurant_close_time}
              onChange={handleChange}
              ref={closeTimeRef}
            />
            <FaClock 
              className="absolute right-[0.938rem] text-[#888] cursor-pointer text-[1rem]" 
              onClick={() => {
                if (closeTimeRef.current && typeof closeTimeRef.current.showPicker === 'function') {
                  closeTimeRef.current.showPicker();
                }
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
