import React from "react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className=" min-h-[1000px] flex  pt-24 items-center">
      <div className=" mt-10 md:mt-0  max-w-7xl  px-6  mx-auto grid md:grid-cols-2 gap-12 ">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <h1 className=" text-5xl md:text-7xl lg:text-8xl font-luxury text-gray-900/90 leading-snug ">
            Elegant Pieces <br />
            <span className="italic text-[#A68A3C]">For Every Moment</span>
          </h1>

          <p className="text-gray-600 max-w-md text-lg md:text-xl leading-[1.6]">
            Discover refined jewelry crafted with precision and timeless beauty.
          </p>

          <button className="mt-4 px-6 py-3 text-sm tracking-[0.2em] uppercase border border-[#C6A962] text-[#A68A3C] hover:bg-[#C6A962] hover:text-white transition">
            Explore Collection
          </button>
        </motion.div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative"
        >
          <img
            src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0"
            className="rounded-2xl h-[600px] shadow-xl"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#A68A3C]/20 to-transparent rounded-2xl"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
