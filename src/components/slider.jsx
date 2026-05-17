import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const slides = [
  {
    title: "Diamond Elegance",
    text: "Adjustable . 18Karat Gold . Diamond",
    img: "https://bijoux.vamtam.com/wp-content/uploads/2020/11/j3378po023200-2-1.jpg",
    overlay:
      "https://bijoux.vamtam.com/wp-content/uploads/2020/11/j3371po033200-3-2.png",
    bg: "#f5efe6",
  },
  {
    title: "Bridal Luxury",
    text: "Light in weight . 18Karat Gold . Opal",
    img: "https://bijoux.vamtam.com/wp-content/uploads/2020/11/j3378po023200-4.jpg",
    overlay:
      "https://bijoux.vamtam.com/wp-content/uploads/2020/11/j3371po033200.png",
    bg: "#eef2f5",
  },
  {
    title: "Golden Heritage",
    text: "Timeless design . 18Karat Gold . Pearl",
    img: "https://bijoux.vamtam.com/wp-content/uploads/2020/11/j3378po023200-3-1.jpg",
    overlay:
      "https://bijoux.vamtam.com/wp-content/uploads/2020/11/j3371po033200-2-1.png",
    bg: "#f7f2e7",
  },
];

const Slider = () => {
  const [active, setActive] = useState(0);
  const [swiperRef, setSwiperRef] = useState(null);
  return (
    <section className=" relative">
      <Swiper
        modules={[Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={true}
        autoplay={false}
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
            {/* MAIN WRAPPER */}
            <div className="relative w-full  mx-auto md:max-w-7xl  flex flex-col md:flex-row items-center justify-between mt-5 md:mt-0 px-6  py-10 ">
              {/* ===== BACKGROUND BAR (same) ===== */}
              <div className="absolute left-1/2 -translate-x-1/2 w-[95%] h-full  md:h-[300px] lg:h-[450px] bg-[#e0dfda]" />

              {/* ===== IMAGE (mobile: half outside bar) ===== */}
              <div className="md:w-1/2 flex justify-center relative z-10 ">
                <img
                  src={item.img}
                  alt={item.title}
                  className="
        w-[200px] md:w-[270px] lg:w-[400px]
        object-cover

       
        -translate-y-20  md:translate-y-0
        
      "
                />
              </div>

              {/* ===== RIGHT SIDE CONTENT ===== */}
              <div className="md:w-1/2 relative text-center md:text-center flex flex-col items-center justify-center md:items-start mt-10 md:mt-0  group ">
                {/* ===== HUGE OVERLAY (CENTER MOBILE HERO) ===== */}
                <img
                  src={item.overlay}
                  alt="decor"
                  className="
        absolute
        top-[-120px] md:top-[-170px]
        lg:top-[-270px]
        left-1/2 md:left-[35%]
        -translate-x-1/2

        w-[220px] md:w-[200px] lg:w-[300px] 
        opacity-90 group-hover:rotate-[-10deg] group-hover:scale-110 transition duration-500
        pointer-events-none
      "
                />

                {/* TITLE */}
                <h2 className="font-luxury text-3xl md:text-5xl lg:text-6xl text-gray-900 mt-20 md:mt-0">
                  {item.title}
                </h2>
                {/* PARAGRAPH + PAGINATION WRAPPER */}

                {/* TEXT */}
                <p className="font-cormorant text-lg md:text-xl lg:text-2xl text-gray-800 max-w-md italic leading-[1.5] md:mt-3">
                  {item.text}
                </p>

                {/* BUTTON */}
                <button className="mt-6 text-xs uppercase tracking-widest border-b border-black hover:text-primary transition group">
                  Discover
                </button>
              </div>
              <div
                className="
    absolute
    
    
    right-10
    top-1/2 

    md:static
    md:translate-y-0
     md:-translate-x-10
    md:flex
    md:flex-col
    md:gap-5

    flex flex-col gap-5
    z-50
  "
              >
                {slides.map((_, i) => (
                  <div
                    key={i}
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
