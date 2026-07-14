import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import {
  FaSearch,
  FaPlus,
  FaMinus,
  FaTrash,
  FaCheck,
  FaCheckSquare,
  FaRegSquare,
  FaTimes,
  FaArrowLeft,
  FaBars,
  FaShoppingCart,
} from "react-icons/fa";

const POSTerminal = ({ onPlaceOrder, terminalResetTrigger, setIsMobileSidebarOpen }) => {
  const [viewMode, setViewMode] = useState("categories"); // "categories" or "products"
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [addonsList, setAddonsList] = useState([]);

  const [gstRate, setGstRate] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);

  const [orderType, setOrderType] = useState("Dine-In");
  const [tableNo, setTableNo] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");


  const [customizationItem, setCustomizationItem] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [optionalIngredients, setOptionalIngredients] = useState([]);
  const [excludedIds, setExcludedIds] = useState([]);
  const [isFetchingRecipe, setIsFetchingRecipe] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [customNote, setCustomNote] = useState("");

  const { data: settingsData = {} } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_settings.php`);
      const data = await response.json();
      return data.status === "success" ? data.data : {};
    }
  });

  const { data: menuData = [] } = useQuery({
    queryKey: ['menu'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_menu.php`);
      return await response.json();
    }
  });

  const { data: realCategories = [] } = useQuery({
    queryKey: ['realCategories'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_categories.php`);
      return await response.json();
    }
  });

  useEffect(() => {
    if (terminalResetTrigger > 0) {
      setSearchTerm("");
      setSelectedCategory("All");
      setViewMode("categories");
    }
  }, [terminalResetTrigger]);

  useEffect(() => {
    if (searchTerm.trim() !== "") {
      setViewMode("products");
    } else if (selectedCategory === "All") {
      setViewMode("categories");
    }
  }, [searchTerm]);

  useEffect(() => {
    if (settingsData && Object.keys(settingsData).length > 0) {
      setGstRate(parseFloat(settingsData.tax) || 0);
      setDeliveryFee(parseFloat(settingsData.delivery_charges) || 0);
    }
  }, [settingsData]);

  useEffect(() => {
    if (Array.isArray(menuData) && menuData.length > 0) {
      const availableItems = menuData.filter((item) => item.isAvailable);
      const formattedItems = availableItems.map((item) => ({
        id: item.id,
        title: item.name,
        category: item.category || "Uncategorized",
        variants: item.variants || [],
        price: item.variants && item.variants.length > 0
            ? parseFloat(item.variants[0].price)
            : parseFloat(item.price),
      }));
      setMenuItems(formattedItems);
      const uniqueCategories = ["All", ...new Set(formattedItems.map((i) => i.category).filter(Boolean))];
      setCategories(uniqueCategories);
    }
  }, [menuData]);

  const filteredItems = menuItems.filter((item) => {
    return (
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "All" || item.category === selectedCategory) &&
      item.category.toLowerCase() !== "add-ons"
    );
  });

  useEffect(() => {
    if (customizationItem && selectedSize) {
      const fetchDetails = async () => {
        setIsFetchingRecipe(true);
        try {
          const recipeRes = await fetch(
            `${import.meta.env.VITE_API_BASE}/get_recipe.php?menu_item_id=${customizationItem.id}&variant_name=${selectedSize.size}`,
          );
          const recipeData = await recipeRes.json();
          if (recipeRes.ok && recipeData.status === "success") {
            const removables = recipeData.ingredients.filter(
              (ing) => ing.is_removable == 1,
            );
            setOptionalIngredients(removables);
          } else {
            setOptionalIngredients([]);
          }

          const addonsRes = await fetch(
            `${import.meta.env.VITE_API_BASE}/get_addons.php?menu_item_id=${customizationItem.id}`,
          );
          const addonsData = await addonsRes.json();
          if (
            addonsRes.ok &&
            addonsData.status === "success" &&
            addonsData.addons
          ) {
            setAddonsList(addonsData.addons);
          } else {
            setAddonsList([]);
          }
        } catch (error) {
          console.error("Error fetching details:", error);
          setOptionalIngredients([]);
          setAddonsList([]);
        } finally {
          setIsFetchingRecipe(false);
        }
      };
      fetchDetails();
    }
  }, [customizationItem, selectedSize]);

  // 🔥 UPDATE: Khulte hi pehla In-Stock variant dhoondy
  const openCustomization = (item) => {
    setCustomizationItem(item);

    let defaultVariant = { size: "Regular", price: item.price };
    if (item.variants && item.variants.length > 0) {
      const firstAvailable = item.variants.find(
        (v) => v.inStock !== false && v.inStock !== 0 && v.inStock !== "0",
      );
      defaultVariant = firstAvailable ? firstAvailable : item.variants[0];
    }

    setSelectedSize(defaultVariant);
    setExcludedIds([]);
    setSelectedAddons([]);
    setCustomNote("");
  };

  const toggleRemovable = (invId) =>
    setExcludedIds((prev) =>
      prev.includes(invId)
        ? prev.filter((id) => id !== invId)
        : [...prev, invId],
    );

  const toggleAddon = (addon) =>
    setSelectedAddons((prev) =>
      prev.find((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon],
    );

  // 🔥 UPDATE: Quick add mein Sold Out ko block kiya
  const handleItemClick = (item) => {
    if (item.variants && item.variants.length > 1) {
      openCustomization(item);
    } else {
      const variant =
        item.variants && item.variants.length > 0
          ? item.variants[0]
          : { size: "Regular", price: item.price, inStock: 1 };

      const isOutOfStock =
        variant.inStock === false ||
        variant.inStock === 0 ||
        variant.inStock === "0";

      if (isOutOfStock) {
        Swal.fire({
          icon: "warning",
          title: "Sold Out",
          text: "This item is currently out of stock.",
          background: "var(--admin-panel)",
          color: "#fff",
          timer: 2000,
          showConfirmButton: false,
        });
        return;
      }

      addItemToCart(item, variant, "", []);
    }
  };

  const addItemToCart = (
    item,
    variant,
    noteString = "",
    excludedArr = [],
    isAddonData = null,
  ) => {
    const cartId = `${item.id}-${variant.size}-${noteString}-${excludedArr.join("-")}`;
    setCart((prev) => {
      const exist = prev.find((i) => i.cartId === cartId);
      if (exist)
        return prev.map((i) =>
          i.cartId === cartId ? { ...i, qty: i.qty + 1 } : i,
        );

      return [
        ...prev,
        {
          ...item,
          cartId,
          size: variant.size,
          price: parseFloat(variant.price),
          note: noteString,
          excluded_ingredients: excludedArr,
          qty: 1,
          is_addon: isAddonData ? true : false,
          addon_data: isAddonData,
        },
      ];
    });
  };

  const addCustomizedToCart = () => {
    const noteString = customNote.trim();

    addItemToCart(customizationItem, selectedSize, noteString, excludedIds);

    selectedAddons.forEach((addon) => {
      const pseudoItem = { id: `addon-${addon.id}`, title: addon.addon_name };
      const pseudoVariant = { size: "Extra", price: addon.addon_price };
      const addonData = {
        inventory_id: addon.inventory_id,
        qty: addon.qty_to_deduct,
      };

      addItemToCart(
        pseudoItem,
        pseudoVariant,
        `For ${customizationItem.title}`,
        [],
        addonData,
      );
    });
    setCustomizationItem(null);
  };

  const updateQty = (cartId, delta) =>
    setCart((prev) =>
      prev.map((item) =>
        item.cartId === cartId
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item,
      ),
    );

  const removeFromCart = (cartId) =>
    setCart((prev) => prev.filter((i) => i.cartId !== cartId));

  const getSubtotal = () =>
    cart.reduce((total, item) => total + item.price * item.qty, 0);
  const getTaxAmount = () => (getSubtotal() * gstRate) / 100;
  const getDeliveryAmount = () => (orderType === "Delivery" ? deliveryFee : 0);
  const getGrandTotal = () =>
    getSubtotal() + getTaxAmount() + getDeliveryAmount();

  const handleCheckout = async () => {
    if (cart.length === 0)
      return Swal.fire({
        icon: "error",
        title: "Empty Cart",
        text: "Please add items to cart first.",
        background: "var(--admin-panel)",
        color: "#fff",
      });

    if (orderType === "Dine-In" && (!tableNo || tableNo.trim() === ""))
      return Swal.fire({
        icon: "warning",
        title: "Table No Required",
        text: "Please enter a Table Number.",
        background: "var(--admin-panel)",
        color: "#fff",
      });

    if (orderType === "Delivery") {
      if (!tableNo || tableNo.trim() === "") {
        return Swal.fire({
          icon: "warning",
          title: "Address Required",
          text: "Please enter a Delivery Address.",
          background: "var(--admin-panel)",
          color: "#fff",
        });
      }
      if (!customerMobile || customerMobile.trim() === "") {
        return Swal.fire({
          icon: "warning",
          title: "Mobile Required",
          text: "Please enter a Customer Mobile Number.",
          background: "var(--admin-panel)",
          color: "#fff",
        });
      }
    }

    const orderPayload = {
      order_type: orderType,
      customer_name: customerName || "Walk-in",
      table_number: orderType === "Dine-In" ? tableNo : orderType,
      customer_mobile: orderType === "Delivery" ? customerMobile : null,
      customer_address: orderType === "Delivery" ? tableNo : "",
      subtotal: getSubtotal(),
      tax_amount: getTaxAmount(),
      delivery_fee: getDeliveryAmount(),
      total: getGrandTotal(),
      cart: cart,
    };

    try {
      Swal.fire({
        title: "Sending to Kitchen...",
        allowOutsideClick: false,
        background: "var(--admin-panel)",
        color: "#fff",
        didOpen: () => Swal.showLoading(),
      });
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/create_order.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        },
      );
      const data = await response.json();

      if (response.ok && data.success) {
        const newOrderForPortal = {
          id: data.order_id || Math.floor(1000 + Math.random() * 9000),
          table: orderPayload.table_number,
          customerName: customerName || "Walk-in",
          time: new Date().toLocaleTimeString(),
          total: getGrandTotal(),
          status: "Pending",
          items: cart,
        };
        onPlaceOrder(newOrderForPortal);

        // 🔥 REAL-TIME: Kitchen ko foran signal bhejo
        try {
          const socket = io(import.meta.env.VITE_SOCKET_URL, {
            transports: ["websocket"],
            reconnection: false,
          });
          socket.on("connect", () => {
            socket.emit("new_order_placed");
            setTimeout(() => socket.disconnect(), 1000);
          });
        } catch (socketErr) {
          console.warn("Socket emit failed (non-critical):", socketErr);
        }

        setCart([]);
        setTableNo("");
        setCustomerName("");
        setCustomerMobile("");
        setOrderType("Dine-In");

        Swal.fire({
          icon: "success",
          title: "Order Placed!",
          text: `Order sent to kitchen as ${orderType}`,
          timer: 2000,
          showConfirmButton: false,
          background: "var(--admin-panel)",
          color: "#fff",
        });
      } else {
        throw new Error(data.message || "Failed to save order");
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      Swal.fire({
        icon: "error",
        title: "Order Failed",
        text: error.message || "Could not connect to database.",
        background: "var(--admin-panel)",
        color: "#fff",
      });
    }
  };


  // 🔥 HELPER: To disable Add To Cart if currently selected item is out of stock
  const isCurrentSelectionOutOfStock = () => {
    if (!selectedSize) return false;
    return (
      selectedSize.inStock === false ||
      selectedSize.inStock === 0 ||
      selectedSize.inStock === "0"
    );
  };

  return (
    <div className="flex h-full p-[25px] gap-[25px] flex-col min-[901px]:flex-row max-[900px]:p-[15px_12px_110px_12px] animate-slide-up">
      <div className="flex-[3] flex flex-col overflow-y-auto pr-[15px] max-[900px]:w-full max-[900px]:max-w-full [&::-webkit-scrollbar]:hidden max-[900px]:pr-0">
        <div className="flex justify-between items-center mb-[20px] max-[900px]:mb-[15px]">
          <div className="flex items-center gap-[10px]">
            <button 
              className="hidden max-[900px]:flex bg-transparent border-none text-[var(--brand-red)] text-[24px] cursor-pointer items-center justify-center p-[5px]"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <FaBars />
            </button>
            <h2 className="m-0 font-oswald text-[28px] font-extrabold text-[var(--admin-text)] uppercase tracking-[1px] max-[900px]:text-[22px]">Point of Sale</h2>
          </div>
          
          {/* Mobile Cart Toggle Button */}
          <button 
            className="hidden max-[900px]:flex relative bg-[#FFDD00] text-[#1a1a1a] border-none rounded-full w-[45px] h-[45px] items-center justify-center cursor-pointer shadow-md"
            onClick={() => setIsMobileCartOpen(true)}
          >
            <FaShoppingCart className="text-[20px]" />
            {cart.length > 0 && (
              <span className="absolute top-[-5px] right-[-5px] bg-black text-[#FFDD00] w-[20px] h-[20px] rounded-full text-[12px] font-bold flex items-center justify-center border-2 border-[#FFDD00]">
                {cart.length}
              </span>
            )}
          </button>
        </div>
        <div className="flex gap-[15px] mb-[20px] items-center">
          <div className="flex-[0_1_220px] flex items-center bg-[var(--pos-panel)] border border-[var(--admin-border)] rounded-[20px] px-[15px] transition-colors duration-300 focus-within:border-[var(--brand-red)] shadow-sm">
            <FaSearch className="text-[var(--admin-muted)] mr-[10px]" />
            <input
              type="text"
              className="bg-transparent border-none text-[var(--admin-text)] py-[12px] px-0 w-full outline-none"
              placeholder="Search menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="bg-[var(--pos-panel)] text-[var(--admin-text)] border border-[var(--admin-border)] py-[12px] px-[15px] rounded-[20px] text-[14px] font-semibold outline-none cursor-pointer min-w-[180px] transition-all duration-300 focus:border-[var(--brand-red)] focus:bg-[var(--pos-panel)] shadow-sm"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setViewMode("products");
            }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {viewMode === "products" && selectedCategory !== "All" && !searchTerm && (
          <div className="mb-[15px]">
            <button 
              className="bg-transparent border-none text-[var(--brand-red)] font-bold text-[14px] cursor-pointer flex items-center gap-[6px] hover:underline p-0"
              onClick={() => {
                setSelectedCategory("All");
                setViewMode("categories");
              }}
            >
              <FaArrowLeft /> Back to Categories
            </button>
          </div>
        )}

        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[15px]">
          {viewMode === "categories" ? (
            realCategories.length > 0 ? (
              realCategories.map((cat) => (
                <div 
                  key={cat.id} 
                  className="relative bg-cover bg-center rounded-[16px] cursor-pointer overflow-hidden transition-transform duration-300 hover:scale-105 flex items-end justify-center min-h-[140px]"
                  style={{ backgroundImage: `url(${cat.img})`, border: "none" }}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setViewMode("products");
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <span className="relative z-10 text-white font-extrabold text-[16px] mb-[15px] drop-shadow-md text-center">{cat.name}</span>
                </div>
              ))
            ) : (
              categories.filter(c => c !== "All").map((catName) => (
                <div 
                  key={catName} 
                  className="bg-[var(--pos-panel)] border border-[var(--admin-border)] rounded-[16px] p-[20px] cursor-pointer transition-all duration-300 flex items-center justify-center min-h-[120px] hover:border-[var(--brand-red)] hover:bg-[rgba(239,68,68,0.1)] hover:-translate-y-[2px]"
                  style={{ borderRadius: "16px" }}
                  onClick={() => {
                    setSelectedCategory(catName);
                    setViewMode("products");
                  }}
                >
                  <span className="text-[16px] font-bold text-[var(--admin-text)] text-center">{catName}</span>
                </div>
              ))
            )
          ) : (
            filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[var(--pos-panel)] border border-[var(--admin-border)] shadow-sm rounded-[16px] p-[15px] cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[100px] hover:border-[var(--brand-red,#ef4444)] hover:shadow-[var(--shadow-glow)] hover:-translate-y-[2px]"
              style={{ borderRadius: "16px", outline: "none" }}
              onClick={() => handleItemClick(item)}
            >
              <div className="text-[15px] font-bold text-[var(--admin-text)] mb-[10px] leading-[1.3]">{item.title}</div>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-[var(--brand-red,#ef4444)] font-extrabold text-[14px]">Rs {item.price}</span>
                <div className="flex items-center justify-center">
                  <button
                    className="bg-[#FFDD00] text-[#1a1a1a] border-none w-[34px] h-[34px] rounded-[10px] flex justify-center items-center cursor-pointer text-[14px] transition-all duration-200 shadow-[0_2px_6px_rgba(255,221,0,0.3)] hover:bg-[#E5C700] hover:scale-110 hover:shadow-[0_4px_10px_rgba(255,221,0,0.5)] active:scale-95"
                    style={{ borderRadius: "10px", border: "none", outline: "none" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(item);
                    }}
                    title="Quick Add"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
            </div>
          )))}
        </div>
      </div>

      {/* Mobile Cart Overlay */}
      {isMobileCartOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[140] min-[901px]:hidden"
          onClick={() => setIsMobileCartOpen(false)}
        ></div>
      )}

      {/* Cart Container */}
      <div className={`flex-1 min-w-[320px] max-w-[380px] bg-[var(--pos-panel)] border-l border-[var(--admin-border)] rounded-[24px] flex flex-col overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)] 
        max-[900px]:fixed max-[900px]:right-0 max-[900px]:top-0 max-[900px]:h-full max-[900px]:z-[150] max-[900px]:rounded-none max-[900px]:transition-transform max-[900px]:duration-300 max-[900px]:w-[320px] 
        ${isMobileCartOpen ? 'max-[900px]:translate-x-0' : 'max-[900px]:translate-x-full'}`}>
        <div className="p-[20px] bg-[rgba(255,221,0,0.05)] border-b border-[var(--admin-border)] flex justify-between items-center border-t-[4px] border-t-[#FFDD00]">
          <h3 className="m-0 font-oswald text-[18px] text-[var(--admin-text)] font-extrabold tracking-[1px]">CURRENT ORDER</h3>
          <button 
            className="hidden max-[900px]:flex bg-transparent border-none text-[var(--admin-muted)] text-[20px] cursor-pointer hover:text-[var(--brand-red)]"
            onClick={() => setIsMobileCartOpen(false)}
          >
            <FaTimes />
          </button>
        </div>
        <div className="p-[15px] border-b border-transparent">
          <div className="flex bg-[var(--bg-body)] border border-[var(--admin-border)] rounded-[8px] p-[4px] mb-[15px]" style={{ borderRadius: "8px" }}>
            <button
              className={`flex-1 py-[8px] px-0 border-none font-bold text-[13px] rounded-[6px] cursor-pointer transition-all duration-300 uppercase ${orderType === "Dine-In" ? "bg-[#FFDD00] text-[#1a1a1a]" : "bg-transparent text-[var(--admin-muted)]"}`}
              style={{ borderRadius: "6px", border: "none" }}
              onClick={() => setOrderType("Dine-In")}
            >
              Dine-In
            </button>
            <button
              className={`flex-1 py-[8px] px-0 border-none font-bold text-[13px] rounded-[6px] cursor-pointer transition-all duration-300 uppercase ${orderType === "Takeaway" ? "bg-[#FFDD00] text-[#1a1a1a]" : "bg-transparent text-[var(--admin-muted)]"}`}
              style={{ borderRadius: "6px", border: "none" }}
              onClick={() => setOrderType("Takeaway")}
            >
              Takeaway
            </button>
            <button
              className={`flex-1 py-[8px] px-0 border-none font-bold text-[13px] rounded-[6px] cursor-pointer transition-all duration-300 uppercase ${orderType === "Delivery" ? "bg-[#FFDD00] text-[#1a1a1a]" : "bg-transparent text-[var(--admin-muted)]"}`}
              style={{ borderRadius: "6px", border: "none" }}
              onClick={() => setOrderType("Delivery")}
            >
              Delivery
            </button>
          </div>

          {orderType === "Dine-In" && (
            <input
              type="text"
              className="w-full bg-[var(--bg-body)] border border-[var(--admin-border)] shadow-sm p-[12px] rounded-[12px] text-[var(--admin-text)] outline-none mb-[10px] focus:border-[var(--brand-red)]"
              placeholder="Table No *"
              value={tableNo}
              onChange={(e) => setTableNo(e.target.value)}
            />
          )}

          {orderType === "Delivery" && (
            <>
              <input
                type="text"
                className="w-full bg-[var(--bg-body)] border border-[var(--admin-border)] shadow-sm p-[12px] rounded-[12px] text-[var(--admin-text)] outline-none mb-[10px] focus:border-[var(--brand-red)]"
                placeholder="Delivery Address *"
                value={tableNo}
                onChange={(e) => setTableNo(e.target.value)}
              />
              <input
                type="text"
                className="w-full bg-[var(--bg-body)] border border-[var(--admin-border)] shadow-sm p-[12px] rounded-[12px] text-[var(--admin-text)] outline-none mb-[10px] focus:border-[var(--brand-red)]"
                placeholder="Customer Mobile *"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
              />
            </>
          )}

          <input
            type="text"
            className="w-full bg-[var(--bg-body)] border border-[var(--admin-border)] shadow-sm p-[12px] rounded-[12px] text-[var(--admin-text)] outline-none mb-[10px] focus:border-[var(--brand-red)]"
            placeholder="Customer Name (Optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-[15px]">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div key={item.cartId} className="grid grid-cols-[2fr_1.5fr_1fr_0.5fr] items-center gap-[10px] mb-[10px] p-[12px] bg-[var(--bg-body)] border border-[var(--admin-border)] shadow-sm rounded-[16px]">
                <div>
                  <h4 className="m-0 text-[13px] text-[var(--admin-text)]">
                    {item.title}{" "}
                    <span className="text-[12px] text-[var(--brand-red)] ml-[5px]">
                      {item.size && item.size !== "Regular"
                        ? `(${item.size})`
                        : ""}
                    </span>
                  </h4>
                  {item.note && (
                    <div className="text-[11px] text-[var(--admin-muted)] mt-[3px] italic">Note: {item.note}</div>
                  )}
                  {item.excluded_ingredients &&
                    item.excluded_ingredients.length > 0 && (
                      <div className="text-[11px] text-[var(--brand-red)] mt-[1px] font-bold">
                        - Optional items removed
                      </div>
                    )}
                  <span className="text-[11px] text-[var(--admin-muted)]">@ Rs {item.price}</span>
                </div>
                <div className="flex items-center justify-center bg-[var(--pos-panel)] rounded-[12px] border border-[var(--admin-border)] p-[2px] shadow-sm">
                  <button
                    className="w-[24px] h-[24px] bg-transparent text-[var(--admin-muted)] border-none cursor-pointer"
                    onClick={() =>
                      item.qty > 1
                        ? updateQty(item.cartId, -1)
                        : removeFromCart(item.cartId)
                    }
                  >
                    <FaMinus />
                  </button>
                  <span className="text-[12px] font-bold text-[var(--admin-text)] w-[20px] text-center">{item.qty}</span>
                  <button
                    className="w-[24px] h-[24px] bg-transparent text-[var(--admin-muted)] border-none cursor-pointer"
                    onClick={() => updateQty(item.cartId, 1)}
                  >
                    <FaPlus />
                  </button>
                </div>
                <div className="font-bold text-[var(--brand-red)] text-[14px] text-right">Rs {item.price * item.qty}</div>
                <button
                  className="bg-transparent border-none text-[var(--admin-muted)] cursor-pointer hover:text-red-500"
                  onClick={() => removeFromCart(item.cartId)}
                >
                  <FaTrash />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center text-[var(--admin-muted)] py-4">Cart is Empty</div>
          )}
        </div>

        <div className="bg-[var(--bg-body)] p-[20px] border-t border-[var(--admin-border)] rounded-b-[24px]">
          <div className="w-full mb-[15px] border-b border-[var(--admin-border)] pb-[10px]">
            <div className="flex justify-between text-[14px] text-[var(--admin-muted)] mb-[5px]">
              <span>Subtotal:</span>
              <span>Rs {getSubtotal().toFixed(2)}</span>
            </div>

            {gstRate > 0 && (
              <div className="flex justify-between text-[14px] text-[var(--admin-muted)] mb-[5px]">
                <span>Tax ({gstRate}%):</span>
                <span>Rs {getTaxAmount().toFixed(2)}</span>
              </div>
            )}

            {orderType === "Delivery" && deliveryFee > 0 && (
              <div className="flex justify-between text-[14px] text-[var(--admin-muted)] mb-[5px]">
                <span>Delivery Fee:</span>
                <span>Rs {deliveryFee.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-[14px] text-[var(--admin-muted)] mb-[5px] text-[18px] font-bold text-[var(--admin-text)] mt-[10px] pt-[10px] border-t border-dashed border-[var(--admin-border)]">
              <span>TOTAL:</span>
              <span>Rs {getGrandTotal().toFixed(2)}</span>
            </div>
          </div>

          <button className="w-full bg-[#FFDD00] p-[15px] border-none rounded-[12px] text-[#1a1a1a] font-oswald font-extrabold text-[16px] cursor-pointer flex justify-center items-center gap-[10px] transition-all duration-300 hover:bg-[#E5C700]" style={{ borderRadius: "12px", border: "none", outline: "none" }} onClick={handleCheckout}>
            <FaCheck /> PLACE ORDER
          </button>
        </div>
      </div>

      {customizationItem && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.6)] flex items-center justify-center z-[999999] backdrop-blur-[6px]"
          onClick={() => setCustomizationItem(null)}
        >
          <div
            className="bg-[var(--admin-panel,#1f2937)] text-white rounded-[12px] w-full max-w-[450px] p-[25px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-[#333] max-h-[90vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-[20px]">
              <div>
                <h3 className="m-0 text-[22px]">{customizationItem.title}</h3>
                <p className="text-[var(--brand-red,#ef4444)] font-bold m-[5px_0_0_0]">
                  {customizationItem.title} - Rs{" "}
                  {selectedSize ? selectedSize.price : customizationItem.price}
                </p>
              </div>
              <button
                className="bg-transparent border-none text-gray-500 text-[20px] cursor-pointer"
                onClick={() => setCustomizationItem(null)}
              >
                <FaTimes />
              </button>
            </div>

            {customizationItem.variants &&
              customizationItem.variants.length > 1 && (
                <div className="mb-[20px]">
                  <label className="font-bold mb-[8px] text-[13px] text-[var(--admin-muted)] uppercase block">Select Size</label>
                  <div className="flex gap-[10px] flex-wrap">
                    {customizationItem.variants.map((variant, index) => {
                      // 🔥 UPDATE: Check In-Stock logic
                      const isOutOfStock =
                        variant.inStock === false ||
                        variant.inStock === 0 ||
                        variant.inStock === "0";

                      return (
                        <button
                          key={index}
                          onClick={() => {
                            if (!isOutOfStock) setSelectedSize(variant);
                          }}
                          disabled={isOutOfStock}
                          className={`p-[10px_18px] rounded-[8px] font-bold transition-all duration-200 border border-[#333] cursor-pointer text-center ${selectedSize?.size === variant.size && !isOutOfStock ? "border-[var(--brand-red,#ef4444)] bg-[var(--brand-red,#ef4444)] text-[var(--text-main,#ffffff)]" : "bg-[rgba(255,255,255,0.05)] text-[var(--text-main,#ffffff)]"}`}
                          style={
                            isOutOfStock
                              ? {
                                  opacity: 0.5,
                                  textDecoration: "line-through",
                                  cursor: "not-allowed",
                                  background: "rgba(255,255,255,0.05)",
                                  color: "gray",
                                }
                              : {}
                          }
                        >
                          {variant.size} <br /> <span>Rs {variant.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            {optionalIngredients.length > 0 && (
              <div className="mb-[20px]">
                <label className="font-bold mb-[8px] text-[13px] text-[var(--admin-muted)] uppercase block">
                  Optional Ingredients
                </label>
                <div className="grid grid-cols-2 gap-[10px]">
                  {isFetchingRecipe ? (
                    <span className="loading-text">Loading ingredients...</span>
                  ) : (
                    optionalIngredients.map((ing, index) => {
                      const isExcluded = excludedIds.includes(ing.inventory_id);
                      return (
                        <label
                          key={`ing-${index}`}
                          className={`flex items-center gap-[10px] mb-[8px] cursor-pointer p-[12px] rounded-[8px] border border-[#333] text-[14px] ${isExcluded ? "text-gray-500 line-through bg-[rgba(0,0,0,0.3)]" : "bg-[rgba(255,255,255,0.05)] text-white"}`}
                        >
                          <input
                            type="checkbox"
                            checked={!isExcluded}
                            onChange={() => toggleRemovable(ing.inventory_id)}
                          />
                          {ing.ingredient_name}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {addonsList.length > 0 && (
              <div className="mb-[20px]">
                <label className="font-bold mb-[8px] text-[13px] text-[var(--admin-muted)] uppercase block">Extra Add-ons</label>
                <div className="flex gap-[10px] flex-wrap">
                  {addonsList.map((addon) => {
                    const isSelected = selectedAddons.find(
                      (a) => a.id === addon.id,
                    );
                    return (
                      <button
                        key={addon.id}
                        onClick={() => toggleAddon(addon)}
                        className={`flex items-center gap-[8px] p-[10px_15px] rounded-[8px] border cursor-pointer text-[14px] transition-all duration-200 ${isSelected ? "bg-[rgba(239,68,68,0.1)] text-[var(--brand-red)] border-[var(--brand-red)]" : "border-[#333] bg-[rgba(255,255,255,0.05)] text-[var(--text-main,#ffffff)]"}`}
                      >
                        {isSelected ? <FaCheckSquare /> : <FaPlus />}{" "}
                        {addon.addon_name} (+Rs {addon.addon_price})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-[20px]">
              <label className="font-bold mb-[8px] text-[13px] text-[var(--admin-muted)] uppercase block">Other Instructions</label>
              <input
                type="text"
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[#333] rounded-[8px] text-white p-[14px] resize-none text-[14px] outline-none focus:border-[var(--brand-red)]"
                placeholder="e.g. Cut in half..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
              />
            </div>

            {/* 🔥 UPDATE: Button disabled agar out of stock hai */}
            <button
              className="w-full bg-[#FFDD00] text-[#1a1a1a] border-none p-[16px] rounded-[8px] text-[16px] font-bold cursor-pointer shadow-[0_4px_15px_rgba(255,221,0,0.4)] mb-[10px] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              onClick={addCustomizedToCart}
              disabled={isCurrentSelectionOutOfStock()}
              style={
                isCurrentSelectionOutOfStock()
                  ? { opacity: 0.5, cursor: "not-allowed", boxShadow: "none" }
                  : {}
              }
            >
              {isCurrentSelectionOutOfStock()
                ? "Sold Out"
                : "Confirm & Add to Cart"}
            </button>
            <button
              className="w-full bg-transparent text-gray-500 border-none p-[12px] text-[14px] cursor-pointer"
              onClick={() => setCustomizationItem(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSTerminal;
