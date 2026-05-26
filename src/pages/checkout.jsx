import { useEffect, useMemo, useState } from "react";
import api from "../components/api";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Loader2,
  Pencil,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
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

  const buyNow = JSON.parse(localStorage.getItem("buyNow")) || null;

  const products = useMemo(() => {
    const source = buyNow?.product ? [buyNow.product] : cart;

    return source.map((p) => ({
      ...p,
      price: Number(p.price || 0),
      quantity: Number(p.quantity || 1),
    }));
  }, [cart, buyNow]);

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

      setUser(res.data.user);

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

      const res = await api.post(
        "/order/create",
        {
          items: products.map((p) => ({
            productId: p._id,
            quantity: p.quantity,
          })),
          paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      localStorage.removeItem("cart");
      localStorage.removeItem("buyNow");

      alert(`Order placed successfully\nOrder ID: ${res.data.order._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Order failed");
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
  /* =========================================================
     MASK EMAIL
  ========================================================= */
  const maskEmail = (email) => {
    if (!email) return "";

    const [namePart, domain] = email.split("@");

    return namePart.slice(0, 3) + "****" + namePart.slice(-2) + "@" + domain;
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
    <div className="min-h-screen  pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto ">
        {/* STEPPER */}
        <Stepper />

        <div className="grid lg:grid-cols-[1fr_420px] gap-8">
          {/* =========================================================
              LEFT
          ========================================================= */}
          <div className="space-y-6">
            {/* =========================================================
                EMAIL STEP
            ========================================================= */}
            {step === 1 && (
              <div className="relative bg-white rounded-md border border-[#ece7df] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] z-[9999]">
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
              </div>
            )}

            {/* =========================================================
                OTP STEP
            ========================================================= */}
            {step === 2 && (
              <div className="relative bg-white rounded-md border border-[#ece7df] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
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
              </div>
            )}

            {/* =========================================================
                PROFILE STEP
            ========================================================= */}
            {step === 3 && (
              <div className=" relative bg-white rounded-md border border-[#ece7df] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
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
                      <p className="text-red-500 text-xs mt-2">{errors.name}</p>
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
              </div>
            )}

            {/* =========================================================
                CHECKOUT STEP
            ========================================================= */}
            {step === 4 && (
              <>
                {/* PROFILE */}
                <div className="relative bg-white rounded-md border border-[#ece7df] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] tracking-[0.45em] uppercase text-neutral-400">
                        Customer
                      </p>

                      <h2 className="mt-2 text-5xl font-cormorant">Profile</h2>
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
                </div>

                {/* PAYMENT */}
                <div className=" relative bg-white rounded-md border border-[#ece7df] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
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

                                <span>UBL</span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-neutral-500">
                                  Account Title
                                </span>

                                <span>Hamdam Jewellery</span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-neutral-500">
                                  Account Number
                                </span>

                                <span>1726278656091</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-500">
                                  WhatsApp
                                </span>

                                <span>03425411173</span>
                              </div>
                            </div>

                            <div className="mt-5 rounded-md bg-[#faf8f5] p-4 text-xs leading-relaxed text-neutral-600">
                              Send payment screenshot on WhatsApp after transfer
                              for order confirmation.
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* =========================================================
    SUMMARY
========================================================= */}
          <div>
            <div className="sticky top-24 bg-white rounded-md border border-[#ece7df] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
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
                  <div key={i} className="flex justify-between gap-4">
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

                        <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 mt-1">
                          Size: {p.size || "N/A"} · x{p.quantity}
                        </p>
                      </div>
                    </div>

                    {/* PRICE */}
                    <p className="text-[15px] font-medium text-neutral-900 whitespace-nowrap">
                      PKR {formatPrice(p.price * p.quantity)}
                    </p>
                  </div>
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
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          EDIT MODAL
      ========================================================= */}
      {editOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
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
    </div>
  );
}
