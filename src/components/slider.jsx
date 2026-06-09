import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectFade } from "swiper/modules";
import api from "./api";
import { useNavigate } from "react-router-dom";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const Slider = () => {
  const fallbackSlides = [
    {
      title: "Diamond Elegance",
      paragraph: "Adjustable . 18Karat Gold . Diamond",
      mainImage:
        "https://bijoux.vamtam.com/wp-content/uploads/2020/11/j3378po023200-2-1.jpg",
      pngImage:
        "https://bijoux.vamtam.com/wp-content/uploads/2020/11/j3371po033200-3-2.png",
      color: "#e7d8c3",
    },
    {
      title: "Bridal Luxury",
      paragraph: "Light in weight . 18Karat Gold . Opal",
      mainImage:
        "https://bijoux.vamtam.com/wp-content/uploads/2020/11/j3378po023200-4.jpg",
      pngImage:
        "https://bijoux.vamtam.com/wp-content/uploads/2020/11/j3371po033200.png",
      color: "#dfeaf2",
    },
    {
      title: "Golden Heritage",
      paragraph: "Timeless design . 18Karat Gold . Pearl",
      mainImage:
        "https://bijoux.vamtam.com/wp-content/uploads/2020/11/j3378po023200-3-1.jpg",
      pngImage:
        "https://bijoux.vamtam.com/wp-content/uploads/2020/11/j3371po033200-2-1.png",
      color: "#f3ead9",
    },
  ];

  const navigate = useNavigate();
  const [slides, setSlides] = useState(fallbackSlides);
  const [active, setActive] = useState(0);
  const [swiperRef, setSwiperRef] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCachedData = () => {
      try {
        const cached = localStorage.getItem("SLIDER_CACHE");
        if (!cached) return null;

        const parsed = JSON.parse(cached);
        return parsed?.data || null;
      } catch {
        return null;
      }
    };

    const fetchFromAPI = async () => {
      try {
        const res = await api.get("/settings/store/slider");

        const data = res.data?.slides || [];

        const finalData =
          Array.isArray(data) && data.length > 0 ? data : fallbackSlides;

        setSlides(finalData);

        localStorage.setItem(
          "SLIDER_CACHE",
          JSON.stringify({
            data: finalData,
            time: Date.now(),
          }),
        );
      } catch (err) {
        console.log("API failed, keeping cached slider data");
      } finally {
        setLoading(false);
      }
    };

    // 1️⃣ instant load
    const cached = getCachedData();

    if (cached && cached.length) {
      setSlides(cached);
      setLoading(false);
    } else {
      setSlides(fallbackSlides);
      setLoading(false);
    }

    // 2️⃣ background refresh
    fetchFromAPI();
  }, []);
  if (loading) {
    return (
      <section className="py-24 text-center">
        <p className="tracking-[0.35em] uppercase text-[#A68A3C] animate-pulse">
          Loading Luxury...
        </p>
      </section>
    );
  }

  return (
    <section className="relative py-24">
      <Swiper
        modules={[Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={true}
        onSwiper={setSwiperRef}
        onSlideChange={(swiper) => setActive(swiper.realIndex)}
        pagination={{
          clickable: true,
          el: ".custom-pagination",
        }}
        className="w-full"
      >
        {slides.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full mx-auto md:max-w-7xl flex flex-col md:flex-row items-center justify-between mt-5 md:mt-0 px-6 py-10">
              {/* 💎 LUXURY BAR (FROM API COLOR) */}
              <div
                className="absolute left-1/2 -translate-x-1/2 w-[95%] h-full md:h-[300px] lg:h-[450px] opacity-100"
                style={{
                  backgroundColor: `
                  
                  
                      ${item.color || "#e7d8c3"}
                    
                    
                    
                  `,
                }}
              />

              {/* IMAGE */}
              <div className="md:w-1/2 flex justify-center relative z-10">
                <img
                  loading="lazy"
                  src={item.mainImage}
                  alt={item.title}
                  className="w-[200px] md:w-[270px] lg:w-[400px] object-cover -translate-y-20 md:translate-y-0"
                />
              </div>

              {/* CONTENT */}
              <div className="md:w-1/2 relative text-center md:text-center flex flex-col items-center justify-center md:items-start mt-10 md:mt-0 group z-10">
                {/* PNG OVERLAY */}
                <img
                  loading="lazy"
                  src={item.pngImage}
                  alt="decor"
                  className="
                    absolute
                    top-[-120px] md:top-[-170px]
                    lg:top-[-270px]
                    left-1/2 md:left-[35%]
                    -translate-x-1/2
                    w-[220px] md:w-[200px] lg:w-[300px]
                    opacity-90
                    pointer-events-none
                  "
                />

                <h2 className=" text-left font-luxury text-3xl md:text-5xl lg:text-6xl text-gray-900 mt-20 md:mt-0">
                  {item.title}
                </h2>

                <p className="font-cormorant text-lg md:text-xl lg:text-2xl text-gray-800 max-w-md italic leading-[1.5] md:mt-3">
                  {item.paragraph}
                </p>

                <button
                  className="mt-6 text-xs uppercase tracking-widest border-b border-black hover:text-primary transition"
                  onClick={() => navigate("/collections")}
                >
                  Discover
                </button>
              </div>

              {/* DOTS */}
              <div className="absolute right-0 top-1/2 md:static md:flex md:flex-col md:gap-5 flex flex-col gap-5 z-50 mr-10">
                {slides.map((_, i) => (
                  <div
                    key={i}
                    title="change slide"
                    aria-label="butotn to switch slides"
                    onClick={() => swiperRef?.slideToLoop(i)}
                    className={`
                      w-3 h-3 rotate-45 cursor-pointer transition-all duration-300
                      ${
                        i === active
                          ? "bg-primary scale-125 shadow-[0_0_8px_rgba(166,138,60,0.6)]"
                          : "bg-primary/30"
                      }
                    `}
                  />
                ))}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Slider;
