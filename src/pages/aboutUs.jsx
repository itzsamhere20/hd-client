import { useEffect, useState, useMemo, useRef } from "react";
import api from "../components/api";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function AboutUs() {
  const navigate = useNavigate();
  const [active, setActive] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const [hover, setHover] = useState(false);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [owner, setOwner] = useState(null);

  // ref to measure how far the moving-text section is from top
  const marqueeRef = useRef(null);
  const [marqueeOffset, setMarqueeOffset] = useState(0);

  /* ================= SCROLL ================= */
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      if (marqueeRef.current) {
        const rect = marqueeRef.current.getBoundingClientRect();
        // how far the centre of the section has been scrolled past the viewport midpoint
        const sectionCenter = rect.top + rect.height / 2;
        const viewportMid = window.innerHeight / 2;
        setMarqueeOffset(viewportMid - sectionCenter); // positive = scrolled past
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const ABOUT_PRODUCTS_CACHE = "about_products_cache";
    const ABOUT_CATEGORIES_CACHE = "about_categories_cache";
    const ABOUT_OWNER_CACHE = "about_owner_cache";

    const getCached = (key) => {
      try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const parsed = JSON.parse(cached);
        return parsed?.data || null;
      } catch {
        return null;
      }
    };

    const fetchFromAPI = async () => {
      try {
        const [p, c, o] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
          api.get("/settings/store/owner"),
        ]);

        const productsData = p.data || [];
        const categoriesData = c.data || [];
        const ownerData = o.data || null;

        setProducts(productsData);
        setCategories(categoriesData);
        setOwner(ownerData);

        localStorage.setItem(
          ABOUT_PRODUCTS_CACHE,
          JSON.stringify({ data: productsData, time: Date.now() }),
        );

        localStorage.setItem(
          ABOUT_CATEGORIES_CACHE,
          JSON.stringify({ data: categoriesData, time: Date.now() }),
        );

        localStorage.setItem(
          ABOUT_OWNER_CACHE,
          JSON.stringify({ data: ownerData, time: Date.now() }),
        );
      } catch (err) {
        console.log("About page API failed, keeping cached data");
      }
    };

    // 1️⃣ INSTANT CACHE LOAD (NO WAIT)
    const cachedProducts = getCached(ABOUT_PRODUCTS_CACHE);
    const cachedCategories = getCached(ABOUT_CATEGORIES_CACHE);
    const cachedOwner = getCached(ABOUT_OWNER_CACHE);

    if (cachedProducts) setProducts(cachedProducts);
    if (cachedCategories) setCategories(cachedCategories);
    if (cachedOwner) setOwner(cachedOwner);

    // 2️⃣ BACKUP SAFETY (optional fallback if empty)
    if (!cachedProducts) setProducts([]);
    if (!cachedCategories) setCategories([]);
    if (!cachedOwner) setOwner(null);

    // 3️⃣ BACKGROUND REFRESH
    fetchFromAPI();
  }, []);
  /* ================= SET DEFAULT ACTIVE CATEGORY ================= */
  useEffect(() => {
    if (categories.length > 0 && !active) {
      setActive(categories[0].name);
    }
  }, [categories]);

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

  // marqueeOffset goes from negative (not yet reached) to positive (scrolled past)
  // speed multiplier: higher = faster slide
  const speed = 0.6;
  const hamdamX = clamp(marqueeOffset * speed, -800, 0);
  const jewellersX = clamp(-marqueeOffset * speed, 0, 800);

  return (
    <section className="text-gray-900 overflow-hidden  relative">
      {/* ================= HERO ================= */}
      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-12 md:pb-20  lg:pb-28 ">
        {/* HEADING — centred on mobile, left on md+ */}
        <h1 className=" md:text-left text-5xl md:text-6xl lg:text-7xl font-luxury text-gray-900 z-20 leading-none mb-8 md:mb-0 md:absolute  md:left-6  md:top-1/2">
          Our Story
        </h1>

        {/* STORY IMAGE */}
        <div className="flex md:justify-end">
          <motion.img
            src={
              owner?.storyImage ||
              "https://t4.ftcdn.net/jpg/05/36/09/73/360_F_536097363_JgtB1decJ8ahW5u35bDzHwWkQuDe7RVd.jpg"
            }
            alt="Our Story"
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            whileInView={{ clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
            viewport={{ once: true }}
            className="w-full md:w-[85%] h-[260px] md:h-[420px] lg:h-[520px] object-cover md:mt-16"
          />
        </div>
      </div>

      {/* ================= ABOUT GRID ================= */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-20 px-6 py-5 md:py-10">
        <motion.img
          src={
            owner?.aboutLeftImage ||
            "https://images.unsplash.com/photo-1617038220319-276d3cfab638"
          }
          alt="About Left"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="w-full h-[425px] hidden md:block object-contain lg:h-[450px] mt-20"
        />

        <div className="flex flex-col justify-center">
          <p className="text-[10px] uppercase tracking-[0.45em] text-primary/70 font-medium mb-4">
            Who We Are
          </p>
          <h2 className="font-luxury text-3xl md:text-5xl lg:text-6xl mb-6 tracking-wider md:text-center">
            About Us
          </h2>
          <p className="font-cormorant text-xl leading-[1.7] lg:text-center text-gray-700">
            {owner?.aboutDescription ||
              "With Hamdam, we've built a clever, customizable jewelry line that morphs with you..."}
          </p>
        </div>

        <motion.img
          src={
            owner?.aboutrightImage ||
            "https://images.unsplash.com/photo-1611652022419-a9419f74343d"
          }
          alt="About Right"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="w-full h-[425px] object-contain lg:h-[450px]"
        />
      </div>

      {/* ===== BIG E SECTION ===== */}
      <div className="relative flex justify-center items-center py-10 md:py-16">
        <div
          className="relative inline-flex justify-center items-center cursor-pointer"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => navigate("/collections")}
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

      {/* ================= PRECIOUS METAL ================= */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <p className="text-[10px] uppercase tracking-[0.45em] text-primary/70 font-medium mb-4">
          Craftsmanship
        </p>
        <h2 className="font-luxury text-3xl md:text-5xl lg:text-6xl mb-16 tracking-wide">
          Precious Metal
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-20 xl:gap-18">
          {/* OUR VALUE */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            <div className=" h-[300px] flex items-center justify-center overflow-hidden">
              <img
                src={
                  owner?.ourValueImage ||
                  "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d"
                }
                alt="Our Value"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-[10px] uppercase tracking-[0.45em] text-primary/70 font-medium mt-8 mb-2">
              Value
            </p>
            <h3 className="font-luxury text-2xl md:text-3xl lg:text-4xl mb-4 italic">
              {owner?.ourValueTitle || "Our Value"}
            </h3>
            <p className="font-cormorant text-xl leading-[1.7] text-gray-700">
              {owner?.ourValueDescription ||
                "The world is our home and we are called to leave it better than we found it."}
            </p>
          </motion.div>

          {/* CENTER IMAGE */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="flex justify-center md:mt-20"
          >
            <img
              src={
                owner?.preciousCenterImage ||
                "https://i.pinimg.com/736x/21/4e/51/214e51fb17c1097fbca6cd89ae5030d2.jpg"
              }
              alt="Precious Metal"
              className="w-full h-[400px] object-contain"
            />
          </motion.div>

          {/* OUR PHILOSOPHY */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            <p className="text-[10px] uppercase tracking-[0.45em] text-primary/70 font-medium mb-2 text-right">
              Philosophy
            </p>
            <h3 className="font-luxury text-2xl md:text-3xl lg:text-4xl mb-4 italic text-right">
              {owner?.philosophyTitle || "Our Philosophy"}
            </h3>
            <p className="font-cormorant text-xl leading-[1.7] text-gray-700 mb-10 text-right">
              {owner?.philosophyDescription ||
                "Built on the idea that life is yours for the making..."}
            </p>
            <div className=" h-[300px] flex items-center justify-center overflow-hidden">
              <img
                src={
                  owner?.philosophyImage ||
                  "https://images.unsplash.com/photo-1605100804763-247f67b3557e"
                }
                alt="Philosophy"
                className="w-full h-full object-contain z-10"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ================= MOVING TEXT ================= */}
      <div
        ref={marqueeRef}
        className="relative !w-screen left-1/2 -translate-x-1/2 py-20 overflow-hidden"
      >
        {/* HAMDAM — starts off left, slides right into view */}
        <h1
          className="absolute left-0 top-0 font-bold uppercase stroke-text leading-none whitespace-nowrap"
          style={{
            fontSize: "clamp(56px, 16vw, 200px)",
            transform: `translateX(${hamdamX}px)`,
            willChange: "transform",
          }}
        >
          HAMDAM
        </h1>

        <div className="relative z-10 flex justify-center font-cormorant py-32 md:py-40 px-6">
          <p className="max-w-2xl text-center text-gray-700 text-xl md:text-3xl lg:text-4xl leading-[1.6] italic">
            At Hamdam Jewellers, every piece is crafted with precision and
            passion. We blend tradition with modern elegance to create timeless
            jewelry.
          </p>
        </div>

        {/* JEWELLERS — starts off right, slides left into view */}
        <h1
          className="absolute right-0 bottom-0 font-bold uppercase stroke-text leading-none whitespace-nowrap text-right"
          style={{
            fontSize: "clamp(56px, 16vw, 200px)",
            transform: `translateX(${jewellersX}px)`,
            willChange: "transform",
          }}
        >
          JEWELLERY
        </h1>
      </div>

      {/* ================= ORIGINS ================= */}
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 flex flex-col md:flex-row items-center gap-10 md:gap-0 justify-end relative">
        <motion.img
          src={
            owner?.image ||
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
          }
          alt={owner?.name || "Hamdam"}
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          whileInView={{ clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration: 1, ease: "easeInOut" }}
          viewport={{ once: true }}
          className="w-full md:w-[50%] lg:w-[40%] h-[450px] md:h-[400px] lg:h-[600px] object-cover"
        />

        <div className="relative lg:absolute left-0 lg:left-[5%] p-8 md:p-14 max-w-xl bg-[#f8f5f0]/95">
          <p className="text-[10px] uppercase tracking-[0.45em] text-primary/70 font-medium mb-4">
            Our Roots
          </p>
          <h2 className="font-luxury text-3xl md:text-4xl lg:text-5xl tracking-wider mb-6">
            Our Origins &
            <br />
            Where We Want To Go
          </h2>
          <p className="font-cormorant text-xl lg:text-2xl italic leading-[1.7] text-gray-700">
            {owner?.description ||
              "Hamdam was founded with a vision to blend timeless artistry with modern luxury. We continue to craft pieces that celebrate elegance, identity and unforgettable moments."}
          </p>
        </div>
      </div>

      {/* ================= COLLECTIONS ================= */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-28">
        <p className="text-[10px] uppercase tracking-[0.45em] text-primary/70 font-medium mb-4">
          Collections
        </p>
        <p className="font-cormorant text-2xl md:text-3xl mb-16 text-gray-700 italic">
          Explore our curated collections crafted with timeless beauty.
        </p>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* CATEGORY TABS */}
          <div className="flex lg:flex-col gap-3 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat._id || cat.name}
                onClick={() => setActive(cat.name)}
                className={`
                  px-5 h-[42px] text-sm tracking-[0.15em] whitespace-nowrap
                  border transition-all duration-300
                  ${
                    active === cat.name
                      ? "bg-primary text-white border-primary"
                      : "text-gray-700 border-[#ddd2c2] hover:border-black"
                  }
                `}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* PRODUCTS */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 md:gap-x-8 gap-y-12 flex-1">
            {(grouped[active] || []).map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.12,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                whileHover={{ y: -8 }}
                onClick={() =>
                  navigate(`/collections/${item.category}/${item._id}`)
                }
                className="group text-center cursor-pointer"
              >
                <div className="relative bg-white flex items-center justify-center h-[200px] sm:h-[240px] md:h-[350px] lg:h-[380px] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-[100%] object-contain transition duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="mt-4 md:mt-5">
                  <p className="text-[10px] uppercase tracking-[0.45em] text-primary/70 font-medium">
                    {item.type}
                  </p>
                  <h3 className="font-cormorant text-xs md:text-lg uppercase tracking-[0.18em] text-black leading-tight mt-1">
                    {item.name}
                  </h3>
                  <div className="mt-1 md:mt-3 flex flex-col items-center gap-1">
                    {item.discount > 0 && (
                      <p className="text-[9px] md:text-[10px] tracking-[0.4em] uppercase text-neutral-400 line-through">
                        PKR {Number(item.price).toLocaleString("en-PK")}
                      </p>
                    )}
                    <p className="text-[10px] md:text-[11px] text-primary tracking-[0.3em] md:tracking-[0.55em] uppercase">
                      PKR{" "}
                      {(
                        Number(item.price) -
                        Math.floor((Number(item.price) * item.discount) / 100)
                      ).toLocaleString("en-PK")}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
