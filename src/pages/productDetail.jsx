import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import DOMPurify from "dompurify";
import api from "../components/api";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState("description");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0]">
        <div className="w-14 h-14 rounded-full border-2 border-[#d6c3a5] border-t-black animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0] text-gray-500 tracking-[0.2em] uppercase text-sm">
        Product not found
      </div>
    );
  }

  const soldOut = product.stock === 0;

  const sections = [
    {
      key: "description",
      title: "Description",
      content:
        product.description ||
        "Crafted with premium materials and timeless elegance.",
    },
    {
      key: "material",
      title: "Material",
      content: product.material || "Premium quality materials",
    },
    {
      key: "care",
      title: "Care Instructions",
      content: product.care || "Avoid water, perfume and chemicals",
    },
  ];

  return (
    <section className="min-h-screen bg-[#f8f5f0] overflow-hidden pb-20 pt-32">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-gray-500 hover:text-black transition mb-10"
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>

        <div className="grid lg:grid-cols-2 gap-14 lg:gap-24 items-center">
          {/* IMAGE */}
          <motion.div
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative bg-white h-[450px] md:h-[700px] flex items-center justify-center overflow-hidden"
          >
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.1 }}
              className="absolute inset-0 bg-[#f8f5f0] z-20"
            />

            {soldOut && (
              <div className="absolute inset-0 bg-gray-500/30 z-10" />
            )}

            <img
              src={product.image}
              alt={product.name}
              className="relative z-0 h-[90%] w-[90%] object-contain"
            />
          </motion.div>

          {/* CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            <p className="uppercase tracking-[0.3em] text-xs text-gray-400 mb-5">
              {product.category}
            </p>

            <h1 className="font-luxury text-4xl md:text-6xl text-gray-900 leading-[1.1]">
              {product.name}
            </h1>

            <div className="mt-8 flex items-center gap-5">
              <p className="text-gray-400 line-through tracking-[0.15em] text-sm">
                PKR {Number(product.price).toLocaleString()}
              </p>

              <p className="text-primary tracking-[0.2em] text-xl md:text-2xl">
                PKR{" "}
                {(
                  Number(product.price) -
                  Math.floor((Number(product.price) * product.discount) / 100)
                ).toLocaleString()}
              </p>
            </div>

            {/* SHOPIFY ACCORDION */}
            <div className="mt-10 border-t border-[#ddd2c2]">
              {sections.map((sec) => (
                <div key={sec.key} className="border-b border-[#ddd2c2]">
                  <button
                    onClick={() =>
                      setOpenSection(openSection === sec.key ? "" : sec.key)
                    }
                    className="w-full flex justify-between items-center py-4 text-xs uppercase tracking-[0.25em] text-gray-600"
                  >
                    {sec.title}
                    <span>{openSection === sec.key ? "−" : "+"}</span>
                  </button>

                  <AnimatePresence>
                    {openSection === sec.key && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden text-sm text-gray-500 leading-[2] pb-4"
                      >
                        {sec.isHtml ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(sec.content || ""),
                            }}
                          />
                        ) : (
                          <div
                            className="overflow-hidden text-sm text-gray-500 leading-[2] pb-4"
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(sec.content || ""),
                            }}
                          />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <button className="h-[58px] px-10 bg-black text-white uppercase tracking-[0.25em] text-xs">
                Add To Cart
              </button>

              <button className="h-[58px] px-10 border border-black uppercase tracking-[0.25em] text-xs">
                Buy Now
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;
