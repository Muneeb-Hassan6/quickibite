import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaUserLock } from "react-icons/fa";

const STANDARD_ROLES = ["Admin", "Manager", "Cashier", "Chef", "Rider", "Waiter"];

export default function EditEmployeeModal({
  isOpen,
  onClose,
  editingEmp,
  handleChange,
  handleSave,
  phoneError,
}) {
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState("");

  useEffect(() => {
    if (editingEmp) {
      const isCustom = !STANDARD_ROLES.includes(editingEmp.role);
      setIsCustomRole(isCustom);
      setCustomRoleInput(isCustom ? (editingEmp.role || "") : "");
    }
  }, [editingEmp?.id]);

  if (!isOpen || !editingEmp) return null;

  const handleRoleSelect = (e) => {
    const val = e.target.value;
    if (val === "__CUSTOM__") {
      setIsCustomRole(true);
      handleChange({ target: { name: "role", value: customRoleInput || "" } });
    } else {
      setIsCustomRole(false);
      handleChange(e);
    }
  };

  const handleCustomRoleChange = (e) => {
    const val = e.target.value;
    setCustomRoleInput(val);
    handleChange({ target: { name: "role", value: val } });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 w-screen h-screen transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="relative z-[10000] w-full max-w-lg bg-white dark:bg-[#121216] shadow-2xl shadow-black/80 rounded-2xl border border-slate-200 dark:border-neutral-800 p-5 sm:p-7 max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
            <h3 className="m-0 text-base font-black font-['Oswald',sans-serif] uppercase tracking-wide">
              Edit Staff Member
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

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={editingEmp.name || ""}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
              Role / Designation
            </label>
            <select
              name="role"
              value={isCustomRole ? "__CUSTOM__" : (editingEmp.role || "")}
              onChange={handleRoleSelect}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option className="bg-white dark:bg-[#171717]" value="Admin">Admin</option>
              <option className="bg-white dark:bg-[#171717]" value="Manager">Manager</option>
              <option className="bg-white dark:bg-[#171717]" value="Cashier">Cashier</option>
              <option className="bg-white dark:bg-[#171717]" value="Chef">Chef / Kitchen</option>
              <option className="bg-white dark:bg-[#171717]" value="Rider">Rider</option>
              <option className="bg-white dark:bg-[#171717]" value="Waiter">Waiter</option>
              <option className="bg-white dark:bg-[#171717] font-bold text-amber-600 dark:text-amber-400" value="__CUSTOM__">
                + Enter Custom Role...
              </option>
            </select>
            {isCustomRole && (
              <div className="mt-2.5 animate-slide-up">
                <label className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">
                  Custom Role Title *
                </label>
                <input
                  type="text"
                  placeholder="Specify Role Title (e.g. Security Guard, Cleaner, Barista)"
                  value={customRoleInput}
                  onChange={handleCustomRoleChange}
                  required
                  autoFocus
                  className="w-full px-3.5 py-2 bg-white dark:bg-[#171717] border border-amber-500 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30 placeholder-slate-400 dark:placeholder-neutral-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
              Mobile Number
            </label>
            <input
              type="text"
              name="phone"
              value={editingEmp.phone || ""}
              onChange={handleChange}
              required
              placeholder="03001234567"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
            />
            {phoneError && (
              <p className="text-rose-500 text-[11px] font-bold mt-1">{phoneError}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
              Monthly Base Salary (PKR)
            </label>
            <input
              type="number"
              name="salary"
              value={editingEmp.salary || ""}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
              Status
            </label>
            <select
              name="status"
              value={editingEmp.status || "Active"}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option className="bg-white dark:bg-[#171717]" value="Active">Active</option>
              <option className="bg-white dark:bg-[#171717]" value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Portal Login Credentials */}
          <div className="p-3.5 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/5 space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-neutral-400 flex items-center gap-1.5">
              <FaUserLock className="text-amber-500" />
              <span>Portal Login Credentials</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 block mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={editingEmp.username || ""}
                  onChange={handleChange}
                  placeholder="e.g. ali_staff"
                  className="w-full px-3 py-2 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={editingEmp.password || ""}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                  className="w-full px-3 py-2 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 placeholder:text-slate-400 dark:placeholder:text-neutral-600"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-white/10 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-brand-cta px-5 py-2.5 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border-none active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
