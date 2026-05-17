import React, { useState } from "react";
const Categories = () => {
  const [hover, setHover] = useState(false);
  const categories = [
    {
      name: "Rings",
      img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e",
    },
    {
      name: "Necklace",
      img: "https://images.unsplash.com/photo-1611652022419-a9419f74343d",
    },
    {
      name: "Earrings",
      img: "https://bijoux.vamtam.com/wp-content/uploads/2020/05/iStock-1136336605.jpg",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 md:px-6">
      {/* ===== HERO TEXT + IMAGE ===== */}
      <div className="relative flex flex-col items-center justify-center mb-16 md:mb-24">
        {/* BIG BACKGROUND TEXT */}
        <h1 className=" text-[50px] md:text-[100px] lg:text-9xl font-luxury text-primary/30 -z-10">
          COLLECTIONS
        </h1>

        {/* IMAGE */}
        <img
          src="https://bijoux.vamtam.com/wp-content/uploads/2020/11/iStock-1164770941-Hand.png"
          alt="hand"
          className=" w-[70px] md:w-[150px] lg:w-[180px] object-contain
          -mt-20 md:-mt-28 lg:-mt-40"
        />
      </div>
      {/* /* ===== CATEGORY DESCRIPTION ===== */}
      <div className="max-w-5xl mx-auto text-center mb-12 md:mb-16 px-4">
        <p className="font-cormorant text-lg md:text-3xl lg:text-5xl text-black !leading-[1.3] ">
          Discover our curated selection of timeless pieces, crafted with
          precision and passion
        </p>
      </div>

      {/* ===== CATEGORY CARDS ===== */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 lg:gap-16 px-5 ">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="relative group overflow-hidden h-[400px] md:h-[480px] lg:h-[550px] cursor-pointer"
          >
            {/* IMAGE */}
            <img
              src={cat.img}
              alt={cat.name}
              className="w-full h-full object-cover transition duration-1000 group-hover:scale-105"
            />

            {/* DEFAULT TEXT */}
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-white text-5xl md:text-3xl  lg:text-4xl font-semibold font-cormorant tracking-wide group-hover:text-transparent bg-clip-text bg-gradient-to-r from-white to-white/0 transition duration-1000 ease-in-out">
                {cat.name}
              </h2>
            </div>

            {/* SLIDE UP OVERLAY */}
            <div
              className="
        absolute bottom-0 left-0 w-full h-0
        bg-primary/50  backdrop-blur-sm overflow-hidden
        transition-all duration-700 ease-in-out
        group-hover:h-full
        flex items-center justify-center
      "
            >
              {/* BIG LETTER (delayed) */}
              <span
                className="
      absolute text-[150px] md:text-[100px] lg:text-[150px]
      font-luxury text-white/10
       scale-95 opacity-0
      transition-all duration-1000 delay-200
      group-hover:opacity-100 group-hover:text-white/30 group-hover:scale-100
    "
              >
                {cat.name.charAt(0)}
              </span>

              {/* FULL WORD */}
              <span
                className="relative text-white text-5xl md:text-3xl
              lg:text-4xl  tracking-wide lg:tracking-widest font-cormorant font-semibold"
              >
                {cat.name}
              </span>
            </div>
          </div>
        ))}
      </div>
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
            E
          </span>

          {/* FILL E ANIMATION */}
          <span
            className="absolute text-[150px] md:text-[320px] font-bold text-primary font-luxury leading-none"
            style={{
              clipPath: hover ? "inset(0 0 0 0)" : "inset(100% 0 0 0)",
              transition: "clip-path 2s ease",
            }}
          >
            E
          </span>

          {/* TEXT ON TOP */}
          <div className="absolute z-10 text-center font-luxury">
            <h2
              className={`text-xl md:text-4xl uppercase tracking-[0.3em] text-gray-900 transition-all duration-500 ${
                hover ? "tracking-[0.5em] " : ""
              }`}
            >
              Explore
            </h2>

            <h2
              className={`text-xl md:text-4xl uppercase tracking-[0.3em] text-gray-900 mt-2 transition-all duration-500 ${
                hover ? "scale-105 text-white" : ""
              }`}
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
