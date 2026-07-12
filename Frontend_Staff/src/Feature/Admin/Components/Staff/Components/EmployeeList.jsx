import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPhone, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [phoneError, setPhoneError] = useState("");

  const fetchEmployees = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_staff.php`,
      );
      const result = await response.json();
      if (result.success) {
        setEmployees(result.data);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to remove this employee from the system?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#333",
      confirmButtonText: "Yes, Delete!",
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
            Swal.fire("Deleted!", "Employee has been removed.", "success");
            fetchEmployees();
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
        confirmButtonColor: "#ef4444",
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
        });
        setIsEditModalOpen(false);
        fetchEmployees();
      } else {
        Swal.fire({ icon: "error", title: "Oops!", text: result.message });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to connect to server.",
      });
    }
  };

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

    if (knownRoles.includes(role)) {
      switch (role) {
        case "manager":
          return "bg-[rgba(108,92,231,0.15)] text-[#a29bfe] border border-[rgba(108,92,231,0.3)]";
        case "chef":
          return "bg-[rgba(245,158,11,0.15)] text-[#fbbf24] border border-[rgba(245,158,11,0.3)]";
        case "rider":
          return "bg-[rgba(16,185,129,0.15)] text-[#34d399] border border-[rgba(16,185,129,0.3)]";
        case "waiter":
          return "bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)]";
        case "cashier":
          return "bg-[rgba(59,130,246,0.15)] text-[#60a5fa] border border-[rgba(59,130,246,0.3)]";
        case "dispatcher":
          return "bg-[rgba(236,72,153,0.15)] text-[#f472b6] border border-[rgba(236,72,153,0.3)]";
        default:
          return "bg-[rgba(156,163,175,0.15)] text-[#9ca3af] border border-[rgba(156,163,175,0.3)]";
      }
    }
    // Agar koi naya role hy toh default VIP gray class milegi
    return "bg-[rgba(156,163,175,0.15)] text-[#9ca3af] border border-[rgba(156,163,175,0.3)]";
  };

  if (isLoading)
    return <div className="text-center p-[3.125rem] text-white">Loading Staff Data...</div>;

  return (
    <>
      <div className="bg-[var(--admin-bg,#141414)] rounded-[0.75rem] border border-[var(--admin-border,#222)] overflow-x-auto shadow-[0_4px_15px_rgba(0,0,0,0.2)] animate-slide-up custom-scrollbar">
        <table className="w-full border-collapse min-w-[37.5rem] text-[0.875rem]">
          <thead>
            <tr>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold border-b border-[var(--admin-border,#333)] text-[0.813rem] uppercase tracking-[0.5px]">Name</th>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold border-b border-[var(--admin-border,#333)] text-[0.813rem] uppercase tracking-[0.5px]">Role</th>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold border-b border-[var(--admin-border,#333)] text-[0.813rem] uppercase tracking-[0.5px]">Phone</th>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold border-b border-[var(--admin-border,#333)] text-[0.813rem] uppercase tracking-[0.5px]">Salary</th>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold border-b border-[var(--admin-border,#333)] text-[0.813rem] uppercase tracking-[0.5px]">Status</th>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold border-b border-[var(--admin-border,#333)] text-[0.813rem] uppercase tracking-[0.5px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp.id} className="border-b border-[var(--admin-border,#333)] transition-colors duration-200 hover:bg-[rgba(255,255,255,0.02)]">
                  <td className="p-[1.25rem] align-middle">
                    <div className="flex items-center gap-[0.75rem]">
                      <div className="w-[2.5rem] h-[2.5rem] rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center font-bold text-[1rem] text-[var(--admin-orange,#f59e0b)] border border-[var(--admin-border,#333)]">
                        {(emp.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[var(--admin-text,#fff)] block">{emp.name}</span>
                        <span className="text-[0.75rem] text-[var(--admin-muted,#888)]">ID: #{emp.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-[1.25rem] align-middle">
                    {/* 🔥 Pure CSS class based on dynamic role */}
                    <span className={`px-[0.75rem] py-[0.313rem] rounded-[0.375rem] text-[0.688rem] font-extrabold uppercase tracking-[0.5px] inline-block ${getRoleClass(emp.role)}`}>
                      {emp.role || "Unassigned"}
                    </span>
                  </td>
                  <td className="p-[1.25rem] align-middle">
                    <div className="flex items-center gap-[0.5rem] text-[var(--admin-muted,#888)] text-[0.813rem]">
                      <FaPhone className="text-[0.625rem]" /> {emp.phone}
                    </div>
                  </td>
                  <td className="p-[1.25rem] align-middle font-bold text-[var(--admin-text,#fff)]">
                    Rs. {Number(emp.salary || 0).toLocaleString()}
                  </td>
                  <td className="p-[1.25rem] align-middle">
                    <span
                      className={`px-[0.625rem] py-[0.25rem] rounded-[0.25rem] text-[0.75rem] font-bold uppercase tracking-[0.5px] ${emp.status === "Active" ? "bg-[rgba(16,185,129,0.15)] text-[#34d399] border border-[rgba(16,185,129,0.3)]" : "bg-[rgba(245,158,11,0.15)] text-[#f59e0b] border border-[rgba(245,158,11,0.3)]"}`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="p-[1.25rem] align-middle">
                    <button
                      className="bg-[rgba(255,255,255,0.05)] border border-[#333] text-white p-[0.375rem_0.75rem] rounded-[0.375rem] cursor-pointer text-[0.75rem] font-bold flex items-center justify-center gap-[0.313rem] transition-all duration-200 mr-[0.313rem] inline-flex hover:bg-[rgba(59,130,246,0.1)] hover:border-[#3b82f6] hover:text-[#3b82f6] hover:-translate-y-[2px]"
                      onClick={() => handleEditClick(emp)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      className="bg-[rgba(255,255,255,0.05)] border border-[#333] text-white p-[0.375rem_0.75rem] rounded-[0.375rem] cursor-pointer text-[0.75rem] font-bold flex items-center justify-center gap-[0.313rem] transition-all duration-200 inline-flex hover:bg-[rgba(239,68,68,0.1)] hover:border-[#ef4444] hover:text-[#ef4444] hover:-translate-y-[2px]"
                      onClick={() => handleDelete(emp.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-[2.5rem] text-[gray]">
                  No employees found in the database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && editingEmp && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-[6px] flex justify-center items-center z-[99999]">
          <div className="w-[90%] max-w-[37.5rem] bg-[var(--admin-bg,#141414)] border border-[var(--admin-border,#222)] rounded-[1rem] p-[1.563rem] shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative animate-slide-up">
            <div className="flex justify-between items-center mb-[1.25rem] w-full">
              <h3 className="uppercase flex items-center gap-[0.625rem] text-white m-0 text-[1.25rem] font-black">EDIT EMPLOYEE</h3>
              <button
                className="bg-transparent border-none text-[#949191] text-[1.25rem] cursor-pointer transition-colors duration-300 hover:text-white static !m-0"
                onClick={() => setIsEditModalOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="mb-[0.938rem]">
                <label className="block text-[#888] text-[0.75rem] font-extrabold mb-[0.5rem] uppercase">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="w-full bg-[#111] border border-[#333] text-white p-[0.875rem_0.938rem] rounded-[0.5rem] text-[0.938rem] font-medium outline-none transition-all duration-300 focus:border-[#ef4444] focus:bg-black"
                  value={editingEmp.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex gap-[0.938rem] mt-[0.938rem] w-full flex-col md:flex-row">
                <div className="mb-[0.938rem] flex-1 min-w-0">
                  <label className="block text-[#888] text-[0.75rem] font-extrabold mb-[0.5rem] uppercase">Role</label>
                  <select
                    name="role"
                    className="w-full bg-[#111] border border-[#333] text-white p-[0.875rem_0.938rem] rounded-[0.5rem] text-[0.938rem] font-medium outline-none transition-all duration-300 focus:border-[#ef4444] focus:bg-black"
                    value={editingEmp.role}
                    onChange={handleChange}
                    required
                  >
                    <option className="bg-[#111] text-white" value="Manager">Manager</option>
                    <option className="bg-[#111] text-white" value="Chef">Chef</option>
                    <option className="bg-[#111] text-white" value="Cashier">Cashier</option>
                    <option className="bg-[#111] text-white" value="Waiter">Waiter</option>
                    <option className="bg-[#111] text-white" value="Rider">Rider</option>
                    <option className="bg-[#111] text-white" value="Dispatcher">Dispatcher</option>
                  </select>
                </div>
                <div className="mb-[0.938rem] flex-1 min-w-0">
                  <label className="block text-[#888] text-[0.75rem] font-extrabold mb-[0.5rem] uppercase">Status</label>
                  <select
                    name="status"
                    className="w-full bg-[#111] border border-[#333] text-white p-[0.875rem_0.938rem] rounded-[0.5rem] text-[0.938rem] font-medium outline-none transition-all duration-300 focus:border-[#ef4444] focus:bg-black"
                    value={editingEmp.status}
                    onChange={handleChange}
                  >
                    <option className="bg-[#111] text-white" value="Active">Active</option>
                    <option className="bg-[#111] text-white" value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-[0.938rem] mt-[0.938rem] w-full flex-col md:flex-row">
                <div className="mb-[0.938rem] flex-1 min-w-0">
                  <label className="block text-[#888] text-[0.75rem] font-extrabold mb-[0.5rem] uppercase">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    maxLength="11"
                    className={`w-full bg-[#111] border border-[#333] text-white p-[0.875rem_0.938rem] rounded-[0.5rem] text-[0.938rem] font-medium outline-none transition-all duration-300 focus:border-[#ef4444] focus:bg-black ${phoneError ? "!border-red-500" : ""}`}
                    value={editingEmp.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setEditingEmp({ ...editingEmp, phone: val });
                      
                      if (val.length > 0 && val.length < 11) {
                        setPhoneError("Please enter all 11 digits.");
                      } else if (val.length === 11 && !/^03\d{9}$/.test(val)) {
                        setPhoneError("Number must start with 03 (e.g. 03001234567).");
                      } else {
                        setPhoneError("");
                      }
                    }}
                    required
                  />
                  {phoneError && (
                    <span className="text-[#ef4444] text-[0.75rem] mt-[0.313rem] inline-block">
                      {phoneError}
                    </span>
                  )}
                </div>
                <div className="mb-[0.938rem] flex-1 min-w-0">
                  <label className="block text-[#888] text-[0.75rem] font-extrabold mb-[0.5rem] uppercase">Salary (Rs.)</label>
                  <input
                    type="number"
                    name="salary"
                    className="w-full bg-[#111] border border-[#333] text-white p-[0.875rem_0.938rem] rounded-[0.5rem] text-[0.938rem] font-medium outline-none transition-all duration-300 focus:border-[#ef4444] focus:bg-black"
                    value={editingEmp.salary}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mt-[1.875rem] border-t border-[#333] pt-[1.25rem] flex justify-end gap-[0.938rem] w-full">
                <button
                  type="button"
                  className="bg-transparent text-white border border-[#333] p-[0.75rem_1.563rem] rounded-[0.5rem] cursor-pointer font-bold transition-colors duration-200 hover:bg-[rgba(255,255,255,0.1)]"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="bg-[var(--brand-red,#ef4444)] text-white border-none p-[0.75rem_1.563rem] rounded-[0.5rem] cursor-pointer font-bold shadow-[0_4px_15px_rgba(239,68,68,0.4)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(239,68,68,0.6)] flex items-center justify-center">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeList;
