import React from "react";
import { FaUtensils, FaArrowRight, FaCheck } from "react-icons/fa";

const KitchenCard = ({
  order,
  btnText,
  btnClass,
  onNext,
  isReady,
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
      className={`bg-[var(--k-panel)] rounded-[10px] flex flex-col shrink-0 overflow-hidden transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:-translate-y-[3px] hover:shadow-[0_6px_15px_rgba(0,0,0,0.12)] ${order.status === "pending"
          ? "border-l-[4px] border-l-[var(--status-yellow)]"
          : order.status === "preparing"
            ? "border-l-[4px] border-l-[var(--brand-red)]"
            : "border-l-[4px] border-l-[var(--status-green)]"
        }`}
    >
      <div className="p-[12px_15px] bg-[var(--k-bg)] flex justify-between items-center">
        <div className="bg-[var(--k-panel)] text-[var(--k-text)] p-[4px_10px] rounded-[6px] font-extrabold text-[12px] flex items-center shadow-sm">
          <FaUtensils className="mr-[5px]" />
          {order.table || order.table_number || "Takeaway"}
        </div>
        <div className="text-[var(--k-muted)] font-bold text-[13px] font-mono">{order.time}</div>
      </div>

      <div className="p-[15px]">
        <div className="flex justify-between text-[12px] text-[var(--k-muted)] font-bold mb-[15px] pb-[10px] border-b border-dashed border-[var(--k-muted)]/20">
          <span>#{order.id}</span>
          <span>{order.type || "Dine-In"}</span>
        </div>

        <div className="mt-[15px]">
          {parsedItems.length > 0 ? (
            parsedItems.map((item, idx) => (
              <div
                key={idx}
                className="mb-[12px] border-b border-dashed border-[var(--k-muted)]/15 pb-[8px]"
              >
                <div className="flex items-center gap-[12px] text-[15px] font-bold text-[var(--k-text)] mb-[10px]">
                  <span className="bg-[var(--k-bg)] text-[var(--k-text)] font-black text-[14px] w-[28px] h-[28px] flex justify-center items-center rounded-[6px] shrink-0 min-w-[30px] text-center">
                    {item.qty || item.quantity || 1}x
                  </span>
                  <span className="font-[600] ml-[10px]">
                    {item.name || item.title || item.item_name}
                    {item.size && (
                      <span className="text-[var(--brand-red)] text-[12px] ml-[6px] font-bold">
                        [{item.size}]
                      </span>
                    )}
                  </span>
                </div>

                {(item.description || item.note) && (
                  <div className="pl-[40px] mt-[4px] flex flex-col gap-[4px]">
                    {item.description && (
                      <div className="text-[11px] text-[var(--k-muted)] leading-[1.2]">
                        {item.description}
                      </div>
                    )}

                    {item.note && (
                      <div className="text-[11px] text-[var(--brand-red)] italic bg-[rgba(239,68,68,0.06)] p-[4px_8px] rounded-[4px] border-l-[2px] border-l-[var(--brand-red)] inline-block w-fit">
                        * Note: {item.note}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-[var(--k-muted)] text-[12px] italic">
              No items details found.
            </div>
          )}
        </div>
      </div>
      <button className={`w-full p-[12px] border-none font-oswald font-extrabold text-[14px] uppercase cursor-pointer flex justify-center items-center gap-[8px] transition-all duration-200 text-white rounded-none hover:brightness-110 ${btnClass === 'yellow' ? 'bg-[var(--status-yellow)] text-[#000]' : btnClass === 'red' ? 'bg-[var(--brand-red)]' : btnClass === 'gray' ? 'bg-[#555] cursor-not-allowed opacity-80' : 'bg-[var(--status-green)]'}`} onClick={onNext} disabled={btnClass === 'gray'}>
        {btnText} {isReady ? <FaCheck /> : <FaArrowRight />}
      </button>
    </div>
  );
};

export default KitchenCard;
