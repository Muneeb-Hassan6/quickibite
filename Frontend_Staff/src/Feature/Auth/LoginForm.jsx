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
import { useStaffAuth, getRoleDashboard } from "../../Context/AuthContext";

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useStaffAuth();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const fromPath = location.state?.from?.pathname;
      const destination =
        fromPath && fromPath !== "/login" && fromPath !== "/"
          ? fromPath
          : getRoleDashboard(user.role);
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.state]);

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

        // Strict Role-Based Dashboard Routing
        const targetRoute = getRoleDashboard(result.user.role);
        if (targetRoute && targetRoute !== "/login") {
          navigate(targetRoute, { replace: true });
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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-['Oswald',sans-serif] font-black text-black text-base shadow-lg shadow-amber-500/20">
              QB
            </div>
            <div>
              <h1 className="font-['Oswald',sans-serif] font-black text-lg tracking-wider text-white uppercase m-0 leading-none">
                QuickiBite Suite
              </h1>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                Staff Operations Portal
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold tracking-wider backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Enterprise Kitchen & POS Engine v2.0</span>
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
            <p className="text-sm text-neutral-300 mt-3 leading-relaxed drop-shadow-sm font-sans">
              Centralized command center for Cashiers, Kitchen Chefs, Dispatchers, and Delivery Riders with live WebSocket synchronization.
            </p>
          </div>

          {/* Operational Feature Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <FaBolt className="text-amber-400 text-sm shrink-0" />
              <span className="text-xs font-bold text-neutral-200">Real-time KDS</span>
            </div>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <FaShieldAlt className="text-amber-400 text-sm shrink-0" />
              <span className="text-xs font-bold text-neutral-200">Multi-Role RBAC</span>
            </div>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <FaMotorcycle className="text-amber-400 text-sm shrink-0" />
              <span className="text-xs font-bold text-neutral-200">Live Rider Dispatch</span>
            </div>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <FaBoxes className="text-amber-400 text-sm shrink-0" />
              <span className="text-xs font-bold text-neutral-200">Inventory & Wastage</span>
            </div>
          </div>
        </div>

        {/* Bottom Security Footer */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-neutral-400 text-xs font-mono">
          <div className="flex items-center gap-2">
            <FaUserShield className="text-amber-400 text-sm" />
            <span>Encrypted Session (Strict Tab-Isolation)</span>
          </div>
          <span className="text-[11px] text-neutral-400 font-sans">© {new Date().getFullYear()} QuickiBite</span>
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
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-500 dark:text-neutral-400 dark:hover:text-amber-400 transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            <FaArrowLeft className="text-xs" />
            <span>Back to Store</span>
          </button>

          {/* Mobile Only Brand Icon */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-['Oswald',sans-serif] font-black text-xs">
              QB
            </div>
            <span className="font-['Oswald',sans-serif] font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Staff Portal
            </span>
          </div>
        </div>

        {/* Centered Form Wrapper */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          {/* Header Card */}
          <div className="mb-8">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/10 mb-5">
              <FaUserShield />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-['Oswald',sans-serif] uppercase tracking-wide text-slate-900 dark:text-white m-0">
              Staff Authentication
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1.5 font-sans">
              Enter your executive credentials to access your designated operations dashboard.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                Username or Staff ID
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
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-neutral-300">
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
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
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
                  <span>Authenticate Securely</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Role Guidance Note */}
          <div className="mt-8 p-3.5 rounded-xl bg-slate-100 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800 text-[11px] text-slate-600 dark:text-neutral-400 flex items-center gap-2">
            <span className="font-bold text-amber-500 shrink-0">💡 Note:</span>
            <span>Role-based portal (Admin, Cashier, Kitchen, Dispatcher, Rider) is automatically assigned upon authentication.</span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-slate-400 dark:text-neutral-600 pt-4">
          QuickiBite Hospitality Multi-Role Systems • Internal Use Only
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
