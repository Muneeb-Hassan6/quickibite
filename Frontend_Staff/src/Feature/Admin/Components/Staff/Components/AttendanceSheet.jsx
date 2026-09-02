import { API_BASE } from '../../../../../utils/apiHelper';
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import AttendanceHeaderControls from "./AttendanceHeaderControls";
import AttendanceGridMatrix from "./AttendanceGridMatrix";

const AttendanceSheet = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [attendanceData, setAttendanceData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/get_staff.php`
        );
        const result = await response.json();

        if (result.success) {
          const activeStaff = result.data.filter(
            (emp) => emp.status === "Active"
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
        `${API_BASE}/mark_attendance.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
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
        Swal.fire(
          "Error",
          result.message || "Failed to save attendance.",
          "error"
        );
      }
    } catch (error) {
      Swal.fire("Error", "Server error.", "error");
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="py-20 text-center text-[var(--admin-muted,#888)] text-xs font-bold uppercase tracking-wider">
        Loading Daily Attendance Sheet...
      </div>
    );

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Top Header & Actions */}
      <AttendanceHeaderControls
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        markAllPresent={markAllPresent}
        handleSave={handleSave}
        isSubmitting={isSubmitting}
      />

      {/* Summary KPI Pills & Attendance Table */}
      <AttendanceGridMatrix
        employees={employees}
        attendanceData={attendanceData}
        stats={stats}
        handleStatusChange={handleStatusChange}
        handleTimeChange={handleTimeChange}
      />
    </div>
  );
};

export default AttendanceSheet;
