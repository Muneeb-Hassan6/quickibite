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
  FaCreditCard,
  FaMoneyBillWave,
  FaUniversity,
  FaMobileAlt,
  FaTimes,
  FaShieldAlt,
  FaEdit,
  FaTrash
} from "react-icons/fa";
import { useCart } from "../../Context/CartContext";
import Swal from "sweetalert2";
import html2canvas from "html2canvas";
import "../../style/payment-sandbox.css";
import "../../style/premium-checkout.css"; // 🔥 THE NEW PREMIUM LAYOUT

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, placeOrder, removeFromCart } = useCart();

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
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");

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
          const activeTables = result.data.filter(t => t.status == 1);
          setAvailableTables(activeTables);
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

  // Calculate expected time (30 mins from now)
  const expectedDate = new Date(new Date().getTime() + 30 * 60000);
  const expectedTimeStr = expectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const finalizeReceipt = (newlyPlacedOrder) => {
    setReceiptData({
      ...newlyPlacedOrder,
      customerName: customerName || "Customer",
      orderType: orderType,
      deliveryFee: deliveryFee,
      cart: cartItems,
      total: total,
      paymentMethod: paymentMethod,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    sessionStorage.removeItem("orderMode");
    sessionStorage.removeItem("tableNumber");
  };

  const showJazzCashModal = () => {
    return new Promise((resolve) => {
      Swal.fire({
        customClass: { popup: 'sandbox-modal-popup' },
        html: `
          <div class="sandbox-modal-header">
            <h2 class="sandbox-modal-title"><span style="color:#ed2a26;"><i class="fas fa-mobile-alt"></i></span> JazzCash Payment</h2>
            <button class="sandbox-modal-close" onclick="Swal.close()"><i class="fas fa-times"></i></button>
          </div>
          <div class="sandbox-modal-body">
            <div class="sandbox-amount-box">
              <div class="sandbox-amount-value">Rs. ${total}</div>
              <div class="sandbox-amount-label">Amount to pay</div>
            </div>
            <button class="sandbox-test-btn" onclick="document.getElementById('jc-mobile').value='03001234567'; document.getElementById('jc-mpin').value='1234';">
              <i class="fas fa-edit"></i> Show Sandbox Test Data
            </button>
            <div class="sandbox-input-group">
              <label class="sandbox-input-label">JazzCash Mobile Number</label>
              <div class="sandbox-input-wrapper">
                <i class="fas fa-mobile-alt sandbox-input-icon"></i>
                <input id="jc-mobile" class="sandbox-input with-icon" placeholder="03XX XXXXXXX" type="tel" maxlength="11">
              </div>
              <span class="sandbox-input-subtext">Enter your JazzCash registered mobile number</span>
            </div>
            <div class="sandbox-input-group">
              <label class="sandbox-input-label">MPIN (4 Digits)</label>
              <input id="jc-mpin" class="sandbox-input" placeholder="XXXX" type="password" maxlength="4" style="-webkit-text-security: disc;">
            </div>
            <button class="sandbox-submit-btn btn-jazzcash" id="btn-pay-jc">Pay Rs. ${total} via JazzCash</button>
          </div>
        `,
        showConfirmButton: false,
        didOpen: () => {
          document.getElementById('btn-pay-jc').addEventListener('click', () => {
            const mobile = document.getElementById("jc-mobile").value;
            const mpin = document.getElementById("jc-mpin").value;
            if (!mobile || mobile.length !== 11) {
              Swal.showValidationMessage("Please enter a valid 11-digit JazzCash number");
              return;
            }
            if (!mpin || mpin.length !== 4) {
              Swal.showValidationMessage("Please enter your 4-digit MPIN");
              return;
            }
            Swal.close();
            resolve(true);
          });
        }
      }).then((result) => { if(result.dismiss) resolve(false); });
    });
  };

  const showCardModal = () => {
    return new Promise((resolve) => {
      Swal.fire({
        customClass: { popup: 'sandbox-modal-popup' },
        html: `
          <div class="sandbox-modal-header">
            <h2 class="sandbox-modal-title"><span style="color:#2563eb;"><i class="fas fa-credit-card"></i></span> Card Payment</h2>
            <button class="sandbox-modal-close" onclick="Swal.close()"><i class="fas fa-times"></i></button>
          </div>
          <div class="sandbox-modal-body">
            <div class="sandbox-amount-box">
              <div class="sandbox-amount-value">Rs. ${total}</div>
              <div class="sandbox-amount-label">Amount to pay</div>
            </div>
            <button class="sandbox-test-btn" onclick="document.getElementById('card-num').value='4242 4242 4242 4242'; document.getElementById('card-name').value='JOHN DOE'; document.getElementById('card-exp').value='12/26'; document.getElementById('card-cvv').value='123';">
              <i class="fas fa-edit"></i> Show Sandbox Test Data
            </button>
            <div class="sandbox-input-group">
              <label class="sandbox-input-label">Card Number</label>
              <div class="sandbox-input-wrapper">
                <i class="far fa-credit-card sandbox-input-icon"></i>
                <input id="card-num" class="sandbox-input with-icon" placeholder="XXXX XXXX XXXX XXXX" type="text" maxlength="19">
              </div>
            </div>
            <div class="sandbox-input-group">
              <label class="sandbox-input-label">Cardholder Name</label>
              <input id="card-name" class="sandbox-input" placeholder="JOHN DOE" type="text">
            </div>
            <div class="sandbox-row">
              <div class="sandbox-col">
                <div class="sandbox-input-group">
                  <label class="sandbox-input-label">Expiry Date</label>
                  <input id="card-exp" class="sandbox-input" placeholder="MM/YY" type="text" maxlength="5">
                </div>
              </div>
              <div class="sandbox-col">
                <div class="sandbox-input-group">
                  <label class="sandbox-input-label">CVV</label>
                  <div class="sandbox-input-wrapper">
                    <input id="card-cvv" class="sandbox-input" placeholder="•••" type="password" maxlength="3" style="-webkit-text-security: disc;">
                    <i class="fas fa-shield-alt" style="position: absolute; right: 14px; color: var(--text-muted);"></i>
                  </div>
                </div>
              </div>
            </div>
            <div class="sandbox-secure-box">
              <i class="fas fa-shield-alt sandbox-secure-icon"></i>
              <div class="sandbox-secure-text">Your card information is encrypted and secure. Sandbox mode - no real charges.</div>
            </div>
            <button class="sandbox-submit-btn btn-card" id="btn-pay-card">Pay Rs. ${total} via Card</button>
          </div>
        `,
        showConfirmButton: false,
        didOpen: () => {
          document.getElementById('btn-pay-card').addEventListener('click', () => {
            const num = document.getElementById("card-num").value;
            const exp = document.getElementById("card-exp").value;
            const cvv = document.getElementById("card-cvv").value;
            if (!num || num.length < 15) {
              Swal.showValidationMessage("Enter a valid card number");
              return;
            }
            if (!exp || !cvv) {
              Swal.showValidationMessage("Enter expiry and CVV");
              return;
            }
            Swal.close();
            resolve(true);
          });
        }
      }).then((result) => { if(result.dismiss) resolve(false); });
    });
  };

  const showBankModal = () => {
    return new Promise((resolve) => {
      Swal.fire({
        customClass: { popup: 'sandbox-modal-popup' },
        html: `
          <div class="sandbox-modal-header">
            <h2 class="sandbox-modal-title"><span style="color:#8b6d43;"><i class="fas fa-university"></i></span> Bank Transfer</h2>
            <button class="sandbox-modal-close" onclick="Swal.close()"><i class="fas fa-times"></i></button>
          </div>
          <div class="sandbox-modal-body">
            <div class="sandbox-amount-box">
              <div class="sandbox-amount-value">Rs. ${total}</div>
              <div class="sandbox-amount-label">Amount to pay</div>
            </div>
            <button class="sandbox-test-btn" onclick="document.getElementById('bt-ref').value='PK00 MEZN 0000 0000 0000 0000';">
              <i class="fas fa-edit"></i> Show Sandbox Test Data
            </button>
            <div class="sandbox-input-group">
              <label class="sandbox-input-label">Bank Account / IBAN Number</label>
              <div class="sandbox-input-wrapper">
                <i class="fas fa-building sandbox-input-icon"></i>
                <input id="bt-ref" class="sandbox-input with-icon" placeholder="PK00 XXXX 0000 0000 0000 0000" type="text">
              </div>
            </div>
            <div style="background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 8px; padding: 15px; text-align: left; margin-bottom: 20px;">
              <div style="color: #3b82f6; font-size: 13px; font-weight: 600; margin-bottom: 8px;">Bank Transfer Instructions:</div>
              <div style="color: #3b82f6; font-size: 12px; margin-bottom: 12px; line-height: 1.5;">
                1. Transfer Rs. ${total} to the account below<br/>
                2. Your order will be confirmed after admin verification<br/>
                3. Please keep the transfer receipt for reference
              </div>
              <div style="background: var(--panel-bg); padding: 12px; border-radius: 6px; font-size: 13px;">
                <div style="margin-bottom: 4px; color: var(--text-muted);">Bank: <strong style="color: var(--text-main);">Meezan Bank</strong></div>
                <div style="margin-bottom: 4px; color: var(--text-muted);">Account: <strong style="color: var(--text-main);">0123-4567890</strong></div>
                <div style="color: var(--text-muted);">Title: <strong style="color: var(--text-main);">QuickBite Foods</strong></div>
              </div>
            </div>
            <button class="sandbox-submit-btn" style="background-color: #927f61;" id="btn-pay-bank">Confirm Transfer Rs. ${total}</button>
          </div>
        `,
        showConfirmButton: false,
        didOpen: () => {
          document.getElementById('btn-pay-bank').addEventListener('click', () => {
            const ref = document.getElementById("bt-ref").value;
            if (!ref) {
              Swal.showValidationMessage("Please enter the reference ID after transferring");
              return;
            }
            Swal.close();
            resolve(true);
          });
        }
      }).then((result) => { if(result.dismiss) resolve(false); });
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if(cartItems.length === 0) {
      Swal.fire({icon: "warning", title: "Empty Cart", text: "Please add items before placing an order."});
      return;
    }
    
    if (!customerName) {
      Swal.fire({icon: "warning", title: "Missing Details", text: "Please enter your name."});
      return;
    }

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

    if (orderType === "delivery" && (!area)) {
       Swal.fire({icon: "warning", title: "Missing Area", text: "Please provide delivery area."});
       return;
    }

    setIsProcessing(true);

    const fullAddress = orderType === "delivery" ? `${houseNo}, ${street}, ${area}`.trim() : "";

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
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === "Cash on Delivery" ? "Pending" : "Paid"
    };

    if (placeOrder) {
      if (paymentMethod !== "Cash on Delivery") {
        let paymentConfirmed = false;

        if (paymentMethod === "JazzCash") paymentConfirmed = await showJazzCashModal();
        else if (paymentMethod === "Credit/Debit Card") paymentConfirmed = await showCardModal();
        else if (paymentMethod === "Bank Transfer") paymentConfirmed = await showBankModal();

        if (!paymentConfirmed) {
          setIsProcessing(false);
          return;
        }

        Swal.fire({
          title: `Processing Payment...`,
          text: 'Connecting to Secure Gateway',
          allowOutsideClick: false,
          background: "var(--admin-panel)",
          color: "#fff",
          didOpen: () => Swal.showLoading()
        });

        setTimeout(async () => {
          Swal.close();
          const newlyPlacedOrder = await placeOrder(customerDetails);
          if (newlyPlacedOrder) {
            Swal.fire({
              icon: "success",
              title: "Payment Successful",
              text: "Transaction Completed.",
              timer: 1500,
              showConfirmButton: false,
              background: "var(--admin-panel)",
              color: "#fff",
            });
            finalizeReceipt(newlyPlacedOrder);
          }
          setIsProcessing(false);
        }, 2000);
      } else {
        const newlyPlacedOrder = await placeOrder(customerDetails);
        if (newlyPlacedOrder) {
          finalizeReceipt(newlyPlacedOrder);
        }
        setIsProcessing(false);
      }
    } else {
      setIsProcessing(false);
    }
  };

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) return;
    try {
      Swal.fire({title: "Generating Receipt...", didOpen: () => Swal.showLoading()});
      const canvas = await html2canvas(receiptRef.current, { backgroundColor: "#0a0a0a", scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `Receipt_${receiptData.id}.png`;
      link.click();
      Swal.close();
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "Could not download receipt", "error");
    }
  };

  // Helper text for payment method
  const getPaymentHelperText = () => {
    if(paymentMethod === "Cash on Delivery") {
      return orderType === "delivery" ? "Payment will be collected at the time of delivery." : "Payment will be collected at the counter.";
    } else {
      return "Payment will be processed securely via online gateway.";
    }
  };

  return (
    <div className="premium-checkout-wrapper">
      <div className="premium-checkout-content">
        <h1 className="checkout-header-title">Checkout</h1>

        {/* 1. ORDER SUMMARY CARD */}
        <div className="premium-card">
          <h2 className="premium-card-title">Order Summary</h2>
          {cartItems && cartItems.length > 0 ? (
            cartItems.map((item, idx) => (
              <div className="order-summary-item" key={idx}>
                <div className="order-item-info">
                  <span className="order-item-name">{item.name || item.title}</span>
                  <span className="order-item-desc">Rs. {item.price} × {item.qty}</span>
                </div>
                <div className="order-item-price" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  Rs. {item.price * item.qty}
                  <button 
                    type="button" 
                    onClick={() => removeFromCart(item.id)} 
                    style={{background: '#ef4444', border: 'none', color: '#fff', borderRadius: '4px', padding: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                  >
                    <FaTrash size={10} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{color: '#888', fontStyle: 'italic', fontSize: '14px', marginBottom: '15px'}}>Your cart is empty.</p>
          )}

          <div className="summary-totals-row">
            <span>Original Subtotal</span>
            <strong>Rs. {subTotal.toFixed(2)}</strong>
          </div>
          <div className="summary-totals-row">
            <span>{orderType === "delivery" ? "Delivery Fee" : "Service Fee"}</span>
            <strong>Rs. {deliveryFee.toFixed(2)}</strong>
          </div>
          <div className="grand-total-row">
            <span>Grand Total</span>
            <span>Rs. {total.toFixed(2)}</span>
          </div>
        </div>

        {/* 2. YOUR DETAILS CARD */}
        <div className="premium-card">
          <h2 className="premium-card-title">Your Details</h2>
          <div className="premium-input-group">
            <label className="premium-label">Full Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              className="premium-input"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="premium-input-group">
            <label className="premium-label">Phone Number</label>
            <input
              type="tel"
              placeholder="e.g. 03001234567"
              maxLength="11"
              className="premium-input"
              style={mobileError ? { borderColor: "#ef4444" } : {}}
              value={customerMobile}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                setCustomerMobile(val);
                if (val.length > 0 && val.length < 11) setMobileError("Enter 11 digits.");
                else if (val.length === 11 && !/^03\d{9}$/.test(val)) setMobileError("Must start with 03");
                else setMobileError("");
              }}
            />
            {mobileError && <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{mobileError}</span>}
          </div>

          {orderType === "delivery" && (
            <div className="animate-slide-up" style={{marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed #eaeaea'}}>
              <h3 className="premium-label" style={{marginBottom: '15px', color: '#111'}}>Delivery Address</h3>
              <div style={{display: 'flex', gap: '15px'}}>
                <div className="premium-input-group" style={{flex: 1}}>
                  <label className="premium-label" style={{fontWeight: 'normal', fontSize: '12px'}}>House / Flat No.</label>
                  <input type="text" className="premium-input" value={houseNo} onChange={(e) => setHouseNo(e.target.value)} />
                </div>
                <div className="premium-input-group" style={{flex: 1}}>
                  <label className="premium-label" style={{fontWeight: 'normal', fontSize: '12px'}}>Street No.</label>
                  <input type="text" className="premium-input" value={street} onChange={(e) => setStreet(e.target.value)} />
                </div>
              </div>
              <div className="premium-input-group" style={{marginBottom: 0}}>
                <label className="premium-label" style={{fontWeight: 'normal', fontSize: '12px'}}>Area / Society</label>
                <input type="text" placeholder="e.g. Johar Town" className="premium-input" value={area} onChange={(e) => setArea(e.target.value)} />
              </div>
            </div>
          )}
          
          {orderType === "dine_in" && (
             <div className="animate-slide-up" style={{marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed #eaeaea'}}>
                <label className="premium-label">Select Table</label>
                <select className="premium-input" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} disabled={!!sessionTable}>
                  <option value="" disabled>-- Select a Table --</option>
                  {availableTables.map((t) => (
                    <option key={t.id} value={t.table_name}>{t.table_name}</option>
                  ))}
                </select>
             </div>
          )}
        </div>

        {/* 3. ORDER TYPE CARD */}
        {sessionMode !== "Dine-In" && (
          <div className="premium-card">
            <h2 className="premium-card-title">Order Type</h2>
            
            <div className={`premium-radio-box ${orderType === 'takeaway' ? 'active' : ''}`} onClick={() => setOrderType('takeaway')}>
              <div className="pr-circle"></div>
              <div className="pr-icon" style={{color: '#8b6d43'}}><FaShoppingBag/></div>
              <div className="pr-content">
                <div className="pr-title">Pickup</div>
                <div className="pr-subtitle">Collect from our store</div>
              </div>
            </div>

            <div className={`premium-radio-box ${orderType === 'delivery' ? 'active' : ''}`} onClick={() => setOrderType('delivery')}>
              <div className="pr-circle"></div>
              <div className="pr-icon" style={{color: '#2563eb'}}><FaMapMarkerAlt/></div>
              <div className="pr-content">
                <div className="pr-title">Delivery / Service</div>
                <div className="pr-subtitle">Get it delivered at your location</div>
              </div>
            </div>
          </div>
        )}

        {/* 4. PAYMENT METHOD CARD */}
        <div className="premium-card">
          <h2 className="premium-card-title">Payment Method</h2>
          
          <div className={`premium-radio-box ${paymentMethod === 'Cash on Delivery' ? 'active' : ''}`} onClick={() => setPaymentMethod('Cash on Delivery')}>
            <div className="pr-circle"></div>
            <div className="pr-icon" style={{color: '#8b6d43'}}><FaMoneyBillWave/></div>
            <div className="pr-content">
              <div className="pr-title">Cash ({orderType === 'delivery' ? 'on Delivery' : 'on Pickup'})</div>
            </div>
          </div>

          <div className={`premium-radio-box ${paymentMethod === 'JazzCash' ? 'active' : ''}`} onClick={() => setPaymentMethod('JazzCash')}>
            <div className="pr-circle"></div>
            <div className="pr-icon" style={{color: '#ed2a26'}}><FaMobileAlt/></div>
            <div className="pr-content">
              <div className="pr-title">JazzCash <span className="pm-sandbox-badge" style={{marginLeft:'8px', fontSize: '9px', padding: '2px 5px'}}>SANDBOX</span></div>
              <div className="pr-subtitle">Pay via JazzCash mobile wallet</div>
            </div>
          </div>

          <div className={`premium-radio-box ${paymentMethod === 'Credit/Debit Card' ? 'active' : ''}`} onClick={() => setPaymentMethod('Credit/Debit Card')}>
            <div className="pr-circle"></div>
            <div className="pr-icon" style={{color: '#10b981'}}><FaCreditCard/></div>
            <div className="pr-content">
              <div className="pr-title">Credit / Debit Card <span className="pm-sandbox-badge" style={{marginLeft:'8px', fontSize: '9px', padding: '2px 5px'}}>SANDBOX</span></div>
              <div className="pr-subtitle">Visa, Mastercard accepted</div>
            </div>
          </div>

          <div className={`premium-radio-box ${paymentMethod === 'Bank Transfer' ? 'active' : ''}`} onClick={() => setPaymentMethod('Bank Transfer')}>
            <div className="pr-circle"></div>
            <div className="pr-icon" style={{color: '#8b6d43'}}><FaUniversity/></div>
            <div className="pr-content">
              <div className="pr-title">Bank Transfer</div>
              <div className="pr-subtitle">Direct bank account transfer</div>
            </div>
          </div>
        </div>

        {/* INFO BOX */}
        <div className="info-box">
          {getPaymentHelperText()}
        </div>

        {/* SCHEDULED BOX */}
        <div className="scheduled-box">
          <div className="scheduled-icon">
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></svg>
          </div>
          <div className="scheduled-text">
            <div className="scheduled-title">Scheduled for Today</div>
            <div className="scheduled-time">Expected: {expectedTimeStr}</div>
          </div>
          <div className="scheduled-badge">Today</div>
        </div>

      </div>

      {/* STICKY BOTTOM BAR */}
      <div className="sticky-bottom-bar">
        <button className="btn-place-order" onClick={handlePlaceOrder} disabled={isProcessing}>
          {isProcessing ? "Processing..." : `Place Order (Rs. ${total.toFixed(2)})`}
        </button>
      </div>

      {/* RECEIPT MODAL POPUP */}
      {receiptData && (
        <div className="receipt-modal-overlay" style={{zIndex: 99999}}>
          <div className="receipt-modal-card animate-slide-up">
            <FaCheckCircle className="receipt-icon" />
            <h2 className="receipt-title">Order Confirmed!</h2>
            <p className="receipt-subtitle">Your delicious food is being prepared.</p>

            <div className="receipt-bill-box" ref={receiptRef}>
              <div className="receipt-row align-items-center">
                <span className="receipt-label">Order ID:</span>
                <span className="receipt-value-wrapper">
                  <span className="receipt-order-id">#{receiptData.id}</span>
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
                <span className="receipt-label">Customer:</span>
                <span className="receipt-value">{receiptData.customerName}</span>
              </div>
              <div className="receipt-row mt-2">
                <span className="receipt-label">Date & Time:</span>
                <span className="receipt-value" style={{ fontFamily: "inherit", fontSize: "14px" }}>
                  {receiptData.date} | {receiptData.time}
                </span>
              </div>
              <div className="receipt-row mt-2">
                <span className="receipt-label">Payment:</span>
                <span className="receipt-value" style={{ fontWeight: "bold", color: receiptData.paymentMethod === "Cash on Delivery" ? "#ef4444" : "#10b981" }}>
                  {receiptData.paymentMethod}
                </span>
              </div>
              
              <div className="receipt-items-list mt-3">
                {receiptData.cart &&
                  receiptData.cart.map((item, idx) => (
                    <div key={idx} className="receipt-item-row">
                      <span>{item.qty}x {item.name || item.title}</span>
                      <span>Rs {item.price * item.qty}</span>
                    </div>
                  ))}
              </div>
              <div className="receipt-total-row">
                <span className="receipt-total-label">Total Paid:</span>
                <span className="receipt-total-value">Rs {receiptData.total}</span>
              </div>
            </div>
            
            <button
              onClick={handleDownloadReceipt}
              className="btn-receipt-download"
            >
              <FaDownload /> Download Receipt
            </button>
            
            <div className="receipt-actions">
              <button className="btn-receipt-track" onClick={() => navigate("/track-order")}>
                Track Order
              </button>
              <button className="btn-receipt-home" onClick={() => navigate("/")}>
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