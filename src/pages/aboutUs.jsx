import { useEffect, useState, useMemo } from "react";
import api from "../components/api";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
export default function AboutUs() {
  const navigate = useNavigate();
  const [active, setActive] = useState("Rings");
  const [scrollY, setScrollY] = useState(0);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [owner, setOwner] = useState(null);

  /* ================= SCROLL ================= */
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, c, o] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
          api.get("/settings/store/owner"),
        ]);

        setProducts(p.data || []);
        setCategories(c.data || []);
        setOwner(o.data || null);
        console.log(" owne values are", p.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  /* ================= GROUP PRODUCTS ================= */
  const grouped = useMemo(() => {
    const map = {};

    products.forEach((p) => {
      const cat = p.category?.name || p.category;
      if (!map[cat]) map[cat] = [];
      map[cat].push(p);
    });

    Object.keys(map).forEach((k) => {
      map[k] = map[k].slice(0, 3);
    });

    return map;
  }, [products]);

  /* ================= CLAMP ================= */
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  return (
    <section className="overflow-hidden text-gray-900 relative max-w-7xl mx-auto px-6 py-20">
      {/* ================= HERO ================= */}
      <div className="relative py-12 lg:py-28 flex items-center px-6 justify-center md:justify-end">
        <h1 className="absolute md:left-0 text-5xl md:text-6xl lg:text-7xl font-luxury text-black z-20 leading-none">
          Our Story
        </h1>

        <img
          src={
            owner?.storyImage ||
            "https://t4.ftcdn.net/jpg/05/36/09/73/360_F_536097363_JgtB1decJ8ahW5u35bDzHwWkQuDe7RVd.jpg"
          }
          className="w-full md:w-[85%] h-[250px] md:h-[400px] lg:h-[500px] object-cover"
        />
      </div>

      {/* ================= ABOUT GRID ================= */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-20 px-6 py-5 md:py-10">
        <img
          src={
            owner?.aboutLeftImage ||
            "https://images.unsplash.com/photo-1617038220319-276d3cfab638"
          }
          className="w-full h-[425px] hidden md:block object-contain lg:h-[450px] mt-20"
        />

        <div className="flex flex-col justify-center">
          <h2 className="font-luxury text-3xl md:text-5xl lg:text-6xl mb-6 tracking-wider md:text-center">
            About Us
          </h2>

          <p className="font-cormorant text-xl lg:text-2xl leading-[1.7] text-gray-800">
            {owner?.aboutDescription ||
              "With Hamdam, we’ve built a clever, customizable jewelry line that morphs with you..."}
          </p>
        </div>

        <img
          src={
            owner?.aboutrightImage ||
            "https://images.unsplash.com/photo-1611652022419-a9419f74343d"
          }
          className="w-full h-[425px] object-contain lg:h-[450px]"
        />
      </div>

      {/* ================= PRECIOUS METAL ================= */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="font-luxury text-3xl md:text-5xl lg:text-6xl mb-16 tracking-wide">
          Precious Metal
        </h2>
        {/* ----our value---- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-20 xl:gap-18">
          <div>
            <img
              src={
                owner?.ourValueImage ||
                "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d"
              }
              className="w-full h-[300px] object-contain"
            />

            <h3 className="font-luxury text-2xl md:text-3xl lg:text-4xl mt-8 mb-4 italic">
              {owner?.ourValueTitle || "Our Value"}
            </h3>

            <p className="font-cormorant text-xl leading-[1.7] text-gray-800">
              {owner?.ourValueDescription ||
                "The world is our home and we are called to leave it better than we found it."}
            </p>
          </div>
          {/* ------center image---- */}
          <div className="flex justify-center md:mt-20">
            <img
              src={
                owner?.preciousCenterImage ||
                "https://i.pinimg.com/736x/21/4e/51/214e51fb17c1097fbca6cd89ae5030d2.jpg"
              }
              className="w-full h-[400px] object-contain"
            />
          </div>
          {/* ------------------ourphilosophy---- */}
          <div>
            <h3 className="font-luxury text-2xl md:text-3xl lg:text-4xl mb-4 italic">
              {owner?.philosophyTitle || "Our Philosophy"}
            </h3>

            <p className="font-cormorant text-xl leading-[1.7] text-gray-800 mb-10">
              {owner?.philosophyDescription ||
                "Built on the idea that life is yours for the making..."}
            </p>

            <img
              src={
                owner?.philosophyImage ||
                "https://images.unsplash.com/photo-1605100804763-247f67b3557e"
              }
              className="w-full h-[300px] object-contain"
            />
          </div>
        </div>
      </div>

      {/* ================= MOVING TEXT ================= */}
      <div className="relative py-32 overflow-hidden">
        <h1
          className="font-luxury uppercase text-primary/10 whitespace-nowrap text-[60px] sm:text-[100px] md:text-[160px] lg:text-[220px]"
          style={{
            transform: `translateX(${clamp(-500 + scrollY * 0.2, -500, 80)}px)`,
          }}
        >
          HAMDAM
        </h1>

        <p className="font-cormorant text-center max-w-2xl mx-auto text-xl md:text-3xl text-gray-700">
          At Hamdam Jewellers, every piece is crafted with precision and
          passion.
        </p>

        <h1
          className="font-luxury uppercase text-primary/10 text-right whitespace-nowrap text-[60px] sm:text-[100px] md:text-[160px] lg:text-[220px]"
          style={{
            transform: `translateX(${clamp(500 - scrollY * 0.2, 80, 500)}px)`,
          }}
        >
          JEWELLERS
        </h1>
      </div>

      {/* ===== ORIGINS ===== */}
      <div className="relative max-w-7xl mx-auto px-6 md:py-16 md:mb-20 flex justify-end flex-col md:flex-row items-center">
        <img
          src={
            owner?.image ||
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
          }
          alt={owner?.name || "Hamdam"}
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
            {owner?.description ||
              "Hamdam was founded with a vision to blend timeless artistry with modern luxury. We continue to craft pieces that celebrate elegance,identity and unforgettable moments."}
          </p>
        </div>
      </div>

      {/* ================= COLLECTIONS ================= */}
      <div className="max-w-7xl mx-auto px-6 pt-24">
        <p className="font-cormorant text-2xl md:text-3xl mb-16 text-gray-700">
          Explore our curated collections crafted with timeless beauty.
        </p>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* CATEGORIES */}
          <div className="flex lg:flex-col gap-6 lg:gap-10 flex-wrap justify-start">
            {categories.map((cat) => (
              <button
                key={cat._id || cat.name}
                onClick={() => setActive(cat.name)}
                className={`text-2xl md:text-3xl font-cormorant transition ${
                  active === cat.name
                    ? "opacity-100 text-primary italic"
                    : "opacity-30"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* PRODUCTS */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 flex-1">
            {(grouped[active] || []).map((item, index) => (
              <motion.button
                key={item._id}
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -8 }}
                className="group text-center"
                onClick={() =>
                  navigate(`/collections/${item.category}/${item._id}`)
                }
              >
                {/* IMAGE */}
                <div
                  className="
          relative
          h-[280px] md:h-[360px]
          bg-[#faf8f5]
          overflow-hidden
          flex items-center justify-center
        "
                >
                  {/* luxury overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/5 opacity-0 group-hover:opacity-100 transition duration-700 z-10" />

                  <motion.img
                    src={item.image}
                    alt={item.name}
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.7 }}
                    className="
            h-[82%]
            w-[82%]
            object-scale-down
            relative
            z-0
          "
                  />
                </div>

                {/* DETAILS */}
                <div className="pt-7 space-y-3">
                  {/* category */}
                  <p
                    className="
            text-[10px]
            uppercase
            tracking-[0.45em]
            text-primary/70
            font-medium
          "
                  >
                    {item.type}
                  </p>

                  {/* name */}
                  <h3
                    className="
            font-cormorant
            text-lg
            md:text-
            uppercase
            tracking-[0.18em]
            text-black
            leading-tight
          "
                  >
                    {item.name}
                  </h3>

                  {/* price */}
                  {item.discount > 0 ? (
                    <div className="space-y-2">
                      {/* FINAL PRICE */}
                      <p
                        className="
        text-[11px]
        tracking-[0.55em]
        uppercase
        text-neutral-700
      "
                      >
                        PKR{" "}
                        {(
                          Number(item.price) -
                          Math.floor((Number(item.price) * item.discount) / 100)
                        ).toLocaleString("en-PK")}
                      </p>

                      {/* OLD PRICE */}
                      <p
                        className="
        text-[10px]
        tracking-[0.4em]
        uppercase
        text-neutral-400
        line-through
      "
                      >
                        PKR {Number(item.price).toLocaleString("en-PK")}
                      </p>
                    </div>
                  ) : (
                    <p
                      className="
      text-[11px]
      tracking-[0.55em]
      uppercase
      text-neutral-500
    "
                    >
                      PKR {Number(item.price).toLocaleString("en-PK")}
                    </p>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
