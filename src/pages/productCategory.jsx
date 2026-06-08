import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import api from "../components/api";

export default function CollectionCategory() {
  const navigate = useNavigate();
  const { category } = useParams();

  const [products, setProducts] = useState([]);
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const safeKey = category?.toLowerCase();

    const PRODUCTS_CACHE = `CATEGORY_PRODUCTS_${safeKey}`;
    const CATEGORY_CACHE = `CATEGORY_INFO_${safeKey}`;

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

        const currentCategory = categoriesRes.data.find(
          (c) => c.name.toLowerCase() === category.toLowerCase(),
        );

        const allProducts = productsRes.data || [];

        const filtered = allProducts.filter(
          (p) =>
            p.category && p.category.toLowerCase() === category.toLowerCase(),
        );

        setCategoryData(currentCategory || null);
        setProducts(filtered);

        localStorage.setItem(
          PRODUCTS_CACHE,
          JSON.stringify({ data: filtered, time: Date.now() }),
        );

        localStorage.setItem(
          CATEGORY_CACHE,
          JSON.stringify({ data: currentCategory || null, time: Date.now() }),
        );
      } catch (err) {
        console.log("Category page API failed, using cache");
      } finally {
        setLoading(false);
      }
    };

    // 1️⃣ instant cache load
    const cachedProducts = getCached(PRODUCTS_CACHE);
    const cachedCategory = getCached(CATEGORY_CACHE);

    if (cachedProducts) setProducts(cachedProducts);
    if (cachedCategory) setCategoryData(cachedCategory);

    if (!cachedProducts) setProducts([]);
    if (!cachedCategory) setCategoryData(null);

    setLoading(false);

    // 2️⃣ background refresh
    fetchFromAPI();
  }, [category]);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) => p.category && p.category.toLowerCase() === category.toLowerCase(),
    );
  }, [products, category]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section className="pb-24 overflow-hidden">
      {/* ================= LUXURY HERO ================= */}
      <div className="relative py-28 md:py-36 flex flex-col items-center justify-center text-center">
        {/* MAIN TITLE */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="font-luxury text-5xl md:text-7xl lg:text-8xl text-gray-900  tracking-[0.2em] uppercase"
        >
          {category}
        </motion.h1>

        {/* BREADCRUMB */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs md:text-sm tracking-[0.25em] uppercase text-gray-500 pt-5 z-20"
        >
          <span
            onClick={() => navigate("/")}
            className="cursor-pointer  border-b border-gray-400 pb-1 hover:border-primary  hover:text-primary duration-300 transition ease-in-out"
          >
            Home
          </span>{" "}
          /{" "}
          <span
            onClick={() => navigate("/collections")}
            className="cursor-pointer  border-b border-gray-400 pb-1 hover:border-primary  hover:text-primary duration-300 transition ease-in-out"
          >
            Collections
          </span>{" "}
          / {category}
        </motion.p>

        {/* SOFT BACKGROUND GLOW */}
        <div className="absolute w-[300px] h-[300px] bg-primary/10 blur-3xl rounded-full z-10" />
      </div>
      {/* ================= CATEGORY HERO IMAGE ================= */}
      {categoryData?.image && (
        <div className="relative max-w-6xl mx-auto px-4 mb-24">
          {/* BACK LAYER (COLOR BLOCK like Products page) */}
          <div key={categoryData?.name} className="md:pb-20">
            <div className="relative flex justify-center items-center h-[220px] md:h-[420px] max-w-6xl mx-auto mt-0 md:mt-10 px-4">
              <div
                className="absolute w-full h-[180px] md:h-[350px] lg:h-[400px] opacity-50"
                style={{
                  backgroundColor: categoryData?.color || "#f5f5f5",
                }}
              />
              <motion.img
                src={categoryData?.image}
                alt={categoryData?.name}
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                whileInView={{ clipPath: "inset(0 0% 0 0)" }}
                transition={{ duration: 0.9, ease: "easeInOut" }}
                viewport={{ once: true }}
                className="relative z-10 h-[240px] md:h-[450px] lg:h-[500px] w-[50%] md:w-[45%] lg:w-[40%] object-cover"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= PRODUCTS ================= */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="min-h-[500px] flex flex-col items-center justify-center text-center relative overflow-hidden"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-[280px] h-[280px] bg-[#d6c3a5]/30 blur-3xl"
            />
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-3 h-3 bg-[#c89b63] mb-8"
            />
            <motion.h2
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ delay: 0.2, duration: 1 }}
              className="relative z-10 text-xl md:text-3xl tracking-[0.35em] uppercase text-gray-800 font-light"
            >
              No Peices Found
            </motion.h2>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-12 lg:gap-24">
            {filteredProducts.map((product) => {
              const finalPrice =
                Number(product.price) -
                Math.floor(
                  (Number(product.price) * Number(product.discount || 0)) / 100,
                );

              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  onClick={() =>
                    navigate(
                      `/collections/${product.category.toLowerCase()}/${product._id}`,
                    )
                  }
                  className="group text-center cursor-pointer"
                >
                  <div className="relative bg-white h-[220px] md:h-[420px] overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain transition duration-700 group-hover:scale-105"
                    />
                  </div>

                  <div className="mt-5">
                    <h3 className="font-cormorant uppercase tracking-[0.18em] text-black">
                      {product.name}
                    </h3>

                    <p className="text-primary tracking-[0.45em] text-[11px] uppercase mt-2">
                      PKR {finalPrice.toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
