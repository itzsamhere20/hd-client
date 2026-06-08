import { useEffect, useRef, useState } from "react";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "./api";
const Footer = () => {
  const marqueeRef = useRef(null);

  const [offset, setOffset] = useState(0);
  const [categories, setCategories] = useState([]);
  const fallbackCategories = [
    { _id: "rings", name: "Rings" },
    { _id: "necklace", name: "Necklace" },
    { _id: "earrings", name: "Earrings" },
    { _id: "bracelets", name: "Bracelets" },
  ];
  const [contact, setContact] = useState({
    facebook: "",
    instagram: "",
    whatsapp: "",
  });

  // -fetch socials-------
  useEffect(() => {
    const fetchFromAPI = async () => {
      try {
        const res = await api.get("/settings/store/contact");

        const data = res.data || {};

        setContact(data);

        localStorage.setItem(
          "footer-contact-cache",
          JSON.stringify({
            data,
            time: Date.now(),
          }),
        );
      } catch (err) {
        console.log("Contact fetch failed");
      }
    };

    const getCachedData = () => {
      try {
        const cached = localStorage.getItem("footer-contact-cache");
        if (!cached) return null;

        const parsed = JSON.parse(cached);
        return parsed?.data || null;
      } catch {
        return null;
      }
    };

    // 1️⃣ instant cache
    const cached = getCachedData();

    if (cached) {
      setContact(cached);
    }

    // 2️⃣ background refresh
    fetchFromAPI();
  }, []);
  const safeLink = (url) => (url ? url : "#");
  // -----scroll evebt---------------
  useEffect(() => {
    const handleScroll = () => {
      if (!marqueeRef.current) return;
      const rect = marqueeRef.current.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const viewportMid = window.innerHeight / 2;
      setOffset(viewportMid - sectionCenter);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const isMobile = window.innerWidth < 768;

  const speed = isMobile ? 0.08 : 0.2;
  const limit = isMobile ? 60 : 190;

  const value = offset * speed;

  const luxuryX = clamp(value, -limit, 0);
  const jewelsX = clamp(-value, 0, limit);

  // -------categories-----------

  useEffect(() => {
    const fallbackCategories = [
      { _id: "rings", name: "Rings" },
      { _id: "necklace", name: "Necklace" },
      { _id: "earrings", name: "Earrings" },
      { _id: "bracelets", name: "Bracelets" },
    ];

    const fetchFromAPI = async () => {
      try {
        const res = await api.get("/categories");

        const finalData =
          Array.isArray(res.data) && res.data.length > 0
            ? res.data
            : fallbackCategories;

        setCategories(finalData);

        localStorage.setItem(
          "footer-categories-cache",
          JSON.stringify({
            data: finalData,
            time: Date.now(),
          }),
        );
      } catch (err) {
        console.log("Category API failed (keeping cache)");
      }
    };

    const getCachedData = () => {
      try {
        const cached = localStorage.getItem("footer-categories-cache");
        if (!cached) return null;

        const parsed = JSON.parse(cached);
        return parsed?.data || null;
      } catch {
        return null;
      }
    };

    // 1️⃣ instant UI
    const cached = getCachedData();

    if (cached && cached.length) {
      setCategories(cached);
    } else {
      setCategories(fallbackCategories);
    }

    // 2️⃣ background refresh
    fetchFromAPI();
  }, []);
  return (
    <footer className="relative overflow-visible pt-20 pb-10 ">
      {/* ── LOGO ── */}
      <div className="text-center mb-16">
        <h2 className="font-luxury text-4xl md:text-6xl text-gray-900 tracking-[0.3em]">
          HAMDAM
        </h2>
        <p className="text-[12px] uppercase tracking-[0.85em] text-primary/70 font-medium mt-3">
          Jewellery
        </p>
      </div>

      {/* ── LINKS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0 text-center max-w-4xl mx-auto mb-20">
        <div>
          <h3 className="font-luxury text-lg md:text-xl text-gray-900 mb-6 tracking-[0.15em]">
            About
          </h3>
          <ul className="flex flex-col space-y-4 font-cormorant text-base md:text-xl text-gray-700">
            <li>
              <Link to="/about" className="hover:text-primary transition">
                Our Story
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary transition">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        {/* ---------------- store----------- */}
        <div>
          <h3 className="font-luxury text-lg md:text-xl text-gray-900 mb-6 tracking-[0.15em]">
            Store
          </h3>

          <ul className="flex flex-col space-y-4 font-cormorant text-base md:text-xl text-gray-700">
            {categories.map((cat) => (
              <li key={cat._id}>
                <Link
                  to={`/collections/${cat.name.toLowerCase()}`}
                  className="hover:text-primary transition"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-luxury text-lg md:text-xl text-gray-900 mb-6 tracking-[0.15em]">
            Care
          </h3>
          <ul className="flex flex-col space-y-4 font-cormorant text-base md:text-xl text-gray-700">
            <li>
              <Link to="/faq" className="hover:text-primary transition">
                Delivery
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-primary transition">
                Cancellation & Return
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-primary transition">
                FAQ
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* ── PARALLAX TEXT + SOCIAL ── */}
      <div ref={marqueeRef} className="overflow-visible py-6">
        {/* LUXURY — full width, slides from left */}
        <div className="overflow-hidden w-full">
          <h1
            className="font-luxury leading-none select-none block whitespace-nowrap"
            style={{
              fontSize: "clamp(48px, 18vw, 220px)",
              color: "var(--color-primary, #b8860b)",
              opacity: 0.1,
              transform: `translateX(${luxuryX}px)`,
              willChange: "transform",
            }}
          >
            LUXURY
          </h1>
        </div>

        {/* SOCIAL ICONS — centred between the two words */}
        <div className="flex justify-center items-center gap-6 py-8">
          {[
            {
              Icon: FaFacebookF,
              href: safeLink(contact.facebook),
            },
            {
              Icon: FaInstagram,
              href: safeLink(contact.instagram),
            },
            {
              Icon: FaWhatsapp,
              href: contact.phone ? `https://wa.me/${contact.phone}` : "#",
            },
          ].map(({ Icon, href }, i) => (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="w-12 h-12 border border-[#ddd2c2] flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white hover:border-primary transition duration-500"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>

        {/* JEWELS — full width, slides from right */}
        <div className="overflow-visible">
          <h1
            className="font-luxury leading-none select-none text-right block whitespace-nowrap"
            style={{
              fontSize: "clamp(48px, 18vw, 220px)",
              color: "var(--color-primary, #b8860b)",
              opacity: 0.1,
              transform: `translateX(${jewelsX}px)`,
              willChange: "transform",
            }}
          >
            JEWELS
          </h1>
        </div>
      </div>

      {/* ── COPYRIGHT ── */}
      <div className="text-center pt-20">
        <p className="text-[8px] md:text-xs uppercase tracking-[0.3em] text-gray-500">
          © {new Date().getFullYear()} Hamdam Jewellery. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
