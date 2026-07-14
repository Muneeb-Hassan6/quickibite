import React, { useState } from "react";
import { FaTimes, FaSave, FaUserLock, FaKey } from "react-icons/fa";
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
        confirmButtonColor: "#ef4444",
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

      // 🔥 DEEP DEBUGGING: Browser Console me check karein ke Backend se kya aaya
      console.log("Backend Response:", result);

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Hired!",
          text: result.message,
          timer: 1500,
          showConfirmButton: false,
        });

        if (onSave) onSave(); // Parent ko refresh karega

        // Reset Form
        setFormData({
          name: "",
          role: "Waiter",
          phone: "",
          salary: "",
          username: "",
          password: "",
          bike_number: "", // 🔥 Reset here
          license_number: "",
        });
        onClose();
      } else {
        // Agar masla aaye toh proper message dikhayega
        Swal.fire({
          icon: "error",
          title: "Action Failed",
          text: result.message,
        });
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      Swal.fire({
        icon: "error",
        title: "System Error",
        text: "Failed to read response from server. Check console.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-[6px] flex justify-center items-center z-[99999]" onClick={onClose}>
      <div
        className="w-[90%] max-w-[37.5rem] bg-[var(--admin-bg,#141414)] rounded-[1rem] p-[1.563rem] shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative animate-slide-up max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-[1.25rem] w-full">
          <h3 className="uppercase flex items-center gap-[0.625rem] text-white m-0 text-[1.25rem] font-black">Add New Employee</h3>
          <button
            type="button"
            className="bg-transparent border-none text-[#949191] text-[1.25rem] cursor-pointer transition-colors duration-300 hover:text-[var(--admin-text)] static !m-0"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-[0.938rem]">
            <label className="block text-[#888] text-[0.75rem] font-extrabold mb-[0.5rem] uppercase">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-[var(--admin-bg)] text-[var(--admin-text)] p-[0.875rem_0.938rem] rounded-[0.5rem] text-[0.938rem] font-medium outline-none transition-all duration-300 focus:bg-[var(--admin-bg)]"
              placeholder="e.g. Ali Khan"
            />
          </div>

          <div className="flex gap-[0.938rem] mt-[0.938rem] w-full flex-col md:flex-row">
            <div className="mb-[0.938rem] flex-1 min-w-0">
              <label className="block text-[#888] text-[0.75rem] font-extrabold mb-[0.5rem] uppercase">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-[var(--admin-bg)] text-[var(--admin-text)] p-[0.875rem_0.938rem] rounded-[0.5rem] text-[0.938rem] font-medium outline-none transition-all duration-300 focus:bg-[var(--admin-bg)]"
              >
                <option className="bg-[var(--admin-bg)] text-[var(--admin-text)]" value="Admin">Admin</option>
                <option className="bg-[var(--admin-bg)] text-[var(--admin-text)]" value="Cashier">Cashier</option>
                <option className="bg-[var(--admin-bg)] text-[var(--admin-text)]" value="Chef">Chef</option>
                <option className="bg-[var(--admin-bg)] text-[var(--admin-text)]" value="Manager">Manager</option>
                <option className="bg-[var(--admin-bg)] text-[var(--admin-text)]" value="Rider">Rider</option>
                <option className="bg-[var(--admin-bg)] text-[var(--admin-text)]" value="Waiter">Waiter</option>
                <option className="bg-[var(--admin-bg)] text-[var(--admin-text)]" value="Dispatcher">Dispatcher</option>
              </select>
            </div>
            <div className="mb-[0.938rem] flex-1 min-w-0">
              <label className="block text-[#888] text-[0.75rem] font-extrabold mb-[0.5rem] uppercase">Monthly Salary (Rs)</label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                required
                className="w-full bg-[var(--admin-bg)] text-[var(--admin-text)] p-[0.875rem_0.938rem] rounded-[0.5rem] text-[0.938rem] font-medium outline-none transition-all duration-300 focus:bg-[var(--admin-bg)]"
                placeholder="e.g. 30000"
              />
            </div>
          </div>

          <div className="mb-[0.938rem]">
            <label className="block text-[#888] text-[0.75rem] font-extrabold mb-[0.5rem] uppercase">Phone Number</label>
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
              className={`w-full bg-[var(--admin-bg)] text-[var(--admin-text)] p-[0.875rem_0.938rem] rounded-[0.5rem] text-[0.938rem] font-medium outline-none transition-all duration-300 focus:border-[#ef4444] focus:bg-[var(--admin-bg)] ${phoneError ? "!border-red-500" : ""}`}
              placeholder="e.g. 03001234567"
            />
            {phoneError && (
              <span className="text-[#ef4444] text-[0.75rem] mt-[0.313rem] inline-block">
                {phoneError}
              </span>
            )}
          </div>

          <hr className="border-none bg-[var(--admin-border,#222)] h-[1px] my-[1.25rem]" />

          <p className="text-[var(--admin-orange)] text-[0.75rem] mt-0 font-bold">
            System Access Credentials (Required)
          </p>
          {/* 🔥 CONDITIONAL RENDERING: Sirf tab dikhega jab role 'Rider' hoga */}
          {formData.role === "Rider" && (
            <>
              <hr className="border-none bg-[var(--admin-border,#222)] h-[1px] my-[1.25rem]" />
              <p className="text-[var(--brand-yellow,#eab308)] text-[0.75rem] mt-0 font-bold">
                Rider Details (Required)
              </p>

              <div className="flex gap-[0.938rem] mt-[0.938rem] w-full flex-col md:flex-row animate-slide-up">
                <div className="mb-[0.938rem] flex-1 min-w-0">
                  <label className="block text-[#888] text-[0.75rem] font-extrabold mb-[0.5rem] uppercase">Bike Number</label>
                  <input
                    type="text"
                    name="bike_number"
                    value={formData.bike_number}
                    onChange={handleChange}
                    required={formData.role === "Rider"} // Rider ke liye lazmi
                    className="w-full bg-[var(--admin-bg)] text-[var(--admin-text)] p-[0.875rem_0.938rem] rounded-[0.5rem] text-[0.938rem] font-medium outline-none transition-all duration-300 focus:bg-[var(--admin-bg)]"
                    placeholder="e.g. LEB-1234"
                  />
                </div>
                <div className="mb-[0.938rem] flex-1 min-w-0">
                  <label className="block text-[#888] text-[0.75rem] font-extrabold mb-[0.5rem] uppercase">License Number</label>
                  <input
                    type="text"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleChange}
                    required={formData.role === "Rider"} // Rider ke liye lazmi
                    className="w-full bg-[var(--admin-bg)] text-[var(--admin-text)] p-[0.875rem_0.938rem] rounded-[0.5rem] text-[0.938rem] font-medium outline-none transition-all duration-300 focus:bg-[var(--admin-bg)]"
                    placeholder="e.g. DL-9876543"
                  />
                </div>
              </div>
            </>
          )}
          <div className="flex gap-[0.938rem] mt-[0.938rem] w-full flex-col md:flex-row">
            <div className="mb-[0.938rem] flex-1 min-w-0">
              <label className="flex items-center text-[#888] text-[0.75rem] font-extrabold mb-[0.5rem] uppercase">
                <FaUserLock className="mr-[0.313rem]" /> Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full bg-[var(--admin-bg)] text-[var(--admin-text)] p-[0.875rem_0.938rem] rounded-[0.5rem] text-[0.938rem] font-medium outline-none transition-all duration-300 focus:bg-[var(--admin-bg)]"
                placeholder="e.g. ali_cashier"
              />
            </div>
            <div className="mb-[0.938rem] flex-1 min-w-0">
              <label className="flex items-center text-[#888] text-[0.75rem] font-extrabold mb-[0.5rem] uppercase">
                <FaKey className="mr-[0.313rem]" /> Password
              </label>
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-[var(--admin-bg)] text-[var(--admin-text)] p-[0.875rem_0.938rem] rounded-[0.5rem] text-[0.938rem] font-medium outline-none transition-all duration-300 focus:bg-[var(--admin-bg)]"
                placeholder="Enter password"
              />
            </div>
          </div>

          <div className="mt-[1.875rem] border-t border-[var(--admin-border)] pt-[1.25rem] flex justify-end gap-[0.938rem] w-full">
            <button
              type="button"
              className="bg-[rgba(255,255,255,0.05)] text-white p-[0.75rem_1.563rem] rounded-[0.5rem] cursor-pointer font-bold transition-colors duration-200 hover:bg-[rgba(255,255,255,0.1)]"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[var(--admin-orange)] text-white border-none p-[0.75rem_1.563rem] rounded-[0.5rem] cursor-pointer font-bold shadow-[var(--shadow-glow)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[var(--shadow-glow)] flex items-center justify-center disabled:opacity-50"
              disabled={isSubmitting}
            >
              <FaSave className="mr-[0.313rem]" />{" "}
              {isSubmitting ? "Saving..." : "Hire Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
