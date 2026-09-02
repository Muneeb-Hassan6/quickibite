import { API_BASE } from '../../../../../utils/apiHelper';
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import EmployeeFilterBar from "./EmployeeFilterBar";
import EmployeeTableRow from "./EmployeeTableRow";
import EditEmployeeModal from "./EditEmployeeModal";

const EmployeeList = () => {
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [phoneError, setPhoneError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE}/get_staff.php`
      );
      const result = await response.json();
      return result.success ? result.data : [];
    },
  });

  const handleDelete = async (id, name) => {
    Swal.fire({
      title: `Delete ${name}?`,
      text: "This employee record and history will be removed from the system.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Yes, Delete",
      background: "#171717",
      color: "#fff",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${API_BASE}/delete_staff.php`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id }),
            }
          );
          const resData = await response.json();
          if (resData.success) {
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: "Employee has been removed.",
              timer: 1500,
              showConfirmButton: false,
              background: "#171717",
              color: "#fff",
            });
            queryClient.invalidateQueries({ queryKey: ["staff"] });
          } else {
            Swal.fire("Error!", resData.message, "error");
          }
        } catch (error) {
          Swal.fire("Error!", "Failed to connect to server.", "error");
        }
      }
    });
  };

  const handleEditClick = (emp) => {
    setEditingEmp(emp);
    setPhoneError("");
    setIsEditModalOpen(true);
  };

  const handleChange = (e) => {
    setEditingEmp({ ...editingEmp, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!/^03\d{9}$/.test(editingEmp.phone)) {
      setPhoneError("Please enter a valid 11-digit mobile number.");
      Swal.fire({
        icon: "error",
        title: "Invalid Mobile Number",
        text: "Please enter exactly 11 digits starting with 03 (e.g. 03001234567).",
        background: "#171717",
        color: "#fff",
      });
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/update_staff.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingEmp),
        }
      );
      const result = await response.json();

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Employee details updated.",
          timer: 1500,
          showConfirmButton: false,
          background: "#171717",
          color: "#fff",
        });
        setIsEditModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ["staff"] });
      } else {
        Swal.fire("Error", result.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Server error.", "error");
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      (emp.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.role || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.phone || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="py-20 text-center text-[var(--admin-muted,#888)] text-xs font-bold uppercase tracking-wider">
        Loading Staff Directory...
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Search and Filters Bar */}
      <EmployeeFilterBar
        totalCount={filteredEmployees.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Staff Table */}
      <div className="admin-card-surface rounded-2xl overflow-hidden shadow-sm">
        <div className="table-responsive-container">
          <table className="min-w-[760px] lg:min-w-full w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02]">
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                  Staff Member
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                  Designation
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                  Phone Contact
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                  Monthly Salary
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                  Status
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/[0.06]">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <EmployeeTableRow
                    key={emp.id}
                    emp={emp}
                    handleEditClick={handleEditClick}
                    handleDelete={handleDelete}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="p-8 text-center text-xs text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider"
                  >
                    No staff members found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editingEmp={editingEmp}
        handleChange={handleChange}
        handleSave={handleSave}
        phoneError={phoneError}
      />
    </div>
  );
};

export default EmployeeList;
