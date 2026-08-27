import React, { useState } from "react";
import { FaTimes, FaUserPlus, FaSpinner } from "react-icons/fa";
import Swal from "sweetalert2";
import EmployeePersonalInfoForm from "./EmployeePersonalInfoForm";
import EmployeeWorkDetailsForm from "./EmployeeWorkDetailsForm";

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
        }
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
          <EmployeePersonalInfoForm
            formData={formData}
            handleChange={handleChange}
            phoneError={phoneError}
            setPhoneError={setPhoneError}
            setFormData={setFormData}
          />

          <EmployeeWorkDetailsForm
            formData={formData}
            handleChange={handleChange}
          />

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
