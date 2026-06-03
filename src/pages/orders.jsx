import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../components/api";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  X,
  AlertTriangle,
} from "lucide-react";

/* =========================
   ADMIN WHATSAPP NUMBER

========================= */

/* =========================
   CANCEL REASONS
========================= */
const CANCEL_REASONS = [
  "I ordered by mistake",
  "I want to change my order",
  "Delivery is taking too long",
  "Other (I'll write my own)",
];

/* =========================
   STATUS CONFIG
========================= */
const STATUS_CONFIG = {
  PROCESSING: {
    label: "Processing",
    icon: Clock,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
    step: 1,
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
    step: 2,
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-400",
    step: 3,
  },
  DELIVERED: {
    label: "Delivered",
    icon: PackageCheck,
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-400",
    step: 4,
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    dot: "bg-red-400",
    step: 0,
  },
};

const STEPS = ["Processing", "Confirmed", "Shipped", "Delivered"];

/* =========================
   MAIN
========================= */
export default function MyOrders() {
  // ------------------admin whatsappp-------------------

  const [adminWhatsapp, setAdminWhatsapp] = useState("03324384033");

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await api.get("/settings/store/contact");
        console.log("Contact info:", res.data);
        // adjust this key depending on your backend response
        setAdminWhatsapp(res.data?.phone);
      } catch (err) {
        console.log("Failed to fetch contact", err);
      }
    };

    fetchContact();
  }, []);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  // cancel modal
  const [cancelTarget, setCancelTarget] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [customMessage, setCustomMessage] = useState("");

  /* AUTH GUARD */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/auth");
  }, [navigate]);

  /* FETCH MY ORDERS */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/orders/my");
        setOrders(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* OPEN CANCEL MODAL */
  const openCancel = (order, e) => {
    e.stopPropagation();
    setSelectedReason("");
    setCustomMessage("");
    setCancelTarget(order);
  };

  /* SEND CANCEL REQUEST TO WHATSAPP */
  const sendCancelRequest = () => {
    if (!cancelTarget) return;
    const isCustom = selectedReason === "Other (I'll write my own)";
    const reasonText = isCustom ? customMessage.trim() : selectedReason;
    if (!reasonText) return;

    const user = (() => {
      try {
        return JSON.parse(localStorage.getItem("user"));
      } catch {
        return null;
      }
    })();

    const message =
      `🚫 *Cancel Order Request*\n\n` +
      `Hi, I would like to cancel my order.\n\n` +
      `📦 *Order ID:* #${cancelTarget.orderId}\n` +
      `👤 *Name:* ${user?.name || cancelTarget.customer?.name || "Customer"}\n` +
      `📞 *Phone:* ${user?.phone || cancelTarget.customer?.phone || "—"}\n\n` +
      `❓ *Reason:* ${reasonText}\n\n` +
      `🛍️ *Items:*\n${cancelTarget.items?.map((i) => `• ${i.name} × ${i.quantity}`).join("\n")}\n\n` +
      `💰 *Total:* PKR ${Number(cancelTarget.totalAmount).toLocaleString()}`;

    window.open(
      `https://wa.me/${adminWhatsapp}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
    setCancelTarget(null);
  };

  /* LOADING */
  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-black border-t-transparent animate-spin" />
          <p className="font-cormorant text-xl text-gray-500 tracking-widest">
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-36 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="font-luxury text-4xl  md:text-5xl lg:text-6xl text-primary tracking-[0.08em]">
            My Orders
          </h1>
          <p className=" text-[11px] md:text-[13px] tracking-[0.1em] md:tracking-[0.25em] uppercase text-black/40 mt-2">
            Track and manage your purchases
          </p>
        </div>

        {/* EMPTY */}
        {orders.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm border border-black/10 rounded-sm p-16 text-center">
            <Package size={44} className="mx-auto text-gray-200 mb-4" />
            <p className="font-luxury text-2xl text-gray-400 mb-2">
              No orders yet
            </p>
            <p className="font-cormorant text-lg text-gray-400">
              Your beautiful pieces will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const cfg =
                STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PROCESSING;
              const StatusIcon = cfg.icon;
              const isOpen = expanded === order._id;
              const canCancel = order.orderStatus === "PROCESSING";
              const isCancelled = order.orderStatus === "CANCELLED";
              const date = new Date(order.createdAt).toLocaleDateString(
                "en-PK",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                },
              );

              return (
                <div
                  key={order._id}
                  className="bg-white/40 backdrop-blur border border-black/10 rounded-lg overflow-hidden  "
                >
                  {/* ── CARD HEADER (always visible, clickable to expand) ── */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : order._id)}
                    className="w-full text-left p-5 flex items-start gap-4"
                  >
                    {/* STATUS ICON */}
                    <div
                      className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.border}`}
                    >
                      <StatusIcon size={18} className={cfg.text} />
                    </div>

                    {/* ORDER INFO */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-gray-800 text-[15px]">
                          #{order.orderId}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                          />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-0.5">{date}</p>

                      {/* PRODUCT THUMBNAILS */}
                      <div className="flex gap-1.5 mt-3 overflow-x-auto">
                        {order.items?.slice(0, 4).map((item, idx) => (
                          <img
                            key={idx}
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-xl object-cover border border-[#e7dcc7] shrink-0"
                          />
                        ))}
                        {order.items?.length > 4 && (
                          <div className="w-10 h-10 rounded-xl bg-[#faf7f2] border border-[#e7dcc7] flex items-center justify-center text-[10px] text-gray-400 shrink-0">
                            +{order.items.length - 4}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* EXPAND ICON */}
                    <div className="shrink-0 mt-1 text-gray-400">
                      {isOpen ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </div>
                  </button>

                  {/* ── EXPANDED DETAILS ── */}
                  {isOpen && (
                    <div className="border-t border-[#f0ebe2] px-5 pb-5 pt-4 space-y-5">
                      {/* PROGRESS TRACKER */}
                      {!isCancelled && (
                        <div>
                          <div className="flex items-center justify-between relative">
                            {/* line */}
                            <div className="absolute top-4 left-0 right-0 h-px bg-[#e7dcc7] z-0" />
                            <div
                              className="absolute top-4 left-0 h-px bg-primary z-0 transition-all duration-500"
                              style={{
                                width: `${((cfg.step - 1) / (STEPS.length - 1)) * 100}%`,
                              }}
                            />
                            {STEPS.map((step, idx) => {
                              const done = cfg.step > idx;
                              const active = cfg.step === idx + 1;
                              return (
                                <div
                                  key={step}
                                  className="flex flex-col items-center gap-1.5 z-10"
                                >
                                  <div
                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                                    ${
                                      done
                                        ? "bg-primary border-primary"
                                        : active
                                          ? "bg-white border-primary"
                                          : "bg-white border-[#e7dcc7]"
                                    }`}
                                  >
                                    {done ? (
                                      <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 12 12"
                                        fill="none"
                                      >
                                        <path
                                          d="M2 6l3 3 5-5"
                                          stroke="white"
                                          strokeWidth="1.8"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    ) : (
                                      <span
                                        className={`w-2 h-2 rounded-full ${active ? "bg-primary" : "bg-[#e7dcc7]"}`}
                                      />
                                    )}
                                  </div>
                                  <span
                                    className={`text-[10px] font-medium ${active ? "text-primary" : done ? "text-gray-500" : "text-gray-300"}`}
                                  >
                                    {step}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* CANCELLED BANNER */}
                      {isCancelled && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                          <XCircle
                            size={18}
                            className="text-red-400 shrink-0"
                          />
                          <p className="text-sm text-red-600">
                            This order has been cancelled.
                          </p>
                        </div>
                      )}

                      {/* ITEMS */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                          Items
                        </p>
                        <div className="space-y-2">
                          {order.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 border border-[#e7dcc7] rounded-2xl p-3"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-14 h-14 rounded-xl object-cover border border-[#e7dcc7] shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 text-sm truncate">
                                  {item.name}
                                </p>
                                <div className="flex gap-3 mt-0.5">
                                  <span className="text-xs text-gray-400">
                                    Qty: {item.quantity}
                                  </span>
                                  {item.size && (
                                    <span className="text-xs text-gray-400">
                                      Size: {item.size}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="font-semibold text-gray-800 text-sm shrink-0">
                                PKR {Number(item.price).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* TOTAL */}
                      <div className="border-t border-[#f0ebe2] pt-3 space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Subtotal</span>
                          <span className="text-gray-600">
                            PKR {Number(order.subtotal).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Shipping</span>
                          <span className="text-gray-600">
                            {Number(order.shippingFee) === 0
                              ? "Free"
                              : `PKR ${Number(order.shippingFee).toLocaleString()}`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="font-medium text-gray-700">
                            Total
                          </span>
                          <span className="font-luxury text-xl text-gray-800">
                            PKR {Number(order.totalAmount).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* CANCEL BUTTON — only when PROCESSING */}
                      {canCancel && (
                        <button
                          onClick={(e) => openCancel(order, e)}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-[#e7dcc7] text-sm text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
                        >
                          <MessageCircle size={15} className="text-[#25D366]" />
                          Request Cancellation via WhatsApp
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ CANCEL MODAL ═══ */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-[99999]">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden">
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0ebe2]">
              <div>
                <h2 className="font-luxury text-2xl text-gray-800">
                  Cancel Order
                </h2>
                <p className="text-sm text-gray-400 font-cormorant">
                  #{cancelTarget.orderId}
                </p>
              </div>
              <button
                onClick={() => setCancelTarget(null)}
                className="w-9 h-9 rounded-2xl border border-[#e7dcc7] flex items-center justify-center hover:bg-[#faf7f2] transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* WARNING */}
              <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                <AlertTriangle
                  size={16}
                  className="text-amber-500 shrink-0 mt-0.5"
                />
                <p className="text-sm text-amber-700">
                  This will open WhatsApp with a cancellation message to our
                  team. We'll process your request as soon as possible.
                </p>
              </div>

              {/* REASONS */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Select a reason
                </p>
                <div className="space-y-2">
                  {CANCEL_REASONS.map((reason) => {
                    const isSelected = selectedReason === reason;
                    return (
                      <button
                        key={reason}
                        onClick={() => {
                          setSelectedReason(reason);
                          setCustomMessage("");
                        }}
                        className={`w-full text-left px-4 py-3 rounded-2xl border text-sm transition-all
                          ${
                            isSelected
                              ? "border-primary bg-[#fdf9f0] text-gray-800 font-medium"
                              : "border-[#e7dcc7] bg-white text-gray-600 hover:bg-[#faf7f2]"
                          }`}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                            ${isSelected ? "border-primary" : "border-[#e7dcc7]"}`}
                          >
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </span>
                          {reason}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CUSTOM MESSAGE (shown when "Other" selected) */}
              {selectedReason === "Other (I'll write my own)" && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Your message</p>
                  <textarea
                    rows={3}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Describe your reason..."
                    className="w-full border border-[#e7dcc7] rounded-2xl px-4 py-3 outline-none bg-[#faf7f2] text-sm placeholder:text-gray-300 focus:border-gray-400 transition-colors resize-none"
                  />
                </div>
              )}

              {/* SEND BTN */}
              <button
                onClick={sendCancelRequest}
                disabled={
                  !selectedReason ||
                  (selectedReason === "Other (I'll write my own)" &&
                    !customMessage.trim())
                }
                className="w-full h-[52px] rounded-2xl bg-[#25D366] text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <MessageCircle size={18} />
                Send Request on WhatsApp
              </button>

              <button
                onClick={() => setCancelTarget(null)}
                className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition"
              >
                Nevermind, keep my order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
