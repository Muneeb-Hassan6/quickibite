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
    return <div className="loading-state-text">Loading Attendance...</div>;

  return (
    <div className="premium-table-wrapper animate-slide-up no-padding-wrapper">
      <div className="module-controls-header">
        <h4 className="report-title">Monthly Report (Current Month)</h4>
        <button className="btn-cancel">
          <FaFileExcel className="excel-icon" /> Export CSV
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th className="pad-left-20">Employee</th>
            <th>Total Days</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Late</th>
            <th>Performance</th>
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
                <tr key={emp.id}>
                  <td className="emp-name-cell pad-left-20">{emp.name}</td>
                  <td className="days-cell">{workingDays} Days</td>
                  <td className="present-cell">{present}</td>
                  <td className="absent-cell">{absent}</td>
                  <td className="late-cell">{late}</td>
                  <td>
                    <div className="perf-bar-container">
                      <div className="perf-bar-bg">
                        <div
                          className="perf-bar-fill"
                          style={{
                            width: `${percentage}%`,
                            background: barColor,
                          }}
                        ></div>
                      </div>
                      <small className="perf-text">{percentage}%</small>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="empty-state-cell">
                No staff records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceHistory;
