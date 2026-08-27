import Swal from "sweetalert2";
import imageCompression from "browser-image-compression";

export function useDealFormValidation() {
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dovuegkwa";
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ml_default";

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

  const validateDealForm = (dealForm, includedItems) => {
    if (!dealForm.title.trim()) {
      Swal.fire("Validation Error", "Please provide a deal title.", "warning");
      return false;
    }
    if (!dealForm.price || isNaN(dealForm.price) || Number(dealForm.price) <= 0) {
      Swal.fire("Validation Error", "Please provide a valid deal price.", "warning");
      return false;
    }

    const validItems = includedItems.filter((it) => it.item_title.trim() !== "");
    if (validItems.length === 0) {
      Swal.fire(
        "Validation Error",
        "Please add at least 1 bundled item.",
        "warning"
      );
      return false;
    }

    return validItems;
  };

  const buildDealPayload = ({
    editDeal,
    dealForm,
    finalImgUrl,
    isPermanent,
    startTime,
    endTime,
    isFeaturedBanner,
    finalPromoUrl,
    bannerOrder,
    selectedAddonCategories,
    validItems,
  }) => {
    return {
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
  };

  return {
    uploadToCloudinary,
    validateDealForm,
    buildDealPayload,
  };
}
