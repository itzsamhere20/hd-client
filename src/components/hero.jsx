import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "./api";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  const [landing, setLanding] = useState(null);
  const [loading, setLoading] = useState(true);

  const fallback = {
    title: "Elegant Pieces",
    italicTitle: "For Every Moment",
    paragraph:
      "Discover refined jewelry crafted with precision and timeless beauty.",
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0",
  };

  useEffect(() => {
    const CACHE_KEY = "landing_cache";

    const getCachedData = () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const parsed = JSON.parse(cached);
        return parsed?.data || null;
      } catch {
        return null;
      }
    };

    const fetchFromAPI = async () => {
      try {
        const res = await api.get("/settings/store/landing");

        setLanding(res.data);

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: res.data,
            time: Date.now(),
          }),
        );
      } catch (err) {
        console.error("API failed, keeping cached data");
      } finally {
        setLoading(false);
      }
    };

    // 1️⃣ STEP 1: instantly show cached data (NO loading)
    const cachedData = getCachedData();

    if (cachedData) {
      setLanding(cachedData);
      setLoading(false); // important: stop loader immediately
    }

    // 2️⃣ STEP 2: always refresh from API in background
    fetchFromAPI();
  }, []);

  const data = landing || fallback;

  if (loading) {
    return (
      <section className="min-h-[1000px] flex items-center justify-center">
        <div className="tracking-[0.3em] uppercase text-[#A68A3C] animate-pulse">
          Loading Luxury...
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen  md:min-h-[1000px] flex items-center justify-center overflow-hidden pt-24 ">
      {/* ✨ Living Luxury Light */}
      <motion.div
        className="pointer-events-none absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-3xl opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(198,169,98,0.30) 0%, rgba(255,255,255,0) 70%)",
        }}
        animate={{
          scale: [0.9, 1.08, 0.9],
          opacity: [0.2, 0.4, 0.2],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* CONTAINER */}
      <div className="w-full max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-16 relative z-10">
        {/* IMAGE FIRST ON MOBILE */}
        <motion.div
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="w-full lg:w-1/2 flex justify-center order-1 lg:order-2 relative"
        >
          <motion.img
            src={data.image}
            alt="Luxury Jewelry"
            className="w-full max-w-[540px] object-contain drop-shadow-2xl"
            animate={{
              y: [0, -12, 0],
              rotate: [0, 0.8, 0],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* glow behind image */}
          <motion.div
            className="absolute -z-10 w-[65%] h-[65%] bg-[#C6A962]/40 blur-3xl rounded-full"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* TEXT */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="w-full lg:w-1/2 text-center lg:text-left space-y-7 order-2 lg:order-1"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-luxury text-gray-900/90 leading-[1.05] flex flex-col gap-1"
          >
            {data.title}
            <br />

            <span className="italic text-[#A68A3C] font-[Cormorant]">
              {data.italicTitle}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1 }}
            className="text-gray-600 max-w-xl mx-auto lg:mx-0 text-lg md:text-xl leading-[1.7] font-[Cormorant]"
          >
            {data.paragraph}
          </motion.p>

          <motion.button
            tit
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 text-sm tracking-[0.3em] uppercase border border-[#C6A962] text-[#A68A3C] relative overflow-hidden group
            "
            onClick={() => navigate("/collections")}
          >
            <span className="relative z-10 group-hover:text-white transition duration-1000">
              Explore Collection
            </span>

            <span className="absolute inset-0 bg-[#C6A962] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700"></span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
