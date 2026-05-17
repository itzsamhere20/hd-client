const CTASection = () => {
  return (
    <section className="py-16 md:py-24 space-y-12 md:space-y-16 lg:space-y-28">
      {/* ===== FIRST CTA ===== */}
      <div className="relative">
        {/* FULL  BAR */}
        <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-[55%] md:h-[300px] lg:h-[500px] bg-[#966b2a1e]"></div>

        <div className="relative max-w-7xl mx-auto  flex flex-col md:flex-row items-center justify-between gap-12 px-4 md:px-6">
          {/* IMAGE */}
          <div className="w-full md:w-1/2 flex justify-end md:justify-start z-10">
            <img
              src="https://bijoux.vamtam.com/wp-content/uploads/2020/05/iStock-1136336605.jpg"
              alt="necklace"
              className="w-[260px] md:w-[300px] lg:w-[520px] object-cover drop-shadow-lg"
            />
          </div>

          {/* TEXT */}
          <div className="md:w-1/2 text-left    z-10">
            <h2 className="font-luxury tracking-wide text-3xl md:text-4xl lg:text-7xl text-gray-900 leading-snug">
              Beautiful Diamond Necklace
            </h2>

            <p
              className="mt-4 font-cormorant text-lg text-gray-800
            md:max-w-md lg:max-w-lg  mr-20 md:mr-0 text-left mx-auto md:mx-0 lg:text-3xl "
            >
              A refined statement of elegance, designed to capture light and
              attention effortlessly.
            </p>

            <button className="mt-6 text-xs lg:text-lg uppercase tracking-widest border-b border-black hover:text-primary  hover:border-primary transition">
              Discover
            </button>
          </div>
        </div>
      </div>

      {/* ===== SECOND CTA (REVERSED) ===== */}
      <div className="relative">
        {/* FULL BLEED BAR */}
        <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[55%] md:h-[300px] lg:h-[500px] bg-[#e1edf7]"></div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 flex flex-col-reverse md:flex-row items-center justify-between gap-12">
          {/* TEXT */}
          <div className="md:w-1/2 text-right z-10  flex flex-col items-end">
            <h2 className="font-luxury text-3xl md:text-4xl lg:text-7xl text-gray-900 leading-snug tracking-wide">
              Elegant Bridal Collection
            </h2>

            <p className="mt-4 font-cormorant text-lg text-gray-800 max-w-md lg:max-w-lg ml-20 md:ml-0  text-right mx-auto md:mx-0 lg:text-3xl  ">
              Timeless craftsmanship curated for the most memorable moments of
              your life.
            </p>

            <button className="mt-6 text-xs lg:text-lg uppercase tracking-widest border-b border-black hover:text-primary  hover:border-primary  transition">
              Discover
            </button>
          </div>

          {/* IMAGE */}
          <div className="w-full md:w-1/2 flex   md:justify-end z-10">
            <img
              src="https://bijoux.vamtam.com/wp-content/uploads/2020/05/iStock-1136336598.jpg"
              alt="bridal"
              className="w-[260px] md:w-[300px] lg:w-[520px] object-cover drop-shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
