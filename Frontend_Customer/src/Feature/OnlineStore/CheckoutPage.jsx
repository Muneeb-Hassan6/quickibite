import React from "react";
import { Link } from "react-router-dom";
import { LuShoppingBag, LuLock } from "react-icons/lu";
import { useCheckoutForm } from "./Components/Checkout/hooks/useCheckoutForm";

// Atomic Subcomponents
import DeliveryAddressForm from "./Components/Checkout/DeliveryAddressForm";
import CustomerContactFields from "./Components/Checkout/CustomerContactFields";
import PaymentMethodPicker from "./Components/Checkout/PaymentMethodPicker";
import OrderSummaryCard from "./Components/Checkout/OrderSummaryCard";
import PaymentSandboxModal from "./Components/Checkout/PaymentSandboxModal";

const CheckoutPage = () => {
  const form = useCheckoutForm();

  // Empty Cart Guard
  if (!form.cartItems || form.cartItems.length === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0c] text-neutral-900 dark:text-white px-4 py-16">
        <div className="text-center max-w-md w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-8 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <LuShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-['Oswald',sans-serif] font-black text-2xl uppercase text-neutral-900 dark:text-white">
            Your Cart is Empty
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 mb-6">
            You don't have any meals in your bucket to checkout.
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-['Oswald',sans-serif] font-bold uppercase text-xs tracking-wider shadow-md transition-all no-underline"
          >
            <span>Browse Delicious Menu</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-neutral-900 dark:text-white transition-colors duration-300 pb-20">
      {/* ── Page Header ── */}
      <section className="relative overflow-hidden pt-8 pb-8 sm:pt-12 sm:pb-10 border-b border-gray-200/80 dark:border-neutral-800/80 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-amber-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
                <LuLock className="w-3.5 h-3.5 text-amber-500" />
                <span>SECURE ENCRYPTED CHECKOUT</span>
              </div>
              <h1 className="font-['Oswald',sans-serif] font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-neutral-950 dark:text-white m-0">
                FINALIZE YOUR{" "}
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  ORDER
                </span>
              </h1>
            </div>

            <div className="text-xs sm:text-sm font-bold text-neutral-500 dark:text-neutral-400 font-['Oswald',sans-serif] uppercase tracking-wider">
              Est. Arrival:{" "}
              <span className="text-amber-500 font-black">{form.expectedTimeStr}</span>{" "}
              (~{form.deliveryTimeMinutes} mins)
            </div>
          </div>
        </div>
      </section>

      {/* ── 2-Column Main Layout ── */}
      <main className="max-w-7xl mx-auto px-3.5 sm:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
          {/* ════ LEFT COLUMN: CUSTOMER & ORDER CONFIGURATION (7 Cols) ════ */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <DeliveryAddressForm
              orderType={form.orderType}
              setOrderType={form.setOrderType}
              baseDeliveryFee={form.baseDeliveryFee}
              houseNo={form.houseNo}
              setHouseNo={form.setHouseNo}
              street={form.street}
              setStreet={form.setStreet}
              area={form.area}
              setArea={form.setArea}
              tableNumber={form.tableNumber}
              setTableNumber={form.setTableNumber}
              availableTables={form.availableTables}
              errors={form.errors}
              setErrors={form.setErrors}
            />

            <CustomerContactFields
              customerName={form.customerName}
              handleNameChange={form.handleNameChange}
              customerMobile={form.customerMobile}
              handleMobileChange={form.handleMobileChange}
              errors={form.errors}
            />

            <PaymentMethodPicker
              paymentMethod={form.paymentMethod}
              setPaymentMethod={form.setPaymentMethod}
            />
          </div>

          {/* ════ RIGHT COLUMN: ORDER SUMMARY CARD (5 Cols) ════ */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            <OrderSummaryCard
              cartItems={form.cartItems}
              subTotal={form.subTotal}
              deliveryFee={form.deliveryFee}
              total={form.total}
              isSubmitting={form.isSubmitting}
              handleProceedOrder={form.handleProceedOrder}
            />
          </div>
        </div>
      </main>

      {/* ════ 5. NATIVE DIGITAL PAYMENT SANDBOX MODAL ════ */}
      <PaymentSandboxModal
        isOpen={form.sandboxModalOpen}
        onClose={() => form.setSandboxModalOpen(false)}
        sandboxMethod={form.sandboxMethod}
        sandboxLoading={form.sandboxLoading}
        sandboxInput1={form.sandboxInput1}
        setSandboxInput1={form.setSandboxInput1}
        sandboxInput2={form.sandboxInput2}
        setSandboxInput2={form.setSandboxInput2}
        handleSandboxPay={form.handleSandboxPay}
        total={form.total}
      />
    </div>
  );
};

export default CheckoutPage;