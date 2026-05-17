import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems = ["Home", "About", "Collections"];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 
  ${
    scrolled
      ? "bg-white/25 backdrop-blur-2xl border-b border-white/40 shadow-md py-0"
      : "bg-white/15 backdrop-blur-xl border-b border-gray-800/50 py-4"
  }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 relative flex items-center justify-between">
        {/* LEFT (Desktop Links) */}
        <div className="hidden md:flex gap-8 text-[12px] tracking-[0.2em] uppercase text-gray-900/90 z-10">
          {navItems.map((item) => (
            <Link
              key={item}
              to={item}
              className="relative group hover:text-[#A68A3C] transition"
            >
              {item}
              <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-[#A68A3C] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* MOBILE MENU BUTTON */}
        <div className="md:hidden z-10">
          <button onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {/* CENTER LOGO */}
        <div className="text-center z-10 md:absolute md:left-1/2 md:-translate-x-1/2">
          <h1 className="font-luxury text-xl md:text-2xl tracking-wide text-gray-900">
            Hamdam
          </h1>
          <p className="text-[10px] md:text-xs italic text-[#A68A3C] tracking-[0.3em]">
            Jewellers
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4 md:gap-6 z-10">
          <button className="hidden md:block text-[12px] tracking-[0.2em] uppercase border-b border-transparent hover:border-[#A68A3C] hover:text-[#A68A3C] transition">
            Sign Up
          </button>

          {/* Cart */}
          <div className="relative cursor-pointer group">
            <ShoppingCart className="w-5 h-5 text-gray-900/90 group-hover:text-[#A68A3C] transition" />

            <span className="absolute -top-2 -right-2 bg-[#A68A3C]/90 backdrop-blur-md text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-md">
              0
            </span>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-white/80 backdrop-blur-xl border-t border-white/20 px-6 py-6 space-y-6 text-center">
          {navItems.map((item) => (
            <Link
              key={item}
              to={item}
              onClick={() => setOpen(false)}
              className="block text-sm uppercase tracking-widest text-gray-900 hover:text-[#A68A3C] transition"
            >
              {item}
            </Link>
          ))}

          <button className="text-sm uppercase tracking-widest border-b border-[#A68A3C]">
            Sign Up
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
