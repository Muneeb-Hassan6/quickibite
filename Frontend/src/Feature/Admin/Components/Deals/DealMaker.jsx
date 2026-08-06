import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import imageCompression from "browser-image-compression";
import {
  FaPlus,
  FaTrash,
  FaTag,
  FaCloudUploadAlt,
  FaClock,
  FaSave,
  FaEdit,
} from "react-icons/fa";
import "./DealMaker.css";

const DealMaker = ({ editDeal, onSuccess }) => {
  // 🔥 Props receive kiye
  const [menuItems, setMenuItems] = useState([]);
  const [dealForm, setDealForm] = useState({ title: "", price: "" });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(""); // 🔥 Image preview alag kar dia
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const [isPermanent, setIsPermanent] = useState(true);
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("16:00");

  const [selectedItems, setSelectedItems] = useState([]);
  const [tempItem, setTempItem] = useState({ menu_item_id: "", qty: 1 });

  const CLOUD_NAME = "dovuegkwa";
  const UPLOAD_PRESET = "ml_default";

  // Menu fetch karein
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/get_menu.php`,
        );
        const data = await response.json();
        if (Array.isArray(data))
          setMenuItems(data.filter((item) => item.isAvailable));
      } catch (error) {
        console.error(error);
      }
    };
    fetchMenu();
  }, []);

  // 🔥 AGAR EDIT MODE HAI TOH FORM PEHLE SE FILL KAREIN
  useEffect(() => {
    if (editDeal) {
      setDealForm({ title: editDeal.title, price: editDeal.price });
      setLogoPreview(editDeal.img || ""); // Purani image lagayen
      setIsPermanent(editDeal.is_permanent === 1);
      if (editDeal.start_time)
        setStartTime(editDeal.start_time.substring(0, 5));
      if (editDeal.end_time) setEndTime(editDeal.end_time.substring(0, 5));
      setSelectedItems(editDeal.items || []); // Purane items lagayen
    } else {
      // Form Clear karein agar create deal hai
      setDealForm({ title: "", price: "" });
      setLogoPreview("");
      setLogoFile(null);
      setSelectedItems([]);
    }
  }, [editDeal]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setLogoFile(e.target.files[0]);
      setLogoPreview(URL.createObjectURL(e.target.files[0])); // Preview foran update
    }
  };

  const uploadToCloudinary = async (file) => {
    if (!file) return null;
    const options = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };
    const compressedFile = await imageCompression(file, options);
    const formData = new FormData();
    formData.append("file", compressedFile);
    formData.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData },
    );
    const data = await res.json();
    return data.secure_url;
  };

  const addItemToDealList = () => {
    if (!tempItem.menu_item_id) return;
    const product = menuItems.find((m) => m.id == tempItem.menu_item_id);
    const existingIndex = selectedItems.findIndex(
      (i) => i.menu_item_id == tempItem.menu_item_id,
    );

    if (existingIndex >= 0) {
      const updatedList = [...selectedItems];
      updatedList[existingIndex].qty =
        parseInt(updatedList[existingIndex].qty) + parseInt(tempItem.qty);
      setSelectedItems(updatedList);
    } else {
      setSelectedItems([
        ...selectedItems,
        { ...tempItem, name: product.name || product.title },
      ]);
    }
    setTempItem({ menu_item_id: "", qty: 1 });
  };

  const removeItem = (index) =>
    setSelectedItems(selectedItems.filter((_, i) => i !== index));

  // 🔥 SAVE YA UPDATE API HIT KAREIN
  const handleSaveDeal = async () => {
    if (!dealForm.title || !dealForm.price)
      return Swal.fire("Error", "Title and Price are required!", "warning");
    if (selectedItems.length === 0)
      return Swal.fire("Error", "Add at least one item!", "warning");

    setIsSaving(true);
    try {
      let imgUrl = logoPreview; // Default to existing DB image
      if (logoFile) {
        imgUrl = await uploadToCloudinary(logoFile); // Agar nayi lagai hai toh upload karein
      }

      const payload = {
        id: editDeal ? editDeal.id : null, // ID bhejein agar Edit hai
        title: dealForm.title,
        price: dealForm.price,
        img: imgUrl,
        is_permanent: isPermanent,
        start_time: startTime,
        end_time: endTime,
        items: selectedItems,
      };

      const apiUrl = editDeal
        ? `${import.meta.env.VITE_API_BASE}/update_deal.php`
        : `${import.meta.env.VITE_API_BASE}/save_deal.php`;

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.success) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: editDeal ? "Deal Updated!" : "Deal Created!",
          showConfirmButton: false,
          timer: 1500,
          background: "#141414",
          color: "#fff",
        });
        if (onSuccess) onSuccess(); // Waapis list me bhej do
      } else {
        Swal.fire("Error", result.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Failed to save deal", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="deal-maker-wrapper">
      <div className="deal-header-title">
        {editDeal ? <FaEdit color="#3b82f6" /> : <FaTag color="#ef4444" />}
        {editDeal ? `Edit Deal: ${editDeal.title}` : "Create Combo Deal"}
      </div>

      <div className="deal-grid-layout">
        {/* LEFT COLUMN */}
        <div className="deal-column-left">
          <div className="dm-input-group">
            <label className="dm-label">Combo Image</label>
            <div
              className="dm-upload-box"
              onClick={() => fileInputRef.current.click()}
            >
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
              {logoPreview ? (
                <>
                  <img
                    src={logoPreview}
                    alt="Preview"
                    className="dm-upload-img-preview"
                  />
                  <div className="dm-image-overlay">
                    <FaCloudUploadAlt
                      size={35}
                      style={{ marginBottom: "10px" }}
                    />
                    <span>Change Image</span>
                  </div>
                </>
              ) : (
                <>
                  <FaCloudUploadAlt
                    size={35}
                    style={{ marginBottom: "10px" }}
                  />
                  <span>Upload Deal Banner</span>
                </>
              )}
            </div>
          </div>
          <div className="dm-input-group">
            <label className="dm-label">Deal Title</label>
            <input
              type="text"
              className="dm-input"
              value={dealForm.title}
              onChange={(e) =>
                setDealForm({ ...dealForm, title: e.target.value })
              }
              placeholder="e.g. Midnight Craving Bundle"
            />
          </div>
          <div className="dm-input-group">
            <label className="dm-label">Combo Price (Rs.)</label>
            <input
              type="number"
              className="dm-input"
              value={dealForm.price}
              onChange={(e) =>
                setDealForm({ ...dealForm, price: e.target.value })
              }
              placeholder="e.g. 1200"
            />
          </div>
          <div className="dm-time-section">
            <label className="dm-checkbox-label">
              <input
                type="checkbox"
                className="dm-checkbox"
                checked={isPermanent}
                onChange={(e) => setIsPermanent(e.target.checked)}
              />{" "}
              THIS IS A PERMANENT DEAL
            </label>
            {!isPermanent && (
              <div className="dm-time-row">
                <div
                  className="dm-input-group"
                  style={{ marginBottom: 0, flex: 1 }}
                >
                  <label className="dm-label">
                    <FaClock /> Start Time
                  </label>
                  <input
                    type="time"
                    className="dm-input"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div
                  className="dm-input-group"
                  style={{ marginBottom: 0, flex: 1 }}
                >
                  <label className="dm-label">
                    <FaClock /> End Time
                  </label>
                  <input
                    type="time"
                    className="dm-input"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="deal-column-right">
          <div className="dm-items-panel">
            <div className="dm-panel-title">Items Included in this Deal</div>
            <div className="dm-add-item-row">
              <select
                className="dm-select"
                style={{ flex: 2 }}
                value={tempItem.menu_item_id}
                onChange={(e) =>
                  setTempItem({ ...tempItem, menu_item_id: e.target.value })
                }
              >
                <option value="">Select a Menu Item...</option>
                {menuItems.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name || m.title}
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="dm-input"
                style={{ flex: 0.5, textAlign: "center" }}
                min="1"
                value={tempItem.qty}
                onChange={(e) =>
                  setTempItem({ ...tempItem, qty: e.target.value })
                }
              />
              <button className="dm-add-btn" onClick={addItemToDealList}>
                <FaPlus />
              </button>
            </div>
            <div className="dm-items-list-container">
              {selectedItems.map((item, idx) => (
                <div key={idx} className="dm-list-item">
                  <span className="dm-item-name">
                    <span className="dm-item-qty">{item.qty}x</span> {item.name}
                  </span>
                  <button
                    className="dm-item-delete"
                    onClick={() => removeItem(idx)}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
            <button
              className="dm-save-btn"
              style={{ background: editDeal ? "#3b82f6" : "#ef4444" }}
              onClick={handleSaveDeal}
              disabled={isSaving}
            >
              <FaSave />{" "}
              {isSaving
                ? "Processing..."
                : editDeal
                  ? "Update Deal"
                  : "Save & Launch Deal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DealMaker;
