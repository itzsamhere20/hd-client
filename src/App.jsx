import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import Home from "./pages/home";
import Products from "./pages/products";
import ProductDetail from "./pages/productDetail";
import Contact from "./pages/contact";
import About from "./pages/aboutUs";
import FAQ from "./pages/faq";

function App() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#faf7f2]">
      <Router>
        <div className="fixed inset-0 z-0 pointer-events-none hidden md:block">
          <div className="absolute left-[23%] top-0 bottom-0 w-px bg-[#A68A3C]/20"></div>
          <div className="absolute left-[41%] top-0 bottom-0 w-px bg-[#A68A3C]/20"></div>
          <div className="absolute left-[59%] top-0 bottom-0 w-px bg-[#A68A3C]/20"></div>
          <div className="absolute left-[77%] top-0 bottom-0 w-px bg-[#A68A3C]/20"></div>
        </div>
        <Navbar />
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/collections" element={<Products />} />
          <Route path="/collections/:id/:id" element={<ProductDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/" element={<Home />} />
          <Route path="/faq" element={<FAQ />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
