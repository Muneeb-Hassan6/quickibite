import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaLock,
  FaTimes,
  FaSpinner,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTag,
  FaCopy,
  FaArrowRight,
  FaKey,
  FaShieldAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { useAuth } from "../../Context/AuthContext";

// Safe JWT Decoder for Google OAuth Credential
const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("Failed to parse Google JWT credential:", err);
    return null;
  }
};

const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    login,
    googleLogin,
    register,
    requestPasswordReset,
    confirmPasswordReset,
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPromo, setCopiedPromo] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regFullName, setRegFullName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  // Forgot Password state
  const [forgotStep, setForgotStep] = useState(1); // 1: Request code, 2: Reset password
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [formError, setFormError] = useState("");

  const googleBtnContainerRef = useRef(null);

  // Google OAuth Initialization via Google Identity Services
  const handleGoogleCredentialResponse = useCallback(
    async (response) => {
      if (!response || !response.credential) {
        toast.error("Google authentication did not return valid credentials.");
        return;
      }

      setGoogleLoading(true);
      setFormError("");

      try {
        const payload = parseJwt(response.credential);
        if (!payload || !payload.email || !payload.sub) {
          toast.error("Could not extract user info from Google response.");
          setGoogleLoading(false);
          return;
        }

        const res = await googleLogin({
          email: payload.email,
          name: payload.name || payload.given_name || "Google User",
          google_id: payload.sub,
          avatar: payload.picture || "",
        });

        if (!res.success) {
          setFormError(res.message || "Failed to authenticate with Google.");
        }
      } catch (err) {
        console.error("Google login processing error:", err);
        setFormError("An unexpected error occurred during Google sign-in.");
      } finally {
        setGoogleLoading(false);
      }
    },
    [googleLogin]
  );

  useEffect(() => {
    if (!isAuthModalOpen) return;

    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      "672266612348-j631r3qg1rd4np8cckrmt3te33vrso5j.apps.googleusercontent.com";

    const initGoogleIdentity = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (googleBtnContainerRef.current) {
            googleBtnContainerRef.current.innerHTML = "";
            window.google.accounts.id.renderButton(
              googleBtnContainerRef.current,
              {
                type: "standard",
                theme: "filled_black",
                size: "large",
                text: authModalTab === "login" ? "signin_with" : "signup_with",
                shape: "pill",
                logo_alignment: "left",
                width: 320,
              }
            );
          }
        } catch (e) {
          console.warn("Google Identity initialize error:", e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogleIdentity();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          initGoogleIdentity();
          clearInterval(timer);
        }
      }, 300);
      return () => clearInterval(timer);
    }
  }, [isAuthModalOpen, authModalTab, handleGoogleCredentialResponse]);

  if (!isAuthModalOpen) return null;

  const triggerGooglePrompt = () => {
    if (googleBtnContainerRef.current) {
      const btn = googleBtnContainerRef.current.querySelector('div[role="button"]');
      if (btn) {
        btn.click();
        return;
      }
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      toast.error("Google Services is loading. Please try again in a moment.");
    }
  };

  const handleCopyPromo = () => {
    navigator.clipboard.writeText("WELCOME50");
    setCopiedPromo(true);
    toast.success("Promo code WELCOME50 copied!");
    setTimeout(() => setCopiedPromo(false), 2500);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!loginIdentifier.trim() || !loginPassword) {
      setFormError("Please enter your phone/email and password.");
      return;
    }

    setLoading(true);
    const res = await login({
      identifier: loginIdentifier.trim(),
      password: loginPassword,
    });
    setLoading(false);

    if (!res.success) {
      setFormError(res.message || "Invalid credentials.");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!regFullName.trim() || !regPhone.trim() || !regPassword) {
      setFormError("Full name, phone number, and password are required.");
      return;
    }

    if (regPassword.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await register({
      full_name: regFullName.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim(),
      password: regPassword,
    });
    setLoading(false);

    if (!res.success) {
      setFormError(res.message || "Failed to create account.");
    }
  };

  // Forgot Password Step 1
  const handleForgotRequest = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!forgotIdentifier.trim()) {
      setFormError("Please provide your registered phone or email.");
      return;
    }

    setLoading(true);
    const res = await requestPasswordReset(forgotIdentifier.trim());
    setLoading(false);

    if (res.success) {
      if (res.reset_code) {
        setResetCode(res.reset_code);
      }
      setForgotStep(2);
    } else {
      setFormError(res.message || "Could not find account.");
    }
  };

  // Forgot Password Step 2
  const handleForgotConfirm = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!resetCode.trim() || !newPassword) {
      setFormError("Please enter reset code and your new password.");
      return;
    }

    if (newPassword.length < 6) {
      setFormError("New password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const res = await confirmPasswordReset({
      identifier: forgotIdentifier.trim(),
      reset_code: resetCode.trim(),
      new_password: newPassword,
    });
    setLoading(false);

    if (res.success) {
      setAuthModalTab("login");
      setForgotStep(1);
    } else {
      setFormError(res.message || "Failed to reset password.");
    }
  };

  const isRegister = authModalTab === "register";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* 2-Panel Split Sliding Modal Container */}
      <div
        className="relative w-full max-w-4xl bg-[#111114] border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col md:flex-row transition-all duration-500 ease-in-out max-h-[92vh] overflow-y-auto md:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Absolute Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-40 w-8 h-8 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/60 text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
          aria-label="Close modal"
        >
          <FaTimes className="w-3.5 h-3.5" />
        </button>

        {/* ═══════════════════════════════════════════════════════════
            HIGH-RES ARTWORK & PROMO PANEL (Sliding Desktop Panel)
            ═══════════════════════════════════════════════════════════ */}
        <div
          className={`hidden md:flex md:w-5/12 relative flex-col justify-between p-8 overflow-hidden transition-all duration-500 ease-in-out ${
            isRegister ? "md:order-2 border-l border-neutral-800" : "md:order-1 border-r border-neutral-800"
          }`}
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=900&auto=format&fit=crop")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark Glass Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60 pointer-events-none"></div>

          {/* Top Active Discount Tag */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[11px] font-black uppercase tracking-wider mb-4 shadow-sm backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>🔥 WELCOME DISCOUNT ACTIVE</span>
            </div>
            <h2 className="font-['Oswald',sans-serif] font-black text-3xl text-white tracking-wide uppercase leading-tight drop-shadow-md">
              FEAST MORE,{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                PAY LESS.
              </span>
            </h2>
            <p className="text-xs text-neutral-300 mt-2 leading-relaxed drop-shadow-sm">
              Unlock member discounts, 1-click reorder pipelines, and live kitchen dispatch tracking.
            </p>
          </div>

          {/* Center Promo Voucher Box */}
          <div className="relative z-10 my-4 p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-amber-500/40 shadow-xl">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <FaTag className="text-xs" /> FIRST ORDER PROMO
              </span>
              <span className="text-[10px] font-bold bg-amber-400 text-black px-2 py-0.5 rounded-full uppercase font-mono">
                20% OFF
              </span>
            </div>
            <div className="flex items-center justify-between bg-neutral-900/90 border border-amber-500/50 rounded-xl px-3 py-2">
              <span className="font-mono font-black text-sm tracking-widest text-amber-300">
                WELCOME50
              </span>
              <button
                type="button"
                onClick={handleCopyPromo}
                className="flex items-center gap-1 text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase bg-transparent border-none cursor-pointer"
              >
                {copiedPromo ? <FaCheckCircle className="text-emerald-400" /> : <FaCopy />}
                <span>{copiedPromo ? "Copied" : "Copy Code"}</span>
              </button>
            </div>
            <p className="text-[10px] text-neutral-300 mt-2 leading-tight">
              Apply code at checkout for instant 20% discount on your entire cart.
            </p>
          </div>

          {/* Bottom Switch Button Inside Artwork Panel */}
          <div className="relative z-10 pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-neutral-300 font-medium mb-2.5">
              {isRegister ? "Already have an account?" : "New to QuickiBite?"}
            </p>
            <button
              type="button"
              onClick={() => {
                setFormError("");
                setAuthModalTab(isRegister ? "login" : "register");
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-['Oswald',sans-serif] font-black text-xs uppercase tracking-wider backdrop-blur-md transition-all active:scale-98 cursor-pointer shadow-md"
            >
              {isRegister ? "Sign In to Account" : "Create New Account"}
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            FORM PANEL (Sliding Desktop / Full Mobile Column)
            ═══════════════════════════════════════════════════════════ */}
        <div
          className={`w-full md:w-7/12 p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-[#111114] relative transition-all duration-500 ease-in-out ${
            isRegister ? "md:order-1" : "md:order-2"
          }`}
        >
          {/* Header */}
          <div className="mb-5">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-['Oswald',sans-serif] font-black text-black text-sm shadow-md">
                QB
              </div>
              <span className="font-['Oswald',sans-serif] font-black text-sm tracking-wider text-amber-400 uppercase">
                QuickiBite Authentication
              </span>
            </div>

            <h3 className="font-['Oswald',sans-serif] font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
              {authModalTab === "login"
                ? "Welcome Back"
                : authModalTab === "register"
                ? "Create Account"
                : "Reset Password"}
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              {authModalTab === "login"
                ? "Access saved addresses, past orders, and instant 1-click reordering."
                : authModalTab === "register"
                ? "Sign up in seconds to claim your WELCOME50 voucher."
                : "Enter your phone or email to recover account access."}
            </p>
          </div>

          {/* Error Banner */}
          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-shake">
              <span className="font-bold">⚠️</span>
              <span>{formError}</span>
            </div>
          )}

          {/* Official Google OAuth Sign-In (Shown on Login & Register) */}
          {authModalTab !== "forgot" && (
            <div className="space-y-3 mb-5">
              {/* Hidden Google Identity rendered button container */}
              <div ref={googleBtnContainerRef} className="hidden"></div>

              <button
                type="button"
                onClick={triggerGooglePrompt}
                disabled={googleLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800/90 border border-neutral-700 hover:border-[#F59E0B] text-white font-semibold text-xs flex items-center justify-center gap-3 transition-all duration-200 active:scale-98 shadow-xs cursor-pointer disabled:opacity-50 group"
              >
                {googleLoading ? (
                  <FaSpinner className="animate-spin text-amber-400 text-sm" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span className="group-hover:text-amber-300 transition-colors">
                  {authModalTab === "login" ? "Continue with Google" : "Sign Up with Google"}
                </span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-[1px] bg-neutral-800"></div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  or with credentials
                </span>
                <div className="flex-1 h-[1px] bg-neutral-800"></div>
              </div>
            </div>
          )}

          {/* ════ TAB 1: LOGIN FORM ════ */}
          {authModalTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Phone Number or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <FaUser className="text-xs" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="03001234567 or email@domain.com"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-900 border border-neutral-700/80 focus:border-amber-500 rounded-xl text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setFormError("");
                      setAuthModalTab("forgot");
                    }}
                    className="text-[11px] font-semibold text-amber-400 hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <FaLock className="text-xs" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-neutral-900 border border-neutral-700/80 focus:border-amber-500 rounded-xl text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-white bg-transparent border-none cursor-pointer"
                  >
                    {showPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-['Oswald',sans-serif] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50 border-none"
              >
                {loading ? <FaSpinner className="animate-spin text-sm" /> : <FaArrowRight />}
                <span>{loading ? "Signing In..." : "Sign In to Account"}</span>
              </button>

              {/* Mobile Switch Link */}
              <div className="md:hidden pt-3 text-center border-t border-neutral-800/80 mt-4">
                <span className="text-xs text-neutral-400">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setFormError("");
                    setAuthModalTab("register");
                  }}
                  className="text-xs font-bold text-amber-400 hover:underline bg-transparent border-none cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          )}

          {/* ════ TAB 2: REGISTER FORM ════ */}
          {authModalTab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <FaUser className="text-xs" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muneeb Hassan"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-900 border border-neutral-700/80 focus:border-amber-500 rounded-xl text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                      <FaPhone className="text-xs" />
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="03001234567"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-900 border border-neutral-700/80 focus:border-amber-500 rounded-xl text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                      <FaEnvelope className="text-xs" />
                    </div>
                    <input
                      type="email"
                      placeholder="you@email.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-900 border border-neutral-700/80 focus:border-amber-500 rounded-xl text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                      <FaLock className="text-xs" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Min 6 chars"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-900 border border-neutral-700/80 focus:border-amber-500 rounded-xl text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                      <FaShieldAlt className="text-xs" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Repeat password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-900 border border-neutral-700/80 focus:border-amber-500 rounded-xl text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-['Oswald',sans-serif] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50 border-none"
              >
                {loading ? <FaSpinner className="animate-spin text-sm" /> : <FaArrowRight />}
                <span>{loading ? "Creating Account..." : "Create Free Account"}</span>
              </button>

              {/* Mobile Switch Link */}
              <div className="md:hidden pt-3 text-center border-t border-neutral-800/80 mt-3">
                <span className="text-xs text-neutral-400">Already a member? </span>
                <button
                  type="button"
                  onClick={() => {
                    setFormError("");
                    setAuthModalTab("login");
                  }}
                  className="text-xs font-bold text-amber-400 hover:underline bg-transparent border-none cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* ════ TAB 3: FORGOT PASSWORD FORM ════ */}
          {authModalTab === "forgot" && (
            <div className="space-y-4">
              {forgotStep === 1 ? (
                <form onSubmit={handleForgotRequest} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Registered Phone or Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                        <FaUser className="text-xs" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="03001234567 or email@domain.com"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-900 border border-neutral-700/80 focus:border-amber-500 rounded-xl text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-['Oswald',sans-serif] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer disabled:opacity-50 border-none"
                  >
                    {loading ? <FaSpinner className="animate-spin text-sm" /> : <FaKey />}
                    <span>{loading ? "Sending Code..." : "Send Verification Code"}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleForgotConfirm} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      6-Digit Reset Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="123456"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700/80 focus:border-amber-500 rounded-xl text-white text-center font-mono font-black text-base tracking-widest focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700/80 focus:border-amber-500 rounded-xl text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-['Oswald',sans-serif] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer disabled:opacity-50 border-none"
                  >
                    {loading ? <FaSpinner className="animate-spin text-sm" /> : <FaCheckCircle />}
                    <span>{loading ? "Resetting..." : "Confirm New Password"}</span>
                  </button>
                </form>
              )}

              <div className="pt-2 text-center border-t border-neutral-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setFormError("");
                    setAuthModalTab("login");
                    setForgotStep(1);
                  }}
                  className="text-xs font-bold text-neutral-400 hover:text-white bg-transparent border-none cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
