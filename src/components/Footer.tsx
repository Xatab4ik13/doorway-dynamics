import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border">
      <div className="px-6 md:px-10 py-12 md:py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo & info */}
          <div className="md:col-span-1">
            <img src={logo} alt="PrimeDoor Service" className="h-8 w-auto invert mb-6" />
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
              {["Межкомнатные двери", "Входные двери", "Врезка замков", "Регулировка", "Демонтаж"].map((s) => (
                <li key={s}>
                  <Link to="/services" className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-300">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <p className="section-label mb-6">Контакты</p>
            <div className="space-y-3 text-xs text-muted-foreground">
              <a href="tel:+74951234567" className="block hover:text-foreground transition-colors">
                +7 (495) 123-45-67
              </a>
              <a href="mailto:info@primedoor.ru" className="block hover:text-foreground transition-colors">
                info@primedoor.ru
              </a>
              <p>Москва</p>
              <p>Санкт-Петербург</p>
            </div>
          </div>
        </div>

        <div className="divider mt-12 mb-8" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2025 PrimeDoor Service</p>
          <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Войти в кабинет
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
