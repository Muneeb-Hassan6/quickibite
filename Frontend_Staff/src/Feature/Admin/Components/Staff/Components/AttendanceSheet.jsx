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

  // 🔥 Re-using pure CSS classes logic for Roles (No inline style)
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
    return knownRoles.includes(role) ? `role-${role}` : "role-default";
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
      <div className="loading-state-text">Loading Attendance Sheet...</div>
    );

  return (
    <div className="premium-table-wrapper animate-slide-up no-padding-wrapper">
      <div className="module-controls-header">
        <div className="date-selector-group">
          <FaCalendarAlt /> Select Date:
          <input
            type="date"
            className="admin-input-field date-input-custom dark-datetime-picker"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="action-buttons-group">
          <button className="btn-cancel" onClick={markAllPresent}>
            <FaCheckDouble /> Mark All Present
          </button>
          <button
            className="btn-save auto-width-btn"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            <FaSave /> {isSubmitting ? "Saving..." : "Save Sheet"}
          </button>
        </div>
      </div>

      <div className="attendance-summary-strip">
        <div className="summary-item green">
          <FaUserCheck /> Present: <strong>{stats.present}</strong>
        </div>
        <div className="summary-item red">
          <FaUserSlash /> Absent: <strong>{stats.absent}</strong>
        </div>
        <div className="summary-item yellow">
          <FaUserClock /> Late: <strong>{stats.late}</strong>
        </div>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th className="pad-left-20">Employee Name</th>
            <th>Role</th>
            <th>Mark Status</th>
            <th>Check-In Time</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {employees.length > 0 ? (
            employees.map((emp) => {
              const currentStatus = attendanceData[emp.id]?.status || "Present";
              const isAbsent = currentStatus === "Absent";
              return (
                <tr key={emp.id} className={isAbsent ? "row-absent" : ""}>
                  <td className="pad-left-20">
                    <div className="item-profile">
                      <div className="staff-avatar">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="item-info">
                        <span className="item-name">{emp.name}</span>
                        <span className="item-id">ID: #{emp.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {/* Role badge fix */}
                    <span className={`role-badge ${getRoleClass(emp.role)}`}>
                      {emp.role}
                    </span>
                  </td>
                  <td>
                    <div className="attendance-btn-group">
                      <button
                        className={`att-btn present ${currentStatus === "Present" ? "active" : ""}`}
                        onClick={() => handleStatusChange(emp.id, "Present")}
                      >
                        P
                      </button>
                      <button
                        className={`att-btn absent ${currentStatus === "Absent" ? "active" : ""}`}
                        onClick={() => handleStatusChange(emp.id, "Absent")}
                      >
                        A
                      </button>
                      <button
                        className={`att-btn late ${currentStatus === "Late" ? "active" : ""}`}
                        onClick={() => handleStatusChange(emp.id, "Late")}
                      >
                        L
                      </button>
                    </div>
                  </td>
                  <td>
                    <input
                      type="time"
                      value={attendanceData[emp.id]?.time || "09:00"}
                      onChange={(e) => handleTimeChange(emp.id, e.target.value)}
                      className={`admin-input-field time-input-custom dark-datetime-picker ${isAbsent ? "dimmed-input" : ""}`}
                      disabled={isAbsent}
                    />
                  </td>
                  <td>
                    <span
                      className={`remark-badge remark-${currentStatus.toLowerCase()}`}
                    >
                      {currentStatus === "Present" ? "On Time" : currentStatus}
                    </span>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" className="empty-state-cell">
                No active staff found to mark attendance.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceSheet;
