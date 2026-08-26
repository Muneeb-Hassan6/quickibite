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
  FaUtensils,
  FaSlidersH,
  FaImage,
  FaPercent,
  FaLayerGroup,
  FaEye,
} from "react-icons/fa";
import { resolveImageUrl } from "../../../../utils/imageOptimizer";

const DealMaker = ({ editDeal, onSuccess }) => {
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

  // Dynamic Addon Categories for Deals
  const AVAILABLE_ADDON_CATEGORIES = [
    { id: "drinks", name: "Cold Drinks", desc: "Coca-Cola, 7Up, Sprite, Mountain Dew, etc." },
    { id: "Potato Corner", name: "Potato Corner (Fries)", desc: "Plain Salted, Masala, Garlic Mayo, Loaded Fries" },
    { id: "Sauses", name: "Sauces & Dips", desc: "Garlic Mayo, Creamy Mayo, Chilli, Ketchup" },
    { id: "Grilled Wings", name: "Grilled & Hot Wings", desc: "Grilled Wings, Peri Peri Wings" },
    { id: "Fried Chicken", name: "Fried Chicken", desc: "Fried Chicken Pieces & Hot Wings" },
    { id: "Wraps", name: "Wraps & Rolls", desc: "Tortilla Wrap, Paratha Rolls" },
  ];

  const [selectedAddonCategories, setSelectedAddonCategories] = useState([
    "drinks",
    "Potato Corner",
    "Sauses",
    "Grilled Wings",
  ]);

  const toggleAddonCategory = (catId) => {
    setSelectedAddonCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dovuegkwa";
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ml_default";

  // Fetch Menu items for quick auto-fill suggestions
  const { data: menuData = [] } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_menu.php`
      );
      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || []);
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
            item_title: it.item_title || "",
            quantity: it.quantity || 1,
            is_customizable:
              it.is_customizable == 1 || it.is_customizable === true,
            choice_group_name: it.choice_group_name || "",
            options_str:
              it.options_str ||
              (it.options ? it.options.map((o) => o.option_name).join(", ") : ""),
          }))
        );
      }

      if (editDeal.addon_categories) {
        const cats = Array.isArray(editDeal.addon_categories)
          ? editDeal.addon_categories
          : editDeal.addon_categories
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
        setSelectedAddonCategories(cats);
      } else {
        setSelectedAddonCategories(["drinks", "Potato Corner", "Sauses", "Grilled Wings"]);
      }
    } else {
      setDealForm({
        title: "",
        description: "",
        price: "",
        original_price: "",
        badge_tag: "HOT DEAL",
      });
      setLogoFile(null);
      setLogoPreview("");
      setPromoBannerFile(null);
      setPromoBannerPreview("");
      setIsFeaturedBanner(false);
      setBannerOrder(0);
      setIsPermanent(true);
      setStartTime("12:00");
      setEndTime("16:00");
      setSelectedAddonCategories(["drinks", "Potato Corner", "Sauses", "Grilled Wings"]);
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

  // Image Upload Handlers
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handlePromoBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPromoBannerFile(file);
      setPromoBannerPreview(URL.createObjectURL(file));
    }
  };

  // Repeater Management
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
    const updated = includedItems.filter((_, i) => i !== index);
    setIncludedItems(
      updated.length > 0
        ? updated
        : [
            {
              item_title: "",
              quantity: 1,
              is_customizable: false,
              choice_group_name: "",
              options_str: "",
            },
          ]
    );
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...includedItems];
    updated[index][field] = value;
    setIncludedItems(updated);
  };

  const handleQuickSelectMenu = (index, menuItemId) => {
    const selected = menuItems.find((m) => m.id == menuItemId);
    if (!selected) return;

    const updated = [...includedItems];
    updated[index].item_title = selected.name || selected.title;
    setIncludedItems(updated);
  };

  // Cloudinary Uploader
  const uploadToCloudinary = async (file) => {
    let fileToUpload = file;
    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };
      fileToUpload = await imageCompression(file, options);
    } catch (err) {
      console.warn("Compression warning:", err);
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Image upload failed");
    return data.secure_url;
  };

  // Save / Update Deal Submission
  const handleSaveDeal = async () => {
    if (!dealForm.title.trim()) {
      return Swal.fire("Validation Error", "Please provide a deal title.", "warning");
    }
    if (!dealForm.price || isNaN(dealForm.price) || Number(dealForm.price) <= 0) {
      return Swal.fire("Validation Error", "Please provide a valid deal price.", "warning");
    }

    const validItems = includedItems.filter((it) => it.item_title.trim() !== "");
    if (validItems.length === 0) {
      return Swal.fire(
        "Validation Error",
        "Please add at least 1 bundled item.",
        "warning"
      );
    }

    setIsSaving(true);
    try {
      let finalImgUrl = logoPreview;
      if (logoFile) {
        finalImgUrl = await uploadToCloudinary(logoFile);
      }

      let finalPromoUrl = promoBannerPreview;
      if (promoBannerFile) {
        finalPromoUrl = await uploadToCloudinary(promoBannerFile);
      }

      const payload = {
        id: editDeal ? editDeal.id : undefined,
        title: dealForm.title.trim(),
        description: dealForm.description.trim(),
        price: parseFloat(dealForm.price),
        original_price: dealForm.original_price
          ? parseFloat(dealForm.original_price)
          : null,
        badge_tag: dealForm.badge_tag.trim(),
        img: finalImgUrl,
        is_permanent: isPermanent ? 1 : 0,
        start_time: isPermanent ? null : startTime,
        end_time: isPermanent ? null : endTime,
        is_featured_banner: isFeaturedBanner ? 1 : 0,
        promo_banner_image: isFeaturedBanner ? finalPromoUrl : null,
        banner_order: isFeaturedBanner ? parseInt(bannerOrder) || 0 : 0,
        addon_categories: selectedAddonCategories.join(","),
        items: validItems.map((it) => ({
          item_title: it.item_title.trim(),
          quantity: parseInt(it.quantity) || 1,
          is_customizable: it.is_customizable ? 1 : 0,
          choice_group_name: it.is_customizable ? it.choice_group_name.trim() : null,
          options_str: it.is_customizable ? it.options_str.trim() : null,
        })),
      };

      const endpoint = editDeal ? "update_deal.php" : "save_deal.php";
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      if (response.ok && result.success) {
        Swal.fire({
          icon: "success",
          title: "Deal Published!",
          text: editDeal
            ? "Deal has been updated."
            : "New deal bundle added to live menu.",
          timer: 1500,
          showConfirmButton: false,
          background: "#171717",
          color: "#fff",
        });
        if (onSuccess) onSuccess();
      } else {
        throw new Error(result.message || "Failed to save deal");
      }
    } catch (error) {
      Swal.fire("Error", error.message || "Network Error", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const dealPrice = parseFloat(dealForm.price) || 0;
  const origPrice = parseFloat(dealForm.original_price) || 0;
  const discountPercent =
    origPrice > dealPrice
      ? Math.round(((origPrice - dealPrice) / origPrice) * 100)
      : 0;

  return (
    <div className="space-y-6 animate-slide-up pb-8">
      {/* 2-Column Master Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ==================================================== */}
        {/* LEFT COLUMN: FORM BUILDER & COMBO REPEATER           */}
        {/* ==================================================== */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card 1: Deal Information */}
          <div className="admin-card-surface bg-white dark:bg-[#161616] p-5 rounded-2xl border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-white/[0.06]">
              <FaTag className="text-amber-500 text-sm" />
              <h3 className="m-0 text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white font-['Oswald',sans-serif]">
                1. General Information & Pricing
              </h3>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">
                Deal Title *
              </label>
              <input
                type="text"
                value={dealForm.title}
                onChange={(e) =>
                  setDealForm({ ...dealForm, title: e.target.value })
                }
                placeholder="e.g. Midnight Feast Combo, Family Mega Saver"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                value={dealForm.description}
                onChange={(e) =>
                  setDealForm({ ...dealForm, description: e.target.value })
                }
                placeholder="Details, included servings, drinks, dipping sauces..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs resize-none focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">
                  Deal Price (Rs.) *
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 rounded-xl px-3 focus-within:border-amber-500">
                  <span className="text-xs font-black text-amber-500 dark:text-amber-400 mr-1.5">Rs.</span>
                  <input
                    type="number"
                    min="0"
                    value={dealForm.price}
                    onChange={(e) =>
                      setDealForm({ ...dealForm, price: e.target.value })
                    }
                    placeholder="999"
                    className="w-full py-2.5 bg-transparent text-slate-900 dark:text-white font-black text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">
                  Original Price (Strikethrough)
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 rounded-xl px-3 focus-within:border-amber-500">
                  <span className="text-xs font-bold text-slate-400 dark:text-neutral-500 mr-1.5">Rs.</span>
                  <input
                    type="number"
                    min="0"
                    value={dealForm.original_price}
                    onChange={(e) =>
                      setDealForm({ ...dealForm, original_price: e.target.value })
                    }
                    placeholder="1300"
                    className="w-full py-2.5 bg-transparent text-slate-600 dark:text-neutral-400 font-semibold text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            {discountPercent > 0 && (
              <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <FaPercent className="text-[10px]" />
                <span>
                  Customer saves {discountPercent}% (Rs. {(origPrice - dealPrice).toLocaleString()} Discount)
                </span>
              </div>
            )}

            {/* Badge Ribbon Tag */}
            <div>
              <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">
                Badge Ribbon Tag
              </label>
              <input
                type="text"
                value={dealForm.badge_tag}
                onChange={(e) =>
                  setDealForm({ ...dealForm, badge_tag: e.target.value })
                }
                placeholder="e.g. HOT DEAL, MEGA SAVER"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-black uppercase tracking-wider focus:outline-none focus:border-amber-500 mb-2"
              />
              <div className="flex flex-wrap gap-1.5">
                {["HOT DEAL", "POPULAR", "MEGA SAVER", "VALUE PACK", "FAMILY DEAL"].map(
                  (tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setDealForm({ ...dealForm, badge_tag: tag })}
                      className={`text-[10px] font-bold px-3 py-1 !rounded-full border cursor-pointer transition-all ${
                        dealForm.badge_tag === tag
                          ? "bg-amber-500 text-neutral-950 border-amber-500 shadow-sm"
                          : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-400 border-slate-200 dark:border-white/5 hover:border-amber-500/40"
                      }`}
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Image Upload Dropzone */}
            <div>
              <label className="text-xs text-slate-600 dark:text-neutral-400 font-extrabold uppercase tracking-wider mb-1.5 block">
                Deal Image
              </label>
              <div
                className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl h-40 flex flex-col justify-center items-center cursor-pointer overflow-hidden relative bg-slate-50 dark:bg-white/[0.02] hover:border-amber-500 hover:bg-amber-500/5 transition-all group shadow-inner"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleLogoChange}
                />
                {logoPreview ? (
                  <>
                    <img
                      src={logoPreview}
                      alt="Deal Preview"
                      className="w-full h-full object-contain p-2"
                    />
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col justify-center items-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <FaCloudUploadAlt size={28} className="text-amber-400" />
                      <span className="text-xs font-bold mt-1.5">Change Image</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 dark:text-neutral-400 p-3 text-center">
                    <FaCloudUploadAlt className="text-2xl text-amber-500 dark:text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
                    <p className="m-0 font-bold text-xs text-slate-900 dark:text-white">Click to upload deal photo</p>
                    <span className="text-[10px] mt-0.5 text-slate-500 dark:text-neutral-400">PNG or JPG up to 5MB</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timing Schedule */}
            <div className="p-3.5 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/[0.06] space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={isPermanent}
                  onChange={(e) => setIsPermanent(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
                <span>Permanent Deal (Active 24/7)</span>
              </label>

              {!isPermanent && (
                <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-200 dark:border-white/5">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-neutral-400 block mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-neutral-400 block mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Promo Banner Feature */}
            <div className="p-3.5 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/[0.06] space-y-2.5">
              <label className={`flex items-center gap-2 text-xs font-bold cursor-pointer ${isFeaturedBanner ? "text-amber-600 dark:text-amber-400" : "text-slate-600 dark:text-neutral-400"}`}>
                <input
                  type="checkbox"
                  checked={isFeaturedBanner}
                  onChange={(e) => setIsFeaturedBanner(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
                <span>Feature as Homepage Wide Promo Banner</span>
              </label>

              {isFeaturedBanner && (
                <div className="pt-2.5 border-t border-slate-200 dark:border-white/5 space-y-2.5">
                  <div
                    onClick={() => promoFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl h-24 flex flex-col justify-center items-center cursor-pointer overflow-hidden relative bg-white dark:bg-black/30 hover:border-amber-500 group"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      ref={promoFileInputRef}
                      className="hidden"
                      onChange={handlePromoBannerChange}
                    />
                    {promoBannerPreview ? (
                      <img
                        src={promoBannerPreview}
                        alt="Promo Banner Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2">
                        <FaImage className="text-lg text-amber-500 dark:text-amber-400 mx-auto mb-1" />
                        <span className="text-[10px] font-bold text-slate-600 dark:text-neutral-300 block">
                          Upload 1200x500 Wide Banner
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-neutral-400 block mb-1">
                      Banner Sort Order (0 = First)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={bannerOrder}
                      onChange={(e) => setBannerOrder(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Combo Bundled Items Repeater */}
          <div className="admin-card-surface bg-white dark:bg-[#161616] p-5 rounded-2xl border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <FaUtensils className="text-amber-500 text-sm" />
                <h3 className="m-0 text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white font-['Oswald',sans-serif]">
                  2. Bundled Food Items ({includedItems.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border-none shadow-sm transition-all active:scale-95"
              >
                <FaPlus className="text-[10px]" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Repeater List */}
            <div className="space-y-3">
              {includedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-3 hover:border-amber-500/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                    <div className="flex-1 min-w-0">
                      <label className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-neutral-400 block mb-1">
                        Item Title *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1 Large Pizza, Zinger Burger"
                        value={item.item_title}
                        onChange={(e) =>
                          handleItemChange(idx, "item_title", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-black/40 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-white/10 text-xs font-semibold focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="w-full sm:w-20">
                      <label className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-neutral-400 block mb-1 text-center">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(idx, "quantity", e.target.value)
                        }
                        className="w-full p-2 bg-white dark:bg-black/40 text-amber-600 dark:text-amber-400 text-center font-black rounded-xl border border-slate-300 dark:border-white/10 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="w-full sm:w-44">
                      <label className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-neutral-400 block mb-1">
                        Auto-fill from Menu
                      </label>
                      <select
                        onChange={(e) =>
                          handleQuickSelectMenu(idx, e.target.value)
                        }
                        defaultValue=""
                        className="w-full p-2 bg-white dark:bg-black/40 text-slate-900 dark:text-neutral-300 rounded-xl border border-slate-300 dark:border-white/10 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option className="bg-white dark:bg-[#171717]" value="">-- Pick Product --</option>
                        {menuItems.map((m) => (
                          <option className="bg-white dark:bg-[#171717]" key={m.id} value={m.id}>
                            {m.name || m.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="self-end sm:self-center pt-2 sm:pt-4">
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white flex items-center justify-center border-none cursor-pointer transition-colors"
                        title="Remove Item"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>

                  {/* Customizable Flavor Choices */}
                  <div className="pt-2 border-t border-slate-200 dark:border-white/5 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-600 dark:text-amber-400">
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
                        className="w-3.5 h-3.5 accent-amber-500 cursor-pointer"
                      />
                      <span className="flex items-center gap-1.5">
                        <FaSlidersH className="text-[10px]" /> Customer Can Choose Flavor / Drink
                      </span>
                    </label>

                    {item.is_customizable && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 bg-slate-100 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/5">
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 dark:text-neutral-400 block mb-1">
                            Choice Group Label
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Select Pizza Flavor"
                            value={item.choice_group_name || ""}
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                "choice_group_name",
                                e.target.value
                              )
                            }
                            className="w-full p-2 bg-white dark:bg-black/50 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-white/10 text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 dark:text-neutral-400 block mb-1">
                            Comma-Separated Options
                          </label>
                          <input
                            type="text"
                            placeholder="Fajita, Tikka, Pepperoni, Veggie"
                            value={item.options_str || ""}
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                "options_str",
                                e.target.value
                              )
                            }
                            className="w-full p-2 bg-white dark:bg-black/50 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-white/10 text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Attach Dynamic Addon Groups & Upsells */}
          <div className="admin-card-surface bg-white dark:bg-[#161616] p-5 rounded-2xl border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <FaLayerGroup className="text-amber-500 text-sm" />
                <div>
                  <h3 className="m-0 text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white font-['Oswald',sans-serif]">
                    3. Attach Dynamic Addon Groups & Upsells
                  </h3>
                  <p className="m-0 text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                    Select which dynamic addon categories and pairings will be offered to customers when customizing this deal.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {selectedAddonCategories.length} Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AVAILABLE_ADDON_CATEGORIES.map((cat) => {
                const isSelected = selectedAddonCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleAddonCategory(cat.id)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-start justify-between gap-2.5 ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/60 text-slate-900 dark:text-white shadow-xs ring-1 ring-amber-500/30"
                        : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-300 hover:border-amber-500/40"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] shrink-0 ${
                            isSelected
                              ? "bg-amber-500 text-neutral-950 font-black"
                              : "border border-slate-300 dark:border-neutral-600"
                          }`}
                        >
                          {isSelected && "✓"}
                        </div>
                        <span className="text-xs font-bold truncate">{cat.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-neutral-400 m-0 mt-1 pl-6">
                        {cat.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="admin-card-surface flex justify-end gap-3 p-4 bg-white dark:bg-[#161616] rounded-2xl border border-slate-200 dark:border-white/[0.06] shadow-sm">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveDeal}
              className="bg-amber-500/90 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-400 text-neutral-900 font-bold px-6 py-2.5 rounded-xl shadow-sm transition-all duration-200 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border-none disabled:opacity-50 active:scale-95"
            >
              <FaSave className="text-xs" />
              <span>{isSaving ? "Saving Deal..." : editDeal ? "Update Deal" : "Publish Deal to Menu"}</span>
            </button>
          </div>
        </div>

        {/* ==================================================== */}
        {/* RIGHT COLUMN: STICKY LIVE CUSTOMER CARD PREVIEW      */}
        {/* ==================================================== */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          <div className="flex items-center gap-2 px-1">
            <FaEye className="text-amber-500 text-xs" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-neutral-400">
              Live Customer Portal Preview
            </span>
          </div>

          {/* Live Preview Card */}
          <div className="admin-card-surface bg-white dark:bg-[#161616] rounded-3xl border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white overflow-hidden shadow-2xl flex flex-col justify-between">
            <div>
              {/* Media Banner */}
              <div className="relative h-52 bg-slate-100 dark:bg-black/60 flex items-center justify-center p-3">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-slate-400 dark:text-neutral-600">
                    <FaImage className="text-4xl mx-auto mb-2 opacity-50" />
                    <span className="text-xs font-bold">No Image Uploaded</span>
                  </div>
                )}

                {/* Ribbon Tag */}
                <div className="absolute top-3.5 left-3.5 bg-amber-100/80 dark:bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-300/60 dark:border-amber-500/20 text-xs font-bold uppercase tracking-wider px-3 py-0.5 !rounded-full shadow-sm flex items-center gap-1 backdrop-blur-sm">
                  <FaTag className="text-[10px]" />
                  <span>{dealForm.badge_tag || "HOT DEAL"}</span>
                </div>

                {/* Discount Badge */}
                {discountPercent > 0 && (
                  <div className="absolute bottom-3.5 left-3.5 bg-emerald-500 text-neutral-950 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 !rounded-full shadow-md flex items-center gap-1">
                    <FaPercent className="text-[9px]" />
                    <span>{discountPercent}% OFF</span>
                  </div>
                )}
              </div>

              {/* Body Content */}
              <div className="p-5 space-y-4">
                <div>
                  <h4 className="m-0 text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide font-['Oswald',sans-serif]">
                    {dealForm.title || "Your Deal Title"}
                  </h4>
                  <p className="m-0 mt-1 text-xs text-slate-500 dark:text-neutral-400 line-clamp-2">
                    {dealForm.description || "Deal description and servings will appear here."}
                  </p>
                </div>

                {/* Price & Schedule */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                      Rs. {dealPrice > 0 ? dealPrice.toLocaleString() : "0"}
                    </span>
                    {origPrice > 0 && (
                      <span className="text-xs text-slate-400 dark:text-neutral-500 line-through">
                        Rs. {origPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="text-[10px] font-bold text-slate-600 dark:text-neutral-400 flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/5">
                    <FaClock className="text-amber-500 dark:text-amber-400 text-[10px]" />
                    <span>{isPermanent ? "24/7" : `${startTime} - ${endTime}`}</span>
                  </div>
                </div>

                {/* Bundled Items Preview */}
                <div className="p-3.5 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="text-[10px] uppercase font-extrabold text-slate-600 dark:text-neutral-400 flex items-center gap-1">
                    <FaLayerGroup className="text-amber-500 dark:text-amber-400 text-[10px]" />
                    <span>Includes {includedItems.filter(i => i.item_title.trim()).length} Items:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {includedItems.filter(i => i.item_title.trim()).length > 0 ? (
                      includedItems
                        .filter(i => i.item_title.trim())
                        .map((it, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-medium bg-slate-200 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-neutral-300 px-2 py-0.5 rounded-lg flex items-center gap-1"
                          >
                            <span className="text-amber-600 dark:text-amber-400 font-bold">{it.quantity}x</span>
                            <span className="truncate max-w-[120px]">{it.item_title}</span>
                            {it.is_customizable && (
                              <span className="text-[9px] text-amber-600 dark:text-amber-400 font-black bg-amber-500/15 px-1 rounded">
                                Choice
                              </span>
                            )}
                          </span>
                        ))
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-neutral-500 italic">No bundled items configured yet.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealMaker;
