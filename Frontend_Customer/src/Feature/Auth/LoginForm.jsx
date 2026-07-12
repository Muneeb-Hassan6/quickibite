import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaLock, FaUser, FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";

const LoginForm = () => {
  const navigate = useNavigate();

  // Form States
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginId || !password) {
      Swal.fire("Warning", "Please enter your username/phone and password!", "warning");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginId, password }),
      });

      const result = await response.json();

      if (result.success) {
        sessionStorage.setItem("staff_session", JSON.stringify(result.user));
        sessionStorage.setItem("user", JSON.stringify(result.user));
        sessionStorage.setItem("auth_token", result.token);

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: `Welcome ${result.user.name}!`,
          showConfirmButton: false,
          timer: 1500,
        });

        const dbRole = result.user.role.toLowerCase();

        if (dbRole === "admin" || dbRole === "manager") {
          navigate("/admin");
        } else if (dbRole === "cashier") {
          navigate("/cashier");
        } else if (dbRole === "chef" || dbRole === "kitchen") {
          navigate("/kitchen");
        } else if (dbRole === "dispatcher") {
          navigate("/dispatcher");
        } else if (dbRole === "rider") {
          navigate("/rider");
        } else {
          Swal.fire("Error", "Your role is not assigned to any portal.", "error");
        }
      } else {
        Swal.fire("Login Failed", result.message, "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire("Error", "Network connection failed.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100vh] flex items-center justify-center bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#050505_100%)] p-[1.075rem] font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]">
      <div className="bg-[var(--panel-bg,#111)] border border-[var(--border-color,#222)] w-[24.188rem] max-w-md py-[4vh] px-[1.612rem] md:px-8 rounded-2xl md:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
        <button 
          className="absolute top-[2vh] left-[1.075rem] md:left-6 bg-transparent border-none text-[var(--text-muted,#888)] flex items-center gap-2 cursor-pointer text-xs md:text-sm font-bold transition-all duration-300 hover:text-red-500" 
          onClick={() => navigate("/")}
        >
          <FaArrowLeft /> Back to Store
        </button>

        <div className="text-center mb-[4vh] mt-[3vh]">
          <div className="w-[4.837rem] h-[4.837rem] max-w-[4.5rem] max-h-[4.5rem] bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <FaUserShield />
          </div>
          <h2 className="text-white font-['Oswald',sans-serif] uppercase tracking-wide m-0 mb-1 text-[1.612rem] md:text-3xl">Staff Portal</h2>
          <p className="text-gray-400 m-0 text-sm md:text-base">Login to access your dashboard</p>
        </div>

        <form className="flex flex-col gap-[3vh]" onSubmit={handleLogin}>
          <div className="flex flex-col gap-2">
            <label className="text-gray-300 text-xs md:text-sm font-semibold uppercase tracking-wider">Username</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-gray-400 text-base flex items-center">
                <FaUser />
              </span>
              <input
                type="text"
                className="w-full bg-[var(--bg-body,#0a0a0a)] border border-[var(--border-color,#333)] text-white py-3 pr-4 pl-11 rounded-xl text-sm md:text-base outline-none transition-all duration-300 focus:border-red-500 focus:shadow-[0_0_10px_rgba(239,68,68,0.2)] placeholder:text-gray-600"
                placeholder="Enter username"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-300 text-xs md:text-sm font-semibold uppercase tracking-wider">Password</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-gray-400 text-base flex items-center">
                <FaLock />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full bg-[var(--bg-body,#0a0a0a)] border border-[var(--border-color,#333)] text-white py-3 pr-11 pl-11 rounded-xl text-sm md:text-base outline-none transition-all duration-300 focus:border-red-500 focus:shadow-[0_0_10px_rgba(239,68,68,0.2)] placeholder:text-gray-600"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span 
                className="absolute right-4 text-gray-400 text-lg cursor-pointer flex items-center transition-all duration-300 select-none hover:text-red-500"
                onMouseDown={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                onMouseLeave={() => setShowPassword(false)}
                onTouchStart={() => setShowPassword(true)}
                onTouchEnd={() => setShowPassword(false)}
                title="Hold to show password"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="bg-gradient-to-br from-red-500 to-red-700 text-white border-none p-[2vh] rounded-xl text-[1.075rem] md:text-base font-bold font-['Oswald',sans-serif] uppercase tracking-wide cursor-pointer transition-all duration-300 mt-2 shadow-[0_5px_15px_rgba(239,68,68,0.3)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(239,68,68,0.5)]"
            disabled={isLoading}
          >
            {isLoading ? "Checking..." : "Login Securely"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
