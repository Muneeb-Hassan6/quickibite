import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FaEdit, FaTrash, FaPhone, FaSearch, FaUserShield } from "react-icons/fa";
import Swal from "sweetalert2";

const getRoleBadge = (roleName) => {
  const role = (roleName || "").toLowerCase();
  switch (role) {
    case "manager":
      return "bg-purple-500/15 text-purple-400 border border-purple-500/30";
    case "chef":
      return "bg-amber-500/15 text-amber-400 border border-amber-500/30";
    case "rider":
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
    case "cashier":
      return "bg-blue-500/15 text-blue-400 border border-blue-500/30";
    case "waiter":
      return "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30";
    case "dispatcher":
      return "bg-pink-500/15 text-pink-400 border border-pink-500/30";
    default:
      return "bg-neutral-500/15 text-neutral-400 border border-neutral-500/30";
  }
};

const EmployeeList = () => {
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [phoneError, setPhoneError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_staff.php`);
      const result = await response.json();
      return result.success ? result.data : [];
    }
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
            `${import.meta.env.VITE_API_BASE}/delete_staff.php`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id }),
            },
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
            queryClient.invalidateQueries({ queryKey: ['staff'] });
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
        `${import.meta.env.VITE_API_BASE}/update_staff.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingEmp),
        },
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
        queryClient.invalidateQueries({ queryKey: ['staff'] });
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

  if (isLoading)
    return (
      <div className="py-20 text-center text-[var(--admin-muted,#888)] text-xs font-bold uppercase tracking-wider">
        Loading Staff Directory...
      </div>
    );

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Search and Filters Bar */}
      <div className="admin-card-surface flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 p-3 sm:p-4 rounded-2xl shadow-sm">
        <div className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
          Staff Roster ({filteredEmployees.length} Members)
        </div>
        <div className="flex items-center bg-slate-50 dark:bg-[#111111] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 focus-within:border-amber-500 transition-colors w-full sm:w-80">
          <FaSearch className="text-slate-400 dark:text-neutral-500 text-xs mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, role, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-slate-900 dark:text-white text-xs outline-none w-full placeholder-slate-400 dark:placeholder-neutral-500 font-medium"
          />
        </div>
      </div>

      {/* Staff Table */}
      <div className="admin-card-surface rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full border-collapse min-w-[680px] text-left text-xs">
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
                <tr
                  key={emp.id}
                  className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-3.5 sm:p-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                        {(emp.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white block truncate">
                          {emp.name}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-semibold block">
                          ID: #{emp.id}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 sm:p-4 align-middle">
                    <span
                      className={`!rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider inline-block ${getRoleBadge(
                        emp.role
                      )}`}
                    >
                      {emp.role || "Unassigned"}
                    </span>
                  </td>
                  <td className="p-3.5 sm:p-4 align-middle font-medium text-slate-600 dark:text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <FaPhone className="text-[10px] text-slate-400 dark:text-neutral-500" />
                      <span>{emp.phone || "--"}</span>
                    </div>
                  </td>
                  <td className="p-3.5 sm:p-4 align-middle font-black text-amber-600 dark:text-amber-400 font-mono">
                    Rs. {Number(emp.salary || 0).toLocaleString()}
                  </td>
                  <td className="p-3.5 sm:p-4 align-middle">
                    <span
                      className={`px-3 py-0.5 !rounded-full text-xs font-bold uppercase tracking-wider inline-block ${
                        emp.status === "Active"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : "bg-neutral-500/15 text-neutral-500 dark:text-neutral-400 border border-neutral-500/30"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="p-3.5 sm:p-4 align-middle text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditClick(emp)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-neutral-950 dark:bg-white/5 dark:hover:bg-amber-500 dark:hover:text-neutral-950 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
                        title="Edit Details"
                      >
                        <FaEdit className="text-[11px]" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(emp.id, emp.name)}
                        className="w-8 h-8 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-500/20 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
                        title="Delete Record"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </td>
                </tr>
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

      {/* Edit Employee Modal */}
      {isEditModalOpen && editingEmp && (
        <div
          className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="modal-surface w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up text-slate-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-white/[0.06]">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
              <h3 className="m-0 text-base font-black font-['Oswald',sans-serif] uppercase tracking-wide">
                Edit Staff Member
              </h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editingEmp.name || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
                  Role / Designation
                </label>
                <select
                  name="role"
                  value={editingEmp.role || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option className="bg-white dark:bg-[#171717]" value="Chef">Chef</option>
                  <option className="bg-white dark:bg-[#171717]" value="Rider">Rider</option>
                  <option className="bg-white dark:bg-[#171717]" value="Cashier">Cashier</option>
                  <option className="bg-white dark:bg-[#171717]" value="Waiter">Waiter</option>
                  <option className="bg-white dark:bg-[#171717]" value="Dispatcher">Dispatcher</option>
                  <option className="bg-white dark:bg-[#171717]" value="Manager">Manager</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={editingEmp.phone || ""}
                  onChange={handleChange}
                  required
                  placeholder="03001234567"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
                />
                {phoneError && (
                  <p className="text-rose-500 text-[11px] font-bold mt-1">{phoneError}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
                  Monthly Base Salary (PKR)
                </label>
                <input
                  type="number"
                  name="salary"
                  value={editingEmp.salary || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
                  Status
                </label>
                <select
                  name="status"
                  value={editingEmp.status || "Active"}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option className="bg-white dark:bg-[#171717]" value="Active">Active</option>
                  <option className="bg-white dark:bg-[#171717]" value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-white/10 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-brand-cta px-5 py-2.5 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border-none active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
