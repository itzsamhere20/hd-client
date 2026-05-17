import React, { useEffect, useState } from "react";
import Hero from "../components/hero";
import Story from "../components/story";
import Featured from "../components/featured";
import Categories from "../components/categories";
import CTA from "../components/cta";
import Slider from "../components/slider";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden ">
      <div className="relative z-10">
        <Hero />
        <Story />
        <Featured />
        <CTA />

        <Categories />
        <Slider />
      </div>
    </div>
  );
}
