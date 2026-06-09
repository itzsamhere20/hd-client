import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "./api";

const CartDrawer = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  // ---------------- LOAD CART ----------------
  useEffect(() => {
    const loadCart = () => {
      const stored = JSON.parse(localStorage.getItem("cart")) || [];
      setCartItems(stored);
    };
    loadCart();
    window.addEventListener("cartUpdated", loadCart);
    return () => window.removeEventListener("cartUpdated", loadCart);
  }, []);

  // ---------------- SYNC CART ----------------
  const syncCart = (updated) => {
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // ---------------- STOCK VALIDATION ----------------
  const validateCart = async () => {
    const stored = JSON.parse(localStorage.getItem("cart")) || [];
    try {
      const res = await api.post("/cart/validate", {
        items: stored.map((item) => ({
          id: item.id,
          qty: item.qty,
          size: item.size,
        })),
      });
      const serverData = res.data;
      const grouped = new Map();
      stored.forEach((item) => {
        if (!grouped.has(item.id))
          grouped.set(item.id, { id: item.id, variants: [item] });
        else grouped.get(item.id).variants.push(item);
      });
      const updatedCart = [];
      grouped.forEach((group) => {
        const match = serverData.find((p) => p.id === group.id);
        if (!match || match.exists === false) return;
        const stock = Number(match.stock || 0);
        if (stock <= 0) return;
        const basePrice = Number(match.price);
        const discount = Number(match.discount || 0);
        const finalPrice =
          discount > 0
            ? basePrice - Math.floor((basePrice * discount) / 100)
            : basePrice;
        let remainingStock = stock;
        for (const item of group.variants) {
          if (remainingStock <= 0) break;
          const safeQty = Math.min(Number(item.qty || 1), remainingStock);
          remainingStock -= safeQty;
          updatedCart.push({
            ...item,
            qty: safeQty,
            stock,
            price: basePrice,
            discount,
            finalPrice,
            image: match.image,
            name: match.name,
          });
        }
      });
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.log("Validation error", err);
    }
  };

  useEffect(() => {
    if (open) validateCart();
  }, [open]);

  // ---------------- QTY UPDATE ----------------
  const updateQty = (id, size, type) => {
    const updated = cartItems.map((item) => {
      if (item.id !== id || item.size !== size) return item;
      const totalProductQty = cartItems
        .filter((p) => p.id === id)
        .reduce((sum, p) => sum + Number(p.qty || 0), 0);
      if (type === "inc") {
        if (totalProductQty + 1 > item.stock) return item;
        return { ...item, qty: item.qty + 1 };
      }
      return { ...item, qty: Math.max(1, item.qty - 1) };
    });
    syncCart(updated);
  };

  // ---------------- REMOVE ITEM ----------------
  const removeItem = (id, size) => {
    syncCart(
      cartItems.filter((item) => !(item.id === id && item.size === size)),
    );
  };

  // ---------------- TOTAL ----------------
  const total = cartItems.reduce(
    (acc, item) => acc + (item.finalPrice || item.price) * item.qty,
    0,
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* OVERLAY */}
          <motion.div
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[3px] z-40"
          />

          {/* DRAWER */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-[#f8f5f0] z-[101] flex flex-col border-l border-[#ddd2c2]"
          >
            {/* ── HEADER ── */}
            <div className="px-8 py-7 border-b border-[#ddd2c2]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.45em] text-primary/70 font-medium">
                    Shopping Bag
                  </p>
                  <h2 className="font-luxury text-4xl mt-2 text-gray-900">
                    Your Cart
                  </h2>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="w-10 h-10 border border-[#ddd2c2] flex items-center justify-center hover:border-primary hover:text-primary transition"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* ── ITEMS ── */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {cartItems.length === 0 ? (
                /* EMPTY STATE */
                <div className="h-full flex flex-col items-center justify-center text-center px-8 gap-6">
                  <ShoppingBag size={40} className="text-primary/20" />
                  <div>
                    <h3 className="font-luxury text-3xl text-gray-900 mb-3">
                      Empty Cart
                    </h3>
                    <p className="font-cormorant text-lg text-gray-500 leading-[1.6]">
                      Discover timeless pieces crafted for life's most memorable
                      moments.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/collections");
                    }}
                    className="text-xs uppercase tracking-[0.35em] border-b border-gray-400 hover:border-primary hover:text-primary transition pb-1"
                  >
                    Explore Collections
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.size}`}
                    className="group flex gap-4 border-b border-[#ddd2c2] pb-5"
                  >
                    {/* IMAGE — bg-white on cream, matching product cards */}
                    <div className="w-[88px] h-[88px] bg-white border border-[#ddd2c2] flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain transition duration-700 group-hover:scale-105"
                      />
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1 min-w-0">
                      {/* NAME */}
                      <h3 className="font-cormorant uppercase tracking-[0.18em] text-sm text-black leading-tight">
                        {item.name}
                      </h3>

                      {/* SIZE + PRICE */}
                      <div className="mt-2 flex items-center gap-3 flex-wrap">
                        {item.size && (
                          <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500 border border-[#ddd2c2] px-2 py-0.5">
                            {item.size}
                          </span>
                        )}
                        {item.discount > 0 && (
                          <span className="text-[9px] tracking-[0.25em] uppercase text-neutral-400 line-through">
                            PKR {Number(item.price).toLocaleString()}
                          </span>
                        )}
                        <span className="text-[10px] tracking-[0.3em] uppercase text-primary">
                          PKR{" "}
                          {Number(
                            item.discount > 0 ? item.finalPrice : item.price,
                          ).toLocaleString()}
                        </span>
                      </div>

                      {/* QTY CONTROLS */}
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={() => updateQty(item.id, item.size, "dec")}
                          className="w-8 h-8 border border-[#ddd2c2] hover:border-primary hover:text-primary transition text-sm flex items-center justify-center"
                        >
                          −
                        </button>

                        <span className="min-w-[24px] text-center text-sm font-medium">
                          {item.qty}
                        </span>

                        <button
                          onClick={() => updateQty(item.id, item.size, "inc")}
                          className="w-8 h-8 border border-[#ddd2c2] hover:border-primary hover:text-primary transition text-sm flex items-center justify-center"
                        >
                          +
                        </button>

                        <button
                          onClick={() => removeItem(item.id, item.size)}
                          className="ml-auto text-gray-400 hover:text-red-500 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── FOOTER ── */}
            {cartItems.length > 0 && (
              <div className="border-t border-[#ddd2c2] px-8 py-7 bg-white/50 backdrop-blur-sm">
                {/* TOTAL */}
                <div className="flex items-baseline justify-between mb-6">
                  <p className="text-[10px] uppercase tracking-[0.45em] text-gray-500">
                    Order Total
                  </p>
                  <h3 className="font-luxury text-3xl text-primary">
                    PKR {total.toLocaleString()}
                  </h3>
                </div>

                {/* CHECKOUT BUTTON — matches products page primary button */}
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/checkout");
                  }}
                  className="w-full h-[54px] bg-primary text-white uppercase tracking-[0.35em] text-xs hover:opacity-90 transition"
                >
                  Secure Checkout
                </button>

                <p className="text-center mt-4 text-[10px] uppercase tracking-[0.3em] text-gray-400">
                  Safe · Secure · Encrypted
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
