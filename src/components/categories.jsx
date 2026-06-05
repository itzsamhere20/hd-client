import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "./api";

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fallbackCategories = [
      {
        name: "Rings",
        image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e",
      },
      {
        name: "Necklace",
        image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d",
      },
      {
        name: "Earrings",
        image:
          "https://bijoux.vamtam.com/wp-content/uploads/2020/05/iStock-1136336605.jpg",
      },
    ];

    const getCachedData = () => {
      try {
        const cached = localStorage.getItem("HOME_CAT_CACHE");
        if (!cached) return null;

        const parsed = JSON.parse(cached);
        return parsed?.data || null;
      } catch {
        return null;
      }
    };

    const fetchFromAPI = async () => {
      try {
        const res = await api.get("/categories");

        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.categories || [];

        const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 3);

        const finalData = shuffled.length > 0 ? shuffled : fallbackCategories;

        setCategories(finalData);

        localStorage.setItem(
          "HOME_CAT_CACHE",
          JSON.stringify({
            data: finalData,
            time: Date.now(),
          }),
        );
      } catch (err) {
        console.log("API failed, keeping cached categories");
      } finally {
        setLoading(false);
      }
    };

    // 1️⃣ instant UI
    const cached = getCachedData();

    if (cached && cached.length) {
      setCategories(cached);
      setLoading(false);
    } else {
      setCategories(fallbackCategories);
      setLoading(false);
    }

    // 2️⃣ background refresh
    fetchFromAPI();
  }, []);

  if (loading) {
    return (
      <section className="py-24 flex items-center justify-center">
        <p className="uppercase tracking-[0.45em] text-primary/60 animate-pulse text-xs">
          Loading Collections...
        </p>
      </section>
    );
  }

  return (
    <section className="pt-16 pb-40 md:pt-24 md:pb-48 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-14 md:mb-20">
          <p className="text-[10px] uppercase tracking-[0.45em] text-primary/70 font-medium mb-3 text-center">
            Browse
          </p>
          <h2 className="font-luxury text-4xl md:text-6xl lg:text-7xl text-center text-gray-900 leading-[1.0]">
            Collections
          </h2>
          <p className="font-cormorant text-xl md:text-2xl text-gray-600 text-center mt-5 max-w-2xl mx-auto leading-[1.6]">
            Discover our curated selection of timeless pieces, crafted with
            precision and passion.
          </p>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {categories.map((cat, index) => (
            <motion.div
              key={cat._id || index}
              onClick={() => navigate(`/collections/${cat.name.toLowerCase()}`)}
              className="group relative overflow-hidden cursor-pointer h-[380px] md:h-[460px] lg:h-[540px]"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.8,
                delay: index * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {/* IMAGE */}
              <img
                src={cat.image || cat.img}
                alt={cat.name}
                className="w-full h-full object-cover transition duration-[1200ms] ease-out group-hover:scale-[1.06]"
              />

              {/* DARK OVERLAY */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition duration-700" />

              {/* DEFAULT LABEL */}
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-10">
                <p className="text-[10px] uppercase tracking-[0.45em] text-white/70 font-medium mb-2 transition-all duration-700 group-hover:opacity-0 group-hover:translate-y-2">
                  Collection
                </p>
                <h3 className="font-luxury text-3xl md:text-4xl text-white tracking-[0.08em] transition-all duration-700 group-hover:opacity-0 group-hover:translate-y-3">
                  {cat.name}
                </h3>
              </div>

              {/* HOVER OVERLAY */}
              <div className="absolute inset-0 bg-primary/50 backdrop-blur-sm flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-700">
                <span className="absolute text-[160px] md:text-[180px] font-luxury text-white/10 leading-none select-none">
                  {cat.name?.charAt(0)}
                </span>
                <p className="relative text-[10px] uppercase tracking-[0.45em] text-white/80 font-medium">
                  Explore
                </p>
                <h3 className="relative font-luxury text-3xl md:text-4xl text-white tracking-[0.12em]">
                  {cat.name}
                </h3>
                <span className="relative text-xs uppercase tracking-[0.35em] text-white border-b border-white/60 pb-0.5">
                  Shop Now
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
