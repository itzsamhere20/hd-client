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
} from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  /* ===================================================
     STATES
  =================================================== */
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

  const [signingOut, setSigningOut] = useState(false);
  /* ===================================================
     SILVER JEWELLERY IMAGES
  =================================================== */
  const luxuryImages = [
    "https://img.sanishtech.com/u/8613714bc1ae8c358c985a4be386e70e.webp",
    "https://img.sanishtech.com/u/a1c6865728844bb4c4ed6a35329443c8.jpg",
    "https://img.sanishtech.com/u/3517dc5536903cd3390ebfa369eb8291.webp",
    "https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=80&w=1200&auto=format&fit=crop",
    "https://img.sanishtech.com/u/ea15727b08c6d5cd36579a465f1e2cc1.webp",
  ];

  /* ===================================================
     PROFILE CHECK
  =================================================== */
  const profileCompleted = useMemo(() => {
    return user?.name && user?.phone && user?.address && user?.city;
  }, [user]);

  /* ===================================================
     LOAD USER
  =================================================== */
  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);

      setUser(parsedUser);

      setName(parsedUser.name || "");
      setPhone(parsedUser.phone || "");
      setAddress(parsedUser.address || "");
      setCity(parsedUser.city || "");
      setPostalCode(parsedUser.postalCode || "");

      const completed =
        parsedUser.name &&
        parsedUser.phone &&
        parsedUser.address &&
        parsedUser.city;

      if (!completed) {
        setStep("profile");
      }
    }
  }, []);

  /* ===================================================
      Resend otp TIMER
  =================================================== */
  useEffect(() => {
    let interval;

    if (step === "otp") {
      setCanResend(false);
      setResendTimer(30);

      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [step]);

  /* ===================================================
     EMAIL VALIDATION
  =================================================== */
  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  /* ===================================================
     SEND OTP
  =================================================== */
  const sendOtp = async () => {
    setEmailError("");

    if (!email.trim()) {
      return setEmailError("Email address is required");
    }

    if (!validateEmail(email)) {
      return setEmailError("Please enter a valid email address");
    }

    try {
      setLoading(true);

      await api.post("/user/send-otp", {
        email,
      });

      setStep("otp");
      // reset timer when OTP is sent
      setResendTimer(30);
      setCanResend(false);
    } catch (err) {
      setEmailError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ===================================================
     VERIFY OTP
  =================================================== */
  const verifyOtp = async () => {
    setOtpError("");

    if (!otp.trim()) {
      return setOtpError("OTP is required");
    }

    try {
      setLoading(true);

      const res = await api.post("/user/verify-otp", {
        email,
        otp,
      });

      localStorage.setItem("token", res.data.token);

      localStorage.setItem("user", JSON.stringify(res.data.user));

      setUser(res.data.user);
      window.dispatchEvent(new Event("authUpdated"));

      setName(res.data.user.name || "");
      setPhone(res.data.user.phone || "");
      setAddress(res.data.user.address || "");
      setCity(res.data.user.city || "");
      setPostalCode(res.data.user.postalCode || "");

      if (!res.data.profileCompleted) {
        setStep("profile");
      } else {
        window.history.back();
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ===================================================
     SAVE PROFILE
  =================================================== */
  const saveProfile = async () => {
    setProfileError("");
    setSuccessMessage("");

    if (!name.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      return setProfileError("Please fill all required fields");
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await api.put(
        "/user/update-profile",
        {
          name,
          phone,
          address,
          city,
          postalCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.dispatchEvent(new Event("authUpdated"));
      setUser(res.data.user);
      setSuccessMessage("Profile updated successfully");
      setEditingProfile(false);
      setStep("account");

      if (!profileCompleted) {
        setTimeout(() => {
          window.history.back();
        }, 1000);
      }
    } catch (err) {
      setProfileError(
        err.response?.data?.message || "Failed to update profile",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ===================================================
     SIGN OUT
  =================================================== */
  const logout = async () => {
    setSigningOut(true);

    // 2s luxury exit animation delay
    setTimeout(() => {
      window.dispatchEvent(new Event("authUpdated"));
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem(`ORDERS_CACHE_${userId}`);
      setUser(null);

      setEmail("");
      setOtp("");

      setName("");
      setPhone("");
      setAddress("");
      setCity("");
      setPostalCode("");

      setStep("email");

      setSigningOut(false);
    }, 2000);
    navigate(-1);
  };

  /* ===================================================
     ACCOUNT SCREEN
  =================================================== */
  if (user && profileCompleted && step !== "profile") {
    return (
      <div className="relative min-h-screen   flex items-center justify-center px-4 py-10 flex-col pt-20">
        {/* BACK BUTTON */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate(-1)}
          className="
    inline-flex items-center gap-3
    text-xs uppercase tracking-[0.25em]
    text-gray-500 hover:text-black  w-full max-w-6xl
    mb-10 min-h-28
  "
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>

        {/* CARD */}
        <div
          className="
            relative
            z-10
            w-full
            max-w-md
            bg-white/90
            backdrop-blur-md
            rounded-md
            border
            border-[#ede7dd]
            p-8
            shadow-[0_15px_60px_rgba(0,0,0,0.08)]
          "
        >
          {/* HEADER */}
          <div className="text-center">
            <p
              className="
                text-[11px]
                tracking-[0.45em]
                uppercase
                text-neutral-400
                font-luxury
              "
            >
              Hamdam Jewellery
            </p>

            <h1
              className="
                mt-5
                text-5xl
                leading-none
                font-cormorant
                text-[#1a1a1a]
              "
            >
              Account
            </h1>

            <div className="mt-5 flex items-center justify-center gap-2 text-emerald-600">
              <ShieldCheck size={18} />

              <span className="text-sm">Verified Account</span>
            </div>
          </div>

          {/* USER DETAILS */}
          <div className="mt-10 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-2">
                Email Address
              </p>

              <p className="text-[15px] text-neutral-700 break-all">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-2">
                Full Name
              </p>

              <p className="text-[15px] text-neutral-700">{user.name}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-2">
                Mobile Number
              </p>

              <p className="text-[15px] text-neutral-700">{user.phone}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-2">
                Address
              </p>

              <p className="text-[15px] text-neutral-700">{user.address}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-2">
                City
              </p>

              <p className="text-[15px] text-neutral-700">{user.city}</p>
            </div>
            {successMessage && (
              <p className="text-emerald-600 text-sm">{successMessage}</p>
            )}
          </div>

          {/* ACTIONS */}
          <div className="mt-10 space-y-3">
            <button
              onClick={() => {
                setEditingProfile(true);
                setStep("profile");
              }}
              className="
                w-full
                h-14
                rounded-sm
                border
                border-primary
                text-primary
                uppercase
                tracking-[0.25em]
                text-sm
                flex
                items-center
                justify-center
                gap-3
                hover:bg-primary
                hover:text-white
                transition-all
              "
            >
              <Pencil size={18} />
              Edit Information
            </button>
            <button
              onClick={logout}
              disabled={signingOut}
              className="
    w-full
    h-14
    
    bg-primary
    text-white
    uppercase
    tracking-[0.25em]
    text-sm
    flex
    items-center
    justify-center
    gap-3
    transition-all
    duration-300
    hover:opacity-90
    disabled:opacity-70
  "
            >
              {signingOut ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <LogOut size={18} />
                  Sign Out
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden  flex items-center justify-center px-4 py-10 flex-col">
      {/* BACK BUTTON */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => navigate(-1)}
        className="
    inline-flex items-center gap-3
    text-xs uppercase tracking-[0.25em]
    text-gray-500 hover:text-black
    mb-10 w-full max-w-6xl 
  "
      >
        <ArrowLeft size={16} />
        Back
      </motion.button>
      {/* MAIN CARD */}
      <div
        className="
          relative
          z-10
          w-full
          max-w-md
          bg-white/90
          backdrop-blur-md
          rounded-md
          border
          border-[#ede7dd]
          p-7
          md:p-10
          shadow-[0_15px_60px_rgba(0,0,0,0.08)]
        "
      >
        {/* HEADER */}
        <div className="text-center">
          <p
            className="
              text-[11px]
              uppercase
              tracking-[0.45em]
              text-neutral-400
              font-luxury
            "
          >
            Hamdam Jewellery
          </p>

          <h1
            className="
              mt-5
              text-5xl
              leading-none
              text-[#1a1a1a]
              font-cormorant
            "
          >
            {step === "profile"
              ? editingProfile
                ? "Edit Profile"
                : "Complete Profile"
              : "Sign Up"}
          </h1>

          <p className="mt-4 text-sm text-neutral-500 leading-relaxed">
            {step === "profile"
              ? "Manage your delivery information for a seamless luxury shopping experience."
              : "Continue securely using your email address."}
          </p>
        </div>

        {/* EMAIL STEP */}
        {step === "email" && (
          <div className="mt-10">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full
                h-14
                px-5
                rounded-md
                border
                border-[#e7dfd3]
                outline-none
                focus:border-primary
              "
            />

            {emailError && (
              <p className="text-red-500 text-sm mt-2">{emailError}</p>
            )}

            <button
              onClick={sendOtp}
              disabled={loading}
              className="
                mt-5
                w-full
                h-14
                rounded-
                bg-primary
                text-white
                uppercase
                tracking-[0.25em]
                text-sm
                flex
                items-center
                justify-center
                gap-2
              "
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Send OTP
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        )}

        {/* OTP STEP */}
        {step === "otp" && (
          <div className="mt-10">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="
        w-full
        h-14
        px-5
        rounded-md
        border
        border-[#e7dfd3]
        outline-none
        focus:border-primary
        text-center
        tracking-[0.5em]
        text-lg
      "
            />

            {otpError && (
              <p className="text-red-500 text-sm mt-2">{otpError}</p>
            )}

            <button
              onClick={verifyOtp}
              disabled={loading}
              className="
        mt-5
        w-full
        h-14
        rounded-none
        bg-primary
        text-white
        uppercase
        tracking-[0.25em]
        text-sm
        flex
        items-center
        justify-center
        gap-2
      "
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Verify OTP"
              )}
            </button>

            {/* ✅ CHANGE EMAIL OPTION */}
            <button
              onClick={() => {
                setStep("email");
                setOtp("");
                setOtpError("");
              }}
              className="
        w-full
        mt-5
        text-sm
        text-neutral-500
        hover:text-black
        transition
        font-light
        tracking-wide
      "
            >
              Change Email Address
            </button>
            {/* -------resend btn -------------- */}
            <button
              onClick={sendOtp}
              disabled={!canResend || loading}
              className={`
    w-full
    mt-2
    text-xs
    tracking-[0.2em]
    transition
    ${
      canResend
        ? "text-neutral-500 hover:text-black"
        : "text-neutral-300 cursor-not-allowed"
    }
  `}
            >
              {canResend ? "Resend OTP" : `Resend in ${resendTimer}s`}
            </button>
          </div>
        )}

        {/* PROFILE STEP */}
        {step === "profile" && (
          <div className="mt-10 space-y-4">
            {/* EMAIL LOCKED */}
            <input
              value={user?.email || email}
              disabled
              className="
                w-full
                h-14
                px-5
                rounded-md
                border
                border-[#e7dfd3]
                bg-[#f7f7f7]
                text-neutral-500
                cursor-not-allowed
              "
            />

            <input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="
                w-full
                h-14
                px-5
                rounded-md
                border
                border-[#e7dfd3]
                outline-none
                focus:border-primary
              "
            />

            <input
              placeholder="Mobile Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="
                w-full
                h-14
                px-5
                rounded-md
                border
                border-[#e7dfd3]
                outline-none
                focus:border-primary
              "
            />

            <input
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="
                w-full
                h-14
                px-5
                rounded-md
                border
                border-[#e7dfd3]
                outline-none
                focus:border-primary
              "
            />

            <input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="
                w-full
                h-14
                px-5
                rounded-md
                border
                border-[#e7dfd3]
                outline-none
                focus:border-primary
              "
            />

            <input
              placeholder="Postal Code (Optional)"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="
                w-full
                h-14
                px-5
                rounded-md
                border
                border-[#e7dfd3]
                outline-none
                focus:border-primary
              "
            />

            {profileError && (
              <p className="text-red-500 text-sm">{profileError}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={saveProfile}
                disabled={loading}
                className="
                  flex-1
                  h-14
                
                  bg-primary
                  text-white
                  uppercase
                  tracking-[0.25em]
                  text-sm
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Save size={18} />
                    Save
                  </>
                )}
              </button>

              {editingProfile && (
                <button
                  onClick={() => {
                    setEditingProfile(false);
                    setStep("email");
                  }}
                  className="
                    w-14
                    h-14
                
                    border
                    border-[#e7dfd3]
                    flex
                    items-center
                    justify-center
                  "
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {!editingProfile && (
              <button
                onClick={() => window.history.back()}
                className="
                  w-full
                  text-sm
                  text-neutral-500
                  pt-1
                "
              >
                Skip For Now
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
