import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#f7f4ef]">
      <div className="text-center max-w-xl">
        {/* BIG 404 */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="font-luxury text-[120px] md:text-[180px] text-primary/20 leading-none"
        >
          404
        </motion.h1>

        {/* TITLE */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-luxury text-3xl md:text-5xl text-gray-800 -mt-6"
        >
          Page Not Found
        </motion.h2>

        {/* DESCRIPTION */}
        <p className="mt-6 text-gray-500 tracking-[0.15em] uppercase text-xs md:text-sm">
          The page you’re looking for doesn’t exist or has been moved.
        </p>

        {/* BUTTONS */}
        <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-400 uppercase tracking-[0.2em] text-xs hover:bg-black hover:text-white transition"
          >
            Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-primary text-white uppercase tracking-[0.2em] text-xs hover:opacity-80 transition"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
