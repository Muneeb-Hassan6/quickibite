import React, { useState, useEffect } from "react";
import { FaFileExcel } from "react-icons/fa";

const AttendanceHistory = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/get_attendance.php`,
        );
        const result = await response.json();
        if (result.success) {
          setAttendanceData(result.data);
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  if (isLoading)
    return <div className="text-center p-[3.125rem] text-white">Loading Attendance...</div>;

  return (
    <div className="bg-[var(--admin-bg,#141414)] rounded-[0.75rem] border border-[var(--admin-border,#222)] overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.2)] animate-slide-up custom-scrollbar">
      <div className="flex justify-between items-center p-[0.938rem_1.25rem]  flex-wrap gap-[0.938rem]">
        <h4 className="m-0 text-[var(--admin-text,#fff)] text-[1.125rem] font-bold">Monthly Report (Current Month)</h4>
        <button className="bg-transparent text-white border border-[#333] p-[0.5rem_0.938rem] rounded-[0.5rem] cursor-pointer font-bold transition-colors duration-200 hover:bg-[rgba(255,255,255,0.1)] flex items-center gap-[0.313rem] text-[0.813rem]">
          <FaFileExcel className="text-[#10b981] mr-[0.313rem]" /> Export CSV
        </button>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse min-w-[37.5rem] text-[0.875rem]">
          <thead>
            <tr>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold  text-[0.813rem] uppercase tracking-[0.5px] pl-[1.25rem]">Employee</th>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold  text-[0.813rem] uppercase tracking-[0.5px]">Total Days</th>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold  text-[0.813rem] uppercase tracking-[0.5px]">Present</th>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold  text-[0.813rem] uppercase tracking-[0.5px]">Absent</th>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold  text-[0.813rem] uppercase tracking-[0.5px]">Late</th>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold  text-[0.813rem] uppercase tracking-[0.5px]">Performance</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.length > 0 ? (
              attendanceData.map((emp) => {
                // API se aanay wala data string form mein ho sakta hai, isliye parseInt zaroori hai
                const present = parseInt(emp.present) || 0;
                const absent = parseInt(emp.absent) || 0;
                const late = parseInt(emp.late) || 0;

                const workingDays = 26; // Maheene ke total working days fix kar diye
                // Percentage calculation
                let percentage = Math.round((present / workingDays) * 100);
                if (percentage > 100) percentage = 100; // 100 se oopar na jaye

                // Bar color logic
                const barColor =
                  percentage >= 85
                    ? "#10b981"
                    : percentage >= 50
                      ? "#f59e0b"
                      : "#ef4444";

                return (
                  <tr key={emp.id} className=" transition-colors duration-200 hover:bg-[rgba(255,255,255,0.02)]">
                    <td className="p-[1.25rem] align-middle font-bold text-[var(--admin-text,#fff)] pl-[1.25rem]">{emp.name}</td>
                    <td className="p-[1.25rem] align-middle text-[var(--admin-muted,#888)]">{workingDays} Days</td>
                    <td className="p-[1.25rem] align-middle text-[#10b981] font-bold">{present}</td>
                    <td className="p-[1.25rem] align-middle text-[#ef4444] font-bold">{absent}</td>
                    <td className="p-[1.25rem] align-middle text-[#f59e0b] font-bold">{late}</td>
                    <td className="p-[1.25rem] align-middle">
                      <div className="flex items-center gap-[0.625rem]">
                        <div className="w-[5rem] h-[0.375rem] bg-[var(--admin-bg,#000)] rounded-[0.625rem] overflow-hidden">
                          <div
                            className="h-full rounded-[0.625rem] transition-[width] duration-500 ease-in-out"
                            style={{
                              width: `${percentage}%`,
                              background: barColor,
                            }}
                          ></div>
                        </div>
                        <small className="font-bold text-[var(--admin-text,#fff)]">{percentage}%</small>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-[2.5rem] text-[gray]">
                  No staff records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceHistory;
