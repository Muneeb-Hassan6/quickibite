import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaLock, FaUserShield, FaKey, FaSave, FaSpinner } from "react-icons/fa";
import Swal from "sweetalert2";

const SecuritySettings = () => {
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 4) {
      Swal.fire({
        icon: "warning",
        title: "Weak Password",
        text: "Password must be at least 4 characters long.",
        background: "#171717",
        color: "#fff",
      });
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
          background: "#171717",
          color: "#fff",
        });
        setNewPassword("");
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
    return (
      <div className="py-12 text-center text-xs text-[var(--admin-muted,#888)] font-bold uppercase tracking-wider">
        Loading Staff Accounts...
      </div>
    );
  }

  return (
    <div className="admin-card-surface bg-white dark:bg-[#161616] rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white shadow-sm space-y-6 animate-slide-up">
      {/* Card Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <FaLock className="text-amber-500 text-sm" />
          <h3 className="m-0 text-sm sm:text-base font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
            Staff Access Security & Password Reset
          </h3>
        </div>

        <button
          type="button"
          onClick={handleUpdatePassword}
          disabled={isSaving}
          className="btn-brand-cta px-5 py-2.5 flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer border-none disabled:opacity-50 active:scale-95"
        >
          {isSaving ? <FaSpinner className="animate-spin text-xs" /> : <FaSave className="text-xs" />}
          <span>Update Password</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Select Account */}
        <div>
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
            <FaUserShield className="text-amber-500" />
            <span>Select Staff Member</span>
          </label>
          <select
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
          >
            {staffList.map((staff) => (
              <option key={staff.id} value={staff.id} className="bg-white dark:bg-[#171717] text-slate-900 dark:text-white">
                {staff.name} ({staff.role})
              </option>
            ))}
          </select>
        </div>

        {/* New Password */}
        <div>
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
            <FaKey className="text-amber-500" />
            <span>New Password</span>
          </label>
          <input
            type="password"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
            placeholder="Enter new password (min 4 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
