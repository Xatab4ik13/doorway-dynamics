import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ChevronDown, X } from "lucide-react";
import logo from "@/assets/logo.png";
import menuBg from "@/assets/menu-bg.jpg";

const serviceLinks = [
  { label: "Установка межкомнатных дверей", path: "/services/interior" },
  { label: "Установка входных дверей", path: "/services/entrance" },
  { label: "Врезка замков", path: "/services/locks" },
  { label: "Регулировка", path: "/services/adjustment" },
  { label: "Демонтаж", path: "/services/demolition" },
];

const cities = ["Москва", "Санкт-Петербург"];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Москва");
  const [servicesOpen, setServicesOpen] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reset servicesOpen to true whenever menu opens
  useEffect(() => {
    if (menuOpen) {
      setServicesOpen(true);
    }
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(0, 0, 0, 0.65)" : "hsl(0 0% 0%)",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        }}
      >
        <div className="flex items-center px-4 md:px-10 h-20 relative">
          <Link to="/" className="relative z-[110]">
            <img
              src={logo}
              alt=""
              className="h-32 md:h-40 w-auto invert brightness-0 invert select-none pointer-events-none -ml-2"
            />
          </Link>

          <div className="absolute right-4 md:right-10 z-[110] flex items-center gap-3 md:gap-4">
            {/* City selector */}
            <div className="relative">
              <button
                onClick={() => setCityOpen(!cityOpen)}
                className="flex items-center gap-1.5 text-foreground/50 hover:text-foreground transition-colors duration-300"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-xs uppercase tracking-[0.15em] font-medium">
                  {selectedCity}
                </span>
                <motion.div
                  animate={{ rotate: cityOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-3 h-3" />
                </motion.div>
              </button>

              <AnimatePresence>
                {cityOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-full right-0 mt-3 bg-card border border-border rounded-lg overflow-hidden min-w-[180px] z-50 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                  >
                    {cities.map((city, i) => (
                      <motion.button
                        key={city}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => {
                          setSelectedCity(city);
                          setCityOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs uppercase tracking-[0.15em] transition-colors duration-300 ${
                          selectedCity === city
                            ? "text-foreground bg-secondary"
                            : "text-foreground/50 hover:text-foreground hover:bg-secondary/50"
                        }`}
                      >
                        {city}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Burger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex flex-col items-center justify-center w-10 h-10 gap-[6px]"
              aria-label="Меню"
            >
              <motion.span
                animate={menuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
                className="block w-7 h-[1.5px] bg-foreground origin-center"
              />
              <motion.span
                animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.2 }}
                className="block w-7 h-[1.5px] bg-foreground"
              />
              <motion.span
                animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
                className="block w-7 h-[1.5px] bg-foreground origin-center"
              />
            </button>
          </div>
        </div>
      </header>

      {cityOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setCityOpen(false)} />
      )}

      {/* Slide-out menu panel */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="fixed inset-0 z-[90] bg-black/70"
              onClick={closeMenu}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-4 right-4 bottom-4 z-[100] w-[90vw] max-w-[520px] rounded-3xl overflow-hidden"
            >
              <div className="absolute inset-0">
                <img src={menuBg} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/70" />
              </div>

              <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-14 overflow-y-auto">
                {/* Close button */}
                <button
                  onClick={closeMenu}
                  className="absolute top-6 right-6 z-20 w-12 h-12 flex items-center justify-center text-white/70 hover:text-white transition-colors duration-300"
                  aria-label="Закрыть меню"
                >
                  <X className="w-8 h-8" strokeWidth={1.5} />
                </button>

                <nav className="flex flex-col gap-1 mt-16">
                  {/* Главная */}
                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <Link
                      to="/"
                      onClick={closeMenu}
                      className="block py-3 font-bold text-white text-2xl md:text-3xl transition-colors duration-300 hover:text-white/50"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Главная
                    </Link>
                  </motion.div>

                  {/* Услуги с раскрытием */}
                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <button
                      onClick={() => setServicesOpen(!servicesOpen)}
                      className="flex items-center gap-3 py-3 font-bold text-white text-2xl md:text-3xl transition-colors duration-300 hover:text-white/50 w-full text-left"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Услуги
                      <motion.div
                        animate={{ rotate: servicesOpen ? 180 : 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <ChevronDown className="w-6 h-6" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {servicesOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="pl-4 border-l border-white/15 ml-2 flex flex-col gap-0.5 pb-2">
                            {serviceLinks.map((service, i) => (
                              <motion.div
                                key={service.path}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.06 }}
                              >
                                <Link
                                  to={service.path}
                                  onClick={closeMenu}
                                  className="block py-2 text-white/60 text-base md:text-lg transition-colors duration-300 hover:text-white"
                                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                >
                                  {service.label}
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Контакты */}
                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <Link
                      to="/contacts"
                      onClick={closeMenu}
                      className="block py-3 font-bold text-white text-2xl md:text-3xl transition-colors duration-300 hover:text-white/50"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Контакты
                    </Link>
                  </motion.div>

                  {/* Заявка на замер */}
                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <Link
                      to="/request"
                      onClick={closeMenu}
                      className="block py-3 font-bold text-white text-2xl md:text-3xl transition-colors duration-300 hover:text-white/50"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Заявка на замер
                    </Link>
                  </motion.div>
                </nav>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="flex flex-col gap-4"
                >
                  <a href="tel:+74951234567" className="text-white/60 text-sm tracking-wider hover:text-white transition-colors">
                    +7 (495) 123-45-67
                  </a>
                  <a href="mailto:info@primedoor.ru" className="text-white/60 text-sm tracking-wider hover:text-white transition-colors">
                    info@primedoor.ru
                  </a>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="mt-4 inline-flex items-center gap-2 text-white/60 text-xs uppercase tracking-[0.2em] hover:text-white transition-colors"
                  >
                    Войти в кабинет →
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
