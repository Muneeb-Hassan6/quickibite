import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import imageCompression from "browser-image-compression";

export function useGeneralSettings() {
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
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_settings.php`
      );
      const result = await response.json();
      return result.success ? result.data : {};
    },
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
        }
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
        }
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
        queryClient.invalidateQueries({ queryKey: ["settings"] });
      } else {
        Swal.fire("Error", result.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Network Connection Failed", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    setSettings,
    logoFile,
    isSaving,
    phoneError,
    setPhoneError,
    fileInputRef,
    isLoading,
    handleChange,
    handleLogoChange,
    handleRemoveLogo,
    handleSave,
  };
}
