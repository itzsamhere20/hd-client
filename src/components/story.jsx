import React, { useEffect, useState } from "react";

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

export default function Story() {
  const [scrollY, setScrollY] = useState(0);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative py-5 h-auto  overflow-hidden ">
      {/* ===== TOP TYPOGRAPHY SECTION ===== */}
      <div className="relative max-w-6xl mx-auto px-6 space-y-10">
        {/* HAMDAM (LEFT) */}
        <h1
          className="text-[120px] md:text-[180px] font-bold uppercase stroke-text leading-none"
          style={{
            transform: `translateX(${clamp(-500 + scrollY * 0.1, -500, 80)}px)`,
          }}
        >
          HAMDAM
        </h1>

        {/* PARAGRAPH  */}
        <div className="flex justify-center font-cormorant">
          <p className="max-w-2xl text-center text-gray-800 text-2xl md:text-3xl lg:text-4xl    ">
            At Hamdam Jewellers, every piece is crafted with precision and
            passion. We blend tradition with modern elegance to create timeless
            jewelry.
          </p>
        </div>

        {/* JEWELLERS (RIGHT) */}
        <h1
          className="text-[120px] md:text-[180px] font-bold uppercase stroke-text text-right leading-none"
          style={{
            transform: `translateX(${clamp(500 - scrollY * 0.1, 80, 500)}px)`,
          }}
        >
          JEWELLERS
        </h1>
      </div>

      {/* ===== SPACING =====
      <div className="h-40"></div> */}
      {/* ===== BIG E SECTION ===== */}
      <div className="relative flex justify-center items-center  py-10 ">
        {/* ===== SINGLE INTERACTIVE BOX ===== */}
        <div
          className="relative inline-flex justify-center over items-center cursor-pointer "
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {/* OUTLINE E (BACKGROUND) */}
          <span className="text-[150px] md:text-[320px]  font-bold text-white/40 font-luxury leading-none">
            O
          </span>

          {/* FILL E ANIMATION */}
          <span
            className="absolute text-[150px] md:text-[320px] font-bold text-primary font-luxury leading-none"
            style={{
              clipPath: hover ? "inset(0 0 0 0)" : "inset(100% 0 0 0)",
              transition: "clip-path 2s ease",
            }}
          >
            O
          </span>

          {/* TEXT ON TOP */}
          <div className="absolute z-10 text-center font-luxury">
            <h2
              className={`text-xl md:text-4xl uppercase tracking-[0.3em] text-gray-900 transition-all duration-500 ${
                hover ? "tracking-[0.5em] " : ""
              }`}
            >
              OUR
            </h2>

            <h2
              className={`text-xl md:text-4xl uppercase tracking-[0.3em] text-gray-900 mt-2 transition-all duration-500 ${
                hover ? "scale-105 text-white" : ""
              }`}
            >
              Story
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
