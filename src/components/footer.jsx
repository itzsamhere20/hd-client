import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden py-20 px-6 md:mt-20">
      {/* ===== LOGO ===== */}
      <div className="text-center">
        <h2 className="font-luxury text-4xl md:text-6xl text-gray-900 tracking-[0.25em]">
          HAMDAM
        </h2>
      </div>

      {/* ===== LINKS ===== */}
      <div
        className="
          mt-16
          grid grid-cols-1 md:grid-cols-3
          gap-10 
          md:gap-0
          text-center
          max-w-5xl
          mx-auto
        
        "
      >
        {/* ABOUT */}
        <div>
          <h3 className="font-luxury text-lg  md:text-2xl text-gray-900 mb-6">
            About
          </h3>

          <ul className="flex flex-col space-y-4 font-cormorant text-base md:text-xl text-gray-800">
            <Link
              to="/about"
              className="hover:text-primary transition cursor-pointer"
            >
              Our Story
            </Link>

            <Link
              to="/contact"
              className="hover:text-primary transition cursor-pointer"
            >
              Contact
            </Link>
          </ul>
        </div>

        {/* STORE */}
        <div>
          <h3 className="font-luxury text-lg  md:text-2xl text-gray-900 mb-6">
            Store
          </h3>

          <ul className="space-y-4 font-cormorant text-base md:text-xl text-gray-800  ">
            <li className="hover:text-primary transition cursor-pointer">
              Rings
            </li>

            <li className="hover:text-primary transition cursor-pointer">
              Necklace
            </li>

            <li className="hover:text-primary transition cursor-pointer">
              Earrings
            </li>

            <li className="hover:text-primary transition cursor-pointer">
              Bracelets
            </li>
          </ul>
        </div>

        {/* CARE */}
        <div>
          <h3 className="font-luxury text-lg  md:text-2xl text-gray-900 mb-6">
            Care
          </h3>

          <ul className=" flex flex-col space-y-4 font-cormorant text-base md:text-xl text-gray-800">
            <Link
              to="/faq"
              className="hover:text-primary transition cursor-pointer"
            >
              Delivery
            </Link>

            <Link
              to="/faq"
              className="hover:text-primary transition cursor-pointer"
            >
              Cancellation & Return
            </Link>

            <Link
              to="/faq"
              className="hover:text-primary transition cursor-pointer"
            >
              FAQ
            </Link>
          </ul>
        </div>
      </div>

      {/* ===== HUGE MOVING TEXT SECTION ===== */}
      <div className="relative mt-28 py-24 overflow-hidden">
        {/* LEFT TEXT */}
        <h1
          className="
            absolute
            left-[-10%]
            top-1/2
            -translate-y-1/2

            text-[70px]
            md:text-[140px]
            lg:text-[220px]

            font-luxury
            text-primary/10
            whitespace-nowrap
            select-none
          "
        >
          LUXURY
        </h1>

        {/* RIGHT TEXT */}
        <h1
          className="
            absolute
            right-[-10%]
            top-1/2
            -translate-y-1/2

            text-[70px]
            md:text-[140px]
            lg:text-[220px]

            font-luxury
            text-primary/10
            whitespace-nowrap
            select-none
          "
        >
          JEWELS
        </h1>

        {/* SOCIAL ICONS */}
        <div className="relative z-10 flex justify-center items-center gap-8">
          <a
            href="#"
            className="
              w-14 h-14
              border border-primary/30
              rounded-full
              flex items-center justify-center
              hover:bg-primary
              hover:text-white
              transition duration-500
            "
          >
            <FaFacebookF size={22} />
          </a>

          <a
            href="#"
            className="
              w-14 h-14
              border border-primary/30
              rounded-full
              flex items-center justify-center
              hover:bg-primary
              hover:text-white
              transition duration-500
            "
          >
            <FaInstagram size={22} />
          </a>

          <a
            href="#"
            className="
              w-14 h-14
              border border-primary/30
              rounded-full
              flex items-center justify-center
              hover:bg-primary
              hover:text-white
              transition duration-500
            "
          >
            <FaWhatsapp size={22} />
          </a>
        </div>
      </div>

      {/* ===== COPYRIGHT ===== */}
      <div className="text-center mt-5 lg:mt-10">
        <p className=" tracking-wide text-xs md:text-sm lg:text-base text-gray-600 ">
          © {new Date().getFullYear()} Hamdam Jewellers. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
