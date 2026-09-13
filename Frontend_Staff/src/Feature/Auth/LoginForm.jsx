import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaUserShield,
  FaLock,
  FaUser,
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
  FaBolt,
  FaMotorcycle,
  FaUtensils,
  FaBoxes,
  FaShieldAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { useStaffAuth, getRoleDashboard, isRoleAllowedForPath } from "../../Context/AuthContext";

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useStaffAuth();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Auto-redirect if already logged in (ensures role permission check)
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const fromPath = location.state?.from?.pathname;
      const canAccessFromPath =
        fromPath &&
        fromPath !== "/login" &&
        fromPath !== "/" &&
        isRoleAllowedForPath(user.role, fromPath);

      const destination = canAccessFromPath
        ? fromPath
        : getRoleDashboard(user.role);

      navigate(destination, { replace: true, state: {} });
    }
  }, [isAuthenticated, user, navigate, location.state]);

  const handleBackToStore = () => {
    const configuredUrl = import.meta.env.VITE_CUSTOMER_URL;
    if (configuredUrl) {
      window.open(configuredUrl, "_blank");
      return;
    }
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      const targetPort = window.location.port === "5173" ? "5174" : "5173";
      window.open(`http://${window.location.hostname}:${targetPort}`, "_blank");
    } else {
      window.open("/", "_blank");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const cleanUsername = (loginId || "").trim();
    if (!cleanUsername || !password) {
      Swal.fire({
        icon: "warning",
        title: "Missing Credentials",
        text: "Please enter your username/phone and password!",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/login.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: cleanUsername, password }),
        }
      );

      const result = await response.json();

      if (result.success && result.user && result.token) {
        // Tab-isolated session synchronization
        login(result.user, result.token);

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: `Welcome back, ${result.user.name}!`,
          showConfirmButton: false,
          timer: 1500,
        });

        // Strict Role-Based Dashboard Routing: only go to fromPath if user's role is authorized!
        const fromPath = location.state?.from?.pathname;
        const canAccessFromPath =
          fromPath &&
          fromPath !== "/login" &&
          fromPath !== "/" &&
          isRoleAllowedForPath(result.user.role, fromPath);

        const targetRoute = canAccessFromPath
          ? fromPath
          : getRoleDashboard(result.user.role);

        if (targetRoute && targetRoute !== "/login") {
          navigate(targetRoute, { replace: true, state: {} });
        } else {
          Swal.fire(
            "Role Unassigned",
            "Your role is not mapped to any staff portal. Please contact management.",
            "error"
          );
        }
      } else {
        Swal.fire("Login Failed", result.message || "Invalid username or password!", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire("Network Error", "Unable to reach the authentication server. Please check connection.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-[#0E0E12] text-slate-900 dark:text-white transition-colors">
      {/* ═══════════════════════════════════════════════════════════
          LEFT SIDE: VISUAL HERO (Visible on lg+, hidden on mobile)
          ═══════════════════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex flex-col justify-between relative p-12 lg:p-16 overflow-hidden bg-neutral-950 text-white"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1600&auto=format&fit=crop')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Soft dark gradient overlay for text clarity */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-black/55 backdrop-blur-[1px] pointer-events-none" />

        {/* Top Branding & Version Pill */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            
            <div>
              <h1 className="font-['Oswald',sans-serif] font-black text-lg tracking-wider text-white uppercase m-0 leading-none">
                Bigbite
              </h1>
              
            </div>
          </div>

          
        </div>

        {/* Center Hero Heading & Feature Badges */}
        <div className="relative z-10 my-auto py-10 space-y-6 max-w-lg">
          <div>
            <h2 className="font-['Oswald',sans-serif] font-black text-4xl lg:text-5xl text-white uppercase tracking-tight leading-tight drop-shadow-md">
              Streamlined Kitchen.{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Instant Dispatch.
              </span>
            </h2>
            
          </div>
 
          {/* Operational Feature Badges */}
          
        </div>

        {/* Bottom Security Footer */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-neutral-400 text-xs font-mono">
          <div className="flex items-center gap-2">
            <FaUserShield className="text-amber-400 text-sm" />
            <span>Encrypted Session</span>
          </div>
          <span className="text-[11px] text-neutral-400 font-sans">© {new Date().getFullYear()} QuickBite</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          RIGHT SIDE: FORM PANEL (Pure Tailwind, Dual-Theme)
          ═══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-16 min-h-screen bg-white dark:bg-[#0E0E12] text-slate-900 dark:text-white transition-colors relative">
        {/* Top Bar: Back to Store */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackToStore}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-500 dark:text-neutral-400 dark:hover:text-amber-400 transition-colors cursor-pointer bg-transparent border-none p-0 group"
          >
            <FaArrowLeft className="text-xs transition-transform group-hover:-translate-x-1" />
            <span>Back to Store</span>
          </button>

          {/* Mobile Only Brand Icon */}
          <div className="lg:hidden flex items-center gap-2">
            
            <span className="font-['Oswald',sans-serif] font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Staff Portal
            </span>
          </div>
        </div>

        {/* Centered Form Wrapper */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          {/* Header Card */}
          <div className="mb-16"> 
            <h2 className="text-2xl sm:text-3xl font-black font-['Oswald',sans-serif] uppercase tracking-wide text-slate-900 dark:text-white m-0 text-center ">
              Staff Login
            </h2> 
            
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-black uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                Username 
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-neutral-500">
                  <FaUser className="text-sm" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. admin, cashier1, chef"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-md font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-black uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-neutral-500">
                  <FaLock className="text-sm" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-md font-medium text-slate-900 dark:text-white  placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash className="text-base" /> : <FaEye className="text-base" />}
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] text-neutral-950 font-['Oswald',sans-serif] font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all cursor-pointer border-none flex items-center justify-center gap-2.5 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <FaUserShield className="text-sm" />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-slate-400 dark:text-neutral-600 pt-4">
          QuickBite Multi-Role Systems • Internal Use Only
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
