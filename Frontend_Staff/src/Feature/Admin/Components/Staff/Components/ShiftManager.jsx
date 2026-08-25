import React, { useState, useEffect } from "react";
import { FaSun, FaCloudSun, FaMoon, FaGear } from "react-icons/fa6";
import Swal from "sweetalert2";

const renderShiftBadge = (shiftName) => {
  switch (shiftName) {
    case "Evening":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20">
          <FaCloudSun className="w-3.5 h-3.5 text-orange-500" />
          <span>Evening</span>
        </span>
      );
    case "Night":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
          <FaMoon className="w-3.5 h-3.5 text-indigo-400" />
          <span>Night</span>
        </span>
      );
    case "Morning":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
          <FaSun className="w-3.5 h-3.5 text-amber-500" />
          <span>Morning</span>
        </span>
      );
  }
};

const ShiftManager = () => {
  const [employees, setEmployees] = useState([]);
  const [shiftTimings, setShiftTimings] = useState({
    Morning: "08:00 AM - 04:00 PM",
    Evening: "04:00 PM - 12:00 AM",
    Night: "12:00 AM - 08:00 AM",
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Staff and Timings
  const fetchShifts = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_shifts.php`,
      );
      const result = await response.json();
      if (result.success) {
        setEmployees(result.data || []);
        if (result.timings) setShiftTimings(result.timings);
      }
    } catch (error) {
      console.error("Error fetching shifts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  // Update Individual Staff Shift
  const handleShiftChange = async (id, newShift) => {
    const updatedEmployees = employees.map((emp) =>
      emp.id === id ? { ...emp, shift: newShift } : emp,
    );
    setEmployees(updatedEmployees);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/update_shift.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ staff_id: id, shift: newShift }),
        },
      );
      const result = await response.json();

      if (result.success) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: `Shift Updated to ${newShift}`,
          showConfirmButton: false,
          timer: 1500,
          background: "#171717",
          color: "#fff",
        });
      } else {
        Swal.fire("Error", result.message, "error");
        fetchShifts();
      }
    } catch (error) {
      Swal.fire("Error", "Network error.", "error");
      fetchShifts();
    }
  };

  // Set Global Shift Timings
  const handleSetTimings = () => {
    Swal.fire({
      title: "Configure Global Shift Hours",
      html: `
        <div style="text-align: left; margin-bottom: 12px;">
          <label style="font-size: 12px; color: #f59e0b; font-weight: bold;">Morning Shift</label>
          <input id="swal-morning" class="swal2-input" value="${shiftTimings.Morning}" style="width: 100%; margin-top: 4px; background: #222; color: #fff;">
        </div>
        <div style="text-align: left; margin-bottom: 12px;">
          <label style="font-size: 12px; color: #fb923c; font-weight: bold;">Evening Shift</label>
          <input id="swal-evening" class="swal2-input" value="${shiftTimings.Evening}" style="width: 100%; margin-top: 4px; background: #222; color: #fff;">
        </div>
        <div style="text-align: left; margin-bottom: 12px;">
          <label style="font-size: 12px; color: #818cf8; font-weight: bold;">Night Shift</label>
          <input id="swal-night" class="swal2-input" value="${shiftTimings.Night}" style="width: 100%; margin-top: 4px; background: #222; color: #fff;">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Save Shift Hours",
      confirmButtonColor: "#f59e0b",
      background: "#171717",
      color: "#fff",
      preConfirm: () => {
        return {
          Morning: document.getElementById("swal-morning").value,
          Evening: document.getElementById("swal-evening").value,
          Night: document.getElementById("swal-night").value,
        };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE}/update_shift_timings.php`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(result.value),
            },
          );
          const data = await response.json();
          if (data.success) {
            setShiftTimings(result.value);
            Swal.fire({
              icon: "success",
              title: "Saved!",
              text: "Shift schedule timings updated.",
              timer: 1500,
              showConfirmButton: false,
              background: "#171717",
              color: "#fff",
            });
          }
        } catch (error) {
          Swal.fire("Error", "Could not save shift timings", "error");
        }
      }
    });
  };

  if (isLoading)
    return (
      <div className="py-20 text-center text-[var(--admin-muted,#888)] text-xs font-bold uppercase tracking-wider">
        Loading Shift Roster...
      </div>
    );

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Shift Timing Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Morning Shift Card */}
        <div className="admin-card-surface p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <FaSun className="text-amber-500 w-4 h-4 inline mr-1.5" />
              <span>Morning Shift</span>
            </div>
            <span className="text-sm font-black text-slate-900 dark:text-white font-mono block">
              {shiftTimings.Morning}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
            <FaSun className="w-5 h-5" />
          </div>
        </div>

        {/* Evening Shift Card */}
        <div className="admin-card-surface p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center text-xs font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              <FaCloudSun className="text-orange-500 w-4 h-4 inline mr-1.5" />
              <span>Evening Shift</span>
            </div>
            <span className="text-sm font-black text-slate-900 dark:text-white font-mono block">
              {shiftTimings.Evening}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/20">
            <FaCloudSun className="w-5 h-5" />
          </div>
        </div>

        {/* Night Shift Card */}
        <div className="admin-card-surface p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <FaMoon className="text-indigo-400 w-4 h-4 inline mr-1.5" />
              <span>Night Shift</span>
            </div>
            <span className="text-sm font-black text-slate-900 dark:text-white font-mono block">
              {shiftTimings.Night}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <FaMoon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Header & Adjust Timing Button */}
      <div className="admin-card-surface flex justify-between items-center p-4 rounded-2xl shadow-sm">
        <div className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
          Staff Shift Allocations ({employees.length} Members)
        </div>
        <button
          type="button"
          onClick={handleSetTimings}
          className="btn-brand-cta px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border-none active:scale-95"
        >
          <FaGear className="w-3.5 h-3.5" />
          <span>Configure Shift Hours</span>
        </button>
      </div>

      {/* Shift Table */}
      <div className="admin-card-surface rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full border-collapse min-w-[680px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02]">
              <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                Staff Member
              </th>
              <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                Role
              </th>
              <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                Current Shift
              </th>
              <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider text-right">
                Assign New Shift
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/[0.06]">
            {employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="p-3.5 sm:p-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                        {(emp.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white block truncate">
                          {emp.name}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-semibold block">
                          ID: #{emp.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5 sm:p-4 align-middle font-semibold text-slate-700 dark:text-neutral-300">
                    {emp.role}
                  </td>

                  <td className="p-3.5 sm:p-4 align-middle">
                    {renderShiftBadge(emp.shift || "Morning")}
                  </td>

                  <td className="p-3.5 sm:p-4 align-middle text-right">
                    <select
                      value={emp.shift || "Morning"}
                      onChange={(e) => handleShiftChange(emp.id, e.target.value)}
                      className="admin-card-surface border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 text-xs font-semibold focus:border-amber-500 outline-none cursor-pointer"
                    >
                      <option className="bg-white dark:bg-[#171717]" value="Morning">Morning Shift</option>
                      <option className="bg-white dark:bg-[#171717]" value="Evening">Evening Shift</option>
                      <option className="bg-white dark:bg-[#171717]" value="Night">Night Shift</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-12 text-xs text-[var(--admin-muted,#888)] font-semibold"
                >
                  No staff members available for shift assignment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShiftManager;
