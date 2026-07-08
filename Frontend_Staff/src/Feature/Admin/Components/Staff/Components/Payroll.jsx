import React, { useState, useEffect } from "react";
import {
  FaMoneyBillWave,
  FaPrint,
  FaCheckCircle,
  FaExclamationCircle,
  FaCalendarAlt,
  FaCog,
  FaInfoCircle,
} from "react-icons/fa";
import Swal from "sweetalert2";

const Payroll = () => {
  const [employees, setEmployees] = useState([]);
  const [offDays, setOffDays] = useState(4);
  const [totalDays, setTotalDays] = useState(30);
  const [workingDays, setWorkingDays] = useState(26);
  const [currentMonthStr, setCurrentMonthStr] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch payroll data ──────────────────────────────────────────────────────
  const fetchPayrollData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_payroll_data.php`
      );
      const result = await response.json();

      if (result.success) {
        setOffDays(result.off_days ?? 4);
        setTotalDays(result.total_days ?? 30);
        setWorkingDays(result.working_days ?? 26);
        setCurrentMonthStr(result.current_month);
        setEmployees(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch payroll data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, []);

  // ── Admin: set monthly off days ─────────────────────────────────────────────
  const handleSetOffDays = () => {
    Swal.fire({
      title: "Configure Monthly Off Days",
      html: `
        <p style="color:#aaa;font-size:13px;margin-bottom:12px">
          Enter how many weekly-off / holiday days are in <strong>${currentMonthStr}</strong>.<br/>
          The system will automatically calculate:<br/>
          <em>Working Days = Total Days − Off Days</em><br/>
          <em>Daily Rate = Basic Salary ÷ Working Days</em>
        </p>
        <p style="color:#888;font-size:12px">Total calendar days this month: <strong>${totalDays}</strong></p>
      `,
      input: "number",
      inputLabel: "Number of Off Days",
      inputValue: offDays,
      inputAttributes: { min: 0, max: totalDays - 1, step: 1 },
      showCancelButton: true,
      confirmButtonText: "Save",
      confirmButtonColor: "#ef4444",
      inputValidator: (value) => {
        if (value === "" || value === null) return "Please enter a value!";
        if (parseInt(value) < 0) return "Off days cannot be negative!";
        if (parseInt(value) >= totalDays)
          return `Off days must be less than ${totalDays} (total days in month)!`;
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const newOffDays = parseInt(result.value);
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_BASE}/update_off_days.php`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ off_days: newOffDays }),
            }
          );
          const resData = await res.json();
          if (resData.success) {
            Swal.fire({
              icon: "success",
              title: "Saved!",
              html: `Off days set to <strong>${newOffDays}</strong>.<br/>
                     Working days this month: <strong>${totalDays - newOffDays}</strong>`,
              confirmButtonColor: "#10b981",
            });
            fetchPayrollData(); // Refresh with new calculations
          } else {
            Swal.fire("Error", resData.message, "error");
          }
        } catch (error) {
          Swal.fire("Error", "Could not save settings.", "error");
        }
      }
    });
  };

  // ── Pay salary ──────────────────────────────────────────────────────────────
  const handlePay = (emp, absents, dailyRate, netPay) => {
    Swal.fire({
      title: `Pay ${emp.name}?`,
      html: `
        <table style="width:100%;font-size:13px;text-align:left;border-collapse:collapse">
          <tr><td style="padding:4px 0;color:#aaa">Basic Salary</td><td style="color:#fff;font-weight:bold">Rs. ${Number(emp.salary).toLocaleString()}</td></tr>
          <tr><td style="padding:4px 0;color:#aaa">Working Days</td><td style="color:#fff">${workingDays} days</td></tr>
          <tr><td style="padding:4px 0;color:#aaa">Daily Rate</td><td style="color:#fff">Rs. ${dailyRate.toLocaleString()}</td></tr>
          <tr><td style="padding:4px 0;color:#aaa">Days Absent</td><td style="color:#ef4444">${absents} days</td></tr>
          <tr><td style="padding:4px 0;color:#aaa">Deduction</td><td style="color:#ef4444">- Rs. ${(absents * dailyRate).toLocaleString()}</td></tr>
          <tr style="border-top:1px solid #444"><td style="padding:6px 0;color:#aaa;font-weight:bold">Net Payable</td><td style="color:#10b981;font-size:16px;font-weight:bold">Rs. ${netPay.toLocaleString()}</td></tr>
        </table>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Pay Now!",
      confirmButtonColor: "#10b981",
      background: "#1a1a1a",
      color: "#fff",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE}/pay_salary.php`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                staff_id: emp.id,
                salary: emp.salary,
                absents: absents,
                net_pay: netPay,
              }),
            }
          );
          const resData = await response.json();
          if (resData.success) {
            Swal.fire("Paid!", "Salary marked as paid successfully.", "success");
            fetchPayrollData();
          } else {
            Swal.fire("Error", resData.message, "error");
          }
        } catch (error) {
          Swal.fire("Error", "Network error.", "error");
        }
      }
    });
  };

  if (isLoading)
    return <div className="loading-state-text">Loading Payroll...</div>;

  return (
    <div
      className="premium-table-wrapper animate-slide-up payroll-wrapper"
      style={{ padding: 0 }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className="module-controls-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "15px 20px",
          borderBottom: "1px solid var(--admin-border)",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h4
            className="module-title"
            style={{ margin: 0, color: "var(--admin-text)" }}
          >
            Payroll Management
          </h4>
          <p
            className="module-subtitle"
            style={{
              margin: "5px 0 0 0",
              color: "var(--admin-muted)",
              fontSize: "12px",
            }}
          >
            Salary disbursement for <strong>{currentMonthStr}</strong>
          </p>

          {/* ── Working Days Info Bar ────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              gap: "18px",
              marginTop: "10px",
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Total Days", value: totalDays, color: "#60a5fa" },
              { label: "Off Days", value: offDays, color: "#f59e0b" },
              {
                label: "Working Days",
                value: workingDays,
                color: "#10b981",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "var(--admin-card, #1a1a1a)",
                  border: `1px solid ${stat.color}33`,
                  borderRadius: "8px",
                  padding: "5px 12px",
                }}
              >
                <FaCalendarAlt color={stat.color} size={12} />
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--admin-muted)",
                  }}
                >
                  {stat.label}:
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </span>
              </div>
            ))}

            {/* Formula hint */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "11px",
                color: "var(--admin-muted)",
                fontStyle: "italic",
              }}
            >
              <FaInfoCircle size={11} />
              Daily Rate = Salary ÷ {workingDays} working days
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
          {/* Set Off Days Button */}
          <button
            className="btn-action-pill"
            style={{
              background: "#1f2937",
              color: "#f59e0b",
              border: "1px solid #f59e0b55",
              padding: "8px 15px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
            }}
            onClick={handleSetOffDays}
          >
            <FaCog size={12} />
            Off Days ({offDays})
          </button>

          <button className="btn-cancel" style={{ padding: "8px 15px" }}>
            <FaPrint style={{ marginRight: "5px" }} /> Print All Slips
          </button>
        </div>
      </div>

      {/* ── Payroll Table ───────────────────────────────────────────────────── */}
      <table className="admin-table">
        <thead>
          <tr>
            <th className="pad-left-20">Employee</th>
            <th>Basic Salary</th>
            <th>Absences</th>
            <th>Deduction</th>
            <th>Net Payable</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {employees.length > 0 ? (
            employees.map((emp) => {
              const salary = Number(emp.salary) || 0;
              const absents = Number(emp.absents) || 0;
              const isPaid = Number(emp.is_paid) > 0;

              // ── Core formula ─────────────────────────────────────────────
              const dailyRate = workingDays > 0
                ? Math.round(salary / workingDays)
                : 0;
              const totalDeduction = absents * dailyRate;
              const netPay = Math.max(0, salary - totalDeduction);

              return (
                <tr key={emp.id}>
                  {/* Employee */}
                  <td className="pad-left-20">
                    <div className="item-profile">
                      <div className="staff-avatar">
                        {(emp.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="item-info">
                        <span className="item-name">{emp.name}</span>
                        <span className="item-id">{emp.role}</span>
                      </div>
                    </div>
                  </td>

                  {/* Basic Salary + daily rate hint */}
                  <td className="basic-salary-cell">
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: "bold" }}>
                        Rs. {salary.toLocaleString()}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--admin-muted)",
                          marginTop: "2px",
                        }}
                      >
                        Rs. {dailyRate.toLocaleString()} / day
                      </span>
                    </div>
                  </td>

                  {/* Absences count */}
                  <td>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        background: absents > 0 ? "#ef444422" : "#10b98122",
                        color: absents > 0 ? "#ef4444" : "#10b981",
                        border: `1px solid ${absents > 0 ? "#ef444444" : "#10b98144"}`,
                      }}
                    >
                      {absents} {absents === 1 ? "Day" : "Days"}
                    </span>
                  </td>

                  {/* Deduction amount */}
                  <td>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "bold",
                          color: absents > 0 ? "#ef4444" : "#10b981",
                        }}
                      >
                        {absents > 0
                          ? `- Rs. ${totalDeduction.toLocaleString()}`
                          : "No Deduction"}
                      </span>
                      {absents > 0 && (
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--admin-muted)",
                            marginTop: "2px",
                          }}
                        >
                          {absents} × Rs. {dailyRate.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Net Payable */}
                  <td>
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: netPay < salary ? "#f59e0b" : "var(--admin-text)",
                      }}
                    >
                      Rs. {netPay.toLocaleString()}
                    </span>
                  </td>

                  {/* Status badge */}
                  <td>
                    <span
                      className={`status-badge ${isPaid ? "delivered" : "pending"}`}
                    >
                      {isPaid ? (
                        <>
                          <FaCheckCircle size={10} /> PAID
                        </>
                      ) : (
                        <>
                          <FaExclamationCircle size={10} /> PENDING
                        </>
                      )}
                    </span>
                  </td>

                  {/* Action */}
                  <td>
                    {!isPaid ? (
                      <button
                        className="btn-save btn-pay-action"
                        style={{
                          padding: "6px 12px",
                          margin: 0,
                          width: "auto",
                        }}
                        onClick={() =>
                          handlePay(emp, absents, dailyRate, netPay)
                        }
                      >
                        <FaMoneyBillWave style={{ marginRight: "5px" }} /> Pay
                      </button>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <FaCheckCircle color="#10b981" size={14} />
                        <span
                          style={{
                            color: "#10b981",
                            fontWeight: "bold",
                            fontSize: "12px",
                          }}
                        >
                          Completed
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan="7"
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "gray",
                }}
              >
                No active employees found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Payroll;
