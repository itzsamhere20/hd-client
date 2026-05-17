import { useState } from "react";

export default function FAQPage() {
  const [open, setOpen] = useState(null);
  const [search, setSearch] = useState("");

  const faqSections = [
    {
      id: "delivery",
      title: "Delivery",
      items: [
        {
          q: "How long does delivery take?",
          a: "Standard delivery takes 3–7 working days within Pakistan. International delivery may take 7–14 days.",
        },
        {
          q: "Do you offer cash on delivery?",
          a: "Yes, we offer cash on delivery across selected regions in Pakistan.",
        },
        {
          q: "Is shipping free?",
          a: "We offer free shipping on orders above a certain value. Below that, standard shipping charges apply.",
        },
        {
          q: "Can I change my delivery address after placing order?",
          a: "You can request an address change within 12 hours of placing the order before it is dispatched.",
        },
        {
          q: "Do you ship internationally?",
          a: "Yes, we ship worldwide with secure packaging and insured delivery partners.",
        },
        {
          q: "How is my jewelry packaged?",
          a: "All orders are packed in luxury branded boxes with protective layers to ensure safety.",
        },
      ],
    },
    {
      id: "orders",
      title: "Orders",
      items: [
        {
          q: "Can I place a custom order?",
          a: "Yes, we accept custom orders. Contact us for personalized designs.",
        },
        {
          q: "How can I track my order?",
          a: "Once shipped, you will receive a tracking ID via email or SMS.",
        },
        {
          q: "Can I modify my order after placing it?",
          a: "Order modifications are allowed only within 24 hours of placing the order.",
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept cash on delivery, bank transfer, and online card payments.",
        },
        {
          q: "How do I know my order is confirmed?",
          a: "You will receive a confirmation email or SMS immediately after placing your order.",
        },
        {
          q: "Can I place bulk orders?",
          a: "Yes, we support bulk and corporate orders with custom pricing.",
        },
      ],
    },
    {
      id: "returns",
      title: "Returns & Cancellation",
      items: [
        {
          q: "What is your return policy?",
          a: "We offer a 7-day return policy. Items must be unused and in original packaging.",
        },
        {
          q: "Can I cancel my order?",
          a: "Orders can be cancelled within 24 hours of placement before processing begins.",
        },
        {
          q: "Who pays return shipping cost?",
          a: "Return shipping is paid by the customer unless the item is defective or incorrect.",
        },
        {
          q: "How long does refund take?",
          a: "Refunds are processed within 5–10 working days after receiving returned items.",
        },
        {
          q: "Can I exchange my jewelry?",
          a: "Yes, exchanges are allowed within 7 days for eligible products.",
        },
        {
          q: "What if my item arrives damaged?",
          a: "Please contact us within 24 hours with images for immediate replacement or refund.",
        },
      ],
    },
  ];

  const toggle = (key) => setOpen(open === key ? null : key);

  const filteredSections = faqSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          item.a.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <section className=" text-gray-900 overflow-hidden">
      {/* HERO (refined spacing) */}
      <div className="relative flex items-center justify-center py-28 md:py-44">
        <h1 className="absolute text-[60px] md:text-[150px] lg:text-[210px] font-luxury text-primary/10 select-none tracking-[0.2em]">
          FAQ
        </h1>

        <div className="relative z-10 text-center px-6 mt-10 md:mt-0">
          <h2 className="font-luxury text-4xl md:text-6xl lg:text-7xl">
            Help & Information
          </h2>

          <p className="mt-6 font-cormorant text-xl md:text-3xl text-gray-700 italic max-w-2xl mx-auto leading-[1.7]">
            Everything you need to know about delivery, orders, returns and
            cancellation.
          </p>
        </div>
      </div>

      {/* SEARCH (refined luxury style) */}
      <div className="flex justify-center mb-24 px-6">
        <input
          type="text"
          placeholder="Search anything about your order..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full max-w-2xl
            bg-transparent
            border-b border-gray-400
            py-4
            outline-none
            text-lg md:text-2xl
            font-cormorant
            tracking-wide
            transition-all duration-500
            focus:border-primary
            focus:tracking-widest
          "
        />
      </div>

      {/* NAV */}
      <div className="flex justify-center gap-5 md:gap-10 md:text-sm uppercase tracking-[0.3em] mb-24  text-xs">
        {faqSections.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="hover:text-primary">
            {s.title}
          </a>
        ))}
      </div>

      {/* SECTIONS */}
      <div className="max-w-5xl mx-auto px-6 pb-28 space-y-28">
        {filteredSections.map((section) => (
          <div key={section.id} id={section.id}>
            <h2 className="font-luxury text-3xl md:text-5xl mb-12 tracking-wide">
              {section.title}
            </h2>

            <div className="space-y-8">
              {section.items.map((item, i) => {
                const key = section.id + i;

                return (
                  <div key={key} className="border-b border-gray-300 pb-5">
                    <button
                      onClick={() => toggle(key)}
                      className="w-full flex justify-between items-center text-left group"
                    >
                      <h3 className="font-luxury text-xl md:text-2xl group-hover:text-primary transition">
                        {item.q}
                      </h3>
                      <span className="text-2xl text-primary">
                        {open === key ? "−" : "+"}
                      </span>
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-500 ${
                        open === key
                          ? "max-h-40 mt-5 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <p className="font-cormorant text-lg md:text-xl text-gray-700 leading-[1.8]">
                        {item.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
