import React, { useEffect, useState } from "react";
import Hero from "../components/hero";
import Story from "../components/story";
import Featured from "../components/featured";
import Categories from "../components/categories";
import CTA from "../components/cta";
import Slider from "../components/slider";
import { Helmet } from "react-helmet-async";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden ">
      <Helmet>
        <title>Hamdam Jewellers | Luxury Handmade Jewellery in Pakistan</title>
        <meta
          name="description"
          content="Shop luxury handmade jewellery at Hamdam Jewellers. Explore rings, bracelets, necklaces and elegant designs crafted with premium quality in Pakistan."
        />
        <meta
          property="og:title"
          content="Hamdam Jewellers | Luxury Jewellery"
        />
        <meta
          property="og:description"
          content="Premium handmade jewellery collection in Pakistan."
        />
        <meta property="og:url" content="https://hamdamcollections.com/" />

        <link rel="canonical" href="https://hamdamcollections.com/" />
      </Helmet>
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
