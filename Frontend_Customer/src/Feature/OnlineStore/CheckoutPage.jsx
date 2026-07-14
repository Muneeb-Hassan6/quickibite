import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaUtensils,
  FaShoppingBag,
  FaCheckCircle,
  FaPhoneAlt,
  FaCopy,
  FaDownload,
} from "react-icons/fa";
import { useCart } from "../../Context/CartContext";
import Swal from "sweetalert2";
import html2canvas from "html2canvas";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, placeOrder } = useCart();

  // Read from Session Storage (if user scanned QR code)
  const sessionMode = sessionStorage.getItem("orderMode");
  const sessionTable = sessionStorage.getItem("tableNumber");

  // Form States
  const [orderType, setOrderType] = useState(sessionMode === "Dine-In" ? "dine_in" : "delivery");
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [mobileError, setMobileError] = useState("");

  // Address Fields
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");

  const [tableNumber, setTableNumber] = useState(sessionTable || "");

  // Modal & Processing States
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const [copied, setCopied] = useState(false);

  const { data: availableTables = [] } = useQuery({
    queryKey: ['active_tables'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/admin_manage_tables.php`);
      const result = await response.json();
      if (result.success) {
        return result.data.filter(t => t.status == 1);
      }
      return [];
    }
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!sessionTable && availableTables.length > 0 && orderType === "dine_in" && !tableNumber) {
      setTableNumber(availableTables[0].table_name);
    }
  }, [availableTables, sessionTable, orderType, tableNumber]);

  const receiptRef = useRef(null);

  const subTotal = cartItems
    ? cartItems.reduce((acc, item) => acc + item.price * (item.qty || 1), 0)
    : 0;

  const deliveryFee = orderType === "delivery" ? 150 : 0;
  const total = subTotal + deliveryFee;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setMobileError("");

    // Mobile Number Validation (Validate if required, or if user entered something voluntarily in Dine-In)
    if ((orderType !== "dine_in" || customerMobile.trim() !== "") && !/^03\d{9}$/.test(customerMobile)) {
      setMobileError("Please enter a valid 11-digit mobile number to proceed.");
      Swal.fire({
        icon: "error",
        title: "Invalid Mobile Number",
        text: "Please enter exactly 11 digits starting with 03 (e.g. 03001234567).",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    setIsProcessing(true);

    const fullAddress =
      orderType === "delivery" ? `${houseNo}, ${street}, ${area}`.trim() : "";

    const customerDetails = {
      orderType: orderType.charAt(0).toUpperCase() + orderType.slice(1),
      customerName: customerName,
      customerMobile: customerMobile,
      customerAddress: fullAddress,
      house_no: orderType === "delivery" ? houseNo : null,
      street: orderType === "delivery" ? street : null,
      area: orderType === "delivery" ? area : null,
      tableNumber: orderType === "dine_in" ? tableNumber : null,
      cart: cartItems,
      totalAmount: total,
    };

    if (placeOrder) {
      const newlyPlacedOrder = await placeOrder(customerDetails);

      if (newlyPlacedOrder) {
        setReceiptData({
          ...newlyPlacedOrder,
          customerName: customerName || "Customer",
          orderType: orderType,
          deliveryFee: deliveryFee,
          cart: cartItems,
          total: total,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        // Clear QR Code session storage after a successful order
        sessionStorage.removeItem("orderMode");
        sessionStorage.removeItem("tableNumber");
      }
    }

    setIsProcessing(false);
  };

  const handleCopy = (id) => {
    const finalId = id || Math.floor(1000 + Math.random() * 9000);
    navigator.clipboard.writeText(finalId);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) return;

    try {
      Swal.fire({
        title: "Generating Receipt Image...",
        allowOutsideClick: false,
        background: "var(--admin-panel)",
        color: "#fff",
        didOpen: () => Swal.showLoading(),
      });

      const element = receiptRef.current;
      const canvas = await html2canvas(element, {
        backgroundColor: "#0a0a0a",
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `QuickBite_Receipt_${receiptData?.id || "order"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Swal.fire({
        icon: "success",
        title: "Downloaded!",
        text: "Your receipt image has been downloaded successfully.",
        timer: 2000,
        showConfirmButton: false,
        background: "var(--admin-panel)",
        color: "#fff",
      });
    } catch (error) {
      console.error("Receipt download error:", error);
      Swal.fire({
        icon: "error",
        title: "Download Failed",
        text: "Could not generate receipt image.",
        background: "var(--admin-panel)",
        color: "#fff",
      });
    }
  };

  const handleCancelDineIn = () => {
    sessionStorage.removeItem("orderMode");
    sessionStorage.removeItem("tableNumber");
    setOrderType("delivery");
    setTableNumber("");
  };

  return (
    <div className="max-w-[75rem] mx-auto p-[2.5rem_1.25rem] animate-slide-up">
      <h2 className="font-['Oswald',sans-serif] text-center text-[var(--text-main)] text-[2rem] uppercase tracking-[1px] mb-[1.875rem] border-b-[2px] border-[#333] pb-[0.625rem]">Checkout</h2>

      <form className="flex items-start gap-[2.5rem] max-lg:flex-col max-lg:gap-[1.25rem]" onSubmit={handlePlaceOrder}>
        {/* CHECKOUT FORM */}
        <div className="flex-[2]">
          {sessionMode !== "Dine-In" ? (
            <>
              <h3 className="font-['Oswald',sans-serif] text-[1.25rem] text-[var(--text-main)] mt-0 border-b border-[var(--border-color)] pb-[0.625rem] mb-[1.25rem]">1. Select Order Type</h3>
              <div className="flex gap-[0.937rem] mb-[1.563rem] max-lg:grid max-lg:grid-cols-3 max-lg:gap-[0.625rem]">
                <div
                  className={`flex-1 border-2 border-[var(--border-color)] bg-[var(--panel-bg)] text-[var(--text-muted)] rounded-[0.75rem] p-[0.937rem] max-lg:p-[0.625rem] max-lg:text-[0.812rem] flex flex-col items-center justify-center gap-[0.625rem] max-lg:gap-[0.312rem] cursor-pointer font-bold transition-all duration-300 [&>svg]:text-[1.5rem] max-lg:[&>svg]:text-[1.25rem] ${orderType === "delivery" ? "border-[#ef4444] text-[#ef4444] bg-[rgba(239,68,68,0.05)]" : ""}`}
                  onClick={() => setOrderType("delivery")}
                >
                  <FaMapMarkerAlt /> <span>Delivery</span>
                </div>
                <div
                  className={`flex-1 border-2 border-[var(--border-color)] bg-[var(--panel-bg)] text-[var(--text-muted)] rounded-[0.75rem] p-[0.937rem] max-lg:p-[0.625rem] max-lg:text-[0.812rem] flex flex-col items-center justify-center gap-[0.625rem] max-lg:gap-[0.312rem] cursor-pointer font-bold transition-all duration-300 [&>svg]:text-[1.5rem] max-lg:[&>svg]:text-[1.25rem] ${orderType === "takeaway" ? "border-[#ef4444] text-[#ef4444] bg-[rgba(239,68,68,0.05)]" : ""}`}
                  onClick={() => setOrderType("takeaway")}
                >
                  <FaShoppingBag /> <span>Takeaway</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center bg-[var(--admin-orange)] text-white p-[0.625rem_0.937rem] rounded-[0.313rem] mb-[1.25rem] font-bold">
                <span><FaUtensils className="mr-[0.5rem]" /> Ordering for Dine-In</span>
                <button 
                  type="button" 
                  onClick={handleCancelDineIn} 
                  className="bg-[rgba(0,0,0,0.2)] border-none text-white p-[0.313rem_0.625rem] rounded-[0.313rem] cursor-pointer text-[0.75rem]"
                >
                  Cancel Dine-In
                </button>
              </div>
            </>
          )}

          <h3 className="font-['Oswald',sans-serif] text-[1.25rem] text-[var(--text-main)] mt-[1.875rem] border-b border-[var(--border-color)] pb-[0.625rem] mb-[1.25rem]">
            2. Your Details
          </h3>
          <div className="mb-[1.25rem]">
            <label className="flex items-center gap-[0.5rem] mb-[0.5rem] text-[var(--text-muted)] font-bold text-[0.875rem]">Full Name / Customer Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              required
              className="w-full bg-[var(--home-bg)] border border-[var(--border-color)] text-[var(--text-main)] p-[0.875rem] rounded-[0.625rem] text-[0.937rem] outline-none transition-all duration-300 focus:border-[#ef4444] focus:shadow-[0_0_10px_rgba(239,68,68,0.2)]"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="mb-[1.25rem]">
            <label className="flex items-center gap-[0.5rem] mb-[0.5rem] text-[var(--text-muted)] font-bold text-[0.875rem]">
              <FaPhoneAlt className="text-[#ef4444]" /> Phone Number
            </label>
            <input
              type="tel"
              placeholder="e.g. 03001234567"
              maxLength="11"
              required={orderType !== "dine_in"}
              className={`w-full bg-[var(--home-bg)] border border-[var(--border-color)] text-[var(--text-main)] p-[0.875rem] rounded-[0.625rem] text-[0.937rem] outline-none transition-all duration-300 focus:border-[#ef4444] focus:shadow-[0_0_10px_rgba(239,68,68,0.2)] ${mobileError ? "border-red-500" : ""}`}
              style={mobileError ? { borderColor: "#ef4444" } : {}}
              value={customerMobile}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                setCustomerMobile(val);
                
                // Real-time validation while typing
                if (val.length > 0 && val.length < 11) {
                  setMobileError("Please enter all 11 digits.");
                } else if (val.length === 11 && !/^03\d{9}$/.test(val)) {
                  setMobileError("Number must start with 03 (e.g. 03001234567).");
                } else {
                  setMobileError("");
                }
              }}
            />
            {mobileError && (
              <span className="text-red-500 text-[0.813rem] mt-[0.313rem] inline-block">
                {mobileError}
              </span>
            )}
          </div>

          {orderType === "delivery" && (
            <div className="mb-[1.25rem] animate-slide-up">
              <label className="flex items-center gap-[0.5rem] mb-[0.5rem] text-[var(--text-muted)] font-bold text-[0.875rem]">
                <FaMapMarkerAlt className="text-[#ef4444]" /> Delivery Address Details
              </label>

              <div className="flex flex-col lg:flex-row gap-[0.625rem] lg:gap-[0.938rem] mb-[0.937rem]">
                <input
                  type="text"
                  placeholder="House / Flat No."
                  className="w-full bg-[var(--home-bg)] border border-[var(--border-color)] text-[var(--text-main)] p-[0.875rem] rounded-[0.625rem] text-[0.937rem] outline-none transition-all duration-300 focus:border-[#ef4444] focus:shadow-[0_0_10px_rgba(239,68,68,0.2)] flex-1"
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Street Name / No."
                  className="w-full bg-[var(--home-bg)] border border-[var(--border-color)] text-[var(--text-main)] p-[0.875rem] rounded-[0.625rem] text-[0.937rem] outline-none transition-all duration-300 focus:border-[#ef4444] focus:shadow-[0_0_10px_rgba(239,68,68,0.2)] flex-1"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </div>

              <input
                type="text"
                placeholder="Area / Society Name (e.g., Johar Town)"
                required
                className="w-full bg-[var(--home-bg)] border border-[var(--border-color)] text-[var(--text-main)] p-[0.875rem] rounded-[0.625rem] text-[0.937rem] outline-none transition-all duration-300 focus:border-[#ef4444] focus:shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>
          )}

          {orderType === "dine_in" && (
            <div className="mb-[1.25rem] animate-slide-up">
              <label className="flex items-center gap-[0.5rem] mb-[0.5rem] text-[var(--text-muted)] font-bold text-[0.875rem]">
                <FaUtensils className="text-[#ef4444]" /> Select Table
              </label>
              <select
                required
                className="w-full bg-[var(--home-bg)] border border-[var(--border-color)] text-[var(--text-main)] p-[0.875rem] rounded-[0.625rem] text-[0.937rem] outline-none transition-all duration-300 focus:border-[#ef4444] focus:shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                disabled={!!sessionTable} // Lock if scanned from QR code
                style={sessionTable ? { backgroundColor: "#333", cursor: "not-allowed", color: "#ccc" } : {}}
              >
                <option value="" disabled>-- Select a Table --</option>
                {availableTables.map((t) => (
                  <option key={t.id} value={t.table_name}>
                    {t.table_name}
                  </option>
                ))}
              </select>
              {sessionTable && <small className="text-[var(--admin-muted)]">Table number locked from QR Code scan.</small>}
            </div>
          )}

          {orderType === "takeaway" && (
            <div className="mb-[1.25rem] animate-slide-up">
              <div className="bg-[rgba(239,68,68,0.1)] text-[#ef4444] p-[0.937rem] rounded-[0.625rem] flex items-center gap-[0.625rem] font-bold border border-dashed border-[rgba(239,68,68,0.3)]">
                <FaShoppingBag /> Please pick up your order from the counter in
                20 minutes.
              </div>
            </div>
          )}
        </div>

        {/* BILL SUMMARY */}
        <div className="flex-1 bg-[var(--panel-bg)] border border-[var(--border-color)] p-[1.563rem] rounded-[1rem] sticky top-[1.25rem] max-lg:static max-lg:w-full max-lg:box-border">
          <h3 className="font-['Oswald',sans-serif] text-[1.25rem] text-[var(--text-main)] mt-0 border-b border-[var(--border-color)] pb-[0.625rem] mb-[1.25rem]">Final Amount</h3>
          <div className="flex justify-between mb-[0.75rem] text-[var(--text-main)] text-[0.937rem]">
            <span>Subtotal</span>
            <span>Rs {subTotal}</span>
          </div>
          <div className="flex justify-between mb-[0.75rem] text-[var(--text-main)] text-[0.937rem]">
            <span>Delivery Fee</span>
            <span>{deliveryFee === 0 ? "Free" : `Rs ${deliveryFee}`}</span>
          </div>
          <div className="h-[1px] bg-[var(--border-color)] my-[0.937rem]"></div>

          <div className="flex justify-between m-0 p-[0.937rem_0] border-none">
            <span className="text-[1.125rem] font-bold">Total to Pay</span>
            <span className="text-[1.5rem] font-[900] text-[#ef4444]">Rs {total}</span>
          </div>

          <p className="text-[#aaa] text-[0.75rem] text-center mb-[1.25rem]">
            Payment Method: <strong>Cash on Delivery / Counter</strong>
          </p>

          <button
            type="submit"
            className="w-full p-[0.937rem] rounded-[0.75rem] bg-[#ef4444] text-white font-bold text-[1rem] border-none cursor-pointer flex justify-center items-center gap-[0.625rem] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isProcessing}
          >
            <FaCheckCircle /> {isProcessing ? "Processing..." : "Confirm Order"}
          </button>
        </div>
      </form>

      {/* RECEIPT MODAL POPUP */}
      {receiptData && (
        <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.85)] backdrop-blur-[0.5rem] z-[100000] flex items-center justify-center p-[0.937rem] animate-fade-in">
          <div className="bg-[var(--panel-bg)] border border-[var(--border-color)] w-full max-w-[30rem] p-[2.188rem_1.875rem] max-lg:p-[1.562rem_1.25rem] rounded-[1.5rem] max-lg:rounded-[1rem] text-center shadow-[0_20px_60px_rgba(0,0,0,0.4)] max-h-[90vh] overflow-y-auto animate-slide-up">
            <FaCheckCircle className="text-[3.75rem] max-lg:text-[3.125rem] text-[#2ecc71] mb-[0.937rem] inline-block" />
            <h2 className="font-['Oswald',sans-serif] text-[var(--text-main)] uppercase m-[0_0_0.313rem] text-[2rem] max-lg:text-[1.5rem] tracking-[1px]">Order Confirmed!</h2>
            <p className="text-[var(--text-muted)] m-[0_0_1.563rem] text-[0.937rem]">
              Your delicious food is being prepared.
            </p>

            <div className="bg-[var(--home-bg)] rounded-[0.75rem] p-[1.25rem] border border-dashed border-[var(--border-color)] text-left" ref={receiptRef}>
              <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-[0.625rem] mb-[0.937rem]">
                <span className="text-[var(--text-muted)] font-bold">Order ID:</span>

                <span className="flex items-center gap-[0.625rem]">
                  <span className="font-bold text-[1.2rem] text-[var(--text-main)] tracking-[1px]">
                    #{receiptData.id}
                  </span>

                  <button
                    data-html2canvas-ignore="true"
                    className={`bg-transparent text-[#ef4444] border border-[#ef4444] rounded-[0.375rem] p-[0.25rem_0.625rem] text-[0.75rem] cursor-pointer flex items-center gap-[0.375rem] transition-all duration-300 ${copied ? "bg-[rgba(16,185,129,0.2)] !text-[#10b981] !border-[#10b981]" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleCopy(receiptData.id);
                    }}
                  >
                    {copied ? <FaCheckCircle /> : <FaCopy />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-[0.625rem] mb-[0.937rem]">
                <span className="text-[var(--text-muted)] font-bold">Customer Name:</span>
                <span className="text-[var(--text-main)] font-bold font-['Oswald',sans-serif] text-[1.125rem] max-lg:text-[0.875rem] tracking-[1px]">
                  {receiptData.customerName}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-[0.625rem] mb-[0.937rem]">
                <span className="text-[var(--text-muted)] font-bold">Date & Time:</span>
                <span className="text-[var(--text-main)] font-bold text-[0.875rem]">
                  {receiptData.date} | {receiptData.time}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-[0.625rem] mb-[0.937rem]">
                <span className="text-[var(--text-muted)] font-bold">Order Type:</span>
                <span className="font-bold font-['Oswald',sans-serif] text-[1.125rem] max-lg:text-[0.875rem] tracking-[1px] text-[#ef4444]">
                  {receiptData.orderType.replace("_", " ").toUpperCase()}
                </span>
              </div>

              <div className="mb-[0.937rem]">
                {receiptData.cart &&
                  receiptData.cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between mb-[0.625rem] text-[var(--text-muted)] font-[500]">
                      <span>
                        {item.qty}x {item.name || item.title}
                      </span>
                      <span>Rs {item.price * item.qty}</span>
                    </div>
                  ))}
              </div>

              <div className="flex justify-between border-t border-[var(--border-color)] pt-[0.937rem] mt-[0.937rem] items-center">
                <span className="text-[var(--text-main)] text-[1.125rem] font-bold uppercase">Total Paid:</span>
                <span className="text-[#ef4444] text-[1.5rem] font-[900]">
                  Rs {receiptData.total}
                </span>
              </div>
            </div>

            <button
              onClick={handleDownloadReceipt}
              className="w-full bg-[#10b981] text-white border-none p-[0.875rem] rounded-[0.75rem] font-bold text-[0.937rem] cursor-pointer mt-[1.25rem] flex items-center justify-center gap-[0.5rem] transition-all duration-300 uppercase hover:bg-[#059669] hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
            >
              <FaDownload /> Download Receipt
            </button>

            <div className="flex gap-[0.937rem] mt-[1.875rem] max-lg:flex-col max-lg:gap-[0.625rem]">
              <button
                className="flex-1 bg-[#ef4444] text-white border-none p-[0.937rem] max-lg:p-[0.75rem] max-lg:w-full rounded-[0.625rem] font-bold cursor-pointer transition-all duration-300 uppercase hover:bg-[#c62828] hover:-translate-y-[2px] max-lg:text-[0.812rem]"
                onClick={() => navigate("/track-order")}
              >
                Track Order
              </button>
              <button
                className="flex-1 bg-transparent text-white border border-[#444] p-[0.937rem] max-lg:p-[0.75rem] max-lg:w-full rounded-[0.625rem] font-bold cursor-pointer transition-all duration-300 uppercase hover:bg-[#222] max-lg:text-[0.812rem]"
                onClick={() => navigate("/")}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;