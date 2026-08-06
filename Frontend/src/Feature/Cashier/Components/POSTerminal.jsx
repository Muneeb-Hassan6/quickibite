import React, { useState, useEffect } from "react";
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
} from "react-icons/fa";

const POSTerminal = ({ onPlaceOrder }) => {
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

  useEffect(() => {
    fetchLiveMenu();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_settings.php`,
      );
      const data = await response.json();
      if (data.status === "success") {
        setGstRate(parseFloat(data.data.tax) || 0);
        setDeliveryFee(parseFloat(data.data.delivery_charges) || 0);
      }
    } catch (error) {
      console.error("Settings fetch error:", error);
    }
  };

  const fetchLiveMenu = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_menu.php`,
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        const availableItems = data.filter((item) => item.isAvailable);
        const formattedItems = availableItems.map((item) => ({
          id: item.id,
          title: item.name,
          category: item.category || "Uncategorized",
          variants: item.variants || [],
          price:
            item.variants && item.variants.length > 0
              ? parseFloat(item.variants[0].price)
              : parseFloat(item.price),
        }));

        setMenuItems(formattedItems);

        const uniqueCategories = [
          "All",
          ...new Set(formattedItems.map((i) => i.category).filter(Boolean)),
        ];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Menu fetch error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to connect to database.",
        background: "var(--admin-panel)",
        color: "#fff",
      });
    }
  };

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
    <div className="pos-section-layout animate-slide-up">
      <div className="menu-side">
        <div className="terminal-header">
          <h2 className="page-title">Point of Sale</h2>
        </div>
        <div className="pos-controls-bar">
          <div className="pos-search-wrapper">
            <FaSearch className="pos-search-icon" />
            <input
              type="text"
              className="pos-search-input"
              placeholder="Search menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="pos-category-dropdown"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="pos-grid">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="pos-card-text-only"
              onClick={() => handleItemClick(item)}
            >
              <div className="card-title">{item.title}</div>
              <div className="card-bottom-row">
                <span className="card-price">Rs {item.price}</span>
                <div className="card-actions-wrapper">
                  <button
                    className="card-action-btn btn-add"
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
          ))}
        </div>
      </div>

      <div className="cart-side">
        <div className="cart-header-modern">
          <h3>CURRENT ORDER</h3>
        </div>
        <div className="cart-inputs">
          <div className="order-type-toggle">
            <button
              className={`toggle-btn ${orderType === "Dine-In" ? "active" : ""}`}
              onClick={() => setOrderType("Dine-In")}
            >
              Dine-In
            </button>
            <button
              className={`toggle-btn ${orderType === "Takeaway" ? "active" : ""}`}
              onClick={() => setOrderType("Takeaway")}
            >
              Takeaway
            </button>
            <button
              className={`toggle-btn ${orderType === "Delivery" ? "active" : ""}`}
              onClick={() => setOrderType("Delivery")}
            >
              Delivery
            </button>
          </div>

          {orderType === "Dine-In" && (
            <input
              type="text"
              className="pos-input-dark"
              placeholder="Table No *"
              value={tableNo}
              onChange={(e) => setTableNo(e.target.value)}
            />
          )}

          {orderType === "Delivery" && (
            <>
              <input
                type="text"
                className="pos-input-dark"
                placeholder="Delivery Address *"
                value={tableNo}
                onChange={(e) => setTableNo(e.target.value)}
              />
              <input
                type="text"
                className="pos-input-dark"
                placeholder="Customer Mobile *"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
              />
            </>
          )}

          <input
            type="text"
            className="pos-input-dark"
            placeholder="Customer Name (Optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        <div className="cart-items-area">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div key={item.cartId} className="cart-item-modern">
                <div className="ci-info">
                  <h4>
                    {item.title}{" "}
                    <span className="cart-item-size">
                      {item.size && item.size !== "Regular"
                        ? `(${item.size})`
                        : ""}
                    </span>
                  </h4>
                  {item.note && (
                    <div className="ci-note">Note: {item.note}</div>
                  )}
                  {item.excluded_ingredients &&
                    item.excluded_ingredients.length > 0 && (
                      <div className="ci-excluded">
                        - Optional items removed
                      </div>
                    )}
                  <span>@ Rs {item.price}</span>
                </div>
                <div className="qty-group">
                  <button
                    className="btn-qty-mini"
                    onClick={() =>
                      item.qty > 1
                        ? updateQty(item.cartId, -1)
                        : removeFromCart(item.cartId)
                    }
                  >
                    <FaMinus />
                  </button>
                  <span className="qty-display">{item.qty}</span>
                  <button
                    className="btn-qty-mini"
                    onClick={() => updateQty(item.cartId, 1)}
                  >
                    <FaPlus />
                  </button>
                </div>
                <div className="ci-total">Rs {item.price * item.qty}</div>
                <button
                  className="btn-cart-remove"
                  onClick={() => removeFromCart(item.cartId)}
                >
                  <FaTrash />
                </button>
              </div>
            ))
          ) : (
            <div className="empty-cart-msg">Cart is Empty</div>
          )}
        </div>

        <div className="cart-footer-modern">
          <div className="bill-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>Rs {getSubtotal().toFixed(2)}</span>
            </div>

            {gstRate > 0 && (
              <div className="summary-row">
                <span>Tax ({gstRate}%):</span>
                <span>Rs {getTaxAmount().toFixed(2)}</span>
              </div>
            )}

            {orderType === "Delivery" && deliveryFee > 0 && (
              <div className="summary-row">
                <span>Delivery Fee:</span>
                <span>Rs {deliveryFee.toFixed(2)}</span>
              </div>
            )}

            <div className="summary-row grand-total">
              <span>TOTAL:</span>
              <span>Rs {getGrandTotal().toFixed(2)}</span>
            </div>
          </div>

          <button className="btn-print-pay" onClick={handleCheckout}>
            <FaCheck /> PLACE ORDER
          </button>
        </div>
      </div>

      {customizationItem && (
        <div
          className="pos-modal-overlay"
          onClick={() => setCustomizationItem(null)}
        >
          <div
            className="pos-modal-box animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pos-modal-header">
              <div>
                <h3 className="pos-modal-title">Customize Order</h3>
                <p className="pos-modal-price">
                  {customizationItem.title} - Rs{" "}
                  {selectedSize ? selectedSize.price : customizationItem.price}
                </p>
              </div>
              <button
                className="btn-close-modal"
                onClick={() => setCustomizationItem(null)}
              >
                <FaTimes />
              </button>
            </div>

            {customizationItem.variants &&
              customizationItem.variants.length > 1 && (
                <div className="pos-modal-section">
                  <label className="pos-section-label">Select Size</label>
                  <div className="pos-size-grid">
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
                          className={`pos-size-btn ${selectedSize?.size === variant.size && !isOutOfStock ? "active" : ""}`}
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
              <div className="pos-modal-section">
                <label className="pos-section-label">
                  Optional Ingredients
                </label>
                <div className="spec-checkbox-grid">
                  {isFetchingRecipe ? (
                    <span className="loading-text">Loading ingredients...</span>
                  ) : (
                    optionalIngredients.map((ing, index) => {
                      const isExcluded = excludedIds.includes(ing.inventory_id);
                      return (
                        <label
                          key={`ing-${index}`}
                          className={`spec-checkbox-label ${isExcluded ? "excluded" : ""}`}
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
              <div className="pos-modal-section">
                <label className="pos-section-label">Extra Add-ons</label>
                <div className="pos-addon-grid">
                  {addonsList.map((addon) => {
                    const isSelected = selectedAddons.find(
                      (a) => a.id === addon.id,
                    );
                    return (
                      <button
                        key={addon.id}
                        onClick={() => toggleAddon(addon)}
                        className={`pos-addon-btn ${isSelected ? "active" : ""}`}
                      >
                        {isSelected ? <FaCheckSquare /> : <FaPlus />}{" "}
                        {addon.addon_name} (+Rs {addon.addon_price})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pos-modal-section">
              <label className="pos-section-label">Other Instructions</label>
              <input
                type="text"
                className="pos-custom-note-input"
                placeholder="e.g. Cut in half..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
              />
            </div>

            {/* 🔥 UPDATE: Button disabled agar out of stock hai */}
            <button
              className="btn-confirm-add"
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
              className="btn-cancel-modal"
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
