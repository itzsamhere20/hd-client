import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, User } from "lucide-react";
import CartDrawer from "./CartDrawer";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Collections", path: "/collections" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  // Load cart from localStorage
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(storedCart);
  }, []);

  // Optional: keep sync if cart updates in same tab
  useEffect(() => {
    const handleStorage = () => {
      const updatedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartItems(updatedCart);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background border-b border-black/5">
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-20 flex items-center justify-between">
          {/* LOGO */}
          <Link
            to="/"
            className="font-luxury text-xl md:text-2xl tracking-widest text-primary flex flex-col"
          >
            HAMDAM
            <span className="text-xs tracking-[0.25em] text-center text-black/70">
              JEWELLERY
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <nav className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-xs uppercase tracking-[0.25em] text-black/70 hover:text-black transition"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-4">
            {/* LOGIN ICON (DESKTOP) */}
            <Link
              to="/auth"
              className="hidden md:flex items-center justify-center relative group"
            >
              <User className="w-5 h-5 text-black" />
              <span className="absolute -bottom-5 text-[10px] opacity-0 group-hover:opacity-100 transition">
                Login
              </span>
            </Link>

            {/* CART */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative group"
            >
              <ShoppingBag className="w-5 h-5 text-black" />

              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItems.length}
                </span>
              )}
            </button>

            {/* MOBILE MENU BUTTON */}
            <button className="md:hidden" onClick={() => setMobileOpen(true)}>
              <Menu />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />

            {/* drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.35 }}
              className="fixed top-0 left-0 w-[80%] sm:w-[320px] h-full bg-[#f8f5f0] z-50 p-6 flex flex-col"
            >
              {/* close */}
              <button
                onClick={() => setMobileOpen(false)}
                className="self-end mb-10"
              >
                <X />
              </button>

              {/* links */}
              <div className="flex flex-col gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className="text-xs uppercase tracking-[0.25em] text-black/80"
                  >
                    {item.name}
                  </Link>
                ))}

                {/* MOBILE LOGIN */}
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-black/80 mt-6"
                >
                  <User className="w-4 h-4" />
                  Login
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CART DRAWER */}
      <CartDrawer
        open={cartOpen}
        setOpen={setCartOpen}
        cartItems={cartItems}
        setCartItems={setCartItems}
      />
    </>
  );
};

export default Navbar;
