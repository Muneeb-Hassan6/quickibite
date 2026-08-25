import React, { useState } from "react";
import { FaTimes, FaSave, FaUserLock, FaKey, FaUserPlus, FaMotorcycle, FaIdCard, FaSpinner } from "react-icons/fa";
import Swal from "sweetalert2";

const AddEmployeeModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    role: "Waiter",
    phone: "",
    salary: "",
    username: "",
    password: "",
    bike_number: "",
    license_number: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!/^03\d{9}$/.test(formData.phone)) {
      setPhoneError("Please enter a valid 11-digit mobile number.");
      Swal.fire({
        icon: "error",
        title: "Invalid Mobile Number",
        text: "Please enter exactly 11 digits starting with 03 (e.g. 03001234567).",
        background: "#171717",
        color: "#fff",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/add_staff.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Staff Enrolled!",
          text: result.message || "New staff member added.",
          timer: 1500,
          showConfirmButton: false,
          background: "#171717",
          color: "#fff",
        });

        if (onSave) onSave();

        setFormData({
          name: "",
          role: "Waiter",
          phone: "",
          salary: "",
          username: "",
          password: "",
          bike_number: "",
          license_number: "",
        });
        onClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "Action Failed",
          text: result.message,
          background: "#171717",
          color: "#fff",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "System Error",
        text: "Failed to connect with server.",
        background: "#171717",
        color: "#fff",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="modal-surface w-full max-w-lg md:max-w-xl p-5 sm:p-7 relative max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
            <h3 className="m-0 text-base sm:text-lg font-black font-['Oswald',sans-serif] uppercase tracking-wide">
              Enroll New Staff Member
            </h3>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center border-none cursor-pointer transition-all active:scale-90"
            onClick={onClose}
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
              Full Legal Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
              placeholder="e.g. Muhammad Ali"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
                Staff Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option className="bg-white dark:bg-[#171717]" value="Admin">Admin</option>
                <option className="bg-white dark:bg-[#171717]" value="Manager">Manager</option>
                <option className="bg-white dark:bg-[#171717]" value="Chef">Chef</option>
                <option className="bg-white dark:bg-[#171717]" value="Cashier">Cashier</option>
                <option className="bg-white dark:bg-[#171717]" value="Rider">Rider</option>
                <option className="bg-white dark:bg-[#171717]" value="Waiter">Waiter</option>
                <option className="bg-white dark:bg-[#171717]" value="Dispatcher">Dispatcher</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
                Monthly Salary (Rs.) *
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                placeholder="e.g. 45000"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
              Mobile Contact (11 Digits) *
            </label>
            <input
              type="tel"
              name="phone"
              maxLength="11"
              value={formData.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                setFormData({ ...formData, phone: val });
                if (val.length > 0 && val.length < 11) {
                  setPhoneError("Please enter all 11 digits.");
                } else if (val.length === 11 && !/^03\d{9}$/.test(val)) {
                  setPhoneError("Number must start with 03 (e.g. 03001234567).");
                } else {
                  setPhoneError("");
                }
              }}
              required
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
              placeholder="e.g. 03001234567"
            />
            {phoneError && (
              <span className="text-[10px] text-rose-500 font-bold block mt-1">
                {phoneError}
              </span>
            )}
          </div>

          {/* Rider Specific Details */}
          {formData.role === "Rider" && (
            <div className="p-3.5 bg-slate-50 dark:bg-black/40 rounded-2xl border border-amber-500/20 space-y-3 animate-slide-up">
              <div className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <FaMotorcycle />
                <span>Rider Vehicle & License Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 block mb-1">
                    Bike Plate Number *
                  </label>
                  <input
                    type="text"
                    name="bike_number"
                    value={formData.bike_number}
                    onChange={handleChange}
                    required={formData.role === "Rider"}
                    className="w-full px-3 py-2 bg-white dark:bg-black/50 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs"
                    placeholder="e.g. LEB-1234"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 block mb-1">
                    License Number *
                  </label>
                  <input
                    type="text"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleChange}
                    required={formData.role === "Rider"}
                    className="w-full px-3 py-2 bg-white dark:bg-black/50 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs"
                    placeholder="e.g. DL-9876543"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Portal Credentials */}
          <div className="p-3.5 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/5 space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-neutral-400 flex items-center gap-1.5">
              <FaUserLock className="text-amber-500" />
              <span>Portal Login Credentials</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 block mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs"
                  placeholder="e.g. ali_staff"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 block mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/[0.06]">
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-white/10 text-xs font-bold uppercase tracking-wider cursor-pointer"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-brand-cta px-6 py-2.5 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border-none active:scale-95 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <FaSpinner className="animate-spin text-xs" />
              ) : (
                <FaUserPlus className="text-xs" />
              )}
              <span>Enroll Staff</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
