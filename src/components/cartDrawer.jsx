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
  };

  // ---------------- STOCK VALIDATION ----------------
  const validateCart = async () => {
    const stored = JSON.parse(localStorage.getItem("cart")) || [];

    try {
      const res = await api.post("/cart/validate", {
        items: stored.map((item) => ({
          id: item.id,
          qty: item.qty,
        })),
      });

      const stockMap = res.data;

      const updatedCart = stored.map((item) => {
        const match = stockMap.find((p) => p.id === item.id);

        if (!match) return item;

        return {
          ...item,
          qty: Math.min(item.qty, match.stock),
          stock: match.stock,
        };
      });

      syncCart(updatedCart);
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
      if (item.id === id && item.size === size) {
        const maxStock = item.stock || Infinity;

        const newQty =
          type === "inc"
            ? Math.min(item.qty + 1, maxStock)
            : Math.max(1, item.qty - 1);

        return { ...item, qty: newQty };
      }

      return item;
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* DRAWER */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-[#f8f5f0] z-50 shadow-2xl flex flex-col"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between p-6 border-b border-[#e8ddcc]">
              <h2 className="uppercase tracking-[0.25em] text-sm">Your Cart</h2>

              <button onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>

            {/* ITEMS */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <p className="text-gray-500 text-sm uppercase tracking-wider">
                  Your cart is empty
                </p>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.size}`}
                    className="flex gap-4 border-b border-[#e8ddcc] pb-4"
                  >
                    <img
                      src={item.image}
                      className="w-20 h-20 object-cover bg-white"
                    />

                    <div className="flex-1">
                      <h3 className="uppercase text-sm tracking-wide">
                        {item.name}
                      </h3>

                      {item.size && (
                        <p className="text-xs text-gray-500">
                          Size: {item.size}
                        </p>
                      )}

                      <p className="text-gray-500 text-sm mt-1">
                        PKR {item.price.toLocaleString()}
                      </p>

                      {/* QTY */}
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => updateQty(item.id, item.size, "dec")}
                          className="w-8 h-8 border"
                        >
                          -
                        </button>

                        <span>{item.qty}</span>

                        <button
                          onClick={() => updateQty(item.id, item.size, "inc")}
                          className="w-8 h-8 border"
                        >
                          +
                        </button>

                        <button
                          onClick={() => removeItem(item.id, item.size)}
                          className="ml-auto text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* FOOTER */}
            <div className="p-6 border-t border-[#e8ddcc] bg-[#f8f5f0]">
              <div className="flex justify-between mb-4 uppercase tracking-wider">
                <span>Total</span>
                <span className="text-primary">
                  PKR {total.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/checkout");
                }}
                className="w-full h-[55px] bg-primary text-white uppercase tracking-[0.25em]"
              >
                Checkout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
