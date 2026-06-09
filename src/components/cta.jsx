import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "./api";
import { useNavigate } from "react-router-dom";

const fallback = {
  leftTitle: "Diamond Necklace",
  leftText:
    "A refined statement of elegance, designed to capture light and attention effortlessly.",
  leftImage:
    "https://bijoux.vamtam.com/wp-content/uploads/2020/05/iStock-1136336605.jpg",
  leftBg: "#ede4d8",
  rightTitle: "Bridal Collection",
  rightText:
    "Timeless craftsmanship curated for the most memorable moments of your life.",
  rightImage:
    "https://bijoux.vamtam.com/wp-content/uploads/2020/05/iStock-1136336598.jpg",
  rightBg: "#dfeaf2",
};

const CTASection = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fallback = {
      leftTitle: "Diamond Necklace",
      leftText:
        "A refined statement of elegance, designed to capture light and attention effortlessly.",
      leftImage:
        "https://bijoux.vamtam.com/wp-content/uploads/2020/05/iStock-1136336605.jpg",
      leftBg: "#ede4d8",
      rightTitle: "Bridal Collection",
      rightText:
        "Timeless craftsmanship curated for the most memorable moments of your life.",
      rightImage:
        "https://bijoux.vamtam.com/wp-content/uploads/2020/05/iStock-1136336598.jpg",
      rightBg: "#dfeaf2",
    };

    const getCachedData = () => {
      try {
        const cached = localStorage.getItem("CTA_CACHE");
        if (!cached) return null;

        const parsed = JSON.parse(cached);
        return parsed?.data || null;
      } catch {
        return null;
      }
    };

    const fetchFromAPI = async () => {
      try {
        const res = await api.get("/settings/store/hero");

        setData(res.data);

        localStorage.setItem(
          "CTA_CACHE",
          JSON.stringify({
            data: res.data,
            time: Date.now(),
          }),
        );
      } catch (err) {
        console.log("API failed, keeping cached CTA data");
      } finally {
        setLoading(false);
      }
    };

    // 1️⃣ instant load
    const cached = getCachedData();

    if (cached) {
      setData(cached);
      setLoading(false);
    } else {
      setData(fallback);
      setLoading(false);
    }

    // 2️⃣ background refresh
    fetchFromAPI();
  }, []);
  const content = data || fallback;

  if (loading) {
    return (
      <section className="py-24 flex items-center justify-center bg-[#f8f5f0]">
        <p className="uppercase tracking-[0.45em] text-primary/60 animate-pulse text-xs">
          Loading...
        </p>
      </section>
    );
  }

  return (
    <section className=" py-16 md:py-28 space-y-20 md:space-y-32">
      {/* ── LEFT BLOCK ── */}
      <div className="relative">
        {/* colour slab */}
        <div
          className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-[52%] h-[380px] md:h-[420px]"
          style={{ backgroundColor: content.leftBg, opacity: 0.8 }}
        />

        <div className="relative max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
          {/* IMAGE */}
          <div className="w-full md:w-1/2 flex justify-start">
            <motion.img
              loading="lazy"
              src={content.leftImage}
              alt={content.leftTitle}
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              whileInView={{ clipPath: "inset(0 0% 0 0)" }}
              transition={{ duration: 1, ease: "easeInOut" }}
              viewport={{ once: true }}
              className="w-[220px] md:w-[360px] lg:w-[480px] object-contain drop-shadow-xl"
            />
          </div>

          {/* TEXT */}
          <div className="w-full md:w-1/2 space-y-5">
            <h2 className="font-luxury text-3xl md:text-5xl lg:text-6xl text-gray-900 leading-[1.05]">
              {content.leftTitle}
            </h2>
            <p className="font-cormorant text-xl md:text-2xl text-gray-600 leading-[1.7] max-w-md">
              {content.leftText}
            </p>
            <button
              title="visit collections page"
              aria-label="navigate button to collections page"
              onClick={() => navigate("/collections")}
              className="text-xs uppercase tracking-[0.35em] border-b border-gray-400 hover:border-primary hover:text-primary transition pb-1"
            >
              Discover
            </button>
          </div>
        </div>
      </div>

      {/* ── RIGHT BLOCK ── */}
      <div className="relative">
        {/* colour slab */}
        <div
          className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[52%] h-[380px] md:h-[420px]"
          style={{ backgroundColor: content.rightBg, opacity: 0.8 }}
        />

        <div className="relative max-w-7xl mx-auto px-6 flex flex-col-reverse md:flex-row items-center gap-10">
          {/* TEXT */}
          <div className="w-full md:w-1/2 space-y-5 text-right flex flex-col items-end">
            <h2 className="font-luxury text-3xl md:text-5xl lg:text-6xl text-gray-900 leading-[1.05]">
              {content.rightTitle}
            </h2>
            <p className="font-cormorant text-xl md:text-2xl text-gray-600 leading-[1.7] max-w-md text-right">
              {content.rightText}
            </p>
            <button
              title="go to collections page"
              aria-label="navigate button to collections page"
              onClick={() => navigate("/collections")}
              className="text-xs uppercase tracking-[0.35em] border-b border-gray-400 hover:border-primary hover:text-primary transition pb-1"
            >
              Discover
            </button>
          </div>

          {/* IMAGE */}
          <div className="w-full md:w-1/2 flex justify-end">
            <motion.img
              loading="lazy"
              src={content.rightImage}
              alt={content.rightTitle}
              initial={{ clipPath: "inset(0 0 0 100%)" }}
              whileInView={{ clipPath: "inset(0 0 0 0)" }}
              transition={{ duration: 1, ease: "easeInOut" }}
              viewport={{ once: true }}
              className="w-[220px] md:w-[360px] lg:w-[480px] object-contain drop-shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
