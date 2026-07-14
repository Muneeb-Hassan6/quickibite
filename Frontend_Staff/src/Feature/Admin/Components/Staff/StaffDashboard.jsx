import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("employees");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: staffData = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_staff.php`);
      const result = await response.json();
      return result.success ? result.data : [];
    }
  });

  const stats = useMemo(() => {
    return {
      total: staffData.length,
      active: staffData.filter((emp) => emp.status === "Active").length
    };
  }, [staffData]);

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
    queryClient.invalidateQueries({ queryKey: ['staff'] });
  };
  return (
    <div className="pb-[3.125rem]">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-[1.563rem]">
        <div>
          <h2 className="text-[var(--admin-text)] m-0 mb-[0.313rem] text-[1.5rem] font-bold tracking-[0.5px] uppercase">Staff & HR Management</h2>
          <p className="text-[var(--admin-muted,#888)] text-[0.875rem] m-0">Manage HR, Payroll & Attendance.</p>
        </div>

        {activeTab === "employees" && (
          <button
            className="bg-[var(--admin-orange)] text-white border-none p-[0.75rem_1.563rem] rounded cursor-pointer font-bold shadow-[var(--shadow-glow)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[var(--shadow-glow)] flex-none w-auto m-0 flex items-center gap-[0.5rem]"
            onClick={() => setIsModalOpen(true)}
          >
            <FaUserPlus /> Add New Staff
          </button>
        )}
      </div>

      {/* PREMIUM STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1.25rem] mb-[1.875rem]">
        <div className="bg-[var(--admin-panel)] rounded-[1rem] p-[1.563rem] flex items-center relative overflow-hidden transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.1)] group">
          <div className="w-[3.75rem] h-[3.75rem] rounded-[0.75rem] flex justify-center items-center text-[1.5rem] mr-[1.25rem] relative z-[2] text-[#3b82f6] bg-[rgba(59,130,246,0.1)]">
            <FaUsers />
          </div>
          <div>
            <h3 className="m-0 text-[1.5rem] font-black text-[var(--admin-text)] relative z-[2]">{stats.total}</h3>
            <p className="m-0 text-[0.813rem] font-bold text-[var(--admin-muted)] uppercase tracking-[1px] relative z-[2]">Total Staff</p>
          </div>
          <div className="absolute -right-[0.625rem] -bottom-[0.625rem] text-[5rem] text-[rgba(255,255,255,0.02)] z-[1] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-[10deg]">
            <FaUsers />
          </div>
        </div>

        <div className="bg-[var(--admin-panel)] rounded-[1rem] p-[1.563rem] flex items-center relative overflow-hidden transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.1)] group">
          <div className="w-[3.75rem] h-[3.75rem] rounded-[0.75rem] flex justify-center items-center text-[1.5rem] mr-[1.25rem] relative z-[2] text-[#10b981] bg-[rgba(16,185,129,0.1)]">
            <FaCalendarCheck />
          </div>
          <div>
            <h3 className="m-0 text-[1.5rem] font-black text-[var(--admin-text)] relative z-[2]">{stats.active}</h3>
            <p className="m-0 text-[0.813rem] font-bold text-[var(--admin-muted)] uppercase tracking-[1px] relative z-[2]">Active Now</p>
          </div>
          <div className="absolute -right-[0.625rem] -bottom-[0.625rem] text-[5rem] text-[rgba(255,255,255,0.02)] z-[1] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-[10deg]">
            <FaCalendarCheck />
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex gap-[0.938rem] mb-[1.563rem] border-b border-[var(--admin-border,#222)] pb-[0.125rem] overflow-x-auto custom-scrollbar">
        <button
          className={`bg-transparent border-none p-[0.75rem_1.25rem] text-[0.875rem] font-semibold text-[var(--admin-muted,#888)] cursor-pointer flex items-center gap-[0.5rem] border-b-[3px] border-transparent transition-all duration-300 whitespace-nowrap hover:text-[var(--admin-text,#fff)] hover:bg-[rgba(255,255,255,0.02)] hover:rounded-t-[0.5rem] ${activeTab === "employees" ? "!text-[var(--admin-orange,#f59e0b)] !border-b-[var(--admin-orange,#f59e0b)]" : ""}`}
          onClick={() => setActiveTab("employees")}
        >
          <FaUsers /> Employee List
        </button>
        <button
          className={`bg-transparent border-none p-[0.75rem_1.25rem] text-[0.875rem] font-semibold text-[var(--admin-muted,#888)] cursor-pointer flex items-center gap-[0.5rem] border-b-[3px] border-transparent transition-all duration-300 whitespace-nowrap hover:text-[var(--admin-text,#fff)] hover:bg-[rgba(255,255,255,0.02)] hover:rounded-t-[0.5rem] ${activeTab === "attendance" ? "!text-[var(--admin-orange,#f59e0b)] !border-b-[var(--admin-orange,#f59e0b)]" : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          <FaCalendarCheck /> Daily Attendance
        </button>
        <button
          className={`bg-transparent border-none p-[0.75rem_1.25rem] text-[0.875rem] font-semibold text-[var(--admin-muted,#888)] cursor-pointer flex items-center gap-[0.5rem] border-b-[3px] border-transparent transition-all duration-300 whitespace-nowrap hover:text-[var(--admin-text,#fff)] hover:bg-[rgba(255,255,255,0.02)] hover:rounded-t-[0.5rem] ${activeTab === "payroll" ? "!text-[var(--admin-orange,#f59e0b)] !border-b-[var(--admin-orange,#f59e0b)]" : ""}`}
          onClick={() => setActiveTab("payroll")}
        >
          <FaMoneyBillWave /> Payroll
        </button>
        <button
          className={`bg-transparent border-none p-[0.75rem_1.25rem] text-[0.875rem] font-semibold text-[var(--admin-muted,#888)] cursor-pointer flex items-center gap-[0.5rem] border-b-[3px] border-transparent transition-all duration-300 whitespace-nowrap hover:text-[var(--admin-text,#fff)] hover:bg-[rgba(255,255,255,0.02)] hover:rounded-t-[0.5rem] ${activeTab === "shifts" ? "!text-[var(--admin-orange,#f59e0b)] !border-b-[var(--admin-orange,#f59e0b)]" : ""}`}
          onClick={() => setActiveTab("shifts")}
        >
          <FaClock /> Shift Roster
        </button>
        <button
          className={`bg-transparent border-none p-[0.75rem_1.25rem] text-[0.875rem] font-semibold text-[var(--admin-muted,#888)] cursor-pointer flex items-center gap-[0.5rem] border-b-[3px] border-transparent transition-all duration-300 whitespace-nowrap hover:text-[var(--admin-text,#fff)] hover:bg-[rgba(255,255,255,0.02)] hover:rounded-t-[0.5rem] ${activeTab === "history" ? "!text-[var(--admin-orange,#f59e0b)] !border-b-[var(--admin-orange,#f59e0b)]" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <FaHistory /> History
        </button>
      </div>

      {/* DYNAMIC CONTENT (Child components ab khud data handle karte hain, inhein props nahi chahiye) */}
      <div>
        {activeTab === "employees" && (
          <EmployeeList />
        )}
        {activeTab === "attendance" && (
          <AttendanceSheet />
        )}
        {activeTab === "payroll" && <Payroll />}
        {activeTab === "shifts" && <ShiftManager />}
        {activeTab === "history" && (
          <AttendanceHistory />
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
