import React, { useEffect, useState } from "react";
import api from "./api";

const Categories = () => {
  const [hover, setHover] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // fallback
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");

        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.categories || [];

        if (data.length > 0) {
          // shuffle categories
          const shuffled = [...data].sort(() => Math.random() - 0.5);

          // take only 3
          setCategories(shuffled.slice(0, 3));
        } else {
          setCategories(fallbackCategories);
        }
      } catch (err) {
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-24 flex items-center justify-center">
        <p className="uppercase tracking-[0.35em] text-[#A68A3C] animate-pulse text-xs md:text-sm">
          Loading Collections...
        </p>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 px-4 md:px-6">
      {/* ===== HERO TEXT + IMAGE ===== */}
      <div className="relative flex flex-col items-center justify-center mb-16 md:mb-24">
        {/* BIG BACKGROUND TEXT */}
        <h1 className="text-[50px] md:text-[100px] lg:text-9xl font-luxury text-primary/20 tracking-[0.18em] -z-10">
          COLLECTIONS
        </h1>

        {/* IMAGE */}
        <img
          src="https://bijoux.vamtam.com/wp-content/uploads/2020/11/iStock-1164770941-Hand.png"
          alt="hand"
          className="
            w-[70px]
            md:w-[150px]
            lg:w-[180px]
            object-contain
            -mt-20
            md:-mt-28
            lg:-mt-40
          "
        />
      </div>

      {/* ===== DESCRIPTION ===== */}
      <div className="max-w-5xl mx-auto text-center mb-12 md:mb-16 px-4">
        <p className="font-cormorant text-xl md:text-3xl lg:text-5xl text-black leading-[1.25] tracking-[0.03em]">
          Discover our curated selection of timeless pieces, crafted with
          precision and passion
        </p>
      </div>

      {/* ===== CATEGORY CARDS ===== */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 lg:gap-16 px-2 md:px-5">
        {categories.map((cat, index) => (
          <div
            key={cat._id || index}
            className="
              relative
              group
              overflow-hidden
              h-[400px]
              md:h-[480px]
              lg:h-[550px]
              cursor-pointer
            "
          >
            {/* IMAGE */}
            <img
              src={cat.image || cat.img}
              alt={cat.name}
              className="
                w-full
                h-full
                object-cover
                transition
                duration-[1400ms]
                ease-out
                group-hover:scale-[1.05]
              "
            />

            {/* DARK OVERLAY */}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition duration-700" />

            {/* DEFAULT TEXT */}
            <div className="absolute inset-0 flex items-center justify-center">
              <h2
                className="
                  text-white
                  text-5xl
                  md:text-3xl
                  lg:text-4xl
                  font-cormorant
                  font-semibold
                  tracking-[0.08em]
                  transition-all
                  duration-1000
                  group-hover:opacity-0
                  group-hover:translate-y-4
                "
              >
                {cat.name}
              </h2>
            </div>

            {/* SLIDE UP OVERLAY */}
            <div
              className="
                absolute
                bottom-0
                left-0
                w-full
                h-0
                bg-primary/50
                backdrop-blur-md
                overflow-hidden
                transition-all
                duration-700
                ease-in-out
                group-hover:h-full
                flex
                items-center
                justify-center
              "
            >
              {/* BIG LETTER */}
              <span
                className="
                  absolute
                  text-[150px]
                  md:text-[120px]
                  lg:text-[180px]
                  font-luxury
                  text-white/10
                  scale-95
                  opacity-0
                  transition-all
                  duration-1000
                  delay-200
                  group-hover:opacity-100
                  group-hover:text-white/20
                  group-hover:scale-100
                "
              >
                {cat.name?.charAt(0)}
              </span>

              {/* FULL WORD */}
              <span
                className="
                  relative
                  text-white
                  text-5xl
                  md:text-3xl
                  lg:text-4xl
                  tracking-[0.2em]
                  font-cormorant
                  font-semibold
                "
              >
                {cat.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ===== BIG E SECTION ===== */}
      <div className="relative flex justify-center items-center py-10 md:py-16">
        <div
          className="relative inline-flex justify-center items-center cursor-pointer"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {/* OUTLINE */}
          <span className="text-[150px] md:text-[320px] font-bold text-white font-luxury leading-none">
            E
          </span>

          {/* FILL */}
          <span
            className="absolute text-[150px] md:text-[320px] font-bold text-primary font-luxury leading-none"
            style={{
              clipPath: hover ? "inset(0 0 0 0)" : "inset(100% 0 0 0)",
              transition: "clip-path 1.8s ease",
            }}
          >
            E
          </span>

          {/* TEXT */}
          <div className="absolute z-10 text-center font-luxury">
            <h2
              className={`
                text-xl
                md:text-4xl
                uppercase
                tracking-[0.3em]
                text-gray-900
                transition-all
                duration-500
                ${hover ? "tracking-[0.45em]" : ""}
              `}
            >
              Explore
            </h2>

            <h2
              className={`
                text-xl
                md:text-4xl
                uppercase
                tracking-[0.3em]
                text-gray-900
                mt-2
                transition-all
                duration-500
                ${hover ? "scale-105 text-white" : ""}
              `}
            >
              Collection
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;
