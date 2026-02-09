import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

const navItems = [
  { label: "Главная", path: "/" },
  { label: "Услуги", path: "/services" },
  { label: "Портфолио", path: "/portfolio" },
  { label: "Отзывы", path: "/reviews" },
  { label: "Контакты", path: "/contacts" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-20 px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="PrimeDoor Service" className="h-10 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative text-sm font-medium tracking-wide uppercase transition-colors duration-300 ${
                location.pathname === item.path
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
              {location.pathname === item.path && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <Link
            to="/request"
            className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold tracking-wide uppercase rounded-sm hover:bg-gold-light transition-colors duration-300"
          >
            Заявка на замер
          </Link>
          <Link
            to="/login"
            className="px-6 py-2.5 border border-border text-foreground text-sm font-semibold tracking-wide uppercase rounded-sm hover:border-primary hover:text-primary transition-colors duration-300"
          >
            Войти
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden flex flex-col gap-1.5 p-2"
          aria-label="Меню"
        >
          <motion.span
            animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="block w-6 h-0.5 bg-foreground"
          />
          <motion.span
            animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block w-6 h-0.5 bg-foreground"
          />
          <motion.span
            animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            className="block w-6 h-0.5 bg-foreground"
          />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden bg-background border-b border-border"
          >
            <nav className="flex flex-col p-6 gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`text-lg font-medium tracking-wide ${
                    location.pathname === item.path
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="line-gold my-2" />
              <Link
                to="/request"
                onClick={() => setMobileOpen(false)}
                className="px-6 py-3 bg-primary text-primary-foreground text-center text-sm font-semibold tracking-wide uppercase rounded-sm"
              >
                Заявка на замер
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="px-6 py-3 border border-border text-foreground text-center text-sm font-semibold tracking-wide uppercase rounded-sm"
              >
                Войти
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
