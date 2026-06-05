import { useEffect, useState } from "react";
import api from "../components/api";
import { AnimatePresence, motion } from "framer-motion";

const fallbackContact = {
  email: "hamdamcollections@gmail.com",
  phone: "+92 332 4384033",
};

const RESEND_KEY = "contact_last_sent";
const RESEND_DELAY_MS = 60 * 60 * 1000; // 1 hour

/* ── tiny helpers ── */
const getLastSent = () => {
  try {
    const v = localStorage.getItem(RESEND_KEY);
    return v ? parseInt(v, 10) : null;
  } catch {
    return null;
  }
};

const setLastSent = () => {
  try {
    localStorage.setItem(RESEND_KEY, Date.now().toString());
  } catch {}
};

const msLeft = () => {
  const last = getLastSent();
  if (!last) return 0;
  return Math.max(0, RESEND_DELAY_MS - (Date.now() - last));
};

const formatTime = (ms) => {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

/* ── notification component ── */
function Notification({ type, title, body, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const isError = type === "error";

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onClick={onClose}
      className="fixed bottom-8 right-6 z-[9999] bg-white border shadow-xl px-8 py-5 cursor-pointer max-w-xs"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: isError ? "#dc2626" : "#16a34a",
      }}
    >
      <p
        className="text-xs uppercase tracking-[0.3em]"
        style={{ color: isError ? "#dc2626" : "var(--color-primary, #b8860b)" }}
      >
        {title}
      </p>
      <h3 className="font-cormorant text-xl mt-1 text-gray-800">{body}</h3>
    </motion.div>
  );
}

