import React, { useState, useEffect } from "react";
import {
  FaMoneyBillWave,
  FaPrint,
  FaCheckCircle,
  FaExclamationCircle,
  FaCalendarAlt,
  FaCog,
  FaInfoCircle,
  FaReceipt,
} from "react-icons/fa";
import Swal from "sweetalert2";

const Payroll = () => {
  const [employees, setEmployees] = useState([]);
  const [offDays, setOffDays] = useState(4);
  const [totalDays, setTotalDays] = useState(30);
  const [workingDays, setWorkingDays] = useState(26);
  const [currentMonthStr, setCurrentMonthStr] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch payroll data
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
        setCurrentMonthStr(result.current_month || "Current Month");
        setEmployees(result.data || []);
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

  // Admin: set monthly off days
  const handleSetOffDays = () => {
    Swal.fire({
      title: "Configure Monthly Off Days",
      html: `
        <p style="color:#aaa;font-size:13px;margin-bottom:12px">
          Enter how many weekly-off / holiday days are in <strong>${currentMonthStr}</strong>.<br/>
          Working Days = Total Days (${totalDays}) − Off Days
        </p>
      `,
      input: "number",
      inputLabel: "Number of Off Days",
      inputValue: offDays,
      inputAttributes: { min: 0, max: totalDays - 1, step: 1 },
      showCancelButton: true,
      confirmButtonText: "Save",
      confirmButtonColor: "#f59e0b",
      background: "#171717",
      color: "#fff",
      inputValidator: (value) => {
        if (value === "" || value === null) return "Please enter a value!";
        if (parseInt(value) < 0) return "Off days cannot be negative!";
        if (parseInt(value) >= totalDays)
          return `Off days must be less than ${totalDays}!`;
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
              text: `Off days set to ${newOffDays}. Working days: ${totalDays - newOffDays}`,
              background: "#171717",
              color: "#fff",
              timer: 1500,
              showConfirmButton: false,
            });
            fetchPayrollData();
          } else {
            Swal.fire("Error", resData.message, "error");
          }
        } catch (error) {
          Swal.fire("Error", "Could not save settings.", "error");
        }
      }
    });
  };

  // Pay salary
  const handlePay = (emp, absents, dailyRate, netPay) => {
    Swal.fire({
      title: `Pay ${emp.name}?`,
      html: `
        <div style="text-align:left;font-size:13px;line-height:1.8;padding:8px 0;">
          <div style="display:flex;justify-content:space-between;color:#aaa"><span>Basic Salary:</span><strong style="color:#fff">Rs. ${Number(emp.salary).toLocaleString()}</strong></div>
          <div style="display:flex;justify-content:space-between;color:#aaa"><span>Working Days:</span><strong style="color:#fff">${workingDays} Days</strong></div>
          <div style="display:flex;justify-content:space-between;color:#aaa"><span>Daily Rate:</span><strong style="color:#fff">Rs. ${dailyRate.toLocaleString()}</strong></div>
          <div style="display:flex;justify-content:space-between;color:#ef4444"><span>Absences (${absents} days):</span><strong>- Rs. ${(absents * dailyRate).toLocaleString()}</strong></div>
          <hr style="border:0;border-top:1px solid #333;margin:8px 0" />
          <div style="display:flex;justify-content:space-between;color:#10b981;font-size:15px;font-weight:bold"><span>Net Payable:</span><span>Rs. ${netPay.toLocaleString()}</span></div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm Disbursement",
      confirmButtonColor: "#10b981",
      background: "#171717",
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
            Swal.fire({
              icon: "success",
              title: "Disbursed!",
              text: `Salary paid to ${emp.name}.`,
              background: "#171717",
              color: "#fff",
              timer: 1500,
              showConfirmButton: false,
            });
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
    return (
      <div className="py-20 text-center text-[var(--admin-muted,#888)] text-xs font-bold uppercase tracking-wider">
        Loading Monthly Payroll Calculations...
      </div>
    );

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Top Header & Actions */}
      <div className="admin-card-surface flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-5 rounded-2xl shadow-sm">
        <div>
          <h4 className="m-0 text-sm sm:text-base font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
            Monthly Payroll & Wage Calculation ({currentMonthStr})
          </h4>
          <p className="text-xs text-slate-500 dark:text-neutral-400 m-0 mt-0.5 font-sans">
            Automatic calculation based on daily attendance and monthly base pay.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-amber-700 dark:text-amber-400 border border-amber-300/60 dark:border-amber-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
            onClick={handleSetOffDays}
          >
            <FaCog className="text-xs" />
            <span>Off Days ({offDays})</span>
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
            onClick={() => window.print()}
          >
            <FaPrint className="text-xs" />
            <span>Print Slips</span>
          </button>
        </div>
      </div>

      {/* KPI Info Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="admin-card-surface p-4 sm:p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-between shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider">Total Calendar Days</span>
          <span className="font-bold text-2xl tracking-tight font-mono">{totalDays} Days</span>
        </div>
        <div className="admin-card-surface p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-between shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider">Monthly Off Days</span>
          <span className="font-bold text-2xl tracking-tight font-mono">{offDays} Days</span>
        </div>
        <div className="admin-card-surface p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-between shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider">Calculated Working Days</span>
          <span className="font-bold text-2xl tracking-tight font-mono">{workingDays} Days</span>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="admin-card-surface rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full border-collapse min-w-[720px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02]">
              <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                Employee
              </th>
              <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                Basic Salary
              </th>
              <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                Absences
              </th>
              <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                Deductions
              </th>
              <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                Net Payable
              </th>
              <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                Status
              </th>
              <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/[0.06]">
            {employees.length > 0 ? (
              employees.map((emp) => {
                const salary = Number(emp.salary) || 0;
                const absents = Number(emp.absents) || 0;
                const isPaid = Number(emp.is_paid) > 0;

                const dailyRate = workingDays > 0 ? Math.round(salary / workingDays) : 0;
                const totalDeduction = absents * dailyRate;
                const netPay = Math.max(0, salary - totalDeduction);

                return (
                  <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
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
                            {emp.role}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 sm:p-4 align-middle">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        Rs. {salary.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-neutral-500">
                        Rs. {dailyRate.toLocaleString()} / day
                      </span>
                    </td>

                    <td className="p-3.5 sm:p-4 align-middle">
                      <span
                        className={`!rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider inline-block ${
                          absents > 0
                            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                            : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {absents} {absents === 1 ? "Day" : "Days"}
                      </span>
                    </td>

                    <td className="p-3.5 sm:p-4 align-middle">
                      <span
                        className={`font-bold ${
                          absents > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-400 dark:text-neutral-500"
                        }`}
                      >
                        {absents > 0 ? `- Rs. ${totalDeduction.toLocaleString()}` : "Rs. 0"}
                      </span>
                    </td>

                    <td className="p-3.5 sm:p-4 align-middle">
                      <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                        Rs. {netPay.toLocaleString()}
                      </span>
                    </td>

                    <td className="p-3.5 sm:p-4 align-middle">
                      <span
                        className={`!rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                          isPaid
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {isPaid ? (
                          <>
                            <FaCheckCircle className="text-[10px]" /> PAID
                          </>
                        ) : (
                          <>
                            <FaExclamationCircle className="text-[10px]" /> PENDING
                          </>
                        )}
                      </span>
                    </td>

                    <td className="p-3.5 sm:p-4 align-middle text-right">
                      {isPaid ? (
                        <span className="text-[11px] text-slate-400 dark:text-neutral-500 font-semibold italic">
                          Disbursed
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handlePay(emp, absents, dailyRate, netPay)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border-none active:scale-95 inline-flex"
                        >
                          <FaMoneyBillWave className="text-xs" />
                          <span>Pay Salary</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-12 text-xs text-[var(--admin-muted,#888)] font-semibold"
                >
                  No payroll records found for this cycle.
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
