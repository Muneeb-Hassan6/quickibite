import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
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
  FaUtensils,
  FaSlidersH,
  FaImage,
} from "react-icons/fa";
import { useTheme } from "../../../../Context/ThemeContext";

const DealMaker = ({ editDeal, onSuccess }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const [dealForm, setDealForm] = useState({
    title: "",
    description: "",
    price: "",
    original_price: "",
    badge_tag: "HOT DEAL",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Promo Banner State
  const [isFeaturedBanner, setIsFeaturedBanner] = useState(false);
  const [promoBannerFile, setPromoBannerFile] = useState(null);
  const [promoBannerPreview, setPromoBannerPreview] = useState("");
  const [bannerOrder, setBannerOrder] = useState(0);
  const promoFileInputRef = useRef(null);

  const [isPermanent, setIsPermanent] = useState(true);
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("16:00");

  // Dynamic Included Items & Choices Repeater State
  const [includedItems, setIncludedItems] = useState([
    {
      item_title: "",
      quantity: 1,
      is_customizable: false,
      choice_group_name: "",
      options_str: "",
    },
  ]);

  const CLOUD_NAME = "dovuegkwa";
  const UPLOAD_PRESET = "ml_default";

  // Fetch Menu items for quick auto-fill suggestions
  const { data: menuData = [] } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_menu.php`
      );
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const menuItems = menuData.filter((item) => item.isAvailable);

  // Initialize or Populate Form on Edit
  useEffect(() => {
    if (editDeal) {
      setDealForm({
        title: editDeal.title || "",
        description: editDeal.description || "",
        price: editDeal.price || "",
        original_price: editDeal.original_price || "",
        badge_tag: editDeal.badge_tag || editDeal.tag || "HOT DEAL",
      });
      setLogoPreview(editDeal.img || "");
      setPromoBannerPreview(editDeal.promo_banner_image || "");
      setIsFeaturedBanner(
        editDeal.is_featured_banner == 1 || editDeal.is_featured_banner === true
      );
      setBannerOrder(editDeal.banner_order || 0);
      setIsPermanent(
        editDeal.is_permanent == 1 || editDeal.is_permanent === true
      );
      if (editDeal.start_time)
        setStartTime(editDeal.start_time.substring(0, 5));
      if (editDeal.end_time) setEndTime(editDeal.end_time.substring(0, 5));

      if (
        editDeal.items &&
        Array.isArray(editDeal.items) &&
        editDeal.items.length > 0
      ) {
        setIncludedItems(
          editDeal.items.map((it) => ({
            item_title: it.item_title || it.name || "",
            quantity: it.quantity || it.qty || 1,
            is_customizable: Boolean(it.is_customizable),
            choice_group_name: it.choice_group_name || "",
            options_str: Array.isArray(it.options)
              ? it.options.join(", ")
              : it.options || "",
          }))
        );
      } else {
        setIncludedItems([
          {
            item_title: "",
            quantity: 1,
            is_customizable: false,
            choice_group_name: "",
            options_str: "",
          },
        ]);
      }
    } else {
      setDealForm({
        title: "",
        description: "",
        price: "",
        original_price: "",
        badge_tag: "POPULAR",
      });
      setLogoPreview("");
      setLogoFile(null);
      setPromoBannerPreview("");
      setPromoBannerFile(null);
      setIsFeaturedBanner(false);
      setBannerOrder(0);
      setIsPermanent(true);
      setIncludedItems([
        {
          item_title: "",
          quantity: 1,
          is_customizable: false,
          choice_group_name: "",
          options_str: "",
        },
      ]);
    }
  }, [editDeal]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
      setLogoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handlePromoBannerChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPromoBannerFile(e.target.files[0]);
      setPromoBannerPreview(URL.createObjectURL(e.target.files[0]));
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
      { method: "POST", body: formData }
    );
    const data = await res.json();
    return data.secure_url;
  };

  // Repeater item operations
  const handleAddItemRow = () => {
    setIncludedItems([
      ...includedItems,
      {
        item_title: "",
        quantity: 1,
        is_customizable: false,
        choice_group_name: "",
        options_str: "",
      },
    ]);
  };

  const handleRemoveItemRow = (index) => {
    if (includedItems.length === 1) {
      setIncludedItems([
        {
          item_title: "",
          quantity: 1,
          is_customizable: false,
          choice_group_name: "",
          options_str: "",
        },
      ]);
      return;
    }
    setIncludedItems(includedItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...includedItems];
    updated[index][field] = value;
    setIncludedItems(updated);
  };

  // Quick pick from existing menu
  const handleQuickSelectMenu = (index, menuItemId) => {
    if (!menuItemId) return;
    const found = menuItems.find((m) => m.id == menuItemId);
    if (found) {
      const updated = [...includedItems];
      updated[index].item_title = found.name || found.title;
      setIncludedItems(updated);
    }
  };

  // Save / Update Deal
  const handleSaveDeal = async () => {
    if (!dealForm.title || !dealForm.price) {
      return Swal.fire(
        "Required",
        "Deal Title and Price are required!",
        "warning"
      );
    }

    const validItems = includedItems.filter(
      (it) => it.item_title.trim() !== ""
    );
    if (validItems.length === 0) {
      return Swal.fire(
        "Required",
        "Add at least one included item in the combo!",
        "warning"
      );
    }

    setIsSaving(true);
    try {
      let imgUrl = logoPreview;
      if (logoFile) {
        imgUrl = await uploadToCloudinary(logoFile);
      }

      let promoImgUrl = promoBannerPreview;
      if (promoBannerFile) {
        promoImgUrl = await uploadToCloudinary(promoBannerFile);
      }

      // Format items with parsed options array
      const formattedItems = validItems.map((it) => ({
        item_title: it.item_title.trim(),
        quantity: parseInt(it.quantity) || 1,
        is_customizable: it.is_customizable ? 1 : 0,
        choice_group_name: it.choice_group_name ? it.choice_group_name.trim() : null,
        options:
          it.is_customizable && it.options_str
            ? it.options_str
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
      }));

      const payload = {
        id: editDeal ? editDeal.id : null,
        title: dealForm.title.trim(),
        description: dealForm.description.trim(),
        price: parseFloat(dealForm.price),
        original_price: dealForm.original_price
          ? parseFloat(dealForm.original_price)
          : null,
        badge_tag: dealForm.badge_tag.trim(),
        img: imgUrl,
        promo_banner_image: promoImgUrl,
        is_featured_banner: isFeaturedBanner ? 1 : 0,
        banner_order: parseInt(bannerOrder) || 0,
        is_permanent: isPermanent ? 1 : 0,
        start_time: startTime,
        end_time: endTime,
        items: formattedItems,
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
          title: editDeal
            ? "Deal Updated Successfully!"
            : "Deal Created Successfully!",
          showConfirmButton: false,
          timer: 1500,
          background: isDarkMode ? "#141414" : "#ffffff",
          color: isDarkMode ? "#fff" : "#111",
        });
        if (onSuccess) onSuccess();
      } else {
        Swal.fire("Error", result.message || "Failed to save deal", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Server connection failed while saving deal", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`rounded-3xl p-6 shadow-md transition-all ${
        isDarkMode
          ? "bg-[#18181b] border border-neutral-800 text-white"
          : "bg-white border border-gray-200 text-gray-900"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between pb-5 mb-6 border-b ${
          isDarkMode ? "border-neutral-800" : "border-gray-200"
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`p-3 rounded-2xl ${
              editDeal
                ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
            }`}
          >
            {editDeal ? (
              <FaEdit className="text-xl" />
            ) : (
              <FaTag className="text-xl" />
            )}
          </div>
          <div>
            <h2
              className={`text-xl font-black m-0 uppercase tracking-wide ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {editDeal ? `Edit Deal: ${editDeal.title}` : "Create Combo Deal"}
            </h2>
            <p
              className={`text-xs m-0 mt-0.5 font-medium ${
                isDarkMode ? "text-neutral-400" : "text-gray-500"
              }`}
            >
              Configure bundled items, pricing, flavor options, and schedule settings
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ═══════════════════════════════════════
            LEFT COLUMN: GENERAL DEAL DETAILS
        ═══════════════════════════════════════ */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Image Dropzone */}
          <div>
            <label
              className={`text-xs font-bold uppercase tracking-wider block mb-2 ${
                isDarkMode ? "text-neutral-300" : "text-gray-700"
              }`}
            >
              Combo Deal Image / Banner
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative w-full h-48 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden shadow-inner group p-6 text-center ${
                isDarkMode
                  ? "border-neutral-700 hover:border-amber-400 bg-neutral-950/50 hover:bg-neutral-900/40 text-neutral-400"
                  : "border-gray-300 hover:border-amber-400 bg-gray-50 hover:bg-amber-50/30 text-gray-600"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageChange}
              />
              {logoPreview ? (
                <>
                  <img
                    src={logoPreview}
                    alt="Preview"
                    className="w-full h-full object-contain p-3.5 transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2 backdrop-blur-sm">
                    <FaCloudUploadAlt className="text-2xl text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-wider">
                      Change Image
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 p-2 text-center">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border text-amber-500 ${
                      isDarkMode
                        ? "bg-neutral-900 border-neutral-800"
                        : "bg-gray-100 border-gray-200"
                    }`}
                  >
                    <FaImage className="text-xl" />
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      isDarkMode ? "text-neutral-200" : "text-gray-800"
                    }`}
                  >
                    Click to Upload Deal Banner
                  </span>
                  <span
                    className={`text-[11px] ${
                      isDarkMode ? "text-neutral-500" : "text-gray-400"
                    }`}
                  >
                    Supports PNG, JPG, or WebP up to 2MB
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 2. Deal Title */}
          <div>
            <label
              className={`text-xs font-bold uppercase tracking-wider block mb-1.5 ${
                isDarkMode ? "text-neutral-300" : "text-gray-700"
              }`}
            >
              Deal Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={dealForm.title}
              onChange={(e) =>
                setDealForm({ ...dealForm, title: e.target.value })
              }
              placeholder="e.g. Midnight Craver Deal"
              className={`w-full rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all text-xs font-bold ${
                isDarkMode
                  ? "bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500"
                  : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>

          {/* 3. Description */}
          <div>
            <label
              className={`text-xs font-bold uppercase tracking-wider block mb-1.5 ${
                isDarkMode ? "text-neutral-300" : "text-gray-700"
              }`}
            >
              Description / Included Summary
            </label>
            <textarea
              rows={2}
              value={dealForm.description}
              onChange={(e) =>
                setDealForm({ ...dealForm, description: e.target.value })
              }
              placeholder="e.g. 1 Zinger Burger + Plain Fries + 345ml Drink"
              className={`w-full rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all text-xs resize-none ${
                isDarkMode
                  ? "bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500"
                  : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>

          {/* 4. Pricing Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className={`text-xs font-bold uppercase tracking-wider block mb-1.5 ${
                  isDarkMode ? "text-neutral-300" : "text-gray-700"
                }`}
              >
                Deal Price (Rs.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={dealForm.price}
                onChange={(e) =>
                  setDealForm({ ...dealForm, price: e.target.value })
                }
                placeholder="e.g. 720"
                className={`w-full rounded-xl px-4 py-3 text-amber-500 font-black text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all ${
                  isDarkMode
                    ? "bg-neutral-950 border border-neutral-800 placeholder-neutral-600"
                    : "bg-gray-50 border border-gray-300 placeholder-gray-400"
                }`}
              />
            </div>
            <div>
              <label
                className={`text-xs font-bold uppercase tracking-wider block mb-1.5 ${
                  isDarkMode ? "text-neutral-300" : "text-gray-700"
                }`}
              >
                Original Price (Rs.)
              </label>
              <input
                type="number"
                value={dealForm.original_price}
                onChange={(e) =>
                  setDealForm({ ...dealForm, original_price: e.target.value })
                }
                placeholder="e.g. 850"
                className={`w-full rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all ${
                  isDarkMode
                    ? "bg-neutral-950 border border-neutral-800 text-neutral-400 placeholder-neutral-600"
                    : "bg-gray-50 border border-gray-300 text-gray-500 placeholder-gray-400"
                }`}
              />
            </div>
          </div>

          {/* 5. Badge Tag */}
          <div>
            <label
              className={`text-xs font-bold uppercase tracking-wider block mb-1.5 ${
                isDarkMode ? "text-neutral-300" : "text-gray-700"
              }`}
            >
              Badge Tag (Floating Ribbon)
            </label>
            <input
              type="text"
              value={dealForm.badge_tag}
              onChange={(e) =>
                setDealForm({ ...dealForm, badge_tag: e.target.value })
              }
              placeholder="e.g. POPULAR, HOT DEAL, MEGA SAVER"
              className={`w-full rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all text-xs font-black uppercase tracking-wider ${
                isDarkMode
                  ? "bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500"
                  : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
            />
            {/* Tag Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[
                "POPULAR",
                "HOT DEAL",
                "MEGA SAVER",
                "BEST VALUE",
                "FAMILY PACK",
                "CRUNCHY",
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setDealForm({ ...dealForm, badge_tag: tag })}
                  className={`text-[10px] font-black px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                    dealForm.badge_tag === tag
                      ? "bg-amber-400 text-neutral-950 border border-amber-400 shadow-sm"
                      : isDarkMode
                      ? "bg-neutral-950 text-neutral-400 border border-neutral-800 hover:border-amber-400/50"
                      : "bg-gray-100 text-gray-600 border border-gray-200 hover:border-amber-400/50"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Schedule Type */}
          <div
            className={`p-4 rounded-2xl space-y-3 shadow-inner ${
              isDarkMode
                ? "bg-neutral-950/80 border border-neutral-800"
                : "bg-gray-50 border border-gray-200"
            }`}
          >
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isPermanent}
                onChange={(e) => setIsPermanent(e.target.checked)}
                className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
              />
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Permanent Deal (Available 24/7)
              </span>
            </label>

            {!isPermanent && (
              <div
                className={`grid grid-cols-2 gap-3 pt-2.5 border-t ${
                  isDarkMode ? "border-neutral-800" : "border-gray-200"
                }`}
              >
                <div>
                  <label
                    className={`text-[11px] font-bold flex items-center gap-1.5 mb-1.5 ${
                      isDarkMode ? "text-neutral-400" : "text-gray-600"
                    }`}
                  >
                    <FaClock className="text-amber-500" /> Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none ${
                      isDarkMode
                        ? "bg-neutral-900 border border-neutral-800 text-white"
                        : "bg-white border border-gray-300 text-gray-900"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`text-[11px] font-bold flex items-center gap-1.5 mb-1.5 ${
                      isDarkMode ? "text-neutral-400" : "text-gray-600"
                    }`}
                  >
                    <FaClock className="text-amber-500" /> End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none ${
                      isDarkMode
                        ? "bg-neutral-900 border border-neutral-800 text-white"
                        : "bg-white border border-gray-300 text-gray-900"
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 7. Homepage Promo Banner Integration */}
          <div
            className={`p-4 rounded-2xl space-y-3 shadow-inner ${
              isDarkMode
                ? "bg-neutral-950/80 border border-neutral-800"
                : "bg-gray-50 border border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeaturedBanner}
                  onChange={(e) => setIsFeaturedBanner(e.target.checked)}
                  className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                />
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Show as Homepage Promo Banner
                </span>
              </label>
              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase bg-amber-400/10 text-amber-500 border border-amber-400/30">
                PROMO
              </span>
            </div>

            {isFeaturedBanner && (
              <div
                className={`pt-3 border-t space-y-3 ${
                  isDarkMode ? "border-neutral-800" : "border-gray-200"
                }`}
              >
                <div>
                  <label
                    className={`text-[11px] font-bold block mb-1.5 ${
                      isDarkMode ? "text-neutral-300" : "text-gray-700"
                    }`}
                  >
                    Wide Promo Banner Image (Recommended 1200x500px)
                  </label>
                  <div
                    onClick={() => promoFileInputRef.current?.click()}
                    className={`relative w-full h-32 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group text-center p-3 ${
                      isDarkMode
                        ? "border-neutral-700 hover:border-amber-400 bg-neutral-900/60 text-neutral-400"
                        : "border-gray-300 hover:border-amber-400 bg-white text-gray-600"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      ref={promoFileInputRef}
                      className="hidden"
                      onChange={handlePromoBannerChange}
                    />
                    {promoBannerPreview ? (
                      <>
                        <img
                          src={promoBannerPreview}
                          alt="Promo Banner Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 backdrop-blur-xs">
                          <FaCloudUploadAlt className="text-xl text-amber-400" />
                          <span className="text-[10px] font-black uppercase tracking-wider">
                            Change Banner
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <FaImage className="text-lg text-amber-500" />
                        <span className="text-xs font-bold text-neutral-300">
                          Upload Wide Banner
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          Leaves empty to use standard deal image
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    className={`text-[11px] font-bold block mb-1 ${
                      isDarkMode ? "text-neutral-400" : "text-gray-600"
                    }`}
                  >
                    Banner Display Order (0 = First)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bannerOrder}
                    onChange={(e) => setBannerOrder(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none ${
                      isDarkMode
                        ? "bg-neutral-900 border border-neutral-800 text-white"
                        : "bg-white border border-gray-300 text-gray-900"
                    }`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════
            RIGHT COLUMN: INCLUDED ITEMS & CHOICES
        ═══════════════════════════════════════ */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="space-y-4">
            <div
              className={`flex items-center justify-between border-b pb-3 ${
                isDarkMode ? "border-neutral-800" : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <FaUtensils className="text-amber-500 text-sm" />
                <h3
                  className={`text-sm font-black uppercase tracking-wide m-0 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Included Items & Flavor Choices ({includedItems.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-neutral-950 text-xs font-black px-3.5 py-2 rounded-xl border-none cursor-pointer transition-all active:scale-95 shadow-md uppercase tracking-wider"
              >
                <FaPlus className="text-[10px]" /> Add Included Item
              </button>
            </div>

            {/* Repeater Rows */}
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {includedItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl p-4 mb-3 space-y-3 transition-all ${
                    isDarkMode
                      ? "bg-neutral-950/80 border border-neutral-800 hover:border-neutral-700"
                      : "bg-gray-50 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {/* Row 1: Title, Qty, Quick Pick & Delete */}
                  <div className="grid grid-cols-12 gap-2.5 items-center">
                    {/* Item Title Input */}
                    <div className="col-span-12 sm:col-span-6">
                      <label
                        className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                          isDarkMode ? "text-neutral-400" : "text-gray-600"
                        }`}
                      >
                        Item Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Large Special Pizza, Zinger Burger"
                        value={item.item_title}
                        onChange={(e) =>
                          handleItemChange(idx, "item_title", e.target.value)
                        }
                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all font-semibold ${
                          isDarkMode
                            ? "bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500"
                            : "bg-white border border-gray-300 text-gray-900 placeholder-gray-400"
                        }`}
                      />
                    </div>

                    {/* Quantity */}
                    <div className="col-span-4 sm:col-span-2">
                      <label
                        className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                          isDarkMode ? "text-neutral-400" : "text-gray-600"
                        }`}
                      >
                        Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(idx, "quantity", e.target.value)
                        }
                        className={`w-full rounded-xl px-2 py-2.5 text-xs font-black text-center text-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all ${
                          isDarkMode
                            ? "bg-neutral-900 border border-neutral-800"
                            : "bg-white border border-gray-300"
                        }`}
                      />
                    </div>

                    {/* Quick Pick from Menu Dropdown */}
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                          isDarkMode ? "text-neutral-400" : "text-gray-600"
                        }`}
                      >
                        Quick Pick
                      </label>
                      <select
                        onChange={(e) =>
                          handleQuickSelectMenu(idx, e.target.value)
                        }
                        defaultValue=""
                        className={`w-full rounded-xl px-2.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all cursor-pointer ${
                          isDarkMode
                            ? "bg-neutral-900 border border-neutral-800 text-neutral-300"
                            : "bg-white border border-gray-300 text-gray-800"
                        }`}
                      >
                        <option value="">-- Menu Item --</option>
                        {menuItems.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name || m.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Delete Item Row */}
                    <div className="col-span-2 sm:col-span-1 flex justify-end pt-4 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className={`p-2.5 rounded-xl cursor-pointer transition-all active:scale-95 shadow-xs ${
                          isDarkMode
                            ? "bg-neutral-800 text-neutral-400 hover:text-red-400 border border-neutral-800 hover:bg-red-500/20 hover:border-red-500/30"
                            : "bg-gray-100 text-gray-500 hover:text-red-500 border border-gray-200 hover:bg-red-50 hover:border-red-300"
                        }`}
                        title="Remove Item"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Customizable Toggle & Options Input */}
                  <div
                    className={`pt-2.5 border-t ${
                      isDarkMode ? "border-neutral-800" : "border-gray-200"
                    }`}
                  >
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        checked={item.is_customizable}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            "is_customizable",
                            e.target.checked
                          )
                        }
                        className="w-3.5 h-3.5 accent-amber-400 rounded cursor-pointer"
                      />
                      <span className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                        <FaSlidersH className="text-[10px]" /> Customer Can Choose Flavor / Variation
                      </span>
                    </label>

                    {item.is_customizable && (
                      <div
                        className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 rounded-xl ${
                          isDarkMode
                            ? "bg-neutral-900 border border-neutral-800"
                            : "bg-white border border-gray-200"
                        }`}
                      >
                        <div>
                          <label
                            className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                              isDarkMode ? "text-neutral-400" : "text-gray-600"
                            }`}
                          >
                            Choice Group Label
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Choose Pizza Flavor, Choose Drink"
                            value={item.choice_group_name}
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                "choice_group_name",
                                e.target.value
                              )
                            }
                            className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium ${
                              isDarkMode
                                ? "bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500"
                                : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400"
                            }`}
                          />
                        </div>
                        <div>
                          <label
                            className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                              isDarkMode ? "text-neutral-400" : "text-gray-600"
                            }`}
                          >
                            Flavor Options (Comma Separated)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Chicken Tikka, Fajita, Peri Peri, Supreme"
                            value={item.options_str}
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                "options_str",
                                e.target.value
                              )
                            }
                            className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium ${
                              isDarkMode
                                ? "bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500"
                                : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400"
                            }`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Primary CTA Button */}
          <div
            className={`pt-6 border-t mt-6 ${
              isDarkMode ? "border-neutral-800" : "border-gray-200"
            }`}
          >
            <button
              type="button"
              onClick={handleSaveDeal}
              disabled={isSaving}
              className={`w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-neutral-950 font-black text-base uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 border-none cursor-pointer ${
                isSaving ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              <FaSave className="text-base" />
              <span>
                {isSaving
                  ? "Processing & Saving Deal..."
                  : editDeal
                  ? "Update Combo Deal"
                  : "Save & Launch Combo Deal"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealMaker;
