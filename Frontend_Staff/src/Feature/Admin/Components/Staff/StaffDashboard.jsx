import React, { useState, useEffect } from "react";
import "./styles/index.css";
import {
  FaUsers,
  FaCalendarCheck,
  FaUserPlus,
  FaMoneyBillWave,
  FaClock,
  FaHistory,
} from "react-icons/fa";
import Swal from "sweetalert2";

// Components Imports
import EmployeeList from "./Components/EmployeeList";
import AttendanceSheet from "./Components/AttendanceSheet";
import Payroll from "./Components/Payroll";
import ShiftManager from "./Components/ShiftManager";
import AttendanceHistory from "./Components/AttendanceHistory";
import AddEmployeeModal from "./Components/AddEmployeeModal";

const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState("employees");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🔥 API Data States
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [refreshKey, setRefreshKey] = useState(0); // For auto-refreshing child components

  // ==========================================
  // ⚙️ FETCH STATS FOR TOP CARDS
  // ==========================================
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/get_staff.php`,
        );
        const result = await response.json();

        if (result.success) {
          const totalStaff = result.data.length;
          const activeStaff = result.data.filter(
            (emp) => emp.status === "Active",
          ).length;
          setStats({ total: totalStaff, active: activeStaff });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [refreshKey, activeTab]); // Jab bhi tab change ho ya naya staff add ho, stats refresh hon

  // ==========================================
  // ⚙️ ADD NEW EMPLOYEE (API POST)
  // ==========================================
  // const handleAddEmployee = async (newEmp) => {
  //   try {
  //     const response = await fetch(
  //       `${import.meta.env.VITE_API_BASE}/add_staff.php`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(newEmp),
  //       },
  //     );
  //     const result = await response.json();

  //     if (result.success) {
  //       Swal.fire({
  //         toast: true,
  //         position: "top-end",
  //         icon: "success",
  //         title: "Staff Added Successfully",
  //         showConfirmButton: false,
  //         timer: 1500,
  //       });
  //       setIsModalOpen(false);
  //       setRefreshKey((prev) => prev + 1); // 🔥 Is trick se neechay wala table foran update hoga
  //     } else {
  //       Swal.fire("Error", result.message, "error");
  //     }
  //   } catch (error) {
  //     Swal.fire(
  //       "Error",
  //       "Network error. Could not connect to backend.",
  //       "error",
  //     );
  //   }
  // };
  const handleEmployeeAdded = () => {
    setIsModalOpen(false);
    setRefreshKey((prev) => prev + 1);
  };
  return (
    <div className="staff-dashboard-container">
      {/* HEADER */}
      <div className="staff-header-wrapper">
        <div className="staff-header-text">
          <h2 className="section-header">Staff & HR Management</h2>
          <p className="section-subtitle">Manage HR, Payroll & Attendance.</p>
        </div>

        {activeTab === "employees" && (
          <button
            className="btn-save btn-add-staff"
            onClick={() => setIsModalOpen(true)}
          >
            <FaUserPlus className="btn-add-icon" /> Add New Staff
          </button>
        )}
      </div>

      {/* PREMIUM STATS CARDS */}
      <div className="stats-grid">
        <div className="stat-card-premium">
          <div className="stat-icon-box stat-blue">
            <FaUsers />
          </div>
          <div>
            <h3>{stats.total}</h3>
            <p>Total Staff</p>
          </div>
          <div className="bg-icon-overlay">
            <FaUsers />
          </div>
        </div>

        <div className="stat-card-premium">
          <div className="stat-icon-box stat-green">
            <FaCalendarCheck />
          </div>
          <div>
            <h3>{stats.active}</h3>
            <p>Active Now</p>
          </div>
          <div className="bg-icon-overlay">
            <FaCalendarCheck />
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="staff-tabs-container">
        <button
          className={`staff-tab-btn ${activeTab === "employees" ? "active" : ""}`}
          onClick={() => setActiveTab("employees")}
        >
          <FaUsers /> Employee List
        </button>
        <button
          className={`staff-tab-btn ${activeTab === "attendance" ? "active" : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          <FaCalendarCheck /> Daily Attendance
        </button>
        <button
          className={`staff-tab-btn ${activeTab === "payroll" ? "active" : ""}`}
          onClick={() => setActiveTab("payroll")}
        >
          <FaMoneyBillWave /> Payroll
        </button>
        <button
          className={`staff-tab-btn ${activeTab === "shifts" ? "active" : ""}`}
          onClick={() => setActiveTab("shifts")}
        >
          <FaClock /> Shift Roster
        </button>
        <button
          className={`staff-tab-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <FaHistory /> History
        </button>
      </div>

      {/* DYNAMIC CONTENT (Child components ab khud data handle karte hain, inhein props nahi chahiye) */}
      <div className="staff-content-area">
        {activeTab === "employees" && (
          <EmployeeList key={`emp-${refreshKey}`} />
        )}
        {activeTab === "attendance" && (
          <AttendanceSheet key={`att-${refreshKey}`} />
        )}
        {activeTab === "payroll" && <Payroll key={`pay-${refreshKey}`} />}
        {activeTab === "shifts" && <ShiftManager key={`shift-${refreshKey}`} />}
        {activeTab === "history" && (
          <AttendanceHistory key={`hist-${refreshKey}`} />
        )}
      </div>

      {/* ADD MODAL */}
      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleEmployeeAdded}
      />
    </div>
  );
};

export default StaffDashboard;
