import React from "react";
import { FaUserLock, FaMotorcycle } from "react-icons/fa";

export default function EmployeeWorkDetailsForm({
  formData,
  handleChange,
}) {
  return (
    <>
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
    </>
  );
}
