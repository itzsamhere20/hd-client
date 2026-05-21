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
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0] text-gray-500 tracking-[0.2em] uppercase text-sm">
        Product not found
      </div>
    );
  }

  const soldOut = product.stock === 0;

  const finalPrice =
    Number(product.price) -
    Math.floor((Number(product.price) * Number(product.discount || 0)) / 100);

  // ---------qty  inc function ------------

  const increaseQty = () => {
    const newQty = qty + 1;

    if (newQty > product.stock) {
      setQtyError(
        "We don’t have that much stock remaining. Please contact us for bulk orders.",
      );
      setQty(qty + 1);
      return;
    }

    setQty(newQty);

    // clear error if back in range
    if (newQty <= product.stock) {
      setQtyError("");
    }
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
    if (!product) return;

    const cartItem = {
      id: product._id || product.id,
      name: product.name,
      price: finalPrice,
      qty,
      size: selectedSize,
      image: product.image,
      stock: product.stock,
    };

    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

    // check same product + same size
    const existingIndex = existingCart.findIndex(
      (item) => item.id === cartItem.id && item.size === cartItem.size,
    );

    if (existingIndex !== -1) {
      const updatedCart = [...existingCart];

      updatedCart[existingIndex].qty += qty;

      // stock safety check
      if (updatedCart[existingIndex].qty > product.stock) {
        updatedCart[existingIndex].qty = product.stock;
      }

      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } else {
      localStorage.setItem("cart", JSON.stringify([...existingCart, cartItem]));
    }

    // optional UX improvement: open cart drawer event
    window.dispatchEvent(new Event("cartUpdated"));
  };
  return (
    <section className="min-h-screen  overflow-hidden pb-20 pt-32">
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

            <h1 className="font-luxury text-3xl md:text-5xl lg:text-6xl text-gray-900">
              {product.name}
            </h1>

            {/* PRICE */}
            <div className="mt-8 flex items-center gap-5 flex-wrap">
              {product.discount > 0 && (
                <p className="text-gray-400 line-through text-lg tracking-[0.15em]">
                  PKR {Number(product.price).toLocaleString()}
                </p>
              )}

              <p className="text-primary text-2xl md:text-3xl tracking-[0.2em]">
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
                      className={`min-w-[52px] h-[52px] px-6   border text-sm ${
                        selectedSize === size
                          ? "bg-primary text-white border-primary"
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
                    className="w-full flex justify-between py-5 text-sm uppercase tracking-[0.25em]"
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
                        className="overflow-hidden  text-gray-600 text-base md:text-base leading-[2] pb-1  capitalize tracking-wide"
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
                disabled={qtyError}
                onClick={addToCart}
                className="h-[60px] px-10 bg-primary text-white uppercase text-xs tracking-[0.25em] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add To Cart
              </button>

              <button
                disabled={qtyError}
                onClick={() => navigate("/checkout")}
                className="h-[60px] px-10 border border-primary uppercase text-xs tracking-[0.25em] disabled:cursor-not-allowed disabled:opacity-50"
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
          <p className="font-cormorant text-lg md:text-xl lg:text-2xl py-5 text-gray-900 tracking-wide leading-snug">
            {product.description}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;
