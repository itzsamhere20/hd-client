import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const Checkout = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <section className="min-h-screen bg-[#f8f5f0] pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Back */}
        <motion.button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-gray-500 mb-10"
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>

        <h1 className="font-luxury text-3xl md:text-5xl mb-12">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-12">
          {/* FORM */}
          <div className="space-y-6">
            {["name", "phone", "address", "city"].map((field) => (
              <input
                key={field}
                name={field}
                placeholder={field.toUpperCase()}
                onChange={handleChange}
                className="w-full h-[55px] px-5 border border-[#e8ddcc] bg-white uppercase tracking-wider text-sm outline-none"
              />
            ))}
          </div>

          {/* ORDER SUMMARY */}
          <div className="bg-white border border-[#e8ddcc] p-8 h-fit">
            <h2 className="text-xl uppercase tracking-[0.2em] mb-6">
              Order Summary
            </h2>

            <div className="flex justify-between mb-4">
              <span>Subtotal</span>
              <span>PKR 25,000</span>
            </div>

            <div className="flex justify-between mb-4">
              <span>Shipping</span>
              <span>PKR 200</span>
            </div>

            <div className="border-t pt-4 flex justify-between text-lg">
              <span className="uppercase tracking-wider">Total</span>
              <span className="text-primary">PKR 25,200</span>
            </div>

            <button className="mt-8 w-full h-[60px] bg-primary text-white uppercase tracking-[0.25em]">
              Place Order
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Checkout;
