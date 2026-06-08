import { useEffect, useMemo, useState } from "react";
import api from "../components/api";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Loader2,
  LogOut,
  Pencil,
  ShieldCheck,
  Save,
  X,
  ArrowLeft,
  Mail,
} from "lucide-react";

/* ── shared input style matching productDetail ── */
const INPUT =
  "w-full h-14 px-5 border border-[#ddd2c2] outline-none bg-white text-sm placeholder:text-neutral-400 focus:border-black transition-colors";

const BTN_PRIMARY =
  "w-full h-14 py-4  bg-primary text-white uppercase tracking-[0.25em] text-xs flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed";

const BTN_OUTLINE =
  "w-full h-14 py-4  border border-[#ddd2c2] uppercase tracking-[0.25em] text-xs flex items-center justify-center gap-2 hover:border-black transition";

export default function Auth() {
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [resendKey, setResendKey] = useState(0);
  const [signingOut, setSigningOut] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const clearField = (f) => setFieldErrors((p) => ({ ...p, [f]: "" }));

  const validatePhone = (val) => {
    const clean = val.replace(/\s/g, "");
    if (!clean) return "Mobile number is required";
    if (!clean.startsWith("03")) return "Mobile number must start with 03";
    if (clean.length !== 11) return "Mobile number must be exactly 11 digits";
    return "";
  };

  /* ── PROFILE COMPLETE CHECK ── */
  const profileCompleted = useMemo(
    () => !!(user?.name && user?.phone && user?.address && user?.city),
    [user],
  );

  /* ── LOAD USER FROM STORAGE ── */
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      const u = JSON.parse(saved);
      setUser(u);
      setName(u.name || "");
      setPhone(u.phone || "");
      setAddress(u.address || "");
      setCity(u.city || "");
      setPostalCode(u.postalCode || "");
      if (!(u.name && u.phone && u.address && u.city)) setStep("profile");
    }
  }, []);

  /* ── OTP RESEND TIMER ── */
  useEffect(() => {
    if (step !== "otp") return;
    setCanResend(false);
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((p) => {
        if (p <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step, resendKey]);

  /* ── SEND OTP ── */
  const sendOtp = async () => {
    setEmailError("");
    if (!email.trim()) return setEmailError("Email address is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setEmailError(
        "Please enter a valid email address — e.g. name@example.com",
      );
    try {
      setLoading(true);
      await api.post("/user/send-otp", { email });
      setStep("otp");
      setResendTimer(30);
      setCanResend(false);
      setResendKey((k) => k + 1);
    } catch (err) {
      setEmailError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ── VERIFY OTP ── */
  const verifyOtp = async () => {
    setOtpError("");
    if (!otp.trim()) return setOtpError("Please enter the OTP");
    try {
      setLoading(true);
      const res = await api.post("/user/verify-otp", { email, otp });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      window.dispatchEvent(new Event("authUpdated"));
      setName(res.data.user.name || "");
      setPhone(res.data.user.phone || "");
      setAddress(res.data.user.address || "");
      setCity(res.data.user.city || "");
      setPostalCode(res.data.user.postalCode || "");
      if (!res.data.profileCompleted) setStep("profile");
      else window.history.back();
    } catch (err) {
      setOtpError(
        err.response?.data?.message || "Invalid OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── SAVE PROFILE ── */
  const saveProfile = async () => {
    setSuccessMessage("");
    // validate each field individually
    const errs = {};
    if (!name.trim()) errs.name = "Full name is required";
    if (!address.trim()) errs.address = "Delivery address is required";
    if (!city.trim()) errs.city = "City is required";
    const phoneErr = validatePhone(phone);
    if (phoneErr) errs.phone = phoneErr;
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await api.put(
        "/user/update-profile",
        { name, phone, address, city, postalCode },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("authUpdated"));
      setUser(res.data.user);
      setSuccessMessage("Profile saved successfully");
      setEditingProfile(false);
      setStep("account");
      if (!profileCompleted) setTimeout(() => window.history.back(), 1000);
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  /* ── LOGOUT ── */
  const logout = async () => {
    setSigningOut(true);
    // Let the overlay animate in (800ms), then clear state and navigate
    setTimeout(() => {
      window.dispatchEvent(new Event("authUpdated"));
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setEmail("");
      setOtp("");
      setName("");
      setPhone("");
      setAddress("");
      setCity("");
      setPostalCode("");
      setStep("email");
    }, 1000);
    setTimeout(() => {
      setSigningOut(false);
      navigate(-1);
    }, 2000);
  };

  /* ── LOGOUT OVERLAY ── */
  const LogoutOverlay = () => (
    <AnimatePresence>
      {signingOut && (
        <motion.div
          key="logout-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ backgroundColor: "#f8f5f0" }}
        >
          {/* Decorative diamond — matches your jewel motif */}
          <motion.div
            initial={{ opacity: 0, rotate: 45, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 45, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-10 h-10 border border-[#ddd2c2] flex items-center justify-center mb-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="w-3 h-3"
              style={{
                backgroundColor: "var(--color-primary, #b08d6a)",
                opacity: 0.25,
              }}
            />
          </motion.div>

          {/* Brand label */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.45 }}
            className="text-[10px] uppercase tracking-[0.45em] mb-4"
            style={{ color: "var(--color-primary, #b08d6a)", opacity: 0.7 }}
          >
            Hamdam Jewellery
          </motion.p>

          {/* Main heading */}
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.25,
              duration: 0.5,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="font-cormorant uppercase tracking-[0.18em] text-black text-4xl mb-6"
          >
            Signing Out
          </motion.h2>

          {/* Animated line sweep */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              delay: 0.4,
              duration: 0.7,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="h-px w-24 origin-left"
            style={{ backgroundColor: "#ddd2c2" }}
          />

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="text-xs text-gray-400 tracking-[0.2em] uppercase mt-6"
          >
            See you soon
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ══════════════════════════════════════════
     ACCOUNT SCREEN
  ══════════════════════════════════════════ */
  if (user && profileCompleted && step !== "profile") {
    return (
      <>
        <LogoutOverlay />
        <div className="min-h-screen bg-[#f8f5f0] pb-24 pt-32 md:pt-40 px-4">
          <div className="max-w-7xl mx-auto">
            {/* BACK */}
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate(-1)}
              className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-gray-400 hover:text-black transition mb-12"
            >
              <ArrowLeft size={15} strokeWidth={1.5} />
              Back
            </motion.button>

            <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start max-w-5xl">
              {/* LEFT — white panel like product image box */}
              <motion.div
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                className="bg-white flex flex-col items-center justify-center h-[380px] lg:h-[480px] z-10 "
              >
                {/* avatar initial */}
                <div className="w-24 h-24 border border-[#ddd2c2] flex items-center justify-center mb-6">
                  <span className="font-cormorant text-5xl text-primary uppercase">
                    {user.name?.[0] || user.email?.[0] || "U"}
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-[0.45em] text-primary/70 mb-2">
                  Hamdam Jewellery
                </p>
                <h2 className="font-cormorant uppercase tracking-[0.18em] text-black text-3xl mb-4">
                  My Account
                </h2>
                <div className="flex items-center gap-2 text-emerald-600">
                  <ShieldCheck size={16} strokeWidth={1.5} />
                  <span className="text-xs uppercase tracking-[0.25em]">
                    Verified
                  </span>
                </div>
                {successMessage && (
                  <p className="mt-4 text-xs tracking-[0.2em] uppercase text-emerald-600">
                    {successMessage}
                  </p>
                )}
              </motion.div>

              {/* RIGHT — details like product right column */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.1,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className="lg:pt-4"
              >
                <p className="text-[10px] uppercase tracking-[0.45em] text-primary/70 mb-4">
                  Profile
                </p>
                <h1 className="font-cormorant uppercase tracking-[0.18em] text-black text-4xl md:text-5xl mb-10">
                  {user.name}
                </h1>

                {/* DETAIL ROWS — matching product accordion style */}
                <div className="border-t border-[#ddd2c2]">
                  {[
                    { label: "Email Address", value: user.email },
                    { label: "Mobile Number", value: user.phone },
                    { label: "Address", value: user.address },
                    { label: "City", value: user.city },
                    ...(user.postalCode
                      ? [{ label: "Postal Code", value: user.postalCode }]
                      : []),
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between items-start py-5 border-b border-[#ddd2c2] gap-6"
                    >
                      <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400 shrink-0 mt-0.5">
                        {row.label}
                      </span>
                      <span className="text-sm text-gray-800 text-right">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ACTIONS */}
                <div className="mt-10 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setEditingProfile(true);
                      setStep("profile");
                    }}
                    className={
                      BTN_OUTLINE +
                      " border-primary text-primary hover:bg-primary hover:text-white flex-1"
                    }
                  >
                    <Pencil size={15} strokeWidth={1.5} />
                    Edit Information
                  </button>
                  <button
                    onClick={logout}
                    disabled={signingOut}
                    className={BTN_PRIMARY + " flex-1"}
                  >
                    {signingOut ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <LogOut size={15} strokeWidth={1.5} /> Sign Out
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ══════════════════════════════════════════
     LOGIN / PROFILE SCREEN
  ══════════════════════════════════════════ */
  const isProfile = step === "profile";
  const screenTitle = isProfile
    ? editingProfile
      ? "Edit Profile"
      : "Complete Profile"
    : step === "otp"
      ? "Verify Email"
      : "Sign In";
  const screenSub = isProfile
    ? "Manage your delivery information for a seamless shopping experience."
    : step === "otp"
      ? `We sent a 6-digit code to ${email}`
      : "Continue securely using your email address.";

  return (
    <div className="min-h-screen bg-[#f8f5f0] pb-24 pt-32 md:pt-40 px-4">
      <div className="max-w-7xl mx-auto">
        {/* BACK */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-gray-400 hover:text-black transition mb-12"
        >
          <ArrowLeft size={15} strokeWidth={1.5} />
          Back
        </motion.button>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center max-w-5xl">
          {/* LEFT — white panel */}
          <motion.div
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="hidden lg:flex bg-white z-10 flex-col items-center justify-center h-[520px]"
          >
            <p className="text-[10px] uppercase tracking-[0.45em] text-primary/70 mb-5">
              Hamdam Jewellery
            </p>
            <h2 className="font-cormorant uppercase tracking-[0.18em] text-black text-4xl text-center px-8 mb-6 leading-tight">
              {screenTitle}
            </h2>
            <div className="w-8 h-px bg-[#ddd2c2] mb-6" />
            <p className="text-xs text-gray-400 tracking-wide text-center px-10 leading-relaxed">
              {screenSub}
            </p>
            {/* decorative jewel icon */}
            <div className="mt-10 w-10 h-10 border border-[#ddd2c2] rotate-45 flex items-center justify-center">
              <div className="w-3 h-3 bg-primary/20 rotate-0" />
            </div>
          </motion.div>

          {/* RIGHT — form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.1,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="lg:pt-4"
          >
            {/* MOBILE HEADER */}
            <div className="lg:hidden mb-8">
              <p className="text-[10px] uppercase tracking-[0.45em] text-primary/70 mb-3">
                Hamdam Jewellery
              </p>
              <h1 className="font-cormorant uppercase tracking-[0.18em] text-black text-4xl">
                {screenTitle}
              </h1>
              <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                {screenSub}
              </p>
            </div>

            {/* ── EMAIL STEP ── */}
            <AnimatePresence mode="wait">
              {step === "email" && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-3">
                      Email Address
                    </p>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                        // live format check once user has typed something
                        const v = e.target.value;
                        if (
                          v.length > 3 &&
                          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
                        ) {
                          setEmailError(
                            "Please enter a valid email — e.g. name@example.com",
                          );
                        }
                      }}
                      onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                      className={INPUT + (emailError ? " border-red-400" : "")}
                    />
                    {emailError ? (
                      <p className="text-red-500 text-xs mt-2 tracking-wide">
                        {emailError}
                      </p>
                    ) : email.length > 3 &&
                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? (
                      <p className="text-emerald-500 text-xs mt-2 tracking-wide">
                        Valid email ✓
                      </p>
                    ) : null}
                  </div>
                  <button
                    onClick={sendOtp}
                    disabled={loading}
                    className={BTN_PRIMARY}
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Mail size={15} strokeWidth={1.5} /> Send Verification
                        Code <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {/* ── OTP STEP ── */}
              {step === "otp" && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-3">
                      6-digit Code
                    </p>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="· · · · · ·"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                        setOtpError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
                      className={
                        INPUT + " text-center tracking-[0.6em] text-xl"
                      }
                    />
                    {otpError && (
                      <p className="text-red-500 text-xs mt-2 tracking-wide">
                        {otpError}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={verifyOtp}
                    disabled={loading}
                    className={BTN_PRIMARY}
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Verify Code"
                    )}
                  </button>

                  {/* change email */}
                  <button
                    onClick={() => {
                      setStep("email");
                      setOtp("");
                      setOtpError("");
                    }}
                    className="w-full text-xs text-gray-400 hover:text-black tracking-[0.2em] uppercase transition pt-1"
                  >
                    ← Change Email Address
                  </button>

                  {/* resend */}
                  <div className="text-center">
                    {canResend ? (
                      <button
                        onClick={sendOtp}
                        disabled={loading}
                        className="text-xs text-primary uppercase tracking-[0.2em] hover:opacity-70 transition"
                      >
                        Resend Code
                      </button>
                    ) : (
                      <p className="text-xs text-gray-400 tracking-[0.15em]">
                        Resend in{" "}
                        <span className="text-gray-600">{resendTimer}s</span>
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── PROFILE STEP ── */}
              {step === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* locked email */}
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-3">
                      Email Address
                    </p>
                    <input
                      value={user?.email || email}
                      disabled
                      className={
                        INPUT + " bg-[#f8f5f0] text-gray-400 cursor-not-allowed"
                      }
                    />
                  </div>

                  {/* FULL NAME */}
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-3">
                      Full Name *
                    </p>
                    <input
                      placeholder="e.g. Ayesha Khan"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        clearField("name");
                      }}
                      className={
                        INPUT + (fieldErrors.name ? " border-red-400" : "")
                      }
                    />
                    {fieldErrors.name && (
                      <p className="text-red-500 text-xs mt-1.5 tracking-wide">
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  {/* MOBILE NUMBER */}
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-3">
                      Mobile Number *
                    </p>
                    <input
                      placeholder="03001234567"
                      value={phone}
                      maxLength={11}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        setPhone(val);
                        // live validation
                        if (val.length > 0) {
                          const err = validatePhone(val);
                          setFieldErrors((p) => ({ ...p, phone: err }));
                        } else {
                          clearField("phone");
                        }
                      }}
                      className={
                        INPUT + (fieldErrors.phone ? " border-red-400" : "")
                      }
                    />
                    {fieldErrors.phone ? (
                      <p className="text-red-500 text-xs mt-1.5 tracking-wide">
                        {fieldErrors.phone}
                      </p>
                    ) : phone.length > 0 && !validatePhone(phone) ? (
                      <p className="text-emerald-500 text-xs mt-1.5 tracking-wide">
                        Looks good ✓
                      </p>
                    ) : (
                      <p className="text-gray-400 text-[10px] mt-1.5 tracking-wide">
                        Must start with 03 · exactly 11 digits
                      </p>
                    )}
                  </div>

                  {/* ADDRESS */}
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-3">
                      Delivery Address *
                    </p>
                    <input
                      placeholder="Street, area, landmark..."
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        clearField("address");
                      }}
                      className={
                        INPUT + (fieldErrors.address ? " border-red-400" : "")
                      }
                    />
                    {fieldErrors.address && (
                      <p className="text-red-500 text-xs mt-1.5 tracking-wide">
                        {fieldErrors.address}
                      </p>
                    )}
                  </div>

                  {/* CITY */}
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-3">
                      City *
                    </p>
                    <input
                      placeholder="e.g. Lahore"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        clearField("city");
                      }}
                      className={
                        INPUT + (fieldErrors.city ? " border-red-400" : "")
                      }
                    />
                    {fieldErrors.city && (
                      <p className="text-red-500 text-xs mt-1.5 tracking-wide">
                        {fieldErrors.city}
                      </p>
                    )}
                  </div>

                  {/* POSTAL CODE */}
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-3">
                      Postal Code{" "}
                      <span className="normal-case">(Optional)</span>
                    </p>
                    <input
                      placeholder="e.g. 54000"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className={INPUT}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={saveProfile}
                      disabled={loading}
                      className={BTN_PRIMARY + " flex-1"}
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          <Save size={15} strokeWidth={1.5} /> Save Profile
                        </>
                      )}
                    </button>
                    {editingProfile && (
                      <button
                        onClick={() => {
                          setEditingProfile(false);
                          setStep("account");
                        }}
                        className="w-14 h-14 border border-[#ddd2c2] flex items-center justify-center hover:border-black transition"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  {!editingProfile && (
                    <button
                      onClick={() => window.history.back()}
                      className="w-full text-xs text-gray-400 hover:text-black tracking-[0.2em] uppercase transition pt-1"
                    >
                      Skip For Now
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
