import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Story() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const [hover, setHover] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const viewportMid = window.innerHeight / 2;
      setOffset(viewportMid - sectionCenter);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const speed = 0.15;
  const hamdamX = clamp(offset * speed, -800, 0);
  const jewellersX = clamp(-offset * speed, 0, 800);

  return (
    <section className="mt-24 lg:mt-0">
      {/* ── MOVING TEXT ── */}
      <div
        ref={sectionRef}
        className="relative !w-screen left-1/2 -translate-x-1/2 overflow-hidden py-16"
      >
        <h1
          className="absolute left-0 top-0 font-bold uppercase stroke-text leading-none whitespace-nowrap opacity-60"
          style={{
            fontSize: "clamp(56px, 16vw, 200px)",
            transform: `translateX(${hamdamX}px)`,
            willChange: "transform",
          }}
        >
          HAMDAM
        </h1>

        <div className="relative z-10 flex justify-center py-10 md:py-36 px-6">
          <div className="text-center max-w-2xl space-y-8">
            <p className="text-[10px] md:text-xs lg:text-sm uppercase tracking-[0.45em] text-primary/90 font-medium ">
              Our Promise
            </p>
            <p className="text-gray-700 text-xl md:text-3xl lg:text-4xl leading-[1.6] italic  font-cormorant">
              At Hamdam Jewellers, every piece is crafted with precision and
              passion. We blend tradition with modern elegance to create
              timeless jewelry.
            </p>
          </div>
        </div>

        <h1
          className="absolute right-0 bottom-0 font-bold uppercase stroke-text leading-none whitespace-nowrap text-right opacity-60"
          style={{
            fontSize: "clamp(56px, 16vw, 200px)",
            transform: `translateX(${jewellersX}px)`,
            willChange: "transform",
          }}
        >
          JEWELLERY
        </h1>
      </div>

      {/* ===== BIG E SECTION ===== */}
      <div className="relative flex justify-center items-center  py-10 ">
        {/* ===== SINGLE INTERACTIVE BOX ===== */}
        <div
          className="relative inline-flex justify-center over items-center cursor-pointer "
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => navigate("/about")}
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
