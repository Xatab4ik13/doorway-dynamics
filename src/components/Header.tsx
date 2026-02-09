import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";
import menuBg from "@/assets/menu-bg.jpg";

const menuLinks = [
  { label: "Межкомнатные двери", path: "/services/interior" },
  { label: "Входные двери", path: "/services/entrance" },
  { label: "Портфолио", path: "/portfolio" },
  { label: "Услуги", path: "/services" },
  { label: "Контакты", path: "/contacts" },
  { label: "Написать нам", path: "/request" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Black solid header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background">
        <div className="flex items-center justify-center px-6 md:px-10 h-20 relative">
          {/* Logo centered & larger */}
          <Link to="/" className="relative z-[110]">
            <img
              src={logo}
              alt=""
              className="h-24 md:h-40 w-auto invert select-none pointer-events-none"
            />
          </Link>

          {/* Burger — absolute right */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="absolute right-6 md:right-10 z-[110] flex flex-col items-center justify-center w-10 h-10 gap-[6px]"
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
      </header>

      {/* Slide-out rounded menu panel from right */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 z-[90] bg-black/70"
              onClick={() => setMenuOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-4 right-4 bottom-4 z-[100] w-[90vw] max-w-[520px] rounded-3xl overflow-hidden"
            >
              {/* Background image */}
              <div className="absolute inset-0">
                <img
                  src={menuBg}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/70" />
              </div>

              {/* Menu content */}
              <div className="relative z-10 h-full flex flex-col justify-between p-10 md:p-14">
                {/* Navigation links */}
                <nav className="flex flex-col gap-1 mt-16">
                  {menuLinks.map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.4, delay: 0.15 + i * 0.06 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setMenuOpen(false)}
                        className="block py-3 font-bold text-white text-2xl md:text-3xl transition-colors duration-300 hover:text-white/50"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* Bottom info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
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
                    onClick={() => setMenuOpen(false)}
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
