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

  // 🔥 CLEAN LOGIC: Returns pure CSS class name based on role
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
      return `role-${role}`;
    }
    // Agar koi naya role hy toh default VIP gray class milegi
    return "role-default";
  };

  if (isLoading)
    return <div className="loading-state-text">Loading Staff Data...</div>;

  return (
    <>
      <div className="premium-table-wrapper animate-slide-up">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Salary</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div className="item-profile">
                      <div className="staff-avatar">
                        {(emp.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="item-info">
                        <span className="item-name">{emp.name}</span>
                        <span className="item-id">ID: #{emp.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {/* 🔥 Pure CSS class based on dynamic role */}
                    <span className={`role-badge ${getRoleClass(emp.role)}`}>
                      {emp.role || "Unassigned"}
                    </span>
                  </td>
                  <td>
                    <div className="phone-cell">
                      <FaPhone className="phone-icon" /> {emp.phone}
                    </div>
                  </td>
                  <td className="salary-cell">
                    Rs. {Number(emp.salary || 0).toLocaleString()}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${emp.status === "Active" ? "delivered" : "pending"}`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-action-pill edit-btn"
                      onClick={() => handleEditClick(emp)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      className="btn-action-pill delete-btn"
                      onClick={() => handleDelete(emp.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state-cell">
                  No employees found in the database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && editingEmp && (
        <div className="admin-modal-overlay override-zindex">
          <div className="admin-modal-box animate-slide-up">
            <div className="modal-header-flex">
              <h3 className="modal-title">EDIT EMPLOYEE</h3>
              <button
                className="btn-close-modal-clean"
                onClick={() => setIsEditModalOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="admin-input-field custom-admin-input"
                  value={editingEmp.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="modal-form-row">
                <div className="admin-input-group input-col">
                  <label>Role</label>
                  <select
                    name="role"
                    className="admin-input-field custom-admin-input"
                    value={editingEmp.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="Manager">Manager</option>
                    <option value="Chef">Chef</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Waiter">Waiter</option>
                    <option value="Rider">Rider</option>
                    <option value="Dispatcher">Dispatcher</option>
                  </select>
                </div>
                <div className="admin-input-group input-col">
                  <label>Status</label>
                  <select
                    name="status"
                    className="admin-input-field custom-admin-input"
                    value={editingEmp.status}
                    onChange={handleChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-form-row">
                <div className="admin-input-group input-col">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    maxLength="11"
                    className={`admin-input-field custom-admin-input ${phoneError ? "border-red-500" : ""}`}
                    style={phoneError ? { borderColor: "#ef4444" } : {}}
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
                    <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px", display: "inline-block" }}>
                      {phoneError}
                    </span>
                  )}
                </div>
                <div className="admin-input-group input-col">
                  <label>Salary (Rs.)</label>
                  <input
                    type="number"
                    name="salary"
                    className="admin-input-field custom-admin-input"
                    value={editingEmp.salary}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="btn-cancel-modal-clean"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save-modal-clean">
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
