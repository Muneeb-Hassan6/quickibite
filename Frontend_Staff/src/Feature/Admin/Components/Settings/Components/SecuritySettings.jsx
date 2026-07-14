import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaLock, FaUserShield } from "react-icons/fa";
import Swal from "sweetalert2";

const SecuritySettings = () => {
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch Staff List from Database using React Query
  const { data: staffList = [], isLoading: isStaffLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_staff.php`);
      const result = await response.json();
      return result.success ? result.data : [];
    }
  });

  useEffect(() => {
    if (staffList.length > 0 && !selectedStaffId) {
      setSelectedStaffId(staffList[0].id);
    }
  }, [staffList, selectedStaffId]);

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

  if (isStaffLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="bg-[var(--admin-panel)] border border-[var(--admin-border)] rounded-[1rem] p-[1.875rem] shadow-[0_4px_10px_rgba(0,0,0,0.1)] animate-slide-up">
      <div className="text-[1.125rem] font-bold text-[var(--admin-text)] mb-[1.563rem] flex items-center gap-[0.75rem] border-b border-[var(--admin-border)] pb-[0.938rem]">
        <FaLock className="text-[var(--admin-orange)] bg-[rgba(239,68,68,0.1)] p-[0.5rem] rounded-[0.5rem] text-[2rem]" /> Security & Account
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1.25rem]">
        {/* 🔥 DROPDOWN FOR ACCOUNT SELECTION */}
        <div className="mb-[0.938rem]">
          <label className="block text-[0.75rem] font-bold mb-[0.5rem] text-[var(--admin-muted)] uppercase tracking-[0.5px] flex items-center">
            <FaUserShield className="mr-[0.313rem]" /> Select Account
          </label>
          <select
            className="w-full p-[0.875rem_0.938rem] bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-[0.625rem] text-[var(--admin-text)] text-[0.875rem] font-medium outline-none transition-all duration-300 focus:border-[var(--admin-orange)] focus:shadow-[var(--shadow-glow)]"
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
          >
            {staffList.map((staff) => (
              <option key={staff.id} value={staff.id} className="bg-[var(--admin-panel)] text-[var(--admin-text)]">
                {staff.name} ({staff.role})
              </option>
            ))}
          </select>
        </div>

        {/* 🔥 NEW PASSWORD INPUT */}
        <div className="mb-[0.938rem]">
          <label className="block text-[0.75rem] font-bold mb-[0.5rem] text-[var(--admin-muted)] uppercase tracking-[0.5px]">New Password</label>
          <input
            type="text" // 'text' rakha hai taake Admin dekh sakay wo kya set kar raha hai (Aap chahain toh 'password' kar dein)
            placeholder="Enter new password"
            className="w-full p-[0.875rem_0.938rem] bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-[0.625rem] text-[var(--admin-text)] text-[0.875rem] font-medium outline-none transition-all duration-300 focus:border-[var(--admin-orange)] focus:shadow-[var(--shadow-glow)]"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
      </div>

      <button
        className="mt-[0.938rem] p-[0.625rem_1.25rem] bg-[#ef4444] text-white border-none rounded-[0.375rem] cursor-pointer font-bold transition-all duration-200 hover:bg-[#dc2626] disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleUpdatePassword}
        disabled={isSaving}
      >
        {isSaving ? "Updating..." : "Force Update Password"}
      </button>
    </div>
  );
};

export default SecuritySettings;
