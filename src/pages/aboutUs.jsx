import { useState } from "react";

const collections = {
  Rings: [
    {
      name: "Diamond Crown Ring",
      price: "PKR 25,000",
      img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e",
    },
    {
      name: "Luxury Gold Ring",
      price: "PKR 42,000",
      img: "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d",
    },
    {
      name: "Royal Emerald Ring",
      price: "PKR 55,000",
      img: "https://images.unsplash.com/photo-1617038220319-276d3cfab638",
    },
  ],

  Necklaces: [
    {
      name: "Pearl Necklace",
      price: "PKR 88,000",
      img: "https://images.unsplash.com/photo-1611652022419-a9419f74343d",
    },
    {
      name: "Luxury Diamond Necklace",
      price: "PKR 110,000",
      img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f",
    },
    {
      name: "Golden Heritage Necklace",
      price: "PKR 96,000",
      img: "https://images.unsplash.com/photo-1611652022419-a9419f74343d",
    },
  ],

  Bracelets: [
    {
      name: "Elegant Bracelet",
      price: "PKR 35,000",
      img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a",
    },
    {
      name: "Luxury Gold Bracelet",
      price: "PKR 45,000",
      img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a",
    },
    {
      name: "Royal Bracelet",
      price: "PKR 52,000",
      img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a",
    },
  ],

  Earrings: [
    {
      name: "Diamond Earrings",
      price: "PKR 28,000",
      img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908",
    },
    {
      name: "Luxury Pearl Earrings",
      price: "PKR 36,000",
      img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908",
    },
    {
      name: "Royal Gold Earrings",
      price: "PKR 41,000",
      img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908",
    },
  ],
};

