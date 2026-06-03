import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ShoppingBag,
  User,
  Package,
  LogOut,
  Pencil,
  ChevronDown,
} from "lucide-react";
import api from "./api";
import CartDrawer from "./cartDrawer";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Collections", path: "/collections" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  /* ── SCROLL SHADOW ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── CART ── */
  useEffect(() => {
    const loadCart = () => {
      setCartItems(JSON.parse(localStorage.getItem("cart")) || []);
    };
    loadCart();
    window.addEventListener("cartUpdated", loadCart);
    return () => window.removeEventListener("cartUpdated", loadCart);
  }, []);

  /* ── AUTH ── */
  useEffect(() => {
    const loadUser = () => {
      try {
        const s = localStorage.getItem("user");
        setUser(s ? JSON.parse(s) : null);
      } catch {
        setUser(null);
      }
    };
    loadUser();
    window.addEventListener("authUpdated", loadUser);
    return () => window.removeEventListener("authUpdated", loadUser);
  }, []);

  /* ── CLOSE DROPDOWN ON OUTSIDE CLICK ── */
  useEffect(() => {
    if (!userMenuOpen) return;
    const h = (e) => {
      if (!e.target.closest("#user-menu-wrap")) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [userMenuOpen]);

  /* ── CLOSE MOBILE ON ROUTE CHANGE ── */
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setUserMenuOpen(false);
    window.dispatchEvent(new Event("authUpdated"));
    navigate("/");
  };

  const isLoggedIn = !!user && !!localStorage.getItem("token");
  const initial = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  // ---------- shipping details -------

  const [shippingThreshold, setShippingThreshold] = useState(0);
  const [announcementVisible, setAnnouncementVisible] = useState(true);

  const fetchShippingThreshold = async () => {
    try {
      const res = await api.get("/settings/shipping");

      setShippingThreshold(res.data.freeShippingThreshold);
      console.log("Shipping threshold:", shippingThreshold);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchShippingThreshold();
  }, [shippingThreshold]);

  return (
    <>
      {/* ═══════════════════════════════════════
          TOP ANNOUNCEMENT BAR — subtle 1px line
      ════════════════════════════════════════ */}
      <AnimatePresence>
        {shippingThreshold > 0 && announcementVisible && (
          <motion.div
            initial={{ height: 34, opacity: 1 }}
            animate={{ height: 34, opacity: 1 }}
            exit={{
              height: 0,
              opacity: 0,
              y: -20,
            }}
            transition={{
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className=" hidden md:block fixed top-0 left-0 w-full z-50 overflow-hidden bg-primary"
          >
            <div className="h-[34px] flex items-center justify-center relative px-10">
              <span className="text-white/80 text-[10px] tracking-[0.35em] uppercase">
                Free shipping on orders above PKR{" "}
                {shippingThreshold.toLocaleString()}
                &nbsp;·&nbsp; Handcrafted in Pakistan
              </span>

              <button
                onClick={() => setAnnouncementVisible(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════
          MAIN NAVBAR
      ════════════════════════════════════════ */}
      <header
        className={`
    fixed left-0 w-full z-40 bg-background
  transition-[top,box-shadow] duration-300 ease-out
    ${
      scrolled
        ? "shadow-[0_1px_0_0_rgba(0,0,0,0.08)]"
        : "border-b border-black/[0.06]"
    }
    ${
      shippingThreshold > 0 && announcementVisible
        ? "md:top-[34px] top-0"
        : "top-0"
    }
  `}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-10 h-[68px] flex items-center">
          {/* ── LOGO ── */}
          <Link to="/" className="flex flex-col mr-auto">
            <span className="font-luxury text-[22px] leading-none tracking-[0.15em] text-primary">
              HAMDAM
            </span>
            <span className="text-[9px] tracking-[0.4em] text-black/50 mt-[2px]">
              JEWELLERY
            </span>
          </Link>

          {/* ── DESKTOP NAV — absolutely centred ── */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  relative text-[11px] uppercase tracking-[0.22em] transition-colors duration-200 pb-0.5
                  ${
                    isActive(item.path)
                      ? "text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-black"
                      : "text-black/55 hover:text-black/90"
                  }
                `}
              >
                {item.name}
              </Link>
            ))}
            {isLoggedIn && (
              <Link
                to="/orders"
                className={`
                  relative text-[11px] uppercase tracking-[0.22em] transition-colors duration-200 pb-0.5
                  ${
                    isActive("/orders")
                      ? "text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-black"
                      : "text-black/55 hover:text-black/90"
                  }
                `}
              >
                My Orders
              </Link>
            )}
          </nav>

          {/* ── RIGHT ACTIONS ── */}
          <div className="flex items-center gap-5 ml-auto">
            {/* USER (desktop) */}
            {isLoggedIn ? (
              <div id="user-menu-wrap" className="hidden md:block relative">
                <button
                  onClick={() => setUserMenuOpen((p) => !p)}
                  className="flex items-center gap-2 group"
                >
                  {/* Avatar ring */}
                  <div className="w-7 h-7 rounded-full border border-black/20 group-hover:border-black/50 transition-colors bg-[#f5efe6] flex items-center justify-center text-[11px] font-medium tracking-wide text-black/70">
                    {initial}
                  </div>
                  <ChevronDown
                    size={12}
                    className={`text-black/40 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 top-10 w-52 bg-white border border-black/[0.08] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden"
                    >
                      {/* USER INFO */}
                      <div className="px-4 py-3.5 border-b border-black/[0.06]">
                        <p className="text-[13px] font-medium text-gray-900 truncate">
                          {user?.name || "My Account"}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {user?.email}
                        </p>
                      </div>

                      <DropdownItem
                        icon={<Package size={14} />}
                        label="My Orders"
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <DropdownItem
                        icon={<Pencil size={14} />}
                        label="Edit Information"
                        to="/auth"
                        onClick={() => setUserMenuOpen(false)}
                      />

                      <div className="border-t border-black/[0.06]">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-red-500 hover:bg-red-50/60 transition-colors"
                        >
                          <LogOut size={14} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/auth"
                className="hidden md:flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] text-black/55 hover:text-black/90 transition-colors"
              >
                <User size={14} strokeWidth={1.5} />
                Login
              </Link>
            )}

            {/* CART */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center"
              aria-label="Open cart"
            >
              <ShoppingBag
                size={18}
                strokeWidth={1.5}
                className="text-black/80"
              />
              <AnimatePresence>
                {cartItems.length > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 bg-primary text-white text-[9px] font-medium w-[17px] h-[17px] flex items-center justify-center rounded-full"
                  >
                    {cartItems.length > 9 ? "9+" : cartItems.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* MOBILE HAMBURGER */}
            <button
              className="md:hidden p-0.5"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} strokeWidth={1.5} className="text-black/80" />
            </button>
          </div>
        </div>

        {/* ── ACTIVE PAGE INDICATOR LINE ── */}
        <div className="h-px w-full bg-black/[0.04]" />
      </header>

      {/* ═══════════════════════════════════════
          MOBILE DRAWER
      ════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/30 z-[60]"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "tween",
                duration: 0.3,
                ease: [0.32, 0, 0.67, 0],
              }}
              className="fixed top-0 right-0 w-[78vw] max-w-[320px] h-full bg-[#faf8f4] z-[70] flex flex-col"
            >
              {/* DRAWER HEADER */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.07]">
                <span className="font-luxury text-base tracking-[0.15em] text-primary">
                  HAMDAM
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-black/50 hover:text-black transition-colors"
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              {/* NAV LINKS */}
              <nav className="flex flex-col px-6 pt-6 gap-1 flex-1">
                {navItems.map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + idx * 0.04 }}
                  >
                    <Link
                      to={item.path}
                      className={`
                        flex items-center justify-between py-3.5 text-[11px] uppercase tracking-[0.25em]
                        border-b border-black/[0.06] transition-colors
                        ${isActive(item.path) ? "text-black" : "text-black/50 hover:text-black/80"}
                      `}
                    >
                      {item.name}
                      {isActive(item.path) && (
                        <span className="w-1 h-1 rounded-full bg-primary" />
                      )}
                    </Link>
                  </motion.div>
                ))}

                {isLoggedIn && (
                  <motion.div
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + navItems.length * 0.04 }}
                  >
                    <Link
                      to="/orders"
                      className={`
                        flex items-center justify-between py-3.5 text-[11px] uppercase tracking-[0.25em]
                        border-b border-black/[0.06] transition-colors
                        ${isActive("/orders") ? "text-black" : "text-black/50 hover:text-black/80"}
                      `}
                    >
                      My Orders
                      {isActive("/orders") && (
                        <span className="w-1 h-1 rounded-full bg-primary" />
                      )}
                    </Link>
                  </motion.div>
                )}

                {isLoggedIn && (
                  <motion.div
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + (navItems.length + 1) * 0.04 }}
                  >
                    <Link
                      to="/auth"
                      className="flex items-center justify-between py-3.5 text-[11px] uppercase tracking-[0.25em] border-b border-black/[0.06] text-black/50 hover:text-black/80 transition-colors"
                    >
                      Edit Information
                    </Link>
                  </motion.div>
                )}
              </nav>

              {/* BOTTOM USER SECTION */}
              <div className="px-6 py-5 border-t border-black/[0.07]">
                {isLoggedIn ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#f0e9df] border border-black/10 flex items-center justify-center text-[11px] font-medium text-black/60">
                        {initial}
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-gray-800 truncate max-w-[140px]">
                          {user?.name || "My Account"}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[140px]">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Logout"
                    >
                      <LogOut size={15} className="text-red-400" />
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.22em] text-black/60 hover:text-black transition-colors"
                  >
                    <User size={14} strokeWidth={1.5} />
                    Login / Sign Up
                  </Link>
                )}
              </div>
            </motion.aside>
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

/* ── DROPDOWN ITEM HELPER ── */
function DropdownItem({ icon, label, to, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 text-[13px] text-gray-600 hover:bg-gray-50/80 transition-colors"
    >
      <span className="text-gray-400">{icon}</span>
      {label}
    </Link>
  );
}
