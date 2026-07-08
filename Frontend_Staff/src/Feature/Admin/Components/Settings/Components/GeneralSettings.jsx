import React, { useState, useEffect, useRef } from "react";
import { FaStore, FaSave, FaCloudUploadAlt, FaTrash, FaClock } from "react-icons/fa";
import Swal from "sweetalert2";
import imageCompression from "browser-image-compression";

const GeneralSettings = () => {
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const fileInputRef = useRef(null);
  const openTimeRef = useRef(null);
  const closeTimeRef = useRef(null);

  const CLOUD_NAME = "dovuegkwa"; // Aapka Cloudinary name
  const UPLOAD_PRESET = "ml_default";

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/get_settings.php`,
        );
        const result = await response.json();

        if (result.success) {
          setSettings({
            store_name: result.data.store_name || "",
            contact_phone: result.data.contact_phone || "",
            admin_email: result.data.admin_email || "",
            store_address: result.data.store_address || "",
            store_logo: result.data.store_logo || "",
            original_logo: result.data.store_logo || "",
            restaurant_open_time: result.data.restaurant_open_time || "10:00",
            restaurant_close_time: result.data.restaurant_close_time || "23:59",
          });
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

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
    return <div className="loading-state-text">Loading Settings...</div>;

  return (
    <div className="settings-card">
      <div className="settings-header-flex">
        <div className="settings-title-left">
          <FaStore /> General Information
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
        {/* 🔥 NEW LOGO UPLOAD SECTION */}
        <div className="settings-input-group logo-upload-group">
          <label className="settings-label">Store Logo</label>
          <div
            className="image-upload-wrapper logo-wrapper"
            onClick={() => fileInputRef.current.click()}
          >
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden-file-input"
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
                  className="logo-preview-img"
                />
                <div className="image-overlay">
                  <FaCloudUploadAlt size={35} />
                  <span>Change Logo</span>
                </div>
              </>
            ) : (
              <div className="menu-upload-placeholder">
                <FaCloudUploadAlt className="menu-upload-icon" size={45} />
                <p>Click to upload logo</p>
                <span>PNG, JPG up to 5MB</span>
              </div>
            )}
          </div>

          {(logoFile || settings.store_logo) && (
            <button className="btn-remove-logo" onClick={handleRemoveLogo}>
              <FaTrash /> Remove Logo
            </button>
          )}
        </div>

        <div className="settings-input-group">
          <label className="settings-label">Restaurant Name</label>
          <input
            type="text"
            name="store_name"
            className="settings-input"
            value={settings.store_name}
            onChange={handleChange}
          />
        </div>
        <div className="settings-input-group">
          <label className="settings-label">Contact Phone</label>
          <input
            type="tel"
            name="contact_phone"
            maxLength="11"
            className={`settings-input ${phoneError ? "border-red-500" : ""}`}
            style={phoneError ? { borderColor: "#ef4444" } : {}}
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
            <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px", display: "inline-block" }}>
              {phoneError}
            </span>
          )}
        </div>
        <div className="settings-input-group">
          <label className="settings-label">Email Address</label>
          <input
            type="email"
            name="admin_email"
            className="settings-input"
            value={settings.admin_email}
            onChange={handleChange}
          />
        </div>
        <div className="settings-input-group">
          <label className="settings-label">Physical Address</label>
          <input
            type="text"
            name="store_address"
            className="settings-input"
            value={settings.store_address}
            onChange={handleChange}
          />
        </div>
        <div className="settings-input-group">
          <label className="settings-label">Opening Time</label>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <input
              type="time"
              name="restaurant_open_time"
              className="settings-input"
              value={settings.restaurant_open_time}
              onChange={handleChange}
              ref={openTimeRef}
              style={{ paddingRight: "40px" }}
            />
            <FaClock 
              style={{ position: "absolute", right: "15px", color: "#888", cursor: "pointer", fontSize: "16px" }} 
              onClick={() => {
                if (openTimeRef.current && typeof openTimeRef.current.showPicker === 'function') {
                  openTimeRef.current.showPicker();
                }
              }} 
            />
          </div>
        </div>
        <div className="settings-input-group">
          <label className="settings-label">Closing Time</label>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <input
              type="time"
              name="restaurant_close_time"
              className="settings-input"
              value={settings.restaurant_close_time}
              onChange={handleChange}
              ref={closeTimeRef}
              style={{ paddingRight: "40px" }}
            />
            <FaClock 
              style={{ position: "absolute", right: "15px", color: "#888", cursor: "pointer", fontSize: "16px" }} 
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
