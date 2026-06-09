import React, { useEffect, useState } from "react";
import { motion, transform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "./api";

const Featured = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const getFinalPrice = (price, discount) => {
    if (discount <= 0) return price;
    return Math.round(price - (price * discount) / 100);
  };

  useEffect(() => {
    const CACHE_KEY = "featured_products_cache";

    const fallbackProducts = [
      {
        _id: "1",
        name: "Gold Ring",
        price: 25000,
        discount: 10,
        type: "925 Silver",
        category: "rings",
        image:
          "https://png.pngtree.com/png-clipart/20240721/original/pngtree-a-jewelry-ring-on-white-background-png-image_15604148.png",
      },
      {
        _id: "2",
        name: "Diamond Necklace",
        price: 85000,
        discount: 0,
        type: "Gold",
        category: "necklaces",
        image:
          "https://png.pngtree.com/png-vector/20231026/ourmid/pngtree-chopard-happy-diamonds-necklace-png-image_10368944.png",
      },
      {
        _id: "3",
        name: "Luxury Bracelet",
        price: 150000,
        discount: 15,
        type: "Rose Gold",
        category: "bracelets",
        image:
          "https://static.vecteezy.com/system/resources/thumbnails/042/167/713/small/ai-generated-3d-rendering-of-a-hand-gold-chain-on-transparent-background-ai-generated-png.png",
      },
      {
        _id: "4",
        name: "Pearl Earrings",
        price: 18000,
        discount: 5,
        type: "925 Silver",
        category: "earrings",
        image:
          "https://www.paspaley.com/cdn/shop/files/Crescent_Moon_Diamond_Mother_Of_Pearl_and_Keshi_Pearl_Earring_Enhancers_-_White_Gold_F23AE10WKQ05_1500_x_1875_C_2.png",
      },
    ];

    const getCachedData = () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;
        const parsed = JSON.parse(cached);
        return parsed?.data || null;
      } catch {
        return null;
      }
    };

    const fetchFromAPI = async () => {
      try {
        const res = await api.get("/products");
        let all = res.data || [];

        if (!Array.isArray(all) || all.length < 4) return;

        // shuffle
        for (let i = all.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [all[i], all[j]] = [all[j], all[i]];
        }

        const final = all.slice(0, 4).map((p) => ({
          _id: p._id,
          name: p.name,
          price: p.price,
          discount: p.discount || 0,
          type: p.type || "925 Silver",
          category: p.category || "all",
          image: p.image || p.images?.[0],
        }));

        setProducts(final);

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: final, time: Date.now() }),
        );
      } catch (err) {
        console.log("API failed, keeping cached data or fallback");
      } finally {
        setLoading(false);
      }
    };

    const cached = getCachedData();

    if (cached && cached.length) {
      setProducts(cached);
      setLoading(false);
    } else {
      setProducts(fallbackProducts);
      setLoading(false);
    }

    fetchFromAPI();
  }, []);

  const handleClick = (product) => {
    const slug = `${product.name.toLowerCase().replace(/\s+/g, "-")}-${product._id}`;
    navigate(`/collections/${product.category.toLowerCase()}/${slug}`);
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto py-24 px-6">
        <div className="text-[#A68A3C] tracking-[0.35em] uppercase animate-pulse">
          Curating Collection...
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto py-16 md:py-24 px-4 md:px-6">
      {/* HEADER */}
      <div className="mb-14">
        <p className="text-[10px] md:text-xs lg:text-sm uppercase tracking-[0.45em] text-primary/90 font-medium mb-2">
          HandPicked Selection
        </p>
        <h2 className="text-3xl md:text-6xl font-luxury text-gray-900 leading-[1.05] tracking-[0.1em]">
          Featured Collection
        </h2>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12">
        {products.map((product, index) => {
          const isTall = index % 2 === 0;
          const finalPrice = getFinalPrice(product.price, product.discount);

          return (
            <motion.div
              key={product._id}
              onClick={() => handleClick(product)}
              className="group cursor-pointer "
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
            >
              {/* IMAGE CARD */}
              <div
                className={`
                  relative overflow-hidden bg-gradient-to-b from-[#faf7f2] to-white
                  flex items-center justify-center transition duration-700
                  h-[330px] md:h-[350px]
                  ${isTall ? "lg:h-[370px]" : "lg:h-[300px]"}
                `}
              >
                <motion.div
                  className="absolute w-[60%] h-[60%] bg-[#C6A962]/10 blur-3xl rounded-full"
                  animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.45, 0.2] }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <motion.img
                  src={product.image}
                  alt={product.name}
                  className="relative z-10 max-h-[78%] object-contain group-hover:scale-[1.05] transition duration-700"
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>

              {/* TEXT */}
              <div className="mt-4 md:mt-5 text-center">
                <h3 className="font-cormorant text-xs md:text-lg uppercase tracking-[0.18em] text-black leading-tight">
                  {product.name}
                </h3>

                <div className="mt-1 md:mt-3 flex flex-col items-center gap-1">
                  {product.discount > 0 && (
                    <p className="text-[9px] md:text-[10px] tracking-[0.25em] md:tracking-[0.4em] uppercase text-neutral-400 line-through">
                      PKR {product.price.toLocaleString()}
                    </p>
                  )}
                  <p className="text-[10px] md:text-[11px] text-primary tracking-[0.3em] md:tracking-[0.55em] uppercase">
                    PKR {finalPrice.toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default Featured;
