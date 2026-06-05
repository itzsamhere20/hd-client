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
          value: "Wedding · Party · Daily Wear ",
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0]">
        <div className="w-14 h-14  border-2 border-[#d6c3a5] border-t-black animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <>
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
            Product not found
          </motion.h2>
        </motion.div>
      </>
    );
  }

  const soldOut = product.stock === 0;
  // --------- products qty in cart function ---------

  const getProductQtyInCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    return cart
      .filter((item) => item.id === (product._id || product.id))
      .reduce((sum, item) => sum + Number(item.qty || 0), 0);
  };

  const remainingStock = Math.max(0, product.stock - getProductQtyInCart());

  const finalPrice =
    Number(product.price) -
    Math.floor((Number(product.price) * Number(product.discount || 0)) / 100);

  // ---------qty  inc function ------------

  const increaseQty = () => {
    const alreadyInCart = getProductQtyInCart();

    const totalAfterIncrease = alreadyInCart + qty + 1;

    if (totalAfterIncrease > product.stock) {
      setQtyError(`Only ${remainingStock} item(s) remaining in stock.`);
      return;
    }

    setQty((prev) => prev + 1);
    setQtyError("");
  };
  // ----------- qty decrease function -----------
  const decreaseQty = () => {
    const newQty = qty > 1 ? qty - 1 : 1;

    setQty(newQty);

    if (newQty <= product.stock) {
      setQtyError("");
    }
  };

  // ----------- add to cart-------------
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

    setTimeout(() => {
      setShowCartSuccess(false);
    }, 2500);
  };
  return (
    <section className="min-h-screen  overflow-hidden pb-20 pt-32 md:pt-40">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* BACK */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-gray-500 hover:text-black mb-10"
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>

        <div className="grid lg:grid-cols-2 gap-14 lg:gap-24 items-center">
          {/* IMAGE */}
          <motion.div
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white h-[450px] md:h-full flex items-center justify-center overflow-hidden"
          >
            {soldOut && (
              <div className="absolute inset-0 bg-gray-500/30 z-10" />
            )}

            {product.discount > 0 && (
              <div className="absolute top-5 left-5 z-30 bg-primary text-white text-[10px] tracking-[0.25em] uppercase px-4 py-2 ">
                {product.discount}% Off
              </div>
            )}

            <img
              src={product.image}
              className="relative z-0 h-[90%] w-[90%] object-contain"
            />
          </motion.div>

          {/* DETAILS */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="uppercase tracking-[0.35em] text-sm text-gray-400 mb-5">
              {product.category}
            </p>

            <h1
              className="font-cormorant   uppercase
            tracking-[0.18em]
            text-black
            leading-tight text-3xl md:text-5xl"
            >
              {product.name}
            </h1>

            {/* PRICE */}
            <div className="mt-8 flex items-center gap-5 flex-wrap">
              {product.discount > 0 && (
                <p className="text-gray-400 line-through md:text-lg tracking-[0.2em] md:tracking-[0.4em]">
                  PKR {Number(product.price).toLocaleString()}
                </p>
              )}

              <p className="text-primary text-xl md:text-3xl tracking-[0.2em]">
                PKR {finalPrice.toLocaleString()}
              </p>
            </div>

            {/* SIZE */}
            {Array.isArray(product.sizes) && product.sizes.length > 0 && (
              <div className="mt-10">
                <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-4">
                  Select Size
                </p>

                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[52px] h-[52px] px-6   border text-sm uppercase tracking-[0.15em] ${
                        selectedSize === size
                          ? "bg-primary text-white border-primary "
                          : "border-[#ddd2c2]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QTY */}
            <div className="mt-10">
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-4">
                Quantity
              </p>

              <div className="flex items-center gap-4">
                <button onClick={decreaseQty} className="w-10 h-10 border ">
                  -
                </button>

                <span className="text-lg">{qty}</span>

                <button onClick={increaseQty} className="w-10 h-10 border ">
                  +
                </button>
              </div>

              {qtyError && (
                <p className="text-red-500 text-sm mt-2">{qtyError}</p>
              )}
            </div>

            {/* DETAILS ACCORDION (NO DESCRIPTION HERE) */}
            <div className="mt-10 border-t border-[#ddd2c2]">
              {details.map((sec) => (
                <div key={sec.key} className="border-b border-[#ddd2c2]">
                  <button
                    onClick={() =>
                      setOpenSection(openSection === sec.key ? "" : sec.key)
                    }
                    className="w-full flex justify-between py-5 text-xs md:text-sm uppercase tracking-[0.25em]"
                  >
                    {sec.title}
                    <span>{openSection === sec.key ? "−" : "+"}</span>
                  </button>

                  <AnimatePresence>
                    {openSection === sec.key && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                        }}
                        className="overflow-hidden  text-gray-500 text-xs md:text-sm leading-[2] pb-1  capitalize tracking-[0.1em] italic"
                      >
                        <div>{sec.value}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* BUTTONS */}
            <div className="mt-12 flex gap-4 flex-col sm:flex-row">
              <button
                disabled={qtyError || soldOut}
                onClick={addToCart}
                className="
    h-[60px]
    px-10
    bg-primary
    text-white
    uppercase
    text-xs
    tracking-[0.25em]
    disabled:opacity-50
    disabled:cursor-not-allowed
  "
              >
                {soldOut ? "Sold Out" : "Add To Cart"}
              </button>
              <button
                disabled={qtyError || soldOut}
                onClick={() => {
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
                  });
                }}
                className={`${soldOut ? "hidden" : "block"} h-[60px] px-10 border border-primary uppercase text-xs tracking-[0.25em] disabled:cursor-not-allowed disabled:opacity-50`}
              >
                Buy Now
              </button>
            </div>
          </motion.div>
        </div>

        {/* DESCRIPTION (OUTSIDE EVERYTHING) */}
        <div className="mt-16 lg:mt-24  leading-[2] max-w-4xl   text-start flex flex-col justify-items-start self-start ">
          <h1 className="font-luxury tracking-wider text-3xl md:text-4xl lg:text-5xl">
            Description
          </h1>
          <p className="font-cormorant text-lg md:text-xl lg:text-2xl py-5 text-gray-900 tracking-wide leading-[1.6]  lg:leading-[2] ">
            {product.description}
          </p>
        </div>
      </div>
      <AnimatePresence>
        {showCartSuccess && (
          <motion.div
            initial={{
              opacity: 0,
              y: 50,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.95,
            }}
            transition={{
              duration: 0.45,
            }}
            className="
        fixed
        bottom-8
        right-6
        z-[9999]
        bg-white
        border
        border-[#e6ddd0]
        shadow-[0_20px_60px_rgba(0,0,0,0.08)]
        px-8
        py-5
        min-w-[300px]
      "
          >
            <p className="text-[10px] tracking-[0.45em] uppercase text-primary">
              Cart Updated
            </p>

            <h3 className="font-cormorant text-2xl mt-2">Added Successfully</h3>

            <p className="text-[11px] tracking-[0.25em] uppercase text-neutral-500 mt-2">
              {product?.name}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProductDetail;