export default function AboutUs() {
  const [active, setActive] = useState("Rings");

  return (
    <section className=" overflow-hidden text-gray-900  relative max-w-7xl mx-auto px-6 py-20">
      {/* ===== HERO ===== */}
      <div className="relative py-12 lg:py-28 flex items-center px-6 justify-center md:justify-end ">
        <h1 className="absolute md:left-0 text-5xl md:text-6xl lg:text-7xl font-luxury text-black z-20 leading-none">
          Our Story
        </h1>

        <img
          src="https://t4.ftcdn.net/jpg/05/36/09/73/360_F_536097363_JgtB1decJ8ahW5u35bDzHwWkQuDe7RVd.jpg"
          alt="hero"
          className=" 
            w-full   md:w-[85%]
            h-[250px] md:h-[400px]  lg:h-[500px]
            object-cover 
          "
        />
      </div>

      {/* ===== STAIRS GRID ===== */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-20 px-6 py-5 md:py-10  ">
        <div>
          <img
            src="https://images.unsplash.com/photo-1617038220319-276d3cfab638"
            alt="about"
            className="w-full  h-[425px] md:h-[360px] object-cover hidden md:block lg:h-[450px]"
          />
        </div>

        <div className="md:mt-0 flex flex-col justify-center">
          <h2 className="font-luxury text-3xl  md:text-5xl lg:text-6xl mb-6 tracking-wider text-center">
            About Us
          </h2>
          <p className="font-cormorant text-xl lg:text-2xl leading-[1.7] text-gray-800">
            With Hamdam, we’ve built a clever, customizable jewelry line that
            morphs with you. A necklace becomes a pair of anklets; an earring
            turns into a ring. Crafted from the finest materials and precious
            stones, Hamdam’s contemporary fine jewelry can be modified to match
            your mood, no matter where you are.
          </p>
        </div>

        <div className="md:mt-56 flex justify-end items-end">
          <img
            src="https://images.unsplash.com/photo-1611652022419-a9419f74343d"
            alt="about"
            className="w-full h-[425px] md:h-[360px] object-cover lg:h-[450px] "
          />
        </div>
      </div>

      {/* ===== PRECIOUS METAL ===== */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="font-luxury text-3xl md:text-5xl lg:text-6xl mb-16 tracking-wide">
          Precious Metal
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-20 xl:gap-48   w-full ">
          <div className="">
            <img
              src="https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d"
              alt="value"
              className="w-full h-[300px] md:h-[280px]  object-cover"
            />

            <h3 className="font-luxury text-2xl md:text-3xl lg:text-4xl mt-8 mb-4 italic text-black">
              Our Value
            </h3>

            <p className="font-cormorant text-xl lg:text-2xl leading-[1.7] text-gray-800">
              The world is our home and we are called to leave it better than we
              found it. Everything we do, from creating sustainable products to
              building communities, is based on that principle. When you buy
              Hamdam jewelry, you’re supporting our artists and helping them
              make their lives, and the lives of their families, better.
            </p>
          </div>

          <div className="flex  md:mt-20 justify-center">
            <img
              src="https://i.pinimg.com/736x/21/4e/51/214e51fb17c1097fbca6cd89ae5030d2.jpg"
              alt="metal"
              className="w-full h-[400px] object-cover"
            />
          </div>

          <div className=" ">
            <h3 className="font-luxury text-2xl md:text-3xl lg:text-4xl mt-8 mb-4 italic text-black">
              Our Philosophy
            </h3>

            <p className="font-cormorant text-xl lg:text-2xl leading-[1.7] text-gray-800 mb-10">
              Built on the idea that life is yours for the making, Hamdam is a
              modular fine jewelry brand that, in its modularity, empowers you
              to live exactly as you are in a world of limitless possibilities.
            </p>

            <img
              src="https://images.unsplash.com/photo-1605100804763-247f67b3557e"
              alt="philosophy"
              className="w-full h-[300px] md:h-[280px] object-cover"
            />
          </div>
        </div>
      </div>

      {/* ===== MOVING TEXT ===== */}
      <div className="relative py-32 overflow-hidden">
        <h1 className="text-[40px] sm:text-[70px] md:text-[140px] lg:text-[250px] font-luxury text-primary/10 whitespace-nowrap">
          TIMELESS ELEGANCE
        </h1>

        <h1 className="text-[40px] sm:text-[70px] md:text-[140px] lg:text-[250px] font-luxury text-primary/10 whitespace-nowrap">
          MODERN LUXURY
        </h1>
      </div>

      {/* ===== ORIGINS ===== */}
      <div className="relative max-w-7xl mx-auto px-6 md:py-16 md:mb-20 flex justify-end flex-col md:flex-row items-center">
        <img
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
          alt="founder"
          className="
            w-[320px] md:w-[50%] lg:w-[40%] 
            h-[450px] md:h-[400px] lg:h-[600px]
            object-cover
          "
        />

        <div
          className="
            relative lg:absolute
            left-0 lg:left-[5%]
            bottom -0 md:-bottom-[10%]

          
            p-8 md:p-14
            max-w-xl
          "
        >
          <h2 className="font-luxury text-3xl md:text-4xl lg:text-5xl tracking-wider mb-6">
            Our Origins &
            <br />
            Where We Want To Go
          </h2>
          <p className="font-cormorant text-xl lg:text-2xl italic leading-[1.7] text-gray-700">
            Hamdam was founded with a vision to blend timeless artistry with
            modern luxury. We continue to craft pieces that celebrate elegance,
            identity and unforgettable moments.
          </p>
        </div>
      </div>

      {/* ===== COLLECTIONS SHOWCASE ===== */}
      <div className="max-w-7xl mx-auto px-6 pt-24">
        <div className="max-w-2xl mb-7  md:mb-16">
          <p className="font-cormorant text-2xl md:text-3xl  leading-[1.5] lg:leading-[1.7] text-gray-700">
            Explore our curated collections crafted with timeless beauty and
            refined luxury.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 items-start">
          {/* LEFT CATEGORY */}
          <div className="flex lg:flex-col gap-6 lg:gap-10 flex-wrap">
            {Object.keys(collections).map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`
                  text-xl md:text-2xl lg:text-3xl
                  font-cormorant 
                  transition-all duration-500
                  ${
                    active === cat
                      ? "opacity-100 text-gray-900"
                      : "opacity-30 hover:opacity-60"
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* RIGHT PRODUCTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 flex-1 w-full">
            {collections[active].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="bg-white h-[260px] md:h-[340px] flex items-center justify-center overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="h-[80%] object-contain transition duration-700 group-hover:scale-105"
                  />
                </div>

                <h3 className="font-cormorant text-2xl mt-5 text-gray-900">
                  {item.name}
                </h3>

                <p className="mt-2 text-primary tracking-widest text-sm">
                  {item.price}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
