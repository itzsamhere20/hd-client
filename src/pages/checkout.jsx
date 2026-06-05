import { useEffect, useMemo, useState } from "react";
import api from "../components/api";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Loader2,
  Pencil,
  ShieldCheck,
  Wallet,
  X,
  PartyPopper,
  BadgeCheck,
} from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  /* =========================================================
     STEP
  ========================================================= */
  const [step, setStep] = useState(1);

  /* =========================================================
     AUTH
  ========================================================= */
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");

  const [loading, setLoading] = useState(false);

  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  /* =========================================================
     USER
  ========================================================= */
  const [user, setUser] = useState(null);

  /* =========================================================
     PROFILE
  ========================================================= */
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [errors, setErrors] = useState({});
  const [errorModal, setErrorModal] = useState({
    open: false,
    title: "",
    message: "",
  });

  const [successModal, setSuccessModal] = useState({
    open: false,
    orderId: "",
  });

  /* =========================================================
     MODAL
  ========================================================= */
  const [editOpen, setEditOpen] = useState(false);

  /* =========================================================
     PAYMENT
  ========================================================= */
  const [paymentMethod, setPaymentMethod] = useState("COD");

  /* =========================================================
     ORDER
  ========================================================= */
  const [placingOrder, setPlacingOrder] = useState(false);

  /* =========================================================
     PRODUCTS
  ========================================================= */
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const products = useMemo(() => {
    const source = location.state?.buyNow ? location.state.items : cart;

    return source.map((p) => ({
      ...p,
      price: Number(p.price || 0),
      quantity: Number(p.quantity || p.qty || 1),
    }));
  }, [location.state, cart]);
  /* =========================================================
     TOTAL
  ========================================================= */
  const subtotal = useMemo(() => {
    return products.reduce((acc, p) => acc + p.price * p.quantity, 0);
  }, [products]);

  const formatPrice = (price) => Number(price || 0).toLocaleString("en-PK");

  /* =========================================================
     LOAD USER
  ========================================================= */
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (!savedUser) return;

    setUser(savedUser);

    setEmail(savedUser.email || "");

    setName(savedUser.name || "");
    setPhone(savedUser.phone || "");
    setAddress(savedUser.address || "");
    setCity(savedUser.city || "");
    setPostalCode(savedUser.postalCode || "");

    const completed =
      savedUser.name && savedUser.phone && savedUser.address && savedUser.city;

    if (completed) {
      setStep(4);
    } else {
      setStep(3);
    }
  }, []);

  /* =========================================================
     OTP TIMER
  ========================================================= */
  useEffect(() => {
    let interval;

    if (step === 2) {
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

  /* =========================================================
     EMAIL VALIDATION
  ========================================================= */
  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  /* =========================================================
     SEND OTP
  ========================================================= */
  const sendOtp = async () => {
    setEmailError("");

    if (!email.trim()) {
      return setEmailError("Email address is required");
    }

    if (!validateEmail(email)) {
      return setEmailError("Please enter a valid email");
    }

    try {
      setLoading(true);

      await api.post("/user/send-otp", {
        email,
      });

      setStep(2);
    } catch (err) {
      setEmailError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     VERIFY OTP
  ========================================================= */
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
      window.dispatchEvent(new Event("authUpdated"));
      setUser(res.data.user);

      setName(res.data.user.name || "");
      setPhone(res.data.user.phone || "");
      setAddress(res.data.user.address || "");
      setCity(res.data.user.city || "");
      setPostalCode(res.data.user.postalCode || "");

      const completed =
        res.data.user.name &&
        res.data.user.phone &&
        res.data.user.address &&
        res.data.user.city;

      if (completed) {
        setStep(4);
      } else {
        setStep(3);
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     VALIDATE PROFILE
  ========================================================= */
  const validateProfile = () => {
    let e = {};

    if (!name.trim()) {
      e.name = "Name cannot be empty";
    }

    if (!phone.trim()) {
      e.phone = "Phone number is required";
    } else if (!/^03\d{9}$/.test(phone)) {
      e.phone = "Phone must start with 03 and be 11 digits";
    }

    if (!address.trim()) {
      e.address = "Address cannot be empty";
    }

    if (!city.trim()) {
      e.city = "City cannot be empty";
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  /* =========================================================
     SAVE PROFILE
  ========================================================= */
  const saveProfile = async () => {
    if (!validateProfile()) return;

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
      window.dispatchEvent(new Event("authUpdated"));

      setEditOpen(false);

      setStep(4);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     PLACE ORDER
  ========================================================= */
  const placeOrder = async () => {
    try {
      setPlacingOrder(true);

      const token = localStorage.getItem("token");
      console.log("PRODUCTS BEING SENT:", products);

      const res = await api.post(
        "/orders/create",
        {
          items: products.map((p) => ({
            productId: p.id,
            quantity: p.quantity,
            size: p.size || p.selectedSize || "",
            price: p.price,
            image: p.image,
            name: p.name,
          })),
          paymentMethod,
          shippingFee,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSuccessModal({
        open: true,
        orderId: res.data.order.orderId,
      });
      if (!location.state?.buyNow) {
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (err) {
      console.log("ORDER ERROR FULL:", err.response?.data || err.message);

      const msg =
        err.response?.data?.message ||
        "Something went wrong while placing order";

      // smarter mapping (UX level)
      let title = "Order Failed";

      if (msg.toLowerCase().includes("stock")) {
        title = "Out of Stock";
      } else if (msg.toLowerCase().includes("profile")) {
        title = "Missing Information";
      } else if (msg.toLowerCase().includes("product")) {
        title = "Product Issue";
      }

      showError(title, msg);
    } finally {
      setPlacingOrder(false);
    }
  };
  /* =========================================================
   SHIPPING SETTINGS
========================================================= */

  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: 0,
    shippingFee: 0,
  });

  const [shippingLoading, setShippingLoading] = useState(true);

  /* =========================================================
   FETCH SHIPPING SETTINGS
========================================================= */
  useEffect(() => {
    fetchShippingSettings();
  }, []);

  const fetchShippingSettings = async () => {
    try {
      setShippingLoading(true);

      const res = await api.get("/settings/shipping");

      setShippingSettings({
        freeShippingThreshold: Number(res.data.freeShippingThreshold),

        shippingFee: Number(res.data.shippingFee),
      });
    } catch (err) {
      console.log(err);
    } finally {
      setShippingLoading(false);
    }
  };

  /* =========================================================
   SHIPPING CALCULATIONS
========================================================= */

  const FREE_SHIPPING_THRESHOLD = shippingSettings.freeShippingThreshold;

  const DEFAULT_SHIPPING_FEE = shippingSettings.shippingFee;

  const shippingFee =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE;

  const totalAmount = subtotal + shippingFee;

  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  const progressPercentage = Math.min(
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
    100,
  );

  /*=================================================================================
                      Fetch bank details
  ==================================================================================*/
  const DEFAULT_BANK = {
    bankName: "UBL",
    accountTitle: "Hamdam Jewellery",
    accountNumber: "1726278656091",
    whatsapp: "03425411173",
  };

  const [bankDetails, setBankDetails] = useState(DEFAULT_BANK);

  useEffect(() => {
    const fetchBank = async () => {
      try {
        const res = await api.get("/settings/store/bank");

        setBankDetails({
          bankName: res.data?.bankName || DEFAULT_BANK.bankName,
          accountTitle: res.data?.accountTitle || DEFAULT_BANK.accountTitle,
          accountNumber: res.data?.accountNumber || DEFAULT_BANK.accountNumber,
          whatsapp: res.data?.whatsapp || DEFAULT_BANK.whatsapp,
        });
      } catch (err) {
        console.log("Bank API failed → fallback used");
        setBankDetails(DEFAULT_BANK);
      }
    };

    fetchBank();
  }, []);
  /* =========================================================
     MASK EMAIL
  ========================================================= */
  const maskEmail = (email) => {
    if (!email) return "";

    const [namePart, domain] = email.split("@");

    return namePart.slice(0, 3) + "****" + namePart.slice(-2) + "@" + domain;
  };
  /* =========================================================  
    Error handler
  ========================================================= */
  const showError = (title, message) => {
    setErrorModal({
      open: true,
      title,
      message,
    });
  };

  // -------aanimation-----------------------------
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  /* =========================================================
     STEPPER
  ========================================================= */
  const Stepper = () => {
    const steps = ["Email", "Verification", "Profile", "Checkout"];

    return (
      <div className=" hidden md:block mb-10">
        <div className="flex items-center justify-between gap-4 overflow-x-auto">
          {steps.map((item, i) => {
            const isLast = i === steps.length - 1;

            return (
              <div key={i} className="flex-1 min-w-[120px]">
                {/* STEP ROW */}
                <div className="flex items-center gap-3">
                  {/* STEP NUMBER */}
                  <div
                    className={`
                w-10 h-10 flex items-center justify-center text-sm
                transition-all duration-300
                ${
                  step >= i + 1
                    ? "bg-primary text-white"
                    : "bg-white border border-[#e8e1d7] text-neutral-400"
                }
              `}
                  >
                    {i + 1}
                  </div>

                  {/* CONNECTOR LINE (HIDDEN AFTER LAST STEP) */}
                  {!isLast && (
                    <div className="flex-1 h-[2px] bg-[#ece7df] relative overflow-hidden">
                      <div
                        className={`
                    absolute inset-y-0 left-0 bg-primary
                    transition-all duration-500
                    ${step > i + 1 ? "w-full" : "w-0"}
                  `}
                      />
                    </div>
                  )}
                </div>

                {/* LABEL (LEFT ALIGNED) */}
                <p className="mt-3 text-xs tracking-[0.25em] uppercase text-neutral-500">
                  {item}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="min-h-screen pt-24 md:pt-40 pb-20 px-4 md:px-8"
    >
      <div className="max-w-7xl mx-auto ">
        {/* STEPPER */}
        <Stepper />

        <motion.div
          variants={pageVariants}
          className="grid lg:grid-cols-[1fr_420px] gap-8"
        >
          {/* =========================================================
              LEFT
          ========================================================= */}

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {/* =========================================================
                EMAIL STEP
            ========================================================= */}

              {step === 1 && (
                <motion.div
                  variants={cardVariants}
                  className="relative bg-white rounded-md border border-[#ece7df] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] z-[9]"
                >
                  <div className="flex w-full justify-between">
                    <p className="text-[11px] tracking-[0.45em] uppercase text-neutral-400">
                      Hamdam Jewellery
                    </p>
                  </div>
                  <h1 className="mt-4 text-5xl font-cormorant">
                    Secure Checkout
                  </h1>
                  <p className="mt-4 text-neutral-500 leading-relaxed">
                    Continue securely using your email address.
                  </p>
                  <div className="mt-10">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className="
                      w-full
                      h-14
                      px-5
                      rounded-md
                      border
                      border-[#e8e1d7]
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
                      
                      bg-primary
                      text-white
                      uppercase
                      tracking-[0.25em]
                      text-sm
                      flex
                      items-center
                      justify-center
                      gap-2
                      disabled:opacity-70
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
                </motion.div>
              )}

              {/* =========================================================
                OTP STEP
            ========================================================= */}
              {step === 2 && (
                <motion.div
                  variants={cardVariants}
                  className="relative bg-white rounded-md border border-[#ece7df] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-primary " />

                    <p className="text-[11px] tracking-[0.45em] uppercase text-neutral-400">
                      Verification
                    </p>
                  </div>

                  <h2 className="mt-2 text-5xl font-cormorant">Enter OTP</h2>

                  <p className="mt-4 text-neutral-500">
                    We sent a verification code to{" "}
                    <span className="text-black">{email}</span>
                  </p>

                  <div className="mt-10">
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      className="
                      w-full
                      h-16
                      px-5
                      rounded-md
                      border
                      border-[#e8e1d7]
                      text-center
                      tracking-[0.5em]
                      text-lg
                      outline-none
                      focus:border-primary
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
                      disabled:opacity-70
                    "
                    >
                      {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        "Verify OTP"
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setStep(1);
                        setOtp("");
                        setOtpError("");
                      }}
                      className="
                      mt-5
                      w-full
                      text-sm
                      text-neutral-500
                    "
                    >
                      Change Email Address
                    </button>

                    <button
                      onClick={sendOtp}
                      disabled={!canResend || loading}
                      className={`
                      mt-2
                      w-full
                      text-xs
                      tracking-[0.25em]
                      uppercase
                      ${canResend ? "text-primary" : "text-neutral-300"}
                    `}
                    >
                      {canResend ? "Resend OTP" : `Resend in ${resendTimer}s`}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* =========================================================
                PROFILE STEP
            ========================================================= */}
              {step === 3 && (
                <motion.div
                  variants={cardVariants}
                  className="relative bg-white rounded-md border border-[#ece7df] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)]"
                >
                  <p className="text-[11px] tracking-[0.45em] uppercase text-neutral-400">
                    Delivery Information
                  </p>

                  <h2 className="mt-4 text-5xl font-cormorant">
                    Complete Profile
                  </h2>
                  {/* ------name and number------ */}

                  <div className="mt-10 space-y-4">
                    <div className=" flex gap-5 w-full">
                      <div className="w-1/2">
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Full Name"
                          className="
                        w-full
                        h-14
                        px-5
                        rounded-md
                        border
                        border-[#ece7df]
                        outline-none
                        focus:border-primary
                      "
                        />
                      </div>

                      {errors.name && (
                        <p className="text-red-500 text-xs mt-2">
                          {errors.name}
                        </p>
                      )}
                      <div className="w-1/2">
                        <input
                          type="number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="03XXXXXXXXX"
                          className="
                        w-full
                        h-14
                        px-5
                        rounded-md
                        border
                        border-[#ece7df]
                        outline-none
                        focus:border-primary
                      "
                        />

                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-2">
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* ------------address and city---------------- */}

                    <div className="flex w-full gap-5">
                      <div className="w-2/3">
                        <input
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Address"
                          className="
                        w-full
                        h-14
                        px-5
                        rounded-md
                        border
                        border-[#ece7df]
                        outline-none
                        focus:border-primary
                      "
                        />

                        {errors.address && (
                          <p className="text-red-500 text-xs mt-2">
                            {errors.address}
                          </p>
                        )}
                      </div>

                      <div className="w-1/3">
                        <input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City"
                          className="
                        w-full
                        h-14
                        px-5
                        rounded-md
                        border
                        border-[#ece7df]
                        outline-none
                        focus:border-primary
                      "
                        />

                        {errors.city && (
                          <p className="text-red-500 text-xs mt-2">
                            {errors.city}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* -----------postal code------- */}

                    <input
                      value={postalCode}
                      type="number"
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="Postal Code (Optional)"
                      className="
                      w-full
                      h-14
                      px-5
                      rounded-md
                      border
                      border-[#ece7df]
                      outline-none
                      focus:border-primary
                    "
                    />

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={saveProfile}
                        disabled={loading}
                        className="
                        flex-1
                        h-14
                        rounded-md
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
                          "Save & Continue"
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* =========================================================
                CHECKOUT STEP
            ========================================================= */}
              {step === 4 && (
                <>
                  {/* PROFILE */}
                  <motion.div
                    variants={cardVariants}
                    className="relative bg-white rounded-md border border-[#ece7df] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)]"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] tracking-[0.45em] uppercase text-neutral-400">
                          Customer
                        </p>

                        <h2 className="mt-2 text-5xl font-cormorant">
                          Profile
                        </h2>
                      </div>

                      <button
                        onClick={() => setEditOpen(true)}
                        className="
                        h-12
                        px-5
                        rounded-md
                        border
                        border-[#ece7df]
                        flex
                        items-center
                        gap-2
                        hover:border-primary
                        hover:text-primary
                        transition-all
                      "
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                    </div>

                    <div className="mt-10 grid md:grid-cols-2 gap-8">
                      <div>
                        <p className="text-xs tracking-[0.25em] uppercase text-neutral-400 ">
                          Full Name
                        </p>

                        <p className="mt-2 text-[15px] capitalize">
                          {user?.name}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs tracking-[0.25em] uppercase text-neutral-400">
                          Email
                        </p>

                        <p className="mt-2 text-[15px]">
                          {maskEmail(user?.email)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs tracking-[0.25em] uppercase text-neutral-400">
                          Mobile Number
                        </p>

                        <p className="mt-2 text-[15px]">{user?.phone}</p>
                      </div>

                      <div>
                        <p className="text-xs tracking-[0.25em] uppercase text-neutral-400">
                          Address
                        </p>

                        <p className="mt-2 text-[15px] leading-relaxed">
                          {`${user?.address}, ${user?.city}${postalCode ? `, ${postalCode}` : ""}`}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* PAYMENT */}
                  <motion.div
                    variants={cardVariants}
                    className="relative bg-white rounded-md border border-[#ece7df] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)]"
                  >
                    <div className="flex items-center gap-3">
                      <Wallet className="text-primary" />

                      <h2 className="text-5xl font-cormorant">Payment</h2>
                    </div>

                    <div className="mt-8 space-y-4">
                      {/* COD */}
                      <label
                        className={`
                        block
                        rounded-md
                        border
                        p-5
                        cursor-pointer
                        transition-all
                        ${
                          paymentMethod === "COD"
                            ? "border-primary bg-primary/5"
                            : "border-[#ece7df]"
                        }
                      `}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[15px]">Cash on Delivery</p>

                            <p className="text-xs text-neutral-500 mt-1">
                              Pay after receiving your order
                            </p>
                          </div>

                          <input
                            type="radio"
                            checked={paymentMethod === "COD"}
                            onChange={() => setPaymentMethod("COD")}
                          />
                        </div>
                      </label>

                      {/* BANK */}
                      <label
                        className={`
                        block
                        rounded-md
                        border
                        p-5
                        cursor-pointer
                        transition-all
                        ${
                          paymentMethod === "BANK"
                            ? "border-primary bg-primary/5"
                            : "border-[#ece7df]"
                        }
                      `}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[15px]">Bank Transfer</p>

                              <p className="text-xs text-neutral-500 mt-1">
                                Manual payment transfer
                              </p>
                            </div>

                            <input
                              type="radio"
                              checked={paymentMethod === "BANK"}
                              onChange={() => setPaymentMethod("BANK")}
                            />
                          </div>

                          {paymentMethod === "BANK" && (
                            <div className="mt-5 border-t pt-5">
                              <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-neutral-500">Bank</span>

                                  <span>{bankDetails.bankName}</span>
                                </div>

                                <div className="flex justify-between">
                                  <span className="text-neutral-500">
                                    Account Title
                                  </span>

                                  <span>{bankDetails.accountTitle}</span>
                                </div>

                                <div className="flex justify-between">
                                  <span className="text-neutral-500">
                                    Account Number
                                  </span>

                                  <span>{bankDetails.accountNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-neutral-500">
                                    WhatsApp
                                  </span>

                                  <span>{bankDetails.whatsapp}</span>
                                </div>
                              </div>

                              <div className="mt-5 rounded-md bg-[#faf8f5] p-4 text-xs leading-relaxed text-neutral-600">
                                Send payment screenshot on WhatsApp after
                                transfer for order confirmation.
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* =========================================================
            SUMMARY 
          ========================================================= */}
          <div>
            <motion.div
              variants={cardVariants}
              className="sticky top-24 bg-white rounded-md border border-[#ece7df] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)]"
            >
              {/* HEADER */}
              <div className="px-7 pt-7 pb-5 border-b border-dashed">
                <p className="text-[11px] tracking-[0.45em] uppercase text-neutral-400">
                  Order Summary
                </p>

                <h2 className="mt-3 text-5xl font-cormorant">Receipt</h2>

                {/* FREE SHIPPING BAR */}
                {FREE_SHIPPING_THRESHOLD > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                        Free Shipping Progress
                      </p>

                      <p className="text-[11px] text-neutral-500">
                        {Math.round(progressPercentage)}%
                      </p>
                    </div>

                    {/* BAR */}
                    <div className="h-[6px] bg-[#f1ece5] overflow-hidden rounded-full">
                      <div
                        className="
              h-full
              bg-primary
              transition-all
              duration-700
            "
                        style={{
                          width: `${progressPercentage}%`,
                        }}
                      />
                    </div>

                    {/* MESSAGE */}
                    {shippingFee > 0 ? (
                      <p className="mt-3 text-[12px] text-neutral-500 leading-relaxed">
                        Add{" "}
                        <span className="text-black font-medium">
                          PKR {formatPrice(remainingForFreeShipping)}
                        </span>{" "}
                        more to unlock free shipping.
                      </p>
                    ) : (
                      <p className="mt-3 text-[12px] text-emerald-600">
                        You unlocked free shipping.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* PRODUCTS */}
              <div className="px-7 py-6 space-y-6">
                {products.map((p, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex justify-between gap-4"
                  >
                    {/* LEFT SIDE */}
                    <div className="flex gap-4 min-w-0">
                      {/* IMAGE */}
                      <div className="w-14 h-14 rounded-md overflow-hidden border border-[#ece7df] flex-shrink-0">
                        <img
                          src={p.image || p.images?.[0]}
                          alt={p.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* INFO */}
                      <div className="min-w-0">
                        <p className="text-[15px] text-neutral-900 truncate">
                          {p.name}
                        </p>

                        <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 mt-1 flex gap-2">
                          <span className={`${p.size ? "block" : "hidden"}`}>
                            Size: {p.size}
                          </span>
                          x{p.quantity}
                        </p>
                      </div>
                    </div>

                    {/* PRICE */}
                    <p className="text-[15px] font-medium text-neutral-900 whitespace-nowrap">
                      PKR {formatPrice(p.price * p.quantity)}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* TOTALS */}
              <div className="px-7 py-6 border-t border-dashed">
                {/* SUBTOTAL */}
                <div className="flex items-center justify-between">
                  <p className="text-[14px] text-neutral-500">Subtotal</p>

                  <p className="text-[15px]">PKR {formatPrice(subtotal)}</p>
                </div>

                {/* SHIPPING */}
                <div className="flex items-center justify-between mt-4">
                  <p className="text-[14px] text-neutral-500">Shipping Fee</p>

                  {shippingFee === 0 ? (
                    <p className="text-emerald-600 text-[15px]">Free</p>
                  ) : (
                    <p className="text-[15px]">
                      PKR {formatPrice(shippingFee)}
                    </p>
                  )}
                </div>

                {/* TOTAL */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-dashed">
                  <p className="tracking-wide text-[15px]">Total</p>

                  <p className="text-3xl font-cormorant">
                    PKR {formatPrice(totalAmount)}
                  </p>
                </div>

                {/* BUTTON */}
                {step === 4 && (
                  <button
                    onClick={placeOrder}
                    disabled={placingOrder}
                    className="
            mt-6
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
            gap-2
            disabled:opacity-70
          "
                  >
                    {placingOrder ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Processing
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} />
                        Place Order
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* =========================================================
          EDIT MODAL
      ========================================================= */}
      {editOpen && (
        <div className="fixed inset-0 z-[99] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-mdoverflow-hidden border border-[#ece7df] shadow-[0_20px_80px_rgba(0,0,0,0.12)]">
            {/* HEADER */}
            <div className="px-7 py-6 border-b border-[#f1ece5] flex items-center justify-between">
              <div>
                <p className="text-[11px] tracking-[0.45em] uppercase text-neutral-400">
                  Hamdam Jewellery
                </p>

                <h2 className="mt-2 text-5xl font-cormorant">Edit Profile</h2>
              </div>

              <button
                onClick={() => setEditOpen(false)}
                className="
                  w-11
                  h-11
              
                  border
                  border-[#ece7df]
                  flex
                  items-center
                  justify-center
                "
              >
                <X size={18} />
              </button>
            </div>

            {/* BODY */}
            <div className="p-7 space-y-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="
                  w-full
                  h-14
                  px-5
                  rounded-md
                  border
                  border-[#ece7df]
                  outline-none
                  focus:border-primary
                "
              />

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03XXXXXXXXX"
                className="
                  w-full
                  h-14
                  px-5
                  rounded-md
                  border
                  border-[#ece7df]
                  outline-none
                  focus:border-primary
                "
              />

              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
                className="
                  w-full
                  h-14
                  px-5
                  rounded-md
                  border
                  border-[#ece7df]
                  outline-none
                  focus:border-primary
                "
              />

              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="
                  w-full
                  h-14
                  px-5
                  rounded-md
                  border
                  border-[#ece7df]
                  outline-none
                  focus:border-primary
                "
              />

              <input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Postal Code (Optional)"
                className="
                  w-full
                  h-14
                  px-5
                  rounded-md
                  border
                  border-[#ece7df]
                  outline-none
                  focus:border-primary
                "
              />
            </div>

            {/* FOOTER */}
            <div className="p-7 border-t border-[#f1ece5] flex gap-3">
              <button
                onClick={() => setEditOpen(false)}
                className="
                  flex-1
                  h-14
                
                  border
                  border-[#ece7df]
                "
              >
                Cancel
              </button>

              <button
                onClick={saveProfile}
                disabled={loading}
                className="
                  flex-1
                  h-14
               
                  bg-primary
                  text-white
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
                    <CheckCircle2 size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ error modal --------------- */}
      {errorModal.open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full max-w-md bg-white rounded-md border border-[#ece7df] shadow-2xl overflow-hidden"
          >
            {/* HEADER */}
            <div className="p-6 border-b border-[#f1ece5]">
              <h2 className="text-2xl font-cormorant text-black">
                {errorModal.title}
              </h2>
              <p className="text-xs tracking-[0.25em] uppercase text-neutral-400 mt-2">
                Checkout Alert
              </p>
            </div>

            {/* BODY */}
            <div className="p-6">
              <p className="text-sm text-neutral-600 leading-relaxed">
                {errorModal.message}
              </p>

              <div className="mt-5 bg-[#faf8f5] p-4 rounded-md text-xs text-neutral-600 leading-relaxed">
                If you still want to place your order, you can contact us
                manually on WhatsApp.
              </div>

              <div className="mt-3 text-sm font-medium text-black">
                {bankDetails.whatsapp}
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-6 border-t border-[#f1ece5] flex gap-3">
              <button
                onClick={() => setErrorModal({ open: false })}
                className="flex-1 h-12 border border-[#ece7df]"
              >
                Close
              </button>

              <a
                href={`https://wa.me/${bankDetails.whatsapp}`}
                target="_blank"
                className="flex-1 h-12 bg-primary text-white flex items-center justify-center"
              >
                WhatsApp Us
              </a>
            </div>
          </motion.div>
        </div>
      )}

      {/* =========================================================
            SUCCESS MODAL
           ======================================================= */}
      {successModal.open && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full max-w-md bg-white rounded-md border border-[#ece7df] shadow-2xl overflow-hidden"
          >
            {/* HEADER */}
            <div className="p-6 border-b border-[#f1ece5] text-center">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />

                <div
                  className="
      relative
      w-20
      h-20
      rounded-full
      bg-primary/10
      flex
      items-center
      justify-center
    "
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -25 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.2,
                      type: "spring",
                      stiffness: 160,
                    }}
                  >
                    <PartyPopper size={38} className="text-primary" />
                  </motion.div>
                </div>
              </div>

              <h2 className="mt-5 text-5xl font-cormorant text-black">
                Order Confirmed
              </h2>

              <p className="text-xs tracking-[0.35em] uppercase text-neutral-400 mt-3">
                Hamdam Jewellery
              </p>
            </div>

            {/* BODY */}
            <div className="p-6">
              <div className="flex items-center gap-3 justify-center">
                <BadgeCheck size={18} className="text-emerald-600" />

                <span className="text-sm text-emerald-600">
                  Payment request received
                </span>
              </div>

              <p className="mt-6 text-sm text-neutral-600 leading-relaxed text-center">
                Thank you for your order. Your request has been received
                successfully and is now awaiting processing by our team.
              </p>

              <div className="mt-6 rounded-md border border-[#ece7df] bg-[#faf8f5] p-5">
                <p className="text-[11px] tracking-[0.25em] uppercase text-neutral-400">
                  Order Reference
                </p>

                <p className="mt-2 text-xl font-medium break-all">
                  #{successModal.orderId}
                </p>
              </div>

              {paymentMethod === "BANK" && (
                <div className="mt-5 rounded-md bg-primary/5 border border-primary/20 p-4">
                  <p className="text-xs leading-relaxed text-neutral-700">
                    Please send your payment screenshot on WhatsApp for
                    verification and order confirmation.
                  </p>

                  <p className="mt-3 font-medium">{bankDetails.whatsapp}</p>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="p-6 border-t border-[#f1ece5] flex gap-3">
              <button
                onClick={() => {
                  setSuccessModal({
                    open: false,
                    orderId: "",
                  });

                  navigate("/orders");
                }}
                className="
            flex-1
            h-12
            border
            border-[#ece7df]
          "
              >
                My Orders
              </button>

              <button
                onClick={() => {
                  setSuccessModal({
                    open: false,
                    orderId: "",
                  });

                  navigate("/");
                }}
                className="
            flex-1
            h-12
            bg-primary
            text-white
            flex
            items-center
            justify-center
            gap-2
          "
              >
                <CheckCircle2 size={16} />
                Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
