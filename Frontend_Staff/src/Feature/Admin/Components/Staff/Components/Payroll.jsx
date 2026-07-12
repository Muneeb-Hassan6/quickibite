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
    return <div className="text-center p-[3.125rem] text-white">Loading Payroll...</div>;

  return (
    <div
      className="bg-[var(--admin-bg,#141414)] rounded-[0.75rem] border border-[var(--admin-border,#222)] overflow-x-auto shadow-[0_4px_15px_rgba(0,0,0,0.2)] animate-slide-up !p-0 custom-scrollbar"
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className="flex justify-between items-start p-[0.938rem_1.25rem] border-b border-[var(--admin-border,#333)] flex-wrap gap-[0.75rem]"
      >
        <div>
          <h4
            className="m-0 text-[var(--admin-text,#fff)] text-[1.125rem] font-bold"
          >
            Payroll Management
          </h4>
          <p
            className="text-[0.75rem] text-[var(--admin-muted,#888)] m-0 mt-[0.313rem]"
          >
            Salary disbursement for <strong>{currentMonthStr}</strong>
          </p>

          {/* ── Working Days Info Bar ────────────────────────────────────── */}
          <div
            className="flex gap-[1.125rem] mt-[0.625rem] flex-wrap"
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
                className="flex items-center gap-[0.375rem] bg-[var(--admin-card,#1a1a1a)] rounded-[0.5rem] p-[0.313rem_0.75rem]"
                style={{ border: `1px solid ${stat.color}33` }}
              >
                <FaCalendarAlt color={stat.color} size={12} />
                <span
                  className="text-[0.75rem] text-[var(--admin-muted,#888)]"
                >
                  {stat.label}:
                </span>
                <span
                  className="text-[0.813rem] font-bold"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </span>
              </div>
            ))}

            {/* Formula hint */}
            <div
              className="flex items-center gap-[0.313rem] text-[0.688rem] text-[var(--admin-muted,#888)] italic"
            >
              <FaInfoCircle size={11} />
              Daily Rate = Salary ÷ {workingDays} working days
            </div>
          </div>
        </div>

        <div className="flex gap-[0.625rem] shrink-0">
          {/* Set Off Days Button */}
          <button
            className="bg-[#1f2937] text-[#f59e0b] border border-[#f59e0b55] p-[0.5rem_0.938rem] rounded-[0.5rem] cursor-pointer flex items-center gap-[0.375rem] text-[0.813rem] transition-all duration-200 hover:bg-[#374151]"
            onClick={handleSetOffDays}
          >
            <FaCog size={12} />
            Off Days ({offDays})
          </button>

          <button className="bg-transparent text-white border border-[#333] p-[0.5rem_0.938rem] rounded-[0.5rem] cursor-pointer font-bold transition-colors duration-200 hover:bg-[rgba(255,255,255,0.1)] flex items-center gap-[0.313rem] text-[0.813rem]">
            <FaPrint /> Print All Slips
          </button>
        </div>
      </div>

      {/* ── Payroll Table ───────────────────────────────────────────────────── */}
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse min-w-[37.5rem] text-[0.875rem]">
          <thead>
            <tr>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold border-b border-[var(--admin-border,#333)] text-[0.813rem] uppercase tracking-[0.5px] pl-[1.25rem]">Employee</th>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold border-b border-[var(--admin-border,#333)] text-[0.813rem] uppercase tracking-[0.5px]">Basic Salary</th>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold border-b border-[var(--admin-border,#333)] text-[0.813rem] uppercase tracking-[0.5px]">Absences</th>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold border-b border-[var(--admin-border,#333)] text-[0.813rem] uppercase tracking-[0.5px]">Deduction</th>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold border-b border-[var(--admin-border,#333)] text-[0.813rem] uppercase tracking-[0.5px]">Net Payable</th>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold border-b border-[var(--admin-border,#333)] text-[0.813rem] uppercase tracking-[0.5px]">Status</th>
              <th className="p-[1.25rem] text-left text-[var(--admin-muted,#888)] font-semibold border-b border-[var(--admin-border,#333)] text-[0.813rem] uppercase tracking-[0.5px]">Action</th>
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
                  <tr key={emp.id} className="border-b border-[var(--admin-border,#333)] transition-colors duration-200 hover:bg-[rgba(255,255,255,0.02)]">
                    {/* Employee */}
                    <td className="p-[1.25rem] align-middle pl-[1.25rem]">
                      <div className="flex items-center gap-[0.75rem]">
                        <div className="w-[2.5rem] h-[2.5rem] rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center font-bold text-[1rem] text-[var(--admin-orange,#f59e0b)] border border-[var(--admin-border,#333)]">
                          {(emp.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-[var(--admin-text,#fff)] block">{emp.name}</span>
                          <span className="text-[0.75rem] text-[var(--admin-muted,#888)]">{emp.role}</span>
                        </div>
                      </div>
                    </td>

                    {/* Basic Salary + daily rate hint */}
                    <td className="p-[1.25rem] align-middle font-semibold text-[var(--admin-muted,#888)]">
                      <div className="flex flex-col">
                        <span className="font-bold">
                          Rs. {salary.toLocaleString()}
                        </span>
                        <span
                          className="text-[0.688rem] text-[var(--admin-muted,#888)] mt-[0.125rem]"
                        >
                          Rs. {dailyRate.toLocaleString()} / day
                        </span>
                      </div>
                    </td>

                    {/* Absences count */}
                    <td className="p-[1.25rem] align-middle">
                      <span
                        className="inline-flex items-center gap-[0.313rem] p-[0.188rem_0.625rem] rounded-[1.25rem] text-[0.75rem] font-bold"
                        style={{
                          background: absents > 0 ? "#ef444422" : "#10b98122",
                          color: absents > 0 ? "#ef4444" : "#10b981",
                          border: `1px solid ${absents > 0 ? "#ef444444" : "#10b98144"}`,
                        }}
                      >
                        {absents} {absents === 1 ? "Day" : "Days"}
                      </span>
                    </td>

                    {/* Deduction amount */}
                    <td className="p-[1.25rem] align-middle">
                      <div className="flex flex-col">
                        <span
                          className="font-bold"
                          style={{
                            color: absents > 0 ? "#ef4444" : "#10b981",
                          }}
                        >
                          {absents > 0
                            ? `- Rs. ${totalDeduction.toLocaleString()}`
                            : "No Deduction"}
                        </span>
                        {absents > 0 && (
                          <span
                            className="text-[0.688rem] text-[var(--admin-muted,#888)] mt-[0.125rem]"
                          >
                            {absents} × Rs. {dailyRate.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Net Payable */}
                    <td className="p-[1.25rem] align-middle">
                      <span
                        className="font-['Courier_New',monospace] text-[1rem] font-extrabold text-[#10b981] bg-[rgba(16,185,129,0.1)] p-[0.375rem_0.75rem] rounded-[0.375rem] border border-[rgba(16,185,129,0.2)]"
                        style={{
                          color: netPay < salary ? "#f59e0b" : "#10b981",
                          borderColor: netPay < salary ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)",
                          backgroundColor: netPay < salary ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
                        }}
                      >
                        Rs. {netPay.toLocaleString()}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="p-[1.25rem] align-middle">
                      <span
                        className={`px-[0.625rem] py-[0.25rem] rounded-[0.25rem] text-[0.75rem] font-bold uppercase tracking-[0.5px] inline-flex items-center gap-[0.313rem] ${isPaid ? "bg-[rgba(16,185,129,0.15)] text-[#34d399] border border-[rgba(16,185,129,0.3)]" : "bg-[rgba(245,158,11,0.15)] text-[#f59e0b] border border-[rgba(245,158,11,0.3)]"}`}
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
                    <td className="p-[1.25rem] align-middle">
                      {!isPaid ? (
                        <button
                          className="bg-[var(--brand-red,#ef4444)] text-white border-none p-[0.5rem_0.875rem] rounded-[0.5rem] cursor-pointer font-bold shadow-[0_4px_15px_rgba(239,68,68,0.4)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(239,68,68,0.6)] flex items-center gap-[0.313rem] text-[0.75rem] !w-auto !m-0"
                          onClick={() =>
                            handlePay(emp, absents, dailyRate, netPay)
                          }
                        >
                          <FaMoneyBillWave /> Pay
                        </button>
                      ) : (
                        <div
                          className="flex items-center gap-[0.375rem]"
                        >
                          <FaCheckCircle color="#10b981" size={14} />
                          <span
                            className="text-[#10b981] text-[0.813rem] font-bold"
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
                  className="text-center p-[2.5rem] text-[gray]"
                >
                  No active employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payroll;
