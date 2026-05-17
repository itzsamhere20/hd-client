export default function ContactPage() {
  return (
    <section className=" text-gray-900 overflow-hidden">
      {/* ===== HERO ===== */}
      <div className="relative flex items-center justify-center py-28 md:py-40">
        <h1 className="absolute text-[70px] md:text-[160px] lg:text-[220px] font-luxury text-primary/10 select-none">
          CONTACT
        </h1>

        <div className="relative z-10 text-center mt-10 md:mt-0">
          <h2 className="font-luxury text-4xl md:text-6xl lg:text-7xl">
            Get In Touch
          </h2>
          <p className="mt-6 font-cormorant text-xl md:text-2xl text-gray-700 italic max-w-md md:max-w-2xl mx-auto leading-[1.6]">
            We would love to hear from you. Whether it’s about our collections,
            custom orders or collaborations.
          </p>
        </div>
      </div>

      {/* ===== CONTACT SECTION ===== */}
      <div className="max-w-7xl mx-auto px-6 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* LEFT INFO */}
          <div>
            <h3 className="font-luxury text-3xl md:text-5xl mb-10">
              Visit Our Store
            </h3>

            <p className="font-cormorant text-xl md:text-2xl text-gray-700 leading-[1.7] mb-10">
              Hamdam Jewelry
              <br />
              Sarai ALamgir, Pakistan
              <br />
              Sat - Thu: 10:00 AM - 7:00 PM
            </p>

            <div className="space-y-6 font-cormorant text-xl text-gray-700">
              <p>
                <span className="text-primary">Email:</span> contact@hamdam.com
              </p>
              <p>
                <span className="text-primary">Phone:</span> +92 300 1234567
              </p>
            </div>
          </div>

          {/* FORM */}
          <div className="bg-white/60 backdrop-blur-xl p-10 md:p-14">
            <h3 className="font-luxury text-3xl mb-8">Send Message</h3>

            <form className="space-y-6">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full bg-transparent border-b border-gray-400 py-3 outline-none font-cormorant text-lg"
              />

              <input
                type="email"
                placeholder="Your Email"
                className="w-full bg-transparent border-b border-gray-400 py-3 outline-none font-cormorant text-lg"
              />

              <textarea
                placeholder="Your Message"
                rows="5"
                className="w-full bg-transparent border-b border-gray-400 py-3 outline-none font-cormorant text-lg"
              ></textarea>

              <button
                type="submit"
                className="mt-6 uppercase tracking-[0.3em] text-sm border-b border-black hover:text-primary transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ===== MAP SECTION ===== */}
      <div className="relative w-full h-[400px] md:h-[600px]">
        <div className="absolute inset-0  flex items-center justify-center">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d537.7970819758706!2d73.76338139872459!3d32.906658084825324!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1773402566378!5m2!1sen!2s"
            allowFullScreen
            loading="lazy"
            className="w-full  h-full"
          />
        </div>
      </div>
    </section>
  );
}
