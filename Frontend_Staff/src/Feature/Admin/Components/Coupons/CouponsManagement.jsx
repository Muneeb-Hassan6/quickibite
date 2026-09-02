import { API_BASE } from '../../../../utils/apiHelper';
import React, { useState, useEffect } from "react";
import {
  FaTag,
  FaPlus,
  FaTrashAlt,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
  FaPercentage,
  FaMoneyBillWave,
  FaClock,
  FaChartBar,
  FaSearch,
} from "react-icons/fa";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

const CouponsManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "fixed",
    discount_value: "",
    min_spend: "0",
    max_discount: "",
    usage_limit: "",
    expiry_date: "",
    is_active: 1,
  });
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE}/get_admin_coupons.php`
      );
      const data = await res.json();
      if (data.success) {
        setCoupons(data.data || []);
      } else {
        toast.error(data.message || "Failed to load coupons");
      }
    } catch (err) {
      toast.error("Network error fetching coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      discount_type: "fixed",
      discount_value: "",
      min_spend: "0",
      max_discount: "",
      usage_limit: "",
      expiry_date: "",
      is_active: 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_spend: coupon.min_spend || "0",
      max_discount: coupon.max_discount || "",
      usage_limit: coupon.usage_limit || "",
      expiry_date: coupon.expiry_date ? coupon.expiry_date.slice(0, 16) : "",
      is_active: parseInt(coupon.is_active) === 1 ? 1 : 0,
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (coupon) => {
    try {
      const res = await fetch(
        `${API_BASE}/delete_coupon.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: coupon.id, action: "toggle" }),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success(
          `Coupon ${coupon.code} is now ${
            parseInt(coupon.is_active) === 1 ? "Inactive" : "Active"
          }`
        );
        fetchCoupons();
      } else {
        toast.error(data.message || "Could not toggle status");
      }
    } catch (err) {
      toast.error("Network error toggling coupon status");
    }
  };

  const handleDelete = (coupon) => {
    Swal.fire({
      title: "Delete Promo Code?",
      text: `Are you sure you want to permanently delete code "${coupon.code}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "swal2-popup",
        confirmButton: "swal2-confirm",
        cancelButton: "swal2-cancel",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(
            `${API_BASE}/delete_coupon.php`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: coupon.id, action: "delete" }),
            }
          );
          const data = await res.json();
          if (data.success) {
            toast.success("Promo code deleted");
            fetchCoupons();
          } else {
            toast.error(data.message || "Failed to delete coupon");
          }
        } catch (err) {
          toast.error("Error deleting promo code");
        }
      }
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    if (!formData.discount_value || parseFloat(formData.discount_value) <= 0) {
      toast.error("Discount value must be greater than 0");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...(editingCoupon ? { id: editingCoupon.id } : {}),
        code: formData.code.trim().toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_spend: parseFloat(formData.min_spend || 0),
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        expiry_date: formData.expiry_date || null,
        is_active: formData.is_active ? 1 : 0,
      };

      const res = await fetch(
        `${API_BASE}/save_coupon.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Promo code saved!");
        setIsModalOpen(false);
        fetchCoupons();
      } else {
        toast.error(data.message || "Failed to save promo code");
      }
    } catch (err) {
      toast.error("Network error saving promo code");
    } finally {
      setSaving(false);
    }
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.discount_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUsed = coupons.reduce(
    (acc, c) => acc + parseInt(c.times_used || 0),
    0
  );
  const activeCount = coupons.filter((c) => parseInt(c.is_active) === 1).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto h-[calc(100vh-80px)] overflow-y-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-wider mb-1">
            <FaTag className="w-3 h-3" />
            <span>Promotion & Discounts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-['Oswald',sans-serif] uppercase tracking-wide text-white m-0">
            Promo Codes & Coupons
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-['Oswald',sans-serif] font-bold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer border-none active:scale-95"
        >
          <FaPlus />
          <span>Create Promo Code</span>
        </button>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl">
            <FaTag />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider m-0">
              Total Coupons
            </p>
            <h3 className="text-2xl font-black text-white m-0">
              {coupons.length}
            </h3>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl">
            <FaCheckCircle />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider m-0">
              Active Coupons
            </p>
            <h3 className="text-2xl font-black text-white m-0">{activeCount}</h3>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-xl">
            <FaChartBar />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider m-0">
              Total Redemptions
            </p>
            <h3 className="text-2xl font-black text-white m-0">{totalUsed}</h3>
          </div>
        </div>
      </div>

      {/* ── Table & Search Bar ── */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3.5 top-3.5 text-neutral-500 text-xs" />
            <input
              type="text"
              placeholder="Search coupon code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <span className="text-xs text-neutral-400 font-bold">
            Showing {filteredCoupons.length} codes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/60 text-neutral-400 font-bold uppercase tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4">Min. Spend</th>
                <th className="py-3.5 px-4">Usage Limit</th>
                <th className="py-3.5 px-4">Times Used</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-neutral-500">
                    Loading promo codes...
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-neutral-500">
                    No promo codes found. Click "Create Promo Code" to add one.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const isActive = parseInt(coupon.is_active) === 1;
                  return (
                    <tr
                      key={coupon.id}
                      className="hover:bg-neutral-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 text-xs">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-200 font-bold">
                        {coupon.discount_type === "percentage" ? (
                          <span>
                            {coupon.discount_value}% OFF{" "}
                            {coupon.max_discount > 0 && (
                              <span className="text-[10px] text-neutral-400 font-normal">
                                (Max Rs {parseFloat(coupon.max_discount)})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span>
                            Rs {parseFloat(coupon.discount_value)} Flat
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-300">
                        {parseFloat(coupon.min_spend) > 0 ? (
                          `Rs ${parseFloat(coupon.min_spend)}`
                        ) : (
                          <span className="text-neutral-500">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-300">
                        {coupon.usage_limit ? (
                          `${coupon.usage_limit} uses`
                        ) : (
                          <span className="text-neutral-500">Unlimited</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white">
                          {coupon.times_used}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(coupon)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer border-none ${
                            isActive
                              ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                              : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                          }`}
                        >
                          {isActive ? "● Active" : "○ Inactive"}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(coupon)}
                            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all border-none cursor-pointer"
                            title="Edit Coupon"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon)}
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all border-none cursor-pointer"
                            title="Delete Coupon"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="font-['Oswald',sans-serif] font-bold text-lg uppercase text-white m-0 flex items-center gap-2">
                <FaTag className="text-amber-500" />
                <span>
                  {editingCoupon ? "Edit Promo Code" : "Create New Promo Code"}
                </span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white border-none bg-transparent cursor-pointer text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WELCOME50"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500 uppercase"
                />
              </div>

              {/* Type & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Discount Type
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="fixed">Fixed Amount (Rs)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder={
                      formData.discount_type === "percentage" ? "20" : "150"
                    }
                    value={formData.discount_value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_value: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Min Spend & Max Discount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Min Order Spend (Rs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.min_spend}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        min_spend: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Max Discount Cap (Rs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional"
                    value={formData.max_discount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_discount: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Usage Limit & Expiry Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Usage Limit (Max Uses)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={formData.usage_limit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usage_limit: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Expiry Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expiry_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expiry_date: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active_toggle"
                  checked={Boolean(formData.is_active)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_active: e.target.checked ? 1 : 0,
                    })
                  }
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-neutral-800 border-neutral-700"
                />
                <label
                  htmlFor="is_active_toggle"
                  className="text-xs font-bold text-neutral-300 cursor-pointer"
                >
                  Active and ready for customer checkout
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs uppercase border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-['Oswald',sans-serif] font-bold text-xs uppercase tracking-wider border-none cursor-pointer disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingCoupon
                    ? "Update Code"
                    : "Create Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsManagement;
