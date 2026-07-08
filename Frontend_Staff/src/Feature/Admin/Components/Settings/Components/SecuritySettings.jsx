import React, { useState, useEffect } from "react";
import { FaLock, FaUserShield } from "react-icons/fa";
import Swal from "sweetalert2";

const SecuritySettings = () => {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch Staff List from Database
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/get_staff.php`,
        );
        const result = await response.json();

        if (result.success) {
          // Sirf wo staff nikalen jinka system mein account ho sakta hai
          setStaffList(result.data);

          // Dropdown mein pehla banda default select kar lein
          if (result.data.length > 0) {
            setSelectedStaffId(result.data[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch staff for security settings", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, []);

  // 2. Handle Password Update
  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 4) {
      Swal.fire(
        "Weak Password",
        "Password must be at least 4 characters long.",
        "warning",
      );
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/update_password.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            staff_id: selectedStaffId,
            new_password: newPassword,
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Password Updated!",
          showConfirmButton: false,
          timer: 1500,
        });
        setNewPassword(""); // Field clear kar dein
      } else {
        Swal.fire("Error", result.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Network Connection Failed", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return <div style={{ padding: "20px" }}>Loading Accounts...</div>;

  return (
    <div className="settings-card">
      <div className="settings-section-title">
        <FaLock /> Security & Account
      </div>

      <div className="settings-form-grid">
        {/* 🔥 DROPDOWN FOR ACCOUNT SELECTION */}
        <div className="settings-input-group">
          <label className="settings-label">
            <FaUserShield style={{ marginRight: "5px" }} /> Select Account
          </label>
          <select
            className="settings-input"
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
          >
            {staffList.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.name} ({staff.role})
              </option>
            ))}
          </select>
        </div>

        {/* 🔥 NEW PASSWORD INPUT */}
        <div className="settings-input-group">
          <label className="settings-label">New Password</label>
          <input
            type="text" // 'text' rakha hai taake Admin dekh sakay wo kya set kar raha hai (Aap chahain toh 'password' kar dein)
            placeholder="Enter new password"
            className="settings-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
      </div>

      <button
        className="btn-save-settings"
        style={{
          marginTop: "15px",
          padding: "10px 20px",
          background: "#ef4444",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
        onClick={handleUpdatePassword}
        disabled={isSaving}
      >
        {isSaving ? "Updating..." : "Force Update Password"}
      </button>
    </div>
  );
};

export default SecuritySettings;
