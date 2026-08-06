import React from "react";
import { FaUtensils, FaPrint, FaArrowRight, FaCheck } from "react-icons/fa";

const KitchenCard = ({
  order,
  btnText,
  btnClass,
  onNext,
  isReady,
  onPrint,
}) => {
  // 🔥 ULTRA SAFE PARSER (Yeh har qism ke data format ko pakar lega)
  let parsedItems = [];
  try {
    // 1. Data jis bhi variable mein ho, usay pakro (items, cart, order_items, details)
    const rawData =
      order.items ||
      order.cart ||
      order.order_items ||
      order.details ||
      order.products;

    if (Array.isArray(rawData)) {
      parsedItems = rawData; // Agar pehle se array hai toh good
    } else if (typeof rawData === "string" && rawData.trim() !== "") {
      let firstParse = JSON.parse(rawData);

      // 2. Agar database mein JSON 2 dafa stringify ho gaya tha (Double String)
      if (typeof firstParse === "string") {
        parsedItems = JSON.parse(firstParse);
      } else if (Array.isArray(firstParse)) {
        parsedItems = firstParse;
      } else {
        // 3. Agar koi object hai jiske andar data rakha hai
        parsedItems =
          firstParse.items || firstParse.cart || Object.values(firstParse);
      }
    }
  } catch (error) {
    console.error(
      "❌ Items parse error in KitchenCard for Order ID:",
      order.id,
    );
  }

  // 🔥 JASOOS: Agar ab bhi display na ho, toh browser ke console mein yeh print hoga
  if (parsedItems.length === 0) {
    console.log("🕵️‍♂️ DEBUG ORDER DATA:", order);
  }

  return (
    <div
      className={`k-card ${
        order.status === "pending"
          ? "new"
          : order.status === "preparing"
            ? "prep"
            : "ready"
      }`}
    >
      <div className="k-card-top">
        <div className="table-pill">
          <FaUtensils style={{ marginRight: "5px" }} />{" "}
          {order.table || order.table_number || "Takeaway"}
        </div>
        <div className="timer-pill">{order.time}</div>
      </div>

      <div className="k-card-content">
        <div className="order-meta">
          <span>#{order.id}</span>
          <span>{order.type || "Dine-In"}</span>
        </div>

        <div className="items-container" style={{ marginTop: "15px" }}>
          {parsedItems.length > 0 ? (
            parsedItems.map((item, idx) => (
              <div
                key={idx}
                className="k-item-wrapper"
                style={{
                  marginBottom: "12px",
                  borderBottom: "1px dashed #eee",
                  paddingBottom: "8px",
                }}
              >
                <div
                  className="k-item-row"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <span
                    className="qty-badge"
                    style={{ minWidth: "30px", textAlign: "center" }}
                  >
                    {item.qty || item.quantity || 1}x
                  </span>
                  <span style={{ fontWeight: "600", marginLeft: "10px" }}>
                    {item.name || item.title || item.item_name}
                    {item.size && (
                      <span
                        style={{
                          color: "#ef4444",
                          fontSize: "12px",
                          marginLeft: "6px",
                          fontWeight: "bold",
                        }}
                      >
                        [{item.size}]
                      </span>
                    )}
                  </span>
                </div>

                {(item.description || item.note) && (
                  <div
                    style={{
                      paddingLeft: "40px",
                      marginTop: "4px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    {item.description && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#666",
                          lineHeight: "1.2",
                        }}
                      >
                        {item.description}
                      </div>
                    )}

                    {item.note && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#ef4444",
                          fontStyle: "italic",
                          backgroundColor: "#fef2f2",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          borderLeft: "2px solid #ef4444",
                          display: "inline-block",
                          width: "fit-content",
                        }}
                      >
                        * Note: {item.note}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div
              style={{ color: "#999", fontSize: "12px", fontStyle: "italic" }}
            >
              No items details found. Check console (F12).
            </div>
          )}
        </div>
      </div>

      <div className="k-card-actions">
        <button
          className="btn-k btn-outline"
          onClick={() => onPrint(order)}
          title="Print Ticket"
        >
          <FaPrint />
        </button>
        <button className={`btn-k btn-fill ${btnClass}`} onClick={onNext}>
          {btnText} {isReady ? <FaCheck /> : <FaArrowRight />}
        </button>
      </div>
    </div>
  );
};

export default KitchenCard;
