import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaCheckDouble,
  FaSave,
  FaUserClock,
  FaUserSlash,
  FaUserCheck,
  FaSpinner,
} from "react-icons/fa";
import Swal from "sweetalert2";

const getRoleBadge = (roleName) => {
  const role = (roleName || "").toLowerCase();
  switch (role) {
    case "manager":
      return "bg-purple-500/15 text-purple-400 border border-purple-500/30";
    case "chef":
      return "bg-amber-500/15 text-amber-400 border border-amber-500/30";
    case "rider":
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
    case "cashier":
      return "bg-blue-500/15 text-blue-400 border border-blue-500/30";
    case "waiter":
      return "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30";
    case "dispatcher":
      return "bg-pink-500/15 text-pink-400 border border-pink-500/30";
    default:
      return "bg-neutral-500/15 text-neutral-400 border border-neutral-500/30";
  }
};

const AttendanceSheet = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [attendanceData, setAttendanceData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/get_staff.php`,
        );
        const result = await response.json();

        if (result.success) {
          const activeStaff = result.data.filter(
            (emp) => emp.status === "Active",
          );
          setEmployees(activeStaff);

          const initialData = {};
          activeStaff.forEach((emp) => {
            initialData[emp.id] = { status: "Present", time: "09:00" };
          });
          setAttendanceData(initialData);
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const handleStatusChange = (id, newStatus) =>
    setAttendanceData((prev) => ({
      ...prev,
      [id]: { ...prev[id], status: newStatus },
    }));

  const handleTimeChange = (id, newTime) =>
    setAttendanceData((prev) => ({
      ...prev,
      [id]: { ...prev[id], time: newTime },
    }));

  const markAllPresent = () => {
    const updated = {};
    employees.forEach((emp) => {
      updated[emp.id] = { ...attendanceData[emp.id], status: "Present" };
    });
    setAttendanceData(updated);
  };

  const handleSave = async () => {
    setIsSubmitting(true);

    const payload = {
      date: selectedDate,
      attendance: Object.keys(attendanceData).map((id) => ({
        staff_id: id,
        status: attendanceData[id].status,
        time:
          attendanceData[id].status === "Absent"
            ? null
            : attendanceData[id].time,
      })),
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/mark_attendance.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Attendance Saved!",
          text: `Attendance recorded for ${selectedDate}.`,
          timer: 1500,
          showConfirmButton: false,
          background: "#171717",
          color: "#fff",
        });
      } else {
        Swal.fire("Error", result.message || "Failed to save attendance.", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Server error.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = {
    present: Object.values(attendanceData).filter((x) => x.status === "Present").length,
    absent: Object.values(attendanceData).filter((x) => x.status === "Absent").length,
    late: Object.values(attendanceData).filter((x) => x.status === "Late").length,
  };

  if (isLoading)
    return (
      <div className="py-20 text-center text-[var(--admin-muted,#888)] text-xs font-bold uppercase tracking-wider">
        Loading Daily Attendance Sheet...
      </div>
    );

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Top Header & Actions */}
      <div className="admin-card-surface flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 p-4 rounded-2xl shadow-sm">
        {/* Date Selector */}
        <div className="flex items-center gap-2.5 text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
          <FaCalendarAlt className="text-amber-500 text-sm" />
          <span>Attendance Date:</span>
          <input
            type="date"
            className="bg-slate-50 dark:bg-[#111111] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:border-amber-500 cursor-pointer"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2 transition-all active:scale-95 shadow-sm"
            onClick={markAllPresent}
          >
            <FaCheckDouble className="text-amber-500 text-xs" />
            <span>Mark All Present</span>
          </button>
          <button
            type="button"
            className="btn-brand-cta px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border-none active:scale-95 disabled:opacity-50"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <FaSpinner className="animate-spin text-xs" />
            ) : (
              <FaSave className="text-xs" />
            )}
            <span>Save Sheet</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="admin-card-surface p-4 sm:p-5 rounded-2xl flex items-center justify-between border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
            <FaUserCheck className="text-sm" />
            <span>Present Today</span>
          </div>
          <span className="font-bold text-2xl tracking-tight font-mono">{stats.present}</span>
        </div>

        <div className="admin-card-surface p-4 sm:p-5 rounded-2xl flex items-center justify-between border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
            <FaUserSlash className="text-sm" />
            <span>Absent Staff</span>
          </div>
          <span className="font-bold text-2xl tracking-tight font-mono">{stats.absent}</span>
        </div>

        <div className="admin-card-surface p-4 sm:p-5 rounded-2xl flex items-center justify-between border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
            <FaUserClock className="text-sm" />
            <span>Late Check-in</span>
          </div>
          <span className="font-bold text-2xl tracking-tight font-mono">{stats.late}</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="admin-card-surface rounded-2xl overflow-hidden shadow-sm">
        <div className="table-responsive-container">
          <table className="min-w-[760px] lg:min-w-full w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02]">
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                  Employee
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                  Role
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                  Mark Status (P / A / L)
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                  Check-In Time
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider text-right">
                  Status Summary
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/[0.06]">
              {employees.length > 0 ? (
                employees.map((emp) => {
                  const currentStatus = attendanceData[emp.id]?.status || "Present";
                  const isAbsent = currentStatus === "Absent";

                  return (
                    <tr
                      key={emp.id}
                      className={`hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors ${
                        isAbsent ? "bg-rose-500/[0.03]" : ""
                      }`}
                    >
                      <td className="p-3.5 sm:p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                            {emp.name.charAt(0).toUpperCase()}
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
                      <td className="p-3.5 sm:p-4 align-middle">
                        <span
                          className={`!rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider inline-block ${getRoleBadge(
                            emp.role
                          )}`}
                        >
                          {emp.role}
                        </span>
                      </td>
                      <td className="p-3.5 sm:p-4 align-middle">
                        {/* Segmented Modern P / A / L Pills */}
                        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.06] gap-1">
                          <button
                            type="button"
                            className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all border-none ${
                              currentStatus === "Present"
                                ? "bg-emerald-500 text-white shadow-sm"
                                : "bg-transparent text-slate-400 dark:text-neutral-500 hover:bg-slate-200/60 dark:hover:bg-white/10"
                            }`}
                            onClick={() => handleStatusChange(emp.id, "Present")}
                            title="Mark Present"
                          >
                            P
                          </button>
                          <button
                            type="button"
                            className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all border-none ${
                              currentStatus === "Absent"
                                ? "bg-rose-500 text-white shadow-sm"
                                : "bg-transparent text-slate-400 dark:text-neutral-500 hover:bg-slate-200/60 dark:hover:bg-white/10"
                            }`}
                            onClick={() => handleStatusChange(emp.id, "Absent")}
                            title="Mark Absent"
                          >
                            A
                          </button>
                          <button
                            type="button"
                            className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all border-none ${
                              currentStatus === "Late"
                                ? "bg-amber-500 text-neutral-950 shadow-sm"
                                : "bg-transparent text-slate-400 dark:text-neutral-500 hover:bg-slate-200/60 dark:hover:bg-white/10"
                            }`}
                            onClick={() => handleStatusChange(emp.id, "Late")}
                            title="Mark Late"
                          >
                            L
                          </button>
                        </div>
                      </td>
                      <td className="p-3.5 sm:p-4 align-middle">
                        <input
                          type="time"
                          value={attendanceData[emp.id]?.time || "09:00"}
                          onChange={(e) => handleTimeChange(emp.id, e.target.value)}
                          className={`bg-slate-50 dark:bg-[#111111] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono outline-none focus:border-amber-500 transition-all ${
                            isAbsent ? "opacity-30 cursor-not-allowed" : ""
                          }`}
                          disabled={isAbsent}
                        />
                      </td>
                      <td className="p-3.5 sm:p-4 align-middle text-right">
                        <span
                          className={`px-3 py-1 !rounded-full text-xs font-bold uppercase tracking-wider inline-block ${
                            currentStatus === "Present"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : currentStatus === "Absent"
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                              : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {currentStatus === "Present" ? "On Time" : currentStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-12 text-xs text-[var(--admin-muted,#888)] font-semibold"
                  >
                    No active staff found to mark attendance.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSheet;
