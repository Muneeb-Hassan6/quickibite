import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaLock,
  FaUserShield,
  FaKey,
  FaSave,
  FaSpinner,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { apiFetch } from "../../../../../utils/apiHelper";

const SecuritySettings = () => {
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: staffList = [], isLoading: isStaffLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const response = await apiFetch("get_staff.php");
      const result = await response.json();
      return result.success && Array.isArray(result.data) ? result.data : [];
    }
  });

  useEffect(() => {
    if (staffList.length > 0 && !selectedStaffId) {
      setSelectedStaffId(staffList[0].id);
    }
  }, [staffList, selectedStaffId]);

  const pwd = (newPassword || "").trim();
  const cpwd = (confirmPassword || "").trim();

  const hasLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
  const isMatch = pwd.length > 0 && cpwd.length > 0 && pwd === cpwd;

  const handleUpdatePassword = async () => {
    if (!pwd || pwd.length < 8) {
      Swal.fire({
        icon: "warning",
        title: "Password Too Short",
        text: "New password must be at least 8 characters long.",
        background: "#171717",
        color: "#fff",
      });
      return;
    }

    if (!hasUpper) {
      Swal.fire({
        icon: "warning",
        title: "Capital Letter Required",
        text: "New password must contain at least one capital letter (A-Z).",
        background: "#171717",
        color: "#fff",
      });
      return;
    }

    if (!hasSpecial) {
      Swal.fire({
        icon: "warning",
        title: "Special Character Required",
        text: "New password must contain at least one special character (!@#$%^&* etc.).",
        background: "#171717",
        color: "#fff",
      });
      return;
    }

    if (pwd !== cpwd) {
      Swal.fire({
        icon: "error",
        title: "Passwords Do Not Match",
        text: "Please make sure your new password and confirm password match.",
        background: "#171717",
        color: "#fff",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await apiFetch("update_password.php", {
        method: "POST",
        body: JSON.stringify({
          staff_id: selectedStaffId,
          new_password: pwd,
          confirm_password: cpwd,
        }),
      });

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
        setConfirmPassword("");
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
              placeholder="Enter new strong password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-200 border-none bg-transparent cursor-pointer p-1 transition-colors"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
            <FaKey className="text-amber-500" />
            <span>Confirm Password</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className={`w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-[#111111] border ${
                cpwd && !isMatch
                  ? "border-red-500 focus:border-red-500"
                  : cpwd && isMatch
                  ? "border-emerald-500 focus:border-emerald-500"
                  : "border-slate-300 dark:border-white/10 focus:border-amber-500"
              } text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none`}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-200 border-none bg-transparent cursor-pointer p-1 transition-colors"
              title={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
            </button>
          </div>
        </div>
      </div>

      {/* Live Checklist */}
      {pwd.length > 0 && (
        <div className="p-3 bg-slate-100/70 dark:bg-white/[0.03] rounded-xl border border-slate-200 dark:border-white/[0.06] space-y-1.5 animate-slide-up">
          <p className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider m-0">
            Password Complexity Checklist:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div
              className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                hasLength
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400 dark:text-neutral-500"
              }`}
            >
              {hasLength ? (
                <FaCheck className="text-[11px] text-emerald-500 shrink-0" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-neutral-600 shrink-0" />
              )}
              <span>Min. 8 Letters</span>
            </div>

            <div
              className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                hasUpper
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400 dark:text-neutral-500"
              }`}
            >
              {hasUpper ? (
                <FaCheck className="text-[11px] text-emerald-500 shrink-0" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-neutral-600 shrink-0" />
              )}
              <span>1+ Capital (A-Z)</span>
            </div>

            <div
              className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                hasSpecial
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400 dark:text-neutral-500"
              }`}
            >
              {hasSpecial ? (
                <FaCheck className="text-[11px] text-emerald-500 shrink-0" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-neutral-600 shrink-0" />
              )}
              <span>1+ Special (!@#$)</span>
            </div>

            <div
              className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                isMatch
                  ? "text-emerald-600 dark:text-emerald-400"
                  : cpwd && !isMatch
                  ? "text-red-500 dark:text-red-400"
                  : "text-slate-400 dark:text-neutral-500"
              }`}
            >
              {isMatch ? (
                <FaCheck className="text-[11px] text-emerald-500 shrink-0" />
              ) : cpwd && !isMatch ? (
                <FaTimes className="text-[11px] text-red-500 shrink-0" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-neutral-600 shrink-0" />
              )}
              <span>Both Match</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;
