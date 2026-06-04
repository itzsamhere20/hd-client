import { useEffect, useState } from "react";
import api from "../components/api";
import { AnimatePresence, motion } from "framer-motion";

const fallbackContact = {
  email: "hamdamcollections@gmail.com",
  phone: "+92 332 4384033",
};

export default function ContactPage() {
  const [contact, setContact] = useState(fallbackContact);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  // ---------- sync user ----------
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

  // ---------- prefill user email ----------
  useEffect(() => {
    if (user?.email) {
      setForm((prev) => ({
        ...prev,
        email: user.email,
      }));
    }
  }, [user]);

  // ---------- fetch contact ----------
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await api.get("/settings/store/contact");

        setContact({
          email: res.data?.email || fallbackContact.email,
          phone: res.data?.phone || fallbackContact.phone,
        });
      } catch {
        setContact(fallbackContact);
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, []);

  // ---------- input handler ----------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ---------- send message ----------
  const sendMessage = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.message) {
      return setError("Please fill all fields");
    }

    try {
      setSending(true);

      await api.post("/contact/send", form);

      setForm({
        name: "",
        email: user?.email || "",
        message: "",
      });

      setShowSuccess(true);

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "You can send message once per hour",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="text-gray-900 overflow-hidden">
      {/* HERO */}
      <div className="relative flex items-center justify-center py-28 md:py-40">
        <h1 className="absolute text-[70px] md:text-[160px] lg:text-[220px] font-luxury text-primary/10 select-none">
          CONTACT
        </h1>

        <div className="relative z-10 text-center mt-10 md:mt-0">
          <h2 className="font-luxury text-4xl md:text-6xl lg:text-7xl">
            Get In Touch
          </h2>

          <p className="mt-6 font-cormorant text-xl md:text-2xl text-gray-700 italic max-w-md md:max-w-2xl mx-auto leading-[1.6]">
            We would love to hear from you.
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* LEFT */}
          <div>
            <h3 className="font-luxury text-3xl md:text-5xl mb-10">
              Visit Our Store
            </h3>

            <p className="font-cormorant text-xl md:text-2xl text-gray-700 mb-10">
              Hamdam Jewellery <br />
              Sarai Alamgir, Pakistan
            </p>

            <div className="space-y-6 font-cormorant text-xl">
              <p>
                <span className="text-primary">Email:</span>{" "}
                <a href={`mailto:${contact.email}`}>
                  {loading ? "Loading..." : contact.email}
                </a>
              </p>

              <p>
                <span className="text-primary">WhatsApp:</span>{" "}
                <a
                  href={`https://wa.me/${contact.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {loading ? "Loading..." : contact.phone}
                </a>
              </p>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="bg-white/60 backdrop-blur-xl p-10 md:p-14">
            <h3 className="font-luxury text-3xl mb-8">Send Message</h3>

            <form onSubmit={sendMessage} className="space-y-6">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="w-full border-b py-3 bg-transparent outline-none"
              />

              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Your Email"
                className="w-full border-b py-3 bg-transparent outline-none"
              />

              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Your Message"
                rows="5"
                className="w-full border-b py-3 bg-transparent outline-none"
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-primary text-white py-3 uppercase tracking-[0.3em]"
              >
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 right-6 z-[9999] bg-white border px-8 py-5 shadow-xl"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-primary">
              Message Sent
            </p>

            <h3 className="font-cormorant text-2xl mt-2">
              We will get back to you ASAP
            </h3>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
