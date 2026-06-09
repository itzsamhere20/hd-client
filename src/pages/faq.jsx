import { useEffect, useState } from "react";
import api from "../components/api";

export default function FAQPage() {
  const [open, setOpen] = useState(null);
  const [search, setSearch] = useState("");
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ── FETCH FROM BACKEND ── */
  useEffect(() => {
    const FAQ_CACHE = "FAQ_CACHE";

    const getCached = () => {
      try {
        const cached = localStorage.getItem(FAQ_CACHE);
        if (!cached) return null;

        const parsed = JSON.parse(cached);
        return parsed?.data || null;
      } catch {
        return null;
      }
    };

    const fetchFromAPI = async () => {
      try {
        const res = await api.get("/settings/store/faq");

        const data = res.data || [];

        setSections(data);

        localStorage.setItem(
          FAQ_CACHE,
          JSON.stringify({
            data,
            time: Date.now(),
          }),
        );
      } catch (err) {
        console.log("FAQ API failed, using cache");
      } finally {
        setLoading(false);
      }
    };

    // 1️⃣ instant load from cache
    const cached = getCached();

    if (cached) {
      setSections(cached);
      setLoading(false);
    } else {
      setSections([]);
      setLoading(false);
    }

    // 2️⃣ background refresh
    fetchFromAPI();
  }, []);

  const toggle = (key) => setOpen(open === key ? null : key);

  const filteredSections = sections
    .map((section) => ({
      ...section,
      items: (section.items || []).filter(
        (item) =>
          item.question?.toLowerCase().includes(search.toLowerCase()) ||
          item.answer?.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <section className="text-gray-900 overflow-hidden">
      {/* HERO */}
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

      {/* SEARCH */}
      <div className="flex justify-center mb-24 px-6">
        <input
          type="text"
          placeholder="Search anything about your order..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-2xl bg-transparent border-b border-gray-400 py-4 outline-none text-lg md:text-2xl font-cormorant tracking-wide transition-all duration-500 focus:border-primary focus:tracking-widest"
        />
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center pb-20">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      )}

      {/* NAV */}
      {!loading && sections.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-20 px-4">
          {sections.map((s) => (
            <a
              key={s._id}
              href={`#${s.id || s._id}`}
              className="
        px-4 py-2
        text-[10px] md:text-xs
        uppercase
        tracking-[0.2em]
       hover:text-primary
       
      "
            >
              {s.title}
            </a>
          ))}
        </div>
      )}

      {/* SECTIONS */}
      {!loading && (
        <div className="max-w-5xl mx-auto px-6 pb-28 space-y-20 md:space-y-28">
          {filteredSections.length === 0 && search && (
            <p className="text-center font-cormorant text-2xl text-gray-400">
              No results for "{search}"
            </p>
          )}
          {filteredSections.map((section) => (
            <div key={section._id} id={section.id || section._id}>
              <h2 className="font-luxury text-2xl md:text-5xl mb-10 md:mb-12 tracking-wide">
                {section.title}
              </h2>
              <div className="space-y-4 md:space-y-8">
                {section.items.map((item, i) => {
                  const key = `${section._id}-${i}`;
                  return (
                    <div
                      key={item._id || key}
                      className="border-b border-gray-300 pb-5"
                    >
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex justify-between items-center text-left group"
                      >
                        <h3 className="font-luxury text-base md:text-2xl group-hover:text-primary transition">
                          {item.question}
                        </h3>
                        <span className="text-2xl text-primary">
                          {open === key ? "−" : "+"}
                        </span>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-500 ${
                          open === key
                            ? "max-h-96 mt-5 opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <p className="font-cormorant text-sm md:text-xl text-gray-700 leading-[1.8]">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
