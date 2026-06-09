import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import api from "../components/api";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [qtyError, setQtyError] = useState("");
  const [showCartSuccess, setShowCartSuccess] = useState(false);

  /* ── FETCH ── */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
        if (Array.isArray(res.data.sizes) && res.data.sizes.length > 0) {
          setSelectedSize(res.data.sizes[0]);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  /* ── DETAILS ACCORDION DATA ── */
  const details = product
    ? [
        { key: "material", title: "Material", value: product.material },
        { key: "stone", title: "Stone", value: product.stone },
        { key: "care", title: "Care Instructions", value: product.care },
        { key: "type", title: "Type", value: product.type },
        {
          key: "gender",
          title: "For",
          value:
            product.gender?.toLowerCase() === "female"
              ? "Her"
              : product.gender?.toLowerCase() === "male"
                ? "Him"
                : product.gender,
        },
        {
          key: "occasion",
          title: "Occasion",
          value: "Wedding · Party · Daily Wear",
        },
        {
          key: "Delivery",
          title: "Delivery",
          value: "Standard delivery takes 3–7 working days within Pakistan.",
        },
      ].filter(
        (item) =>
          item.value !== undefined && item.value !== null && item.value !== "",
      )
    : [];

  /* ── LOADING ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0]">
        <div className="w-14 h-14 border-2 border-[#d6c3a5] border-t-black animate-spin" />
      </div>
    );
  }

  /* ── NOT FOUND ── */
  if (!product) {
    return (
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
          Product not found
        </motion.h2>
      </motion.div>
    );
  }

  /* ── DERIVED ── */
  const soldOut = product.stock === 0;
  const limitedStock = product.stock > 0 && product.stock < 3;

  const finalPrice =
    Number(product.price) -
    Math.floor((Number(product.price) * Number(product.discount || 0)) / 100);

  const getProductQtyInCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    return cart
      .filter((item) => item.id === (product._id || product.id))
      .reduce((sum, item) => sum + Number(item.qty || 0), 0);
  };

  const remainingStock = Math.max(0, product.stock - getProductQtyInCart());

  /* ── QTY ── */
  const increaseQty = () => {
    const alreadyInCart = getProductQtyInCart();
    const totalAfterIncrease = alreadyInCart + qty + 1;
    if (totalAfterIncrease > product.stock) {
      setQtyError(`Only ${remainingStock} item(s) remaining in stock.`);
      return;
    }
    setQty((p) => p + 1);
    setQtyError("");
  };

  const decreaseQty = () => {
    const newQty = qty > 1 ? qty - 1 : 1;
    setQty(newQty);
    if (newQty <= product.stock) setQtyError("");
  };

  /* ── ADD TO CART ── */
  const addToCart = () => {
    if (!product || soldOut) return;
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalInCart = existingCart
      .filter((item) => item.id === (product._id || product.id))
      .reduce((sum, item) => sum + Number(item.qty || 0), 0);

    if (totalInCart + qty > product.stock) {
      setQtyError(`Only ${remainingStock} item(s) remaining in stock.`);
      return;
    }

    const cartItem = {
      id: product._id || product.id,
      name: product.name,
      price: finalPrice,
      qty,
      size: selectedSize,
      image: product.image,
      stock: product.stock,
    };

    const existingIndex = existingCart.findIndex(
      (item) => item.id === cartItem.id && item.size === cartItem.size,
    );

    if (existingIndex !== -1) {
      const updatedCart = [...existingCart];
      updatedCart[existingIndex].qty += qty;
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } else {
      localStorage.setItem("cart", JSON.stringify([...existingCart, cartItem]));
    }

    window.dispatchEvent(new Event("cartUpdated"));
    setShowCartSuccess(true);
    setTimeout(() => setShowCartSuccess(false), 2500);
  };

  return (
    <section className="min-h-screen overflow-hidden pb-24 pt-32 md:pt-44 ">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* BACK */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-gray-400 hover:text-black transition mb-12"
        >
          <ArrowLeft size={15} strokeWidth={1.5} />
          Back to Collections
        </motion.button>

        {/* ═══ MAIN GRID ═══ */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start">
          {/* ── IMAGE ── */}
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative bg-white flex items-center justify-center h-[420px] sm:h-[520px] lg:h-[680px] overflow-hidden"
          >
            {/* SOLD OUT OVERLAY */}
            {soldOut && (
              <div className="absolute inset-0 bg-gray-500/40 z-20" />
            )}

            {/* BADGES */}
            {soldOut && (
              <div className="absolute top-5 left-5 z-30 bg-black text-white text-[10px] tracking-[0.25em] uppercase px-4 py-2">
                Sold Out
              </div>
            )}

            {!soldOut && limitedStock && (
              <div className="absolute top-5 left-5 z-30 bg-[#c89b63] text-white text-[10px] tracking-[0.25em] uppercase px-4 py-2">
                Limited Stock
              </div>
            )}

            {!soldOut && product.discount > 0 && (
              <div className="absolute top-5 right-5 z-30 bg-primary text-white text-[10px] tracking-[0.25em] uppercase px-4 py-2">
                {product.discount}% Off
              </div>
            )}

            <motion.img
              src={product.image}
              alt={product.name}
              className="relative z-0 h-[88%] w-[88%] object-contain transition duration-700 hover:scale-105"
            />
          </motion.div>

          {/* ── DETAILS ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="lg:pt-4"
          >
            {/* CATEGORY */}
            <p className="text-[10px] uppercase tracking-[0.45em] text-primary/70 mb-4">
              {product.category}
            </p>

            {/* NAME */}
            <h1 className="font-cormorant uppercase tracking-[0.18em] text-black leading-tight text-3xl sm:text-4xl md:text-5xl">
              {product.name}
            </h1>

            {/* PRICE */}
            <div className="mt-7 flex items-baseline gap-5 flex-wrap">
              {product.discount > 0 && (
                <p className="text-gray-400 line-through text-sm md:text-base tracking-[0.3em]">
                  PKR {Number(product.price).toLocaleString()}
                </p>
              )}
              <p className="text-primary text-xl md:text-3xl tracking-[0.2em]">
                PKR {finalPrice.toLocaleString()}
              </p>
            </div>

            {/* STOCK INDICATOR */}
            <div className="mt-4">
              {soldOut ? (
                <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400">
                  Currently unavailable
                </p>
              ) : limitedStock ? (
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#c89b63]">
                  Only {product.stock} left
                </p>
              ) : (
                <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400">
                  In Stock
                </p>
              )}
            </div>

            {/* SIZE */}
            {Array.isArray(product.sizes) && product.sizes.length > 0 && (
              <div className="mt-10">
                <p className="text-xs uppercase tracking-[0.25em] text-gray-400 mb-4">
                  Select Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedSize(size)}
                      className={`
                        min-w-[52px] h-[48px] px-5
                        border text-xs uppercase tracking-[0.15em]
                        transition
                        ${
                          selectedSize === size
                            ? "bg-primary text-white border-primary"
                            : "border-[#ddd2c2] hover:border-black text-gray-700"
                        }
                      `}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QTY */}
            <div className="mt-10">
              <p className="text-xs uppercase tracking-[0.25em] text-gray-400 mb-4">
                Quantity
              </p>
              <div className="flex items-center gap-0">
                <button
                  onClick={decreaseQty}
                  className="w-11 h-11 border border-[#ddd2c2] hover:border-black transition text-lg leading-none"
                >
                  −
                </button>
                <span className="w-14 h-11 border-t border-b border-[#ddd2c2] flex items-center justify-center text-sm tracking-widest">
                  {qty}
                </span>
                <button
                  onClick={increaseQty}
                  className="w-11 h-11 border border-[#ddd2c2] hover:border-black transition text-lg leading-none"
                >
                  +
                </button>
              </div>
              {qtyError && (
                <p className="text-[11px] tracking-[0.15em] text-red-400 mt-3">
                  {qtyError}
                </p>
              )}
            </div>

            {/* BUTTONS */}
            <div className="mt-10 flex gap-3 flex-col sm:flex-row">
              <button
                disabled={!!qtyError || soldOut}
                onClick={addToCart}
                className="
                  h-[56px] px-10
                  bg-primary text-white
                  uppercase text-xs tracking-[0.25em]
                  hover:opacity-90 transition
                  disabled:opacity-40 disabled:cursor-not-allowed
                "
              >
                {soldOut ? "Sold Out" : "Add To Cart"}
              </button>

              {!soldOut && (
                <button
                  disabled={!!qtyError}
                  onClick={() =>
                    navigate("/checkout", {
                      state: {
                        buyNow: true,
                        items: [
                          {
                            _id: product._id,
                            id: product._id,
                            name: product.name,
                            image: product.image,
                            size: selectedSize,
                            qty,
                            quantity: qty,
                            price: finalPrice,
                            stock: product.stock,
                          },
                        ],
                      },
                    })
                  }
                  className="
                    h-[56px] px-10
                    border border-[#ddd2c2] hover:border-black
                    uppercase text-xs tracking-[0.25em] text-gray-700
                    transition
                    disabled:opacity-40 disabled:cursor-not-allowed
                  "
                >
                  Buy Now
                </button>
              )}
            </div>

            {/* ACCORDION */}
            <div className="mt-12">
              {/* DETAILS DIVIDER */}
              <div className="flex items-center gap-6">
                <div className="h-px flex-1 bg-[#ddd2c2]" />
                <span className="text-[10px] uppercase tracking-[0.4em] text-gray-400">
                  Details
                </span>
                <div className="h-px flex-1 bg-[#ddd2c2]" />
              </div>
              {details.map((sec) => (
                <div key={sec.key} className="border-b border-[#ddd2c2]">
                  <button
                    onClick={() =>
                      setOpenSection(openSection === sec.key ? "" : sec.key)
                    }
                    className="w-full flex justify-between items-center py-5 text-[10px] md:text-xs uppercase tracking-[0.25em] hover:text-primary transition"
                  >
                    {sec.title}
                    <span className="text-base">
                      {openSection === sec.key ? "−" : "+"}
                    </span>
                  </button>

                  <AnimatePresence>
                    {openSection === sec.key && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="text-gray-500 text-xs md:text-sm leading-[2] pb-4 capitalize tracking-[0.1em] italic">
                          {sec.value}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ═══ DESCRIPTION ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-20 lg:mt-32 max-w-4xl"
        >
          <h2 className="font-luxury tracking-wider text-3xl md:text-4xl lg:text-5xl mb-6">
            Description
          </h2>
          <p className=" text-[14px] md:text-xl text-gray-600 tracking-widest leading-[2.1] lg:leading-[2]">
            {product.description}
          </p>
        </motion.div>
      </div>

      {/* ═══ CART SUCCESS TOAST ═══ */}
      <AnimatePresence>
        {showCartSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.4 }}
            className="
              fixed bottom-8 right-6 z-[9999]
              bg-white border border-[#e6ddd0]
              shadow-[0_20px_60px_rgba(0,0,0,0.08)]
              px-8 py-5 min-w-[280px]
            "
          >
            <p className="text-[10px] tracking-[0.45em] uppercase text-primary">
              Cart Updated
            </p>
            <h3 className="font-cormorant text-2xl mt-1">Added Successfully</h3>
            <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-400 mt-1.5">
              {product?.name}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProductDetail;
