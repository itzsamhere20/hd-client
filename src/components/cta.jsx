import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "./api";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fallback = {
    leftTitle: "Diamond Necklace",
    leftText:
      "A refined statement of elegance, designed to capture light and attention effortlessly.",
    leftImage:
      "https://bijoux.vamtam.com/wp-content/uploads/2020/05/iStock-1136336605.jpg",
    leftBg: "#f6efe6",

    rightTitle: "Bridal Collection",
    rightText:
      "Timeless craftsmanship curated for the most memorable moments of your life.",
    rightImage:
      "https://bijoux.vamtam.com/wp-content/uploads/2020/05/iStock-1136336598.jpg",
    rightBg: "#eef3f8",
  };

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await api.get("/settings/store/hero");
        setData(res.data);
      } catch (err) {
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHero();
  }, []);

  const content = data || fallback;

  if (loading) {
    return (
      <section className="py-24 text-center">
        <p className="tracking-[0.35em] uppercase text-[#A68A3C] animate-pulse">
          Loading...
        </p>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-28 space-y-20 md:space-y-32">
      {/* ================= LEFT BLOCK ================= */}
      <div className="relative">
        <div
          className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-[55%] md:h-[420px] opacity-70"
          style={{ background: content.leftBg }}
        />

        <div className="relative max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
          {/* IMAGE (LEFT ALWAYS LEFT EVEN ON MOBILE) */}
          <div className="w-full md:w-1/2 flex justify-start">
            <motion.img
              src={content.leftImage}
              alt="left"
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              whileInView={{ clipPath: "inset(0 0% 0 0)" }}
              transition={{ duration: 1, ease: "easeInOut" }}
              viewport={{ once: true }}
              className="w-[240px] md:w-[380px] lg:w-[520px] object-contain drop-shadow-xl"
            />
          </div>

          {/* TEXT (RIGHT SIDE ALWAYS) */}
          <div className="w-full md:w-1/2 text-left space-y-5">
            <h2 className="font-luxury text-3xl md:text-5xl lg:text-7xl tracking-tight text-gray-900 leading-[1.05]">
              {content.leftTitle}
            </h2>

            <p className="font-[Cormorant] text-lg md:text-xl lg:text-2xl text-gray-700 leading-[1.7] tracking-wide max-w-lg">
              {content.leftText}
            </p>

            <button
              className="text-xs md:text-sm uppercase tracking-[0.4em] border-b border-black hover:text-[#A68A3C] hover:border-[#A68A3C] transition"
              onClick={() => navigate("/collections")}
            >
              Discover
            </button>
          </div>
        </div>
      </div>

      {/* ================= RIGHT BLOCK ================= */}
      <div className="relative">
        <div
          className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[55%] md:h-[420px] opacity-70"
          style={{ background: content.rightBg }}
        />

        <div className="relative max-w-7xl mx-auto px-6 flex flex-col-reverse md:flex-row items-center gap-10">
          {/* TEXT (LEFT ON DESKTOP, RIGHT ALIGN MOBILE PRESERVED) */}
          <div className="w-full md:w-1/2 space-y-5  md:text-right md:items-end flex flex-col text-right">
            <h2 className="font-luxury text-3xl md:text-5xl lg:text-7xl tracking-wide text-gray-900 leading-[1.05]">
              {content.rightTitle}
            </h2>

            <p className="font-[Cormorant] text-lg md:text-xl lg:text-2xl text-gray-700 leading-[1.7] tracking-wide max-w-lg md:ml-auto">
              {content.rightText}
            </p>

            <button
              className="text-xs md:text-sm uppercase tracking-[0.4em] border-b border-black hover:text-[#A68A3C] hover:border-[#A68A3C] transition md:ml-auto w-max flex self-end"
              onClick={() => navigate("/collections")}
            >
              Discover
            </button>
          </div>

          {/* IMAGE (RIGHT ALWAYS RIGHT EVEN ON MOBILE) */}
          <div className="w-full md:w-1/2 flex justify-end">
            <motion.img
              src={content.rightImage}
              alt="right"
              initial={{ clipPath: "inset(0 0 0 100%)" }}
              whileInView={{ clipPath: "inset(0 0 0 0)" }}
              transition={{ duration: 1, ease: "easeInOut" }}
              viewport={{ once: true }}
              className="w-[240px] md:w-[380px] lg:w-[520px] object-contain drop-shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
