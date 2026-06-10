import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import PageTransition from "./components/pageTransition";
import ScrollToTop from "./components/scrollToTop";
// pages...
import Home from "./pages/home";
import Products from "./pages/products";
import ProductDetail from "./pages/productDetail";
import Auth from "./pages/auth";
import Checkout from "./pages/checkout";
import Contact from "./pages/contact";
import About from "./pages/aboutUs";
import FAQ from "./pages/faq";
import MyOrders from "./pages/orders";
import ProductCategory from "./pages/productCategory";
import NotFound from "./pages/notFound";

function App() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="fixed inset-0 z-0 pointer-events-none hidden md:block ">
        <div className="absolute left-[23%] top-0 bottom-0 w-px bg-[#A68A3C]/20"></div>
        <div className="absolute left-[41%] top-0 bottom-0 w-px bg-[#A68A3C]/20"></div>
        <div className="absolute left-[59%] top-0 bottom-0 w-px bg-[#A68A3C]/20"></div>
        <div className="absolute left-[77%] top-0 bottom-0 w-px bg-[#A68A3C]/20"></div>
      </div>
      <Navbar />
      <ScrollToTop />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />
          <Route
            path="/collections"
            element={
              <PageTransition>
                <Products />
              </PageTransition>
            }
          />
          <Route
            path="/collections/:category"
            element={
              <PageTransition>
                <ProductCategory />
              </PageTransition>
            }
          />
          <Route
            path="/collections/:category/:productSlug"
            element={
              <PageTransition>
                <ProductDetail />
              </PageTransition>
            }
          />
          <Route
            path="/checkout"
            element={
              <PageTransition>
                <Checkout />
              </PageTransition>
            }
          />
          <Route
            path="/contact"
            element={
              <PageTransition>
                <Contact />
              </PageTransition>
            }
          />
          <Route
            path="/about"
            element={
              <PageTransition>
                <About />
              </PageTransition>
            }
          />
          <Route
            path="/faq"
            element={
              <PageTransition>
                <FAQ />
              </PageTransition>
            }
          />
          <Route
            path="/auth"
            element={
              <PageTransition>
                <Auth />
              </PageTransition>
            }
          />
          <Route
            path="/orders"
            element={
              <PageTransition>
                <MyOrders />
              </PageTransition>
            }
          />
          <Route
            path="*"
            element={
              <PageTransition>
                <NotFound />
              </PageTransition>
            }
          />
        </Routes>
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default App;
