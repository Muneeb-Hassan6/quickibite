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
    <div className="admin-modal-overlay override-zindex" onClick={onClose}>
      <div
        className="admin-modal-box staff-modal-box animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "90vh", overflowY: "auto" }} // 🔥 YEH LINE ADD KARNI HY
      >
        <div className="modal-header-flex">
          <h3 className="modal-title">Add New Employee</h3>
          <button
            type="button"
            className="btn-close-modal-clean"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-input-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="admin-input-field custom-admin-input"
              placeholder="e.g. Ali Khan"
            />
          </div>

          <div className="modal-form-row">
            <div className="admin-input-group input-col">
              <label>Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="admin-input-field custom-admin-input"
              >
                <option value="Admin">Admin</option>
                <option value="Cashier">Cashier</option>
                <option value="Chef">Chef</option>
                <option value="Manager">Manager</option>
                <option value="Rider">Rider</option>
                <option value="Waiter">Waiter</option>
                <option value="Dispatcher">Dispatcher</option>
              </select>
            </div>
            <div className="admin-input-group input-col">
              <label>Monthly Salary (Rs)</label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                required
                className="admin-input-field custom-admin-input"
                placeholder="e.g. 30000"
              />
            </div>
          </div>

          <div className="admin-input-group">
            <label>Phone Number</label>
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
              className={`admin-input-field custom-admin-input ${phoneError ? "border-red-500" : ""}`}
              style={phoneError ? { borderColor: "#ef4444" } : {}}
              placeholder="e.g. 03001234567"
            />
            {phoneError && (
              <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px", display: "inline-block" }}>
                {phoneError}
              </span>
            )}
          </div>

          <hr
            style={{
              border: "1px solid var(--admin-border)",
              margin: "20px 0",
            }}
          />

          <p
            style={{
              color: "var(--brand-red, #ef4444)",
              fontSize: "12px",
              marginTop: 0,
              fontWeight: "bold",
            }}
          >
            System Access Credentials (Required)
          </p>
          {/* 🔥 CONDITIONAL RENDERING: Sirf tab dikhega jab role 'Rider' hoga */}
          {formData.role === "Rider" && (
            <>
              <hr
                style={{
                  border: "1px solid var(--admin-border)",
                  margin: "20px 0",
                }}
              />
              <p
                style={{
                  color: "var(--brand-yellow, #eab308)",
                  fontSize: "12px",
                  marginTop: 0,
                  fontWeight: "bold",
                }}
              >
                Rider Details (Required)
              </p>

              <div className="modal-form-row animate-slide-up">
                <div className="admin-input-group input-col">
                  <label>Bike Number</label>
                  <input
                    type="text"
                    name="bike_number"
                    value={formData.bike_number}
                    onChange={handleChange}
                    required={formData.role === "Rider"} // Rider ke liye lazmi
                    className="admin-input-field custom-admin-input"
                    placeholder="e.g. LEB-1234"
                  />
                </div>
                <div className="admin-input-group input-col">
                  <label>License Number</label>
                  <input
                    type="text"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleChange}
                    required={formData.role === "Rider"} // Rider ke liye lazmi
                    className="admin-input-field custom-admin-input"
                    placeholder="e.g. DL-9876543"
                  />
                </div>
              </div>
            </>
          )}
          <div className="modal-form-row">
            <div className="admin-input-group input-col">
              <label>
                <FaUserLock style={{ marginRight: "5px" }} /> Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="admin-input-field custom-admin-input"
                placeholder="e.g. ali_cashier"
              />
            </div>
            <div className="admin-input-group input-col">
              <label>
                <FaKey style={{ marginRight: "5px" }} /> Password
              </label>
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="admin-input-field custom-admin-input"
                placeholder="Enter password"
              />
            </div>
          </div>

          <div className="modal-footer-actions">
            <button
              type="button"
              className="btn-cancel-modal-clean"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save-modal-clean"
              disabled={isSubmitting}
            >
              <FaSave style={{ marginRight: "5px" }} />{" "}
              {isSubmitting ? "Saving..." : "Hire Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
