import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ContactForm from "@/components/ContactForm";

const cities = [
  { id: "moscow", label: "Москва" },
  { id: "spb", label: "Санкт-Петербург" },
];

const serviceTypes = [
  { id: "interior", label: "Установка межкомнатных дверей" },
  { id: "entrance", label: "Установка входных дверей" },
  { id: "reclamation", label: "Рекламация" },
];

type PriceItem = {
  name: string;
  unit: string;
  moscow: number;
  spb: number;
};

const priceData: Record<string, PriceItem[]> = {
  interior: [
    { name: "Установка межкомнатной двери (распашная)", unit: "шт", moscow: 4500, spb: 4000 },
    { name: "Установка раздвижной двери", unit: "шт", moscow: 6000, spb: 5500 },
    { name: "Установка двери скрытого монтажа", unit: "шт", moscow: 8000, spb: 7500 },
    { name: "Установка двери-книжки", unit: "шт", moscow: 5500, spb: 5000 },
    { name: "Установка дверной коробки", unit: "шт", moscow: 2000, spb: 1800 },
    { name: "Установка наличников (комплект)", unit: "комп", moscow: 1500, spb: 1300 },
    { name: "Установка доборов", unit: "м.п.", moscow: 800, spb: 700 },
    { name: "Врезка петель", unit: "шт", moscow: 500, spb: 450 },
    { name: "Врезка замка/защёлки", unit: "шт", moscow: 1000, spb: 900 },
    { name: "Подрезка полотна по высоте", unit: "шт", moscow: 1500, spb: 1300 },
    { name: "Демонтаж старой двери", unit: "шт", moscow: 1000, spb: 800 },
    { name: "Расширение дверного проёма", unit: "шт", moscow: 3000, spb: 2500 },
    { name: "Сужение дверного проёма", unit: "шт", moscow: 3500, spb: 3000 },
  ],
  entrance: [
    { name: "Установка входной стальной двери", unit: "шт", moscow: 6000, spb: 5500 },
    { name: "Установка входной деревянной двери", unit: "шт", moscow: 5500, spb: 5000 },
    { name: "Установка двери с электронным замком", unit: "шт", moscow: 8000, spb: 7500 },
    { name: "Отделка откосов (штукатурка)", unit: "комп", moscow: 4000, spb: 3500 },
    { name: "Отделка откосов (панели МДФ)", unit: "комп", moscow: 5000, spb: 4500 },
    { name: "Отделка откосов (ламинат)", unit: "комп", moscow: 4500, spb: 4000 },
    { name: "Установка порога", unit: "шт", moscow: 1500, spb: 1300 },
    { name: "Установка уплотнителя", unit: "комп", moscow: 800, spb: 700 },
    { name: "Утепление дверного проёма", unit: "шт", moscow: 2000, spb: 1800 },
    { name: "Демонтаж старой входной двери", unit: "шт", moscow: 1500, spb: 1200 },
    { name: "Врезка дополнительного замка", unit: "шт", moscow: 2000, spb: 1800 },
    { name: "Установка глазка/цепочки", unit: "шт", moscow: 500, spb: 450 },
  ],
  reclamation: [
    { name: "Выезд мастера на диагностику", unit: "выезд", moscow: 0, spb: 0 },
    { name: "Регулировка петель", unit: "шт", moscow: 1500, spb: 1300 },
    { name: "Регулировка замка", unit: "шт", moscow: 1500, spb: 1300 },
    { name: "Устранение скрипа двери", unit: "шт", moscow: 1000, spb: 800 },
    { name: "Замена уплотнителя", unit: "комп", moscow: 1200, spb: 1000 },
    { name: "Подтяжка крепления коробки", unit: "шт", moscow: 2000, spb: 1800 },
    { name: "Замена фурнитуры (ручка)", unit: "шт", moscow: 800, spb: 700 },
    { name: "Перенавеска полотна", unit: "шт", moscow: 2500, spb: 2200 },
    { name: "Устранение провисания двери", unit: "шт", moscow: 2000, spb: 1800 },
  ],
};

const formatPrice = (price: number) => {
  if (price === 0) return "Бесплатно";
  return price.toLocaleString("ru-RU") + " ₽";
};

const ServicesPage = () => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Услуги — PrimeDoor Service";
  }, []);

  const prices = selectedService ? priceData[selectedService] : [];
  const cityKey = selectedCity as "moscow" | "spb";

  return (
    <main className="pt-24 pb-0">
      <div className="px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16 md:mb-20"
          >
            <p className="section-label mb-6">Услуги и цены</p>
            <h1 className="heading-xl">Прайс-лист</h1>
          </motion.div>

          {/* City filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <p className="section-label mb-4">Выберите город</p>
            <div className="flex flex-wrap gap-3">
              {cities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => {
                    setSelectedCity(city.id);
                    setSelectedService(null);
                  }}
                  className={`px-6 py-3 text-sm font-medium uppercase tracking-[0.15em] transition-all duration-500 border ${
                    selectedCity === city.id
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-foreground/60 border-border hover:text-foreground hover:border-foreground/50"
                  }`}
                >
                  {city.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Service filter */}
          <AnimatePresence>
            {selectedCity && (
              <motion.div
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-12 overflow-hidden"
              >
                <p className="section-label mb-4">Выберите услугу</p>
                <div className="flex flex-wrap gap-3">
                  {serviceTypes.map((svc) => (
                    <button
                      key={svc.id}
                      onClick={() => setSelectedService(svc.id)}
                      className={`px-6 py-3 text-sm font-medium uppercase tracking-[0.1em] transition-all duration-500 border ${
                        selectedService === svc.id
                          ? "bg-foreground text-background border-foreground"
                          : "bg-transparent text-foreground/60 border-border hover:text-foreground hover:border-foreground/50"
                      }`}
                    >
                      {svc.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Price list */}
          <AnimatePresence>
            {selectedCity && selectedService && prices.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="mb-24"
              >
                <div className="border border-border">
                  {/* Table header */}
                  <div className="grid grid-cols-[1fr_80px_120px] md:grid-cols-[1fr_100px_140px] bg-secondary/50 border-b border-border">
                    <div className="px-4 md:px-6 py-4 text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground">
                      Наименование
                    </div>
                    <div className="px-4 py-4 text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground text-center">
                      Ед.
                    </div>
                    <div className="px-4 md:px-6 py-4 text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground text-right">
                      Цена
                    </div>
                  </div>

                  {/* Rows */}
                  {prices.map((item, i) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.03 }}
                      className={`grid grid-cols-[1fr_80px_120px] md:grid-cols-[1fr_100px_140px] border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors duration-300`}
                    >
                      <div className="px-4 md:px-6 py-4 text-sm text-foreground/80">
                        {item.name}
                      </div>
                      <div className="px-4 py-4 text-sm text-muted-foreground text-center">
                        {item.unit}
                      </div>
                      <div className="px-4 md:px-6 py-4 text-sm font-medium text-foreground text-right">
                        {formatPrice(item[cityKey])}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  * Указаны ориентировочные цены. Точная стоимость определяется после осмотра объекта.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Contact form */}
      <ContactForm />
    </main>
  );
};

export default ServicesPage;
