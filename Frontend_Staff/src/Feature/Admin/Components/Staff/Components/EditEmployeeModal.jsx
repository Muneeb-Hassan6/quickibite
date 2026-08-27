import React from "react";

export default function EditEmployeeModal({
  isOpen,
  onClose,
  editingEmp,
  handleChange,
  handleSave,
  phoneError,
}) {
  if (!isOpen || !editingEmp) return null;

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="modal-surface w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-white/[0.06]">
          <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
          <h3 className="m-0 text-base font-black font-['Oswald',sans-serif] uppercase tracking-wide">
            Edit Staff Member
          </h3>
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
              value={editingEmp.role || ""}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option className="bg-white dark:bg-[#171717]" value="Chef">Chef</option>
              <option className="bg-white dark:bg-[#171717]" value="Rider">Rider</option>
              <option className="bg-white dark:bg-[#171717]" value="Cashier">Cashier</option>
              <option className="bg-white dark:bg-[#171717]" value="Waiter">Waiter</option>
              <option className="bg-white dark:bg-[#171717]" value="Dispatcher">Dispatcher</option>
              <option className="bg-white dark:bg-[#171717]" value="Manager">Manager</option>
            </select>
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
    </div>
  );
}
