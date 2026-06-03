import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "./api";

const CartDrawer = ({ open, setOpen }) => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const getKey = (item) => `${item.id}-${item.size}`;

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

      // 1. group by product id (IMPORTANT for shared stock)
      const grouped = new Map();

      stored.forEach((item) => {
        const key = item.id;

        if (!grouped.has(key)) {
          grouped.set(key, {
            id: item.id,
            variants: [item],
          });
        } else {
          grouped.get(key).variants.push(item);
        }
      });

      const updatedCart = [];

      // 2. validate per product
      grouped.forEach((group) => {
        const match = serverData.find((p) => p.id === group.id);

        // product removed from backend
        if (!match || match.exists === false) return;

        const stock = Number(match.stock || 0);

        // OUT OF STOCK → remove entire product (all sizes)
        if (stock <= 0) return;

        const basePrice = Number(match.price);
        const discount = Number(match.discount || 0);

        const finalPrice =
          discount > 0
            ? basePrice - Math.floor((basePrice * discount) / 100)
            : basePrice;

        // 3. distribute stock across sizes (CRITICAL FIX)
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

      // 4. save cleaned cart
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.log("Validation error", err);
    }
  };
  // — RUN VALIDATION WHEN CART OPENS
  useEffect(() => {
    if (open) {
      validateCart();
    }
  }, [open]);

  // ---------------- QTY UPDATE (SAFE) ----------------
  const updateQty = (id, size, type) => {
    const updated = cartItems.map((item) => {
      if (item.id !== id || item.size !== size) {
        return item;
      }

      // total quantity of this product across ALL sizes
      const totalProductQty = cartItems
        .filter((p) => p.id === id)
        .reduce((sum, p) => sum + Number(p.qty || 0), 0);

      if (type === "inc") {
        // if adding one would exceed stock
        if (totalProductQty + 1 > item.stock) {
          return item;
        }

        return {
          ...item,
          qty: item.qty + 1,
        };
      }

      return {
        ...item,
        qty: Math.max(1, item.qty - 1),
      };
    });

    syncCart(updated);
  };
  // ---------------- REMOVE ITEM ----------------
  const removeItem = (id, size) => {
    const updated = cartItems.filter(
      (item) => !(item.id === id && item.size === size),
    );

    syncCart(updated);
  };

  // ---------------- TOTAL ----------------
  const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

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
            className="
    fixed inset-0
    bg-black/50
    backdrop-blur-[4px]
    z-40
  "
          />

          {/* DRAWER */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
    fixed right-0 top-0
    h-full
    w-full sm:w-[470px]
    bg-[#faf8f4]
    z-50
    shadow-[0_0_80px_rgba(0,0,0,0.12)]
    flex flex-col
    border-l border-[#ece4d8]
  "
          >
            {/* HEADER */}
            <div className="px-8 py-7 border-b border-[#ece4d8]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.5em] text-neutral-400">
                    Shopping Bag
                  </p>

                  <h2 className="font-luxury text-4xl mt-3">Your Cart</h2>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="
        w-11 h-11
        border border-[#e8ddcc]
        flex items-center justify-center
        hover:border-primary
        transition-all
      "
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ITEMS */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-8">
                  <h3 className="font-luxury text-3xl mb-4">Empty Cart</h3>

                  <p className="text-neutral-500 tracking-[0.15em] uppercase text-xs leading-7">
                    Discover timeless pieces crafted for life's most memorable
                    moments.
                    <button onClick={() => navigate("/collections")}>
                      collections{" "}
                    </button>
                  </p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.size}`}
                    className="
    group
    flex gap-5
    border-b border-[#ece4d8]
    pb-6
  "
                  >
                    {/* IMAGE */}
                    <div
                      className="
      w-24 h-24
      bg-white
      border border-[#ece4d8]
      overflow-hidden
      flex items-center justify-center
    "
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="
        w-full h-full
        object-contain
        transition duration-700
        group-hover:scale-105
      "
                      />
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1">
                      {/* NAME */}
                      <h3
                        className="
        uppercase
        tracking-[0.18em]
        text-sm
        leading-relaxed
      "
                      >
                        {item.name}
                      </h3>

                      {/* SIZE + PRICE ROW */}
                      <div className="mt-2 flex items-center gap-4 text-[11px] tracking-[0.25em] uppercase text-neutral-500">
                        {item.size && (
                          <span className="border border-[#e8ddcc] px-2 py-1">
                            Size: {item.size}
                          </span>
                        )}

                        <span>PKR {Number(item.price).toLocaleString()}</span>
                      </div>

                      {/* QTY CONTROLS */}
                      <div className="flex items-center gap-3 mt-5">
                        <button
                          onClick={() => updateQty(item.id, item.size, "dec")}
                          className="
          w-9 h-9
          border border-[#e8ddcc]
          hover:border-primary
          transition
        "
                        >
                          −
                        </button>

                        <span className="min-w-[20px] text-center text-sm">
                          {item.qty}
                        </span>

                        <button
                          onClick={() => updateQty(item.id, item.size, "inc")}
                          className="
          w-9 h-9
          border border-[#e8ddcc]
          hover:border-primary
          transition
        "
                        >
                          +
                        </button>

                        <button
                          onClick={() => removeItem(item.id, item.size)}
                          className="
          ml-auto
          text-neutral-400
          hover:text-red-500
          transition
        "
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* FOOTER */}
            {cartItems.length > 0 && (
              <div
                className="
    border-t border-[#ece4d8]
    p-8
    bg-white/60
    backdrop-blur-sm
  "
              >
                <div className="mb-6">
                  <p className="uppercase tracking-[0.35em] text-[10px] text-neutral-400">
                    Order Total
                  </p>

                  <h3 className="font-luxury text-4xl mt-2 text-primary">
                    PKR {total.toLocaleString()}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/checkout");
                  }}
                  className="
      w-full
      h-[62px]
      bg-primary
      text-white
      uppercase
      tracking-[0.35em]
      text-xs
      transition-all
      hover:opacity-90
      hover:scale-[1.01]
    "
                >
                  Secure Checkout
                </button>

                <p className="text-center mt-4 text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                  Safe • Secure • Encrypted
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
