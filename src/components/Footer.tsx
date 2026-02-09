import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <img src={logo} alt="PrimeDoor Service" className="h-8 w-auto mb-6" />
            <p className="text-muted-foreground text-sm leading-relaxed">
              Профессиональная установка межкомнатных и входных дверей в Москве и Санкт-Петербурге
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">Услуги</h4>
            <ul className="space-y-3">
              {["Межкомнатные двери", "Входные двери", "Врезка замков", "Регулировка", "Демонтаж"].map((s) => (
                <li key={s}>
                  <Link to="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">Компания</h4>
            <ul className="space-y-3">
              {[
                { label: "Портфолио", path: "/portfolio" },
                { label: "Отзывы", path: "/reviews" },
                { label: "Контакты", path: "/contacts" },
              ].map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">Контакты</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Москва</p>
              <p>Санкт-Петербург</p>
              <a href="tel:+74951234567" className="block hover:text-foreground transition-colors">
                +7 (495) 123-45-67
              </a>
              <a href="mailto:info@primedoor.ru" className="block hover:text-foreground transition-colors">
                info@primedoor.ru
              </a>
            </div>
          </div>
        </div>

        <div className="line-gold mt-12 mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2025 PrimeDoor Service. Все права защищены.</p>
          <p>Москва · Санкт-Петербург</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
