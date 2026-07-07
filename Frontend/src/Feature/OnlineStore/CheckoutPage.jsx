import React, { useState, useRef, useEffect } from "react";
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

  const [availableTables, setAvailableTables] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchTables = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE}/admin_manage_tables.php`);
        const result = await response.json();
        if (result.success) {
          // Filter only active tables
          const activeTables = result.data.filter(t => t.status == 1);
          setAvailableTables(activeTables);
          // If no session table and tables exist, default to first active table
          if (!sessionTable && activeTables.length > 0 && orderType === "dine_in") {
            setTableNumber(activeTables[0].table_name);
          }
        }
      } catch (error) {
        console.error("Failed to load tables", error);
      }
    };
    fetchTables();
  }, [sessionTable, orderType]);

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
    <div className="store-page-container animate-slide-up">
      <h2 className="store-page-title">Checkout</h2>

      <form className="checkout-layout" onSubmit={handlePlaceOrder}>
        {/* CHECKOUT FORM */}
        <div className="checkout-form-section">
          {sessionMode !== "Dine-In" ? (
            <>
              <h3 className="form-section-heading">1. Select Order Type</h3>
              <div className="order-type-selector">
                <div
                  className={`type-box ${orderType === "delivery" ? "active" : ""}`}
                  onClick={() => setOrderType("delivery")}
                >
                  <FaMapMarkerAlt /> <span>Delivery</span>
                </div>
                <div
                  className={`type-box ${orderType === "takeaway" ? "active" : ""}`}
                  onClick={() => setOrderType("takeaway")}
                >
                  <FaShoppingBag /> <span>Takeaway</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="dine-in-badge" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--admin-orange)", color: "#fff", padding: "10px 15px", borderRadius: "5px", marginBottom: "20px", fontWeight: "bold" }}>
                <span><FaUtensils style={{ marginRight: "8px" }} /> Ordering for Dine-In</span>
                <button 
                  type="button" 
                  onClick={handleCancelDineIn} 
                  style={{ background: "rgba(0,0,0,0.2)", border: "none", color: "white", padding: "5px 10px", borderRadius: "5px", cursor: "pointer", fontSize: "12px" }}
                >
                  Cancel Dine-In
                </button>
              </div>
            </>
          )}

          <h3 className="form-section-heading mt-30">
            2. Your Details
          </h3>
          <div className="form-group">
            <label>Full Name / Customer Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              required
              className="web-input"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>
              <FaPhoneAlt className="text-red" /> Phone Number
            </label>
            <input
              type="tel"
              placeholder="e.g. 03001234567"
              maxLength="11"
              required={orderType !== "dine_in"}
              className={`web-input ${mobileError ? "border-red-500" : ""}`}
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
              <span style={{ color: "#ef4444", fontSize: "13px", marginTop: "5px", display: "inline-block" }}>
                {mobileError}
              </span>
            )}
          </div>

          {orderType === "delivery" && (
            <div className="form-group animate-slide-up">
              <label>
                <FaMapMarkerAlt className="text-red" /> Delivery Address Details
              </label>

              <div className="address-inputs-row">
                <input
                  type="text"
                  placeholder="House / Flat No."
                  className="web-input flex-1"
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Street Name / No."
                  className="web-input flex-1"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </div>

              <input
                type="text"
                placeholder="Area / Society Name (e.g., Johar Town)"
                required
                className="web-input"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>
          )}

          {orderType === "dine_in" && (
            <div className="form-group animate-slide-up">
              <label>
                <FaUtensils className="text-red" /> Select Table
              </label>
              <select
                required
                className="web-input"
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
              {sessionTable && <small style={{ color: "var(--admin-muted)" }}>Table number locked from QR Code scan.</small>}
            </div>
          )}

          {orderType === "takeaway" && (
            <div className="form-group animate-slide-up">
              <div className="takeaway-info-box">
                <FaShoppingBag /> Please pick up your order from the counter in
                20 minutes.
              </div>
            </div>
          )}
        </div>

        {/* BILL SUMMARY */}
        <div className="cart-summary-section">
          <h3 className="form-section-heading">Final Amount</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>Rs {subTotal}</span>
          </div>
          <div className="summary-row">
            <span>Delivery Fee</span>
            <span>{deliveryFee === 0 ? "Free" : `Rs ${deliveryFee}`}</span>
          </div>
          <div className="summary-divider"></div>

          <div className="summary-row total-row">
            <span className="total-label-text">Total to Pay</span>
            <span className="total-price-value">Rs {total}</span>
          </div>

          <p className="checkout-note">
            Payment Method: <strong>Cash on Delivery / Counter</strong>
          </p>

          <button
            type="submit"
            className="btn-checkout"
            disabled={isProcessing}
          >
            <FaCheckCircle /> {isProcessing ? "Processing..." : "Confirm Order"}
          </button>
        </div>
      </form>

      {/* RECEIPT MODAL POPUP */}
      {receiptData && (
        <div className="receipt-modal-overlay">
          <div className="receipt-modal-card animate-slide-up">
            <FaCheckCircle className="receipt-icon" />
            <h2 className="receipt-title">Order Confirmed!</h2>
            <p className="receipt-subtitle">
              Your delicious food is being prepared.
            </p>

            <div className="receipt-bill-box" ref={receiptRef}>
              <div className="receipt-row align-items-center">
                <span className="receipt-label">Order ID:</span>

                <span className="receipt-value-wrapper">
                  <span className="receipt-order-id">
                    #{receiptData.id}
                  </span>

                  <button
                    data-html2canvas-ignore="true"
                    className={`btn-copy ${copied ? "copied" : ""}`}
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

              <div className="receipt-row mt-2">
                <span className="receipt-label">Customer Name:</span>
                <span className="receipt-value">
                  {receiptData.customerName}
                </span>
              </div>

              <div className="receipt-row mt-2">
                <span className="receipt-label">Date & Time:</span>
                <span className="receipt-value" style={{ fontFamily: "inherit", fontSize: "14px" }}>
                  {receiptData.date} | {receiptData.time}
                </span>
              </div>

              <div className="receipt-row mt-2">
                <span className="receipt-label">Order Type:</span>
                <span className="receipt-value highlight">
                  {receiptData.orderType.replace("_", " ").toUpperCase()}
                </span>
              </div>

              <div className="receipt-items-list mt-3">
                {receiptData.cart &&
                  receiptData.cart.map((item, idx) => (
                    <div key={idx} className="receipt-item-row">
                      <span>
                        {item.qty}x {item.name || item.title}
                      </span>
                      <span>Rs {item.price * item.qty}</span>
                    </div>
                  ))}
              </div>

              <div className="receipt-total-row">
                <span className="receipt-total-label">Total Paid:</span>
                <span className="receipt-total-value">
                  Rs {receiptData.total}
                </span>
              </div>
            </div>

            <button
              onClick={handleDownloadReceipt}
              className="btn-receipt-download"
            >
              <FaDownload /> Download Receipt
            </button>

            <div className="receipt-actions">
              <button
                className="btn-receipt-track"
                onClick={() => navigate("/track-order")}
              >
                Track Order
              </button>
              <button
                className="btn-receipt-home"
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