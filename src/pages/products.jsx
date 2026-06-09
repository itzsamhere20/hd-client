import { Search, X, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../components/api";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState({});

  // ===== FILTERS =====
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  // ===== MOBILE FILTER =====
  const [filterOpen, setFilterOpen] = useState(false);

  // ================= FETCH =================
  useEffect(() => {
    const PRODUCTS_CACHE = "products_cache";
    const CATEGORIES_CACHE = "categories_cache";

    const fallbackProducts = {};
    const fallbackCategories = [];

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
        const [productsRes, categoriesRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);

        const grouped = productsRes.data.reduce((acc, product) => {
          const cat = product.category || "Uncategorized";

          if (!acc[cat]) acc[cat] = [];

          acc[cat].push({
            id: product._id,
            name: product.name,
            price:
              product.price -
              Math.floor((Number(product.price) * product.discount) / 100),
            oldPrice: Number(product.price),
            discount: Number(product.discount || 0),
            img: product.image,
            gender: product.gender || "Unisex",
            stock: product.stock || 0,
            type: product.type || "Silver",
            category: cat,
          });

          return acc;
        }, {});

        setProducts(grouped);
        setCategories(categoriesRes.data);

        // 💾 cache (consistent format)
        localStorage.setItem(
          PRODUCTS_CACHE,
          JSON.stringify({
            data: grouped,
            time: Date.now(),
          }),
        );

        localStorage.setItem(
          CATEGORIES_CACHE,
          JSON.stringify({
            data: categoriesRes.data,
            time: Date.now(),
          }),
        );
      } catch (err) {
        console.log("API failed, keeping cached data");
      } finally {
        setLoading(false);
      }
    };

    // 1️⃣ INSTANT LOAD FROM CACHE
    const cachedProducts = getCached(PRODUCTS_CACHE);
    const cachedCategories = getCached(CATEGORIES_CACHE);

    if (cachedProducts) setProducts(cachedProducts);
    if (cachedCategories) setCategories(cachedCategories);

    // fallback if nothing exists
    if (!cachedProducts) setProducts(fallbackProducts);
    if (!cachedCategories) setCategories(fallbackCategories);

    setLoading(false);

    // 2️⃣ BACKGROUND REFRESH
    fetchFromAPI();
  }, []);

  const getCategoryImage = (categoryName) => {
    const cat = categories.find(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
    );

    return cat?.image;
  };

  const filterButtons = useMemo(() => {
    return ["All", ...categories.map((c) => c.name)];
  }, [categories]);

  // ================= FILTER + SEARCH + SORT =================
  const filteredProducts = useMemo(() => {
    const result = {};

    Object.entries(products).forEach(([category, items]) => {
      let filteredItems = [...items];

      filteredItems = filteredItems.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()),
      );

      if (activeCategory !== "All") {
        filteredItems = filteredItems.filter((item) => {
          return category.toLowerCase() === activeCategory.toLowerCase();
        });
      }

      if (sortBy === "men") {
        filteredItems = filteredItems.filter(
          (item) => item.gender?.toLowerCase() === "male",
        );
      }
      if (sortBy === "women") {
        filteredItems = filteredItems.filter(
          (item) => item.gender?.toLowerCase() === "female",
        );
      }

      if (sortBy === "artificial") {
        filteredItems = filteredItems.filter(
          (item) => item.type?.toLowerCase() === "artificial",
        );
      }
      if (sortBy === "silver") {
        filteredItems = filteredItems.filter(
          (item) => item.type?.toLowerCase() === "silver",
        );
      }

      if (sortBy === "highest") {
        filteredItems.sort((a, b) => b.price - a.price);
      }

      if (sortBy === "lowest") {
        filteredItems.sort((a, b) => a.price - b.price);
      }

      if (filteredItems.length > 0) {
        result[category] = filteredItems;
      }
    });

    return result;
  }, [products, search, activeCategory, sortBy]);

  const hasProducts = Object.keys(filteredProducts).length > 0;

  return (
    <section className="overflow-hidden pb-0">
      {/* ================= FILTER BAR ================= */}
      <div className="sticky top-20 z-[10]">
        <div className="max-w-7xl mx-auto px-4 py-20">
          {/* SEARCH */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search luxury products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full h-[58px]
                
                border border-[#ddd2c2]
                bg-[#f8f5f0]
                pl-14 pr-14
                outline-none
                text-gray-800
                placeholder:text-gray-400
                focus:border-black
                transition
              "
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="
                  absolute right-4 top-1/2 -translate-y-1/2
                  w-8 h-8 
                  hover:bg-primary hover:text-white
                  transition
                  flex items-center justify-center
                "
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* DESKTOP FILTERS ONLY */}
          <div className="hidden lg:flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-5">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {filterButtons.map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveCategory(item)}
                  className={`
                    px-5 h-[42px]
                   
                    text-sm tracking-[0.15em]
                    whitespace-nowrap
                    border transition-all duration-300
                    ${
                      activeCategory === item
                        ? "bg-primary text-white border-primary"
                        : " text-gray-700 border-primary hover:border-black"
                    }
                  `}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm tracking-[0.2em] uppercase text-gray-500">
                <SlidersHorizontal size={16} />
                Sort
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="
                  h-[44px]
                  px-4
                  
                  border border-[#ddd2c2]
                  bg-white
                  outline-none
                  text-sm
                  cursor-pointer
                "
              >
                <option value="default">Default</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="artificial">Artificial</option>
                <option value="silver">Silver</option>
                <option value="highest">Highest Price</option>
                <option value="lowest">Lowest Price</option>
              </select>
            </div>
          </div>

          {/* MOBILE FILTER BUTTON (SHOPIFY STYLE) */}
          <div className="lg:hidden mt-5 flex justify-center">
            <button
              onClick={() => setFilterOpen(true)}
              className="
                bg-primary text-white
                px-6 py-3
               
                text-xs tracking-[0.25em]
                uppercase
              "
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* ================= LOADING ================= */}
      {loading ? (
        [...Array(2)].map((_, i) => (
          <div key={i} className="py-20 animate-pulse">
            <div className="h-[260px] md:h-[420px] bg-gray-200 w-full max-w-6xl mx-auto mt-10 rounded-xl" />
          </div>
        ))
      ) : !hasProducts ? (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="
    min-h-[500px]
    flex flex-col items-center justify-center
    text-center
    relative overflow-hidden
  "
        >
          {/* SOFT GLOW */}
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.25, 0.4, 0.25],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
      absolute
      w-[280px] h-[280px]
     
      bg-[#d6c3a5]/30
      blur-3xl
    "
          />

          {/* SMALL LUXURY DOT */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
      relative z-10
      w-3 h-3
     
      bg-[#c89b63]
      mb-8
    "
          />

          {/* TITLE */}
          <motion.h2
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ delay: 0.2, duration: 1 }}
            className="
      relative z-10
      text-xl md:text-3xl
      tracking-[0.35em]
      uppercase
      text-gray-800
      font-light
    "
          >
            No pieces found
          </motion.h2>

          {/* SUBTEXT */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="
      relative z-10
      mt-4
      text-sm
      tracking-[0.18em]
      uppercase
      text-gray-400
    "
          >
            Try adjusting your filters
          </motion.p>
        </motion.div>
      ) : (
        Object.entries(filteredProducts).map(([category, items]) => {
          const categoryImage = getCategoryImage(category);

          return (
            <div key={category} className="py-20 md:py-28">
              <div className="relative flex justify-center items-center h-[220px] md:h-[420px] max-w-6xl mx-auto mt-0 md:mt-10 px-4">
                <div
                  className="absolute w-full h-[180px] md:h-[350px] lg:h-[400px] opacity-50"
                  style={{
                    backgroundColor:
                      categories.find((c) => c.name === category)?.color ||
                      "#f5f5f5",
                  }}
                />
                <motion.img
                  src={categoryImage}
                  alt={category}
                  initial={{ clipPath: "inset(0 100% 0 0)" }}
                  whileInView={{ clipPath: "inset(0 0% 0 0)" }}
                  transition={{ duration: 0.9, ease: "easeInOut" }}
                  viewport={{ once: true }}
                  className="relative z-10 h-[240px] md:h-[450px] lg:h-[500px] w-[50%] md:w-[45%] lg:w-[40%] object-cover"
                />
              </div>

              <h2 className="text-center text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-luxury text-gray-900 py-16 md:py-20 lg:py-24 xl:py-32">
                {category}
              </h2>

              <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-x-5 md:gap-x-8 gap-y-12 md:gap-y-16 px-4 lg:gap-32 md:px-6">
                {items.map((item, i) => {
                  if (!showAll[category] && i >= 6) return null;

                  const soldOut = item.stock === 0;
                  const limitedStock = item.stock > 0 && item.stock < 3;

                  return (
                    <motion.div
                      key={i}
                      variants={{
                        hidden: { opacity: 0, y: 50 },
                        show: {
                          opacity: 1,
                          y: 0,
                          transition: {
                            duration: 0.8,
                            ease: [0.25, 0.1, 0.25, 1],
                          },
                        },
                      }}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, margin: "-100px" }}
                      whileHover={{ y: -8 }}
                      onClick={() => {
                        console.log("PRODUCT CLICKED");
                        navigate(
                          `/collections/${item.category.toLowerCase()}/${item.id}`,
                        );
                      }}
                      className="group text-center cursor-pointer"
                    >
                      <div className="relative bg-white flex items-center justify-center h-[200px] sm:h-[240px] md:h-[350px] lg:h-[450px] overflow-hidden">
                        {soldOut && (
                          <div className="absolute inset-0 z-30 bg-gray-500/40" />
                        )}

                        {soldOut && (
                          <div className="absolute top-4 left-4 z-40 bg-black text-white text-[8px] md:text-[10px] tracking-[0.2em] px-3 py-2 uppercase">
                            Sold Out
                          </div>
                        )}

                        {limitedStock && !soldOut && (
                          <div className="absolute top-4 left-4 z-20 bg-[#c89b63] text-white text-[8px] md:text-[10px] tracking-[0.2em] px-3 py-2 uppercase">
                            Limited Stock
                          </div>
                        )}

                        <img
                          src={item.img}
                          alt={item.name}
                          className="h-[100%] object-contain transition duration-700 group-hover:scale-105"
                        />
                      </div>

                      <div className="mt-4 md:mt-5">
                        <h3
                          className="  font-cormorant
            text-xs
            md:text-lg
            uppercase
            tracking-[0.18em]
            text-black
            leading-tight"
                        >
                          {item.name}
                        </h3>

                        <div className="mt-1 md:mt-3 flex flex-col items-center gap-1">
                          {item.discount > 0 && (
                            <p
                              className="
      text-[9px]
      md:text-[10px]
      tracking-[0.25em]
      md:tracking-[0.4em]
      uppercase
      text-neutral-400
      line-through
    "
                            >
                              PKR {item.oldPrice.toLocaleString()}
                            </p>
                          )}

                          <p
                            className="text-[10px] md:text-[11px] text-primary
        tracking-[0.3em] md:tracking-[0.55em]
        uppercase
       "
                          >
                            PKR {item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {items.length > 6 && !showAll[category] && (
                <div className="flex justify-center mt-14 md:mt-16">
                  <button
                    onClick={() =>
                      setShowAll((prev) => ({
                        ...prev,
                        [category]: true,
                      }))
                    }
                    className="
                      uppercase
                      tracking-[0.3em]
                      text-xs md:text-sm
                      border-b border-black
                      hover:text-primary
                      transition
                    "
                  >
                    Show All
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* ================= MOBILE FILTER SHEET ================= */}
      <AnimatePresence>
        {filterOpen && (
          <div className="fixed inset-0 z-[200]">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => setFilterOpen(false)}
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs tracking-[0.3em] uppercase text-gray-500">
                  Filters
                </h3>

                <button onClick={() => setFilterOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-xs tracking-[0.2em] text-gray-400 mb-3">
                  Category
                </p>

                <div className="flex flex-wrap gap-2">
                  {filterButtons.map((item) => (
                    <button
                      key={item}
                      onClick={() => setActiveCategory(item)}
                      className={`px-4 py-2 text-xs border ${
                        activeCategory === item
                          ? "bg-primary text-white border-primary"
                          : "border-[#ddd2c2]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs tracking-[0.2em] text-gray-400 mb-3">
                  Sort
                </p>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full h-[44px] border border-[#ddd2c2] px-4 text-sm"
                >
                  <option value="default">Default</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="artificial">Artificial</option>
                  <option value="silver">Silver</option>
                  <option value="highest">Highest Price</option>
                  <option value="lowest">Lowest Price</option>
                </select>
              </div>

              <button
                onClick={() => setFilterOpen(false)}
                className="w-full mt-6 bg-primary text-white py-4 text-xs tracking-[0.2em] uppercase"
              >
                Apply Filters
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Products;
