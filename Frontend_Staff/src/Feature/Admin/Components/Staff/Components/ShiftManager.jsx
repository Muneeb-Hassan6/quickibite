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
    return <div className="text-center p-[3.125rem] text-white">Loading Shift Data...</div>;

  return (
    <div className="bg-[var(--admin-bg,#141414)] rounded-[0.75rem] border border-[var(--admin-border,#222)] overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.2)] animate-slide-up custom-scrollbar">
      <div
        className="flex justify-between items-center p-[0.938rem_1.25rem]  flex-wrap gap-[0.938rem]"
      >
        <div>
          <h4 className="m-0 text-[var(--admin-text,#fff)] text-[1.125rem] font-bold">Shift Roster</h4>
          <p className="text-[0.75rem] text-[var(--admin-muted,#888)] m-0 mt-[0.313rem]">Assign daily shifts to staff.</p>
        </div>

        <div className="flex gap-[0.938rem] items-center">
          <div className="flex gap-[0.938rem] text-[0.75rem] font-semibold text-[var(--admin-muted,#888)] m-0">
            <span className="text-[#f59e0b] mr-[0.938rem] flex items-center gap-[0.313rem]">
              <FaCoffee /> Morning
            </span>
            <span className="text-[#3b82f6] mr-[0.938rem] flex items-center gap-[0.313rem]">
              <FaSun /> Evening
            </span>
            <span className="text-[#8b5cf6] flex items-center gap-[0.313rem]">
              <FaMoon /> Night
            </span>
          </div>

          {/* 🔥 ADMIN BUTTON TO SET TIMINGS */}
          <button
            className="bg-[#333] text-white p-[0.5rem_0.938rem] rounded-[0.5rem] cursor-pointer font-bold flex items-center gap-[0.313rem] transition-colors duration-200 hover:bg-[#444]"
            onClick={handleSetTimings}
          >
            <FaCog /> Setup Timings
          </button>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse min-w-[37.5rem] text-[0.875rem]">
          <thead>
            <tr>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold  text-[0.813rem] uppercase tracking-[0.5px] pl-[1.25rem]">Staff Member</th>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold  text-[0.813rem] uppercase tracking-[0.5px]">Current Shift Status</th>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold  text-[0.813rem] uppercase tracking-[0.5px]">Shift Timings</th>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold  text-[0.813rem] uppercase tracking-[0.5px]">Change Shift</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((emp) => {
                const shiftInfo = getShiftDetails(emp.shift);
                return (
                  <tr key={emp.id} className=" transition-colors duration-200 hover:bg-[rgba(255,255,255,0.02)]">
                    <td className="p-[1.25rem] align-middle pl-[1.25rem]">
                      <div className="flex items-center gap-[0.75rem]">
                        <div className="w-[2.5rem] h-[2.5rem] rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center font-bold text-[1rem] text-[var(--admin-orange,#f59e0b)] border border-[var(--admin-border,#333)]">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-[var(--admin-text,#fff)] block">{emp.name}</span>
                      </div>
                    </td>
                    <td className="p-[1.25rem] align-middle">
                      <div
                        className="inline-flex items-center gap-[0.5rem] p-[0.375rem_0.75rem] rounded-[0.5rem] font-bold text-[0.813rem] uppercase"
                        style={{
                          color: shiftInfo.color,
                          background: shiftInfo.bg,
                        }}
                      >
                        {shiftInfo.icon} {emp.shift || "Morning"}
                      </div>
                    </td>
                    <td className="p-[1.25rem] align-middle text-[0.938rem] font-bold text-[var(--admin-text,#fff)]">{shiftInfo.time}</td>
                    <td className="p-[1.25rem] align-middle">
                      <div className="relative w-[8.75rem]">
                        <select
                          className="p-[0.5rem_0.75rem] rounded-[0.5rem] border border-[var(--admin-border,#333)] bg-[var(--admin-bg,#000)] text-[var(--admin-text,#fff)] text-[0.813rem] font-semibold cursor-pointer outline-none w-[8.125rem] focus:border-[var(--admin-orange,#f59e0b)]"
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
                <td colSpan="4" className="text-center p-[2.5rem] text-[gray]">
                  No active staff found.
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