export default function ContactPage() {
  const [contact, setContact] = useState(fallbackContact);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  /* cooldown timer */
  const [cooldown, setCooldown] = useState(msLeft);
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      const remaining = msLeft();
      setCooldown(remaining);
      if (remaining <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  /* notification queue — only one shown at a time */
  const [notif, setNotif] = useState(null); // { type, title, body }

  const showNotif = (type, title, body) => setNotif({ type, title, body });
  const clearNotif = () => setNotif(null);

  /* ── sync user ── */
  const syncUser = () => {
    try {
      const u = localStorage.getItem("user");
      setUser(u ? JSON.parse(u) : null);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    syncUser();
    window.addEventListener("authUpdated", syncUser);
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener("authUpdated", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  /* ── prefill ── */
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  /* ── fetch contact info ── */
  useEffect(() => {
    const CONTACT_CACHE = "CONTACT_CACHE";

    const fetchFromAPI = async () => {
      try {
        const res = await api.get("/settings/store/contact");

        const data = {
          email: res.data?.email || fallbackContact.email,
          phone: res.data?.phone || fallbackContact.phone,
        };

        setContact(data);

        localStorage.setItem(
          CONTACT_CACHE,
          JSON.stringify({
            data,
            time: Date.now(),
          }),
        );
      } catch {
        console.log("Contact API failed, keeping cached data");
      } finally {
        setLoading(false);
      }
    };

    const getCachedData = () => {
      try {
        const cached = localStorage.getItem(CONTACT_CACHE);
        if (!cached) return null;

        const parsed = JSON.parse(cached);
        return parsed?.data || null;
      } catch {
        return null;
      }
    };

    // 1️⃣ instant UI from cache
    const cached = getCachedData();

    if (cached) {
      setContact(cached);
      setLoading(false);
    } else {
      setContact(fallbackContact);
      setLoading(false);
    }

    // 2️⃣ background refresh
    fetchFromAPI();
  }, []);

  /* ── input handler ── */
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    /* 1. must be logged in */
    if (!user) {
      showNotif("error", "Login Required", "Please log in to send a message.");
      return;
    }

    /* 2. client-side cooldown guard — skip API entirely */
    const remaining = msLeft();
    if (remaining > 0) {
      showNotif(
        "error",
        "Slow Down",
        `Please wait ${formatTime(remaining)} before sending again.`,
      );
      return;
    }

    /* 3. basic validation */
    if (!form.name || !form.email || !form.message) {
      showNotif("error", "Missing Fields", "Please fill all fields.");
      return;
    }

    try {
      setSending(true);

      await api.post("/messages", {
        name: form.name,
        email: form.email,
        message: form.message,
      });

      /* start cooldown */
      setLastSent();
      setCooldown(RESEND_DELAY_MS);

      /* reset only message */
      setForm((prev) => ({ ...prev, message: "" }));

      showNotif("success", "Message Sent", "We will get back to you ASAP.");
    } catch (err) {
      /* show backend error message (e.g. rate-limit) in same modal style */
      const msg =
        err?.response?.data?.message ||
        "Something went wrong. Please try again.";
      showNotif("error", "Could Not Send", msg);
    } finally {
      setSending(false);
    }
  };

  const isOnCooldown = cooldown > 0;
  const btnDisabled = sending || isOnCooldown;

  return (
    <section className="text-gray-900 overflow-hidden">
      {/* ===== HERO ===== */}
      <div className="relative flex items-center justify-center py-28 md:py-40">
        <h1 className="absolute text-[70px] md:text-[160px] lg:text-[220px] font-luxury text-primary/10 select-none">
          CONTACT
        </h1>

        <div className="relative z-10 text-center mt-10 md:mt-0">
          <h2 className="font-luxury text-4xl md:text-6xl lg:text-7xl">
            Get In Touch
          </h2>

          <p className="mt-6 font-cormorant text-xl md:text-2xl text-gray-700 italic max-w-md md:max-w-2xl mx-auto leading-[1.6]">
            We would love to hear from you. Whether it's about our collections,
            custom orders or collaborations.
          </p>
        </div>
      </div>

      {/* ===== CONTACT SECTION ===== */}
      <div className="max-w-7xl mx-auto px-6 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* LEFT INFO */}
          <div>
            <h3 className="font-luxury text-3xl md:text-5xl mb-10">
              Visit Our Store
            </h3>

            <p className="font-cormorant text-xl md:text-2xl text-gray-700 leading-[1.7] mb-10">
              Hamdam Jewellery
              <br />
              Sarai Alamgir, Pakistan
              <br />
              Sat - Thu: 10:00 AM - 7:00 PM
            </p>

            <div className="space-y-6 font-cormorant text-xl text-gray-700">
              <p>
                <span className="text-primary">Email:</span>{" "}
                <a
                  href={`mailto:${contact.email}`}
                  className="hover:text-primary"
                >
                  {loading ? "Loading..." : contact.email}
                </a>
              </p>

              <p>
                <span className="text-primary">Phone:</span>{" "}
                <a
                  href={`https://wa.me/${contact.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  {loading ? "Loading..." : contact.phone}
                </a>
              </p>
            </div>
          </div>

          {/* FORM */}
          <div className="bg-white/60 backdrop-blur-xl p-10 md:p-14">
            <h3 className="font-luxury text-3xl mb-8">Send Message</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="w-full bg-transparent border-b border-gray-400 py-3 outline-none font-cormorant text-lg"
              />

              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Your Email"
                className="w-full bg-transparent border-b border-gray-400 py-3 outline-none font-cormorant text-lg"
              />

              <textarea
                name="message"
                rows="5"
                value={form.message}
                onChange={handleChange}
                placeholder="Your Message"
                className="w-full bg-transparent border-b border-gray-400 py-3 outline-none font-cormorant text-lg"
              />

              <button
                type="submit"
                disabled={btnDisabled}
                className="mt-6 uppercase tracking-[0.3em] text-sm border-b border-black hover:text-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending
                  ? "Sending..."
                  : isOnCooldown
                    ? `Wait ${formatTime(cooldown)}`
                    : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ===== MAP ===== */}
      <div className="relative w-full h-[400px] md:h-[600px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d537.7970819758706!2d73.76338139872459!3d32.906658084825324!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1773402566378!5m2!1sen!2s"
            allowFullScreen
            loading="lazy"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* ===== NOTIFICATION MODAL ===== */}
      <AnimatePresence>
        {notif && (
          <Notification
            key={notif.title + notif.body}
            type={notif.type}
            title={notif.title}
            body={notif.body}
            onClose={clearNotif}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
