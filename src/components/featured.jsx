const Featured = () => {
  const products = [
    {
      name: "Gold Ring",
      price: "PKR 25,000",
      img: "https://png.pngtree.com/png-clipart/20240721/original/pngtree-a-jewelry-ring-on-white-background-png-image_15604148.png",
    },
    {
      name: "Diamond Necklace",
      price: "PKR 85,000",
      img: "https://png.pngtree.com/png-vector/20231026/ourmid/pngtree-chopard-happy-diamonds-necklace-png-image_10368944.png",
    },
    {
      name: "Micro Jewellery gold Bracelet",
      price: "PKR 150,000",
      img: "https://static.vecteezy.com/system/resources/thumbnails/042/167/713/small/ai-generated-3d-rendering-of-a-hand-gold-chain-on-transparent-background-ai-generated-png.png",
    },
    {
      name: "Pearl Earrings",
      price: "PKR 18,000",
      img: "https://www.paspaley.com/cdn/shop/files/Crescent_Moon_Diamond_Mother_Of_Pearl_and_Keshi_Pearl_Earring_Enhancers_-_White_Gold_F23AE10WKQ05_1500_x_1875_C_2.png?v=1742528428&width=2048.png",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto py-14 md:py-20 px-4 md:px-6">
      <h2 className="text-left text-xl md:text-3xl tracking-widest uppercase mb-10 md:mb-12 text-gray-900 font-luxury">
        Featured Collection
      </h2>

      {/* PRODUCTS */}
      <div className=" flex flex-col md:flex-row gap-5 md:gap-6 overflow-x-auto lg:overflow-visible lg:justify-between">
        {products.map((item, index) => (
          <div
            key={item.name}
            className={`flex flex-col text-center
            ${
              index === 0 || index === 2
                ? "w-full   md:w-[300px]"
                : "w-full md:w-[240px]"
            }`}
          >
            {/* IMAGE BACKGROUND */}
            <div
              className={`bg-white flex items-center justify-center   hover:scale-95 transition duration-500
              ${
                index === 0 || index === 2
                  ? "h-[350px]  md:h-[380px]"
                  : "h-[350px] md:h-[260px]"
              }`}
            >
              <img
                src={item.img}
                alt={item.name}
                className="max-h-[75%] object-contain transition duration-300 "
              />
            </div>

            {/* TEXT */}
            <div className="mt-3 md:mt-4 text-left">
              <div className="flex  justify-between ">
                <h3 className="text-base lg:text-lg text-gray-950 font-cormorant  font-bold w-[60%] ">
                  {item.name}
                </h3>

                <p className="text-xs md:text-sm text-primary mt-1">
                  {item.price}
                </p>
              </div>

              <button className="mt-2 text-[10px] md:text-[10px] lg:text-[11px] uppercase tracking-widest border-b border-transparent hover:border-black transition">
                gold .14k
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Featured;
