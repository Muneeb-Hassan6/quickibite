import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaCheckDouble,
  FaSave,
  FaUserClock,
  FaUserSlash,
  FaUserCheck,
} from "react-icons/fa";
import Swal from "sweetalert2";

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
          title: "Saved!",
          text: `Attendance for ${selectedDate} saved.`,
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({ icon: "error", title: "Oops!", text: result.message });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Failed to connect to server.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleClass = (roleName) => {
    const role = (roleName || "").toLowerCase();
    const knownRoles = [
      "manager",
      "chef",
      "cashier",
      "dispatcher",
      "waiter",
      "rider",
    ];

    if (knownRoles.includes(role)) {
      switch (role) {
        case "manager":
          return "bg-[rgba(108,92,231,0.15)] text-[#a29bfe] border border-[rgba(108,92,231,0.3)]";
        case "chef":
          return "bg-[rgba(245,158,11,0.15)] text-[#fbbf24] border border-[rgba(245,158,11,0.3)]";
        case "rider":
          return "bg-[rgba(16,185,129,0.15)] text-[#34d399] border border-[rgba(16,185,129,0.3)]";
        case "waiter":
          return "bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)]";
        case "cashier":
          return "bg-[rgba(59,130,246,0.15)] text-[#60a5fa] border border-[rgba(59,130,246,0.3)]";
        case "dispatcher":
          return "bg-[rgba(236,72,153,0.15)] text-[#f472b6] border border-[rgba(236,72,153,0.3)]";
        default:
          return "bg-[rgba(156,163,175,0.15)] text-[#9ca3af] border border-[rgba(156,163,175,0.3)]";
      }
    }
    return "bg-[rgba(156,163,175,0.15)] text-[#9ca3af] border border-[rgba(156,163,175,0.3)]";
  };

  const stats = {
    present: Object.values(attendanceData).filter((x) => x.status === "Present")
      .length,
    absent: Object.values(attendanceData).filter((x) => x.status === "Absent")
      .length,
    late: Object.values(attendanceData).filter((x) => x.status === "Late")
      .length,
  };

  if (isLoading)
    return (
      <div className="text-center p-[3.125rem] text-white">Loading Attendance Sheet...</div>
    );

  return (
    <div className="bg-[var(--admin-bg,#141414)] rounded-[0.75rem] border border-[var(--admin-border,#222)] overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.2)] animate-slide-up custom-scrollbar">
      <div className="flex justify-between items-center p-[0.938rem_1.25rem] border-b border-[var(--admin-border,#333)] flex-wrap gap-[0.938rem]">
        <div className="flex items-center gap-[0.625rem] font-semibold text-[var(--admin-muted,#888)]">
          <FaCalendarAlt /> Select Date:
          <input
            type="date"
            className="bg-[#111111] text-white border border-[#333333] rounded-[0.5rem] outline-none focus:border-[#ef4444] w-auto p-[0.5rem_0.75rem] [&::-webkit-calendar-picker-indicator]:invert-[1] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-80 [color-scheme:dark]"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="flex gap-[0.625rem]">
          <button className="bg-transparent text-white border border-[#333] p-[0.75rem_1.563rem] rounded-[0.5rem] cursor-pointer font-bold transition-colors duration-200 hover:bg-[rgba(255,255,255,0.1)] flex items-center gap-[0.5rem]" onClick={markAllPresent}>
            <FaCheckDouble /> Mark All Present
          </button>
          <button
            className="bg-[var(--brand-red,#ef4444)] text-white border-none p-[0.75rem_1.563rem] rounded-[0.5rem] cursor-pointer font-bold shadow-[0_4px_15px_rgba(239,68,68,0.4)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(239,68,68,0.6)] flex items-center gap-[0.5rem] disabled:opacity-50 !w-auto !m-0"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            <FaSave /> {isSubmitting ? "Saving..." : "Save Sheet"}
          </button>
        </div>
      </div>

      <div className="flex gap-[1.25rem] p-[0.938rem_1.25rem] bg-[var(--admin-bg,#000)] border-b border-[var(--admin-border,#333)] overflow-x-auto">
        <div className="flex items-center gap-[0.5rem] text-[0.813rem] font-semibold p-[0.5rem_0.938rem] rounded-[0.5rem] bg-[var(--admin-panel,#141414)] border text-[#10b981] border-[rgba(16,185,129,0.3)]">
          <FaUserCheck /> Present: <strong className="text-[1rem] ml-[0.313rem]">{stats.present}</strong>
        </div>
        <div className="flex items-center gap-[0.5rem] text-[0.813rem] font-semibold p-[0.5rem_0.938rem] rounded-[0.5rem] bg-[var(--admin-panel,#141414)] border text-[#ef4444] border-[rgba(239,68,68,0.3)]">
          <FaUserSlash /> Absent: <strong className="text-[1rem] ml-[0.313rem]">{stats.absent}</strong>
        </div>
        <div className="flex items-center gap-[0.5rem] text-[0.813rem] font-semibold p-[0.5rem_0.938rem] rounded-[0.5rem] bg-[var(--admin-panel,#141414)] border text-[#f59e0b] border-[rgba(245,158,11,0.3)]">
          <FaUserClock /> Late: <strong className="text-[1rem] ml-[0.313rem]">{stats.late}</strong>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse min-w-[37.5rem] text-[0.875rem]">
          <thead>
            <tr>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold border-b border-[var(--admin-border,#333)] text-[0.813rem] uppercase tracking-[0.5px] pl-[1.25rem]">Employee Name</th>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold border-b border-[var(--admin-border,#333)] text-[0.813rem] uppercase tracking-[0.5px]">Role</th>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold border-b border-[var(--admin-border,#333)] text-[0.813rem] uppercase tracking-[0.5px]">Mark Status</th>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold border-b border-[var(--admin-border,#333)] text-[0.813rem] uppercase tracking-[0.5px]">Check-In Time</th>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold border-b border-[var(--admin-border,#333)] text-[0.813rem] uppercase tracking-[0.5px]">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((emp) => {
                const currentStatus = attendanceData[emp.id]?.status || "Present";
                const isAbsent = currentStatus === "Absent";
                return (
                  <tr key={emp.id} className={`border-b border-[var(--admin-border,#333)] transition-colors duration-200 hover:bg-[rgba(255,255,255,0.02)] ${isAbsent ? "!bg-[rgba(239,68,68,0.05)]" : ""}`}>
                    <td className="p-[1.25rem] align-middle pl-[1.25rem]">
                      <div className="flex items-center gap-[0.75rem]">
                        <div className="w-[2.5rem] h-[2.5rem] rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center font-bold text-[1rem] text-[var(--admin-orange,#f59e0b)] border border-[var(--admin-border,#333)]">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-[var(--admin-text,#fff)] block">{emp.name}</span>
                          <span className="text-[0.75rem] text-[var(--admin-muted,#888)]">ID: #{emp.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-[1.25rem] align-middle">
                      {/* Role badge fix */}
                      <span className={`px-[0.75rem] py-[0.313rem] rounded-[0.375rem] text-[0.688rem] font-extrabold uppercase tracking-[0.5px] inline-block ${getRoleClass(emp.role)}`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="p-[1.25rem] align-middle">
                      <div className="bg-[var(--admin-bg,#000)] p-[0.313rem] rounded-[0.5rem] inline-flex gap-[0.313rem] border border-[var(--admin-border,#333)]">
                        <button
                          className={`w-[2rem] h-[2rem] flex items-center justify-center rounded-[0.375rem] border border-transparent font-extrabold text-[0.813rem] cursor-pointer transition-all duration-200 bg-transparent text-[var(--admin-muted,#888)] hover:bg-[rgba(16,185,129,0.2)] hover:text-[#10b981] hover:border-[#10b981] ${currentStatus === "Present" ? "!bg-[rgba(16,185,129,0.2)] !text-[#10b981] !border-[#10b981]" : ""}`}
                          onClick={() => handleStatusChange(emp.id, "Present")}
                        >
                          P
                        </button>
                        <button
                          className={`w-[2rem] h-[2rem] flex items-center justify-center rounded-[0.375rem] border border-transparent font-extrabold text-[0.813rem] cursor-pointer transition-all duration-200 bg-transparent text-[var(--admin-muted,#888)] hover:bg-[rgba(239,68,68,0.2)] hover:text-[#ef4444] hover:border-[#ef4444] ${currentStatus === "Absent" ? "!bg-[rgba(239,68,68,0.2)] !text-[#ef4444] !border-[#ef4444]" : ""}`}
                          onClick={() => handleStatusChange(emp.id, "Absent")}
                        >
                          A
                        </button>
                        <button
                          className={`w-[2rem] h-[2rem] flex items-center justify-center rounded-[0.375rem] border border-transparent font-extrabold text-[0.813rem] cursor-pointer transition-all duration-200 bg-transparent text-[var(--admin-muted,#888)] hover:bg-[rgba(245,158,11,0.2)] hover:text-[#f59e0b] hover:border-[#f59e0b] ${currentStatus === "Late" ? "!bg-[rgba(245,158,11,0.2)] !text-[#f59e0b] !border-[#f59e0b]" : ""}`}
                          onClick={() => handleStatusChange(emp.id, "Late")}
                        >
                          L
                        </button>
                      </div>
                    </td>
                    <td className="p-[1.25rem] align-middle">
                      <input
                        type="time"
                        value={attendanceData[emp.id]?.time || "09:00"}
                        onChange={(e) => handleTimeChange(emp.id, e.target.value)}
                        className={`bg-[#111111] text-white border border-[#333333] rounded-[0.5rem] outline-none focus:border-[#ef4444] w-[8.125rem] p-[0.625rem] transition-all duration-300 [&::-webkit-calendar-picker-indicator]:invert-[1] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-80 [color-scheme:dark] ${isAbsent ? "!opacity-30 !cursor-not-allowed !bg-[#0a0a0a]" : ""}`}
                        disabled={isAbsent}
                      />
                    </td>
                    <td className="p-[1.25rem] align-middle">
                      <span
                        className={`text-[0.75rem] font-bold uppercase ${currentStatus === "Present" ? "text-[#10b981]" : currentStatus === "Absent" ? "text-[#ef4444]" : "text-[#f59e0b]"}`}
                      >
                        {currentStatus === "Present" ? "On Time" : currentStatus}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-[2.5rem] text-[gray]">
                  No active staff found to mark attendance.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceSheet;
