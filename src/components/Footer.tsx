import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border">
      <div className="px-6 md:px-10 py-12 md:py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo & info */}
          <div className="md:col-span-1">
            <img src={logo} alt="PrimeDoor Service" className="h-20 w-auto brightness-0 invert mb-6" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Профессиональная установка дверей в Москве и Санкт-Петербурге
            </p>
          </div>

          {/* Nav */}
          <div>
            <p className="section-label mb-6">Навигация</p>
            <ul className="space-y-3">
              {[
                { label: "Портфолио", path: "/portfolio" },
                { label: "Услуги", path: "/services" },
                { label: "Контакты", path: "/contacts" },
                { label: "Отзывы", path: "/reviews" },
              ].map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-300">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <p className="section-label mb-6">Услуги</p>
            <ul className="space-y-3">
              {[
                { label: "Межкомнатные двери", path: "/services?type=interior" },
                { label: "Входные двери", path: "/services?type=entrance" },
                { label: "Рекламация", path: "/services?type=reclamation" },
              ].map((s) => (
              <li key={s.label}>
                  <Link to={s.path} className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-300">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <p className="section-label mb-6">Контакты</p>
            <div className="space-y-3 text-xs text-muted-foreground">
              <p className="text-foreground/50 uppercase tracking-[0.1em] text-[10px] mb-1">Москва</p>
              <a href="tel:+79261663062" className="block hover:text-foreground transition-colors">
                +7 926 166 30 62
              </a>
              <a href="tel:+79255700609" className="block hover:text-foreground transition-colors">
                +7 925 570 06 09
              </a>
              <p className="text-foreground/50 uppercase tracking-[0.1em] text-[10px] mt-4 mb-1">Санкт-Петербург</p>
              <a href="tel:+79932663504" className="block hover:text-foreground transition-colors">
                +7 993 266 35 04
              </a>
            </div>
          </div>
        </div>

        <div className="divider mt-12 mb-8" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2025 PrimeDoor Service</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Политика конфиденциальности
            </Link>
            <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Войти в кабинет
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
