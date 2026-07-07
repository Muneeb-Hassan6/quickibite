import React, { useState, useEffect } from "react";
import { FaClock, FaSun, FaMoon, FaCoffee, FaCog } from "react-icons/fa";
import Swal from "sweetalert2";

const ShiftManager = () => {
  const [employees, setEmployees] = useState([]);
  const [shiftTimings, setShiftTimings] = useState({
    Morning: "08:00 AM - 04:00 PM",
    Evening: "04:00 PM - 12:00 AM",
    Night: "12:00 AM - 08:00 AM",
  });
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 Fetch Staff and Timings
  const fetchShifts = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_shifts.php`,
      );
      const result = await response.json();
      if (result.success) {
        setEmployees(result.data);
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

  // 🔥 Update Individual Staff Shift
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
          title: "Shift Updated",
          showConfirmButton: false,
          timer: 1500,
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

  // 🔥 ADMIN FEATURE: Set Global Shift Timings
  const handleSetTimings = () => {
    Swal.fire({
      title: "Set Shift Timings",
      html: `
        <div style="text-align: left; margin-bottom: 10px;">
          <label style="font-size: 13px; color: #888; font-weight: bold;">☀️ Morning Shift</label>
          <input id="swal-morning" class="swal2-input" value="${shiftTimings.Morning}" style="width: 80%; margin-top: 5px;">
        </div>
        <div style="text-align: left; margin-bottom: 10px;">
          <label style="font-size: 13px; color: #888; font-weight: bold;">🌤️ Evening Shift</label>
          <input id="swal-evening" class="swal2-input" value="${shiftTimings.Evening}" style="width: 80%; margin-top: 5px;">
        </div>
        <div style="text-align: left; margin-bottom: 10px;">
          <label style="font-size: 13px; color: #888; font-weight: bold;">🌙 Night Shift</label>
          <input id="swal-night" class="swal2-input" value="${shiftTimings.Night}" style="width: 80%; margin-top: 5px;">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Save Timings",
      confirmButtonColor: "#10b981",
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
          const resData = await response.json();
          if (resData.success) {
            Swal.fire("Saved!", "Shift timings have been updated.", "success");
            fetchShifts(); // Refresh data
          } else {
            Swal.fire("Error", resData.message, "error");
          }
        } catch (error) {
          Swal.fire("Error", "Could not connect to server.", "error");
        }
      }
    });
  };

  // 🔥 Get details dynamically based on API timings
  const getShiftDetails = (shift) => {
    const currentShift = shift || "Morning";
    if (currentShift === "Morning")
      return {
        icon: <FaCoffee />,
        color: "#f59e0b",
        time: shiftTimings.Morning,
        bg: "rgba(245, 158, 11, 0.1)",
      };
    if (currentShift === "Evening")
      return {
        icon: <FaSun />,
        color: "#3b82f6",
        time: shiftTimings.Evening,
        bg: "rgba(59, 130, 246, 0.1)",
      };
    return {
      icon: <FaMoon />,
      color: "#8b5cf6",
      time: shiftTimings.Night,
      bg: "rgba(139, 92, 246, 0.1)",
    };
  };

  if (isLoading)
    return <div className="loading-state-text">Loading Shift Data...</div>;

  return (
    <div className="premium-table-wrapper animate-slide-up no-padding-wrapper">
      <div
        className="module-controls-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h4 className="module-title">Shift Roster</h4>
          <p className="module-subtitle">Assign daily shifts to staff.</p>
        </div>

        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <div className="shift-legend" style={{ margin: 0 }}>
            <span className="legend-morning">
              <FaCoffee /> Morning
            </span>
            <span className="legend-evening">
              <FaSun /> Evening
            </span>
            <span className="legend-night">
              <FaMoon /> Night
            </span>
          </div>

          {/* 🔥 ADMIN BUTTON TO SET TIMINGS */}
          <button
            className="btn-action-pill"
            style={{ background: "#333", color: "#fff", padding: "8px 15px" }}
            onClick={handleSetTimings}
          >
            <FaCog /> Setup Timings
          </button>
        </div>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th className="pad-left-20">Staff Member</th>
            <th>Current Shift Status</th>
            <th>Shift Timings</th>
            <th>Change Shift</th>
          </tr>
        </thead>
        <tbody>
          {employees.length > 0 ? (
            employees.map((emp) => {
              const shiftInfo = getShiftDetails(emp.shift);
              return (
                <tr key={emp.id}>
                  <td className="pad-left-20">
                    <div className="item-profile">
                      <div className="staff-avatar">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="item-name">{emp.name}</span>
                    </div>
                  </td>
                  <td>
                    <div
                      className="shift-badge"
                      style={{
                        color: shiftInfo.color,
                        background: shiftInfo.bg,
                      }}
                    >
                      {shiftInfo.icon} {emp.shift || "Morning"}
                    </div>
                  </td>
                  <td className="shift-time-cell">{shiftInfo.time}</td>
                  <td>
                    <div className="shift-select-wrapper">
                      <select
                        className="shift-select"
                        value={emp.shift || "Morning"}
                        onChange={(e) =>
                          handleShiftChange(emp.id, e.target.value)
                        }
                      >
                        <option value="Morning">Morning</option>
                        <option value="Evening">Evening</option>
                        <option value="Night">Night</option>
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="4" className="empty-state-cell">
                No active staff found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ShiftManager;
