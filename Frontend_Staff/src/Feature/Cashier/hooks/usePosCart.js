import { API_BASE } from '../../../utils/apiHelper';
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Swal from "sweetalert2";

export default function usePosCart({
  gstRate = 0,
  deliveryFee = 0,
  onPlaceOrder,
  setIsMobileCartOpen,
  onCartCountChange,
}) {
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState("Dine-In");
  const [tableNo, setTableNo] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");

  // Notify parent of total cart count changes
  useEffect(() => {
    if (onCartCountChange) {
      const count = cart.reduce(
        (total, item) => total + Number(item.qty || item.quantity || 1),
        0
      );
      onCartCountChange(count);
    }
  }, [cart, onCartCountChange]);

  const addItemToCart = (cartItem) => {
    const noteString = (cartItem.note || "").trim();
    const excludedArr = cartItem.excluded_ingredients || [];
    const cartId = `${cartItem.id}-${cartItem.size || cartItem.variant || "Regular"}-${noteString}-${excludedArr.join("-")}`;

    setCart((prev) => {
      const exist = prev.find((i) => i.cartId === cartId);
      if (exist) {
        return prev.map((i) =>
          i.cartId === cartId
            ? { ...i, qty: Number(i.qty || 1) + Number(cartItem.qty || 1) }
            : i
        );
      }

      return [
        ...prev,
        {
          ...cartItem,
          cartId,
          qty: Number(cartItem.qty || cartItem.quantity || 1),
        },
      ];
    });
  };

  const updateQty = (cartIdOrId, deltaOrQty) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartId === cartIdOrId || item.id === cartIdOrId) {
          const currentQty = Number(item.qty || item.quantity || 1);
          const newQty =
            typeof deltaOrQty === "number" &&
            (deltaOrQty === -1 || deltaOrQty === 1)
              ? Math.max(1, currentQty + deltaOrQty)
              : Math.max(1, deltaOrQty);
          return { ...item, qty: newQty, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartIdOrId) => {
    setCart((prev) =>
      prev.filter((i) => i.cartId !== cartIdOrId && i.id !== cartIdOrId)
    );
  };

  const clearCart = () => {
    setCart([]);
    setTableNo("");
    setCustomerName("");
    setCustomerMobile("");
    setOrderType("Dine-In");
  };

  // Computations
  const subtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.qty || item.quantity || 1),
    0
  );
  const taxAmount = (subtotal * gstRate) / 100;
  const activeDeliveryFee = orderType === "Delivery" ? deliveryFee : 0;
  const grandTotal = subtotal + taxAmount + activeDeliveryFee;

  // Checkout API trigger
  const handleCheckout = async () => {
    if (cart.length === 0) {
      return Swal.fire({
        icon: "error",
        title: "Empty Cart",
        text: "Please add items to cart first.",
      });
    }

    if (orderType === "Dine-In" && (!tableNo || tableNo.trim() === "")) {
      return Swal.fire({
        icon: "warning",
        title: "Table No Required",
        text: "Please enter a Table Number.",
      });
    }

    if (orderType === "Delivery") {
      if (!tableNo || tableNo.trim() === "") {
        return Swal.fire({
          icon: "warning",
          title: "Address Required",
          text: "Please enter a Delivery Address.",
        });
      }
      if (!customerMobile || customerMobile.trim() === "") {
        return Swal.fire({
          icon: "warning",
          title: "Mobile Required",
          text: "Please enter a Customer Mobile Number.",
        });
      }
    }

    const orderPayload = {
      order_type: orderType,
      customer_name: customerName || "Walk-in",
      table_number: orderType === "Dine-In" ? tableNo : orderType,
      customer_mobile: orderType === "Delivery" ? customerMobile : null,
      customer_address: orderType === "Delivery" ? tableNo : "",
      subtotal,
      tax_amount: taxAmount,
      delivery_fee: activeDeliveryFee,
      total: grandTotal,
      cart,
    };

    try {
      Swal.fire({
        title: "Sending to Kitchen...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await fetch(
        `${API_BASE}/create_order.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        }
      );
      const data = await response.json();

      if (response.ok && data.success) {
        const newOrderForPortal = {
          id: data.order_id || Math.floor(1000 + Math.random() * 9000),
          table: orderPayload.table_number,
          customerName: customerName || "Walk-in",
          time: new Date().toLocaleTimeString(),
          total: grandTotal,
          status: "Pending",
          items: cart,
        };
        if (onPlaceOrder) onPlaceOrder(newOrderForPortal);

        // Real-Time Socket Signal
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

        clearCart();
        if (setIsMobileCartOpen) setIsMobileCartOpen(false);

        Swal.fire({
          icon: "success",
          title: "Order Placed!",
          text: `Order sent to kitchen as ${orderType}`,
          timer: 2000,
          showConfirmButton: false,
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
      });
    }
  };

  return {
    cart,
    orderType,
    setOrderType,
    tableNo,
    setTableNo,
    customerName,
    setCustomerName,
    customerMobile,
    setCustomerMobile,
    addItemToCart,
    updateQty,
    removeFromCart,
    clearCart,
    subtotal,
    taxAmount,
    deliveryFee: activeDeliveryFee,
    grandTotal,
    handleCheckout,
  };
}
