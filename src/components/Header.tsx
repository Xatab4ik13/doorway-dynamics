import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

const menuLinks = [
  { label: "Межкомнатные двери", path: "/services/interior" },
  { label: "Входные двери", path: "/services/entrance" },
  { label: "Портфолио", path: "/portfolio" },
  { label: "Услуги", path: "/services" },
  { label: "Контакты", path: "/contacts" },
  { label: "Написать нам", path: "/request" },
];

const topNavLinks = [
  { label: "Межкомнатные двери", path: "/services" },
  { label: "Входные двери", path: "/services" },
  { label: "Портфолио", path: "/portfolio" },
  { label: "Услуги", path: "/services" },
  { label: "Написать нам", path: "/request" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
        <div className="flex items-center justify-between px-6 md:px-10 h-20">
          {/* Logo */}
          <Link to="/" className="relative z-[110]">
            <img
              src={logo}
              alt="PrimeDoor Service"
              className="h-8 md:h-10 w-auto invert"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {topNavLinks.map((item) => (
              <Link key={item.label} to={item.path} className="nav-link">
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Burger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative z-[110] flex flex-col items-center justify-center w-10 h-10 gap-[6px]"
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

      {/* Full-screen overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="overlay-menu"
          >
            <motion.nav
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex flex-col items-center gap-2 md:gap-4"
            >
              {menuLinks.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className="overlay-menu-link block"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 flex flex-col items-center gap-3"
              >
                <a href="tel:+74951234567" className="nav-link text-sm">
                  +7 (495) 123-45-67
                </a>
                <a href="mailto:info@primedoor.ru" className="nav-link text-sm">
                  info@primedoor.ru
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6"
              >
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="nav-link text-sm"
                >
                  Войти в кабинет
                </Link>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
