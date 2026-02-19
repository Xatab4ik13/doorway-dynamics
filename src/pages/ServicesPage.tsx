import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, Wrench, Package, Ruler, Thermometer, Lightbulb, Zap, KeyRound, BoxSelect, ShieldCheck, Droplets, SprayCan } from "lucide-react";
import ContactForm, { ContactFormRef } from "@/components/ContactForm";

const cities = [
  { id: "moscow", label: "Москва" },
  { id: "spb", label: "Санкт-Петербург" },
];

const serviceTypes = [
  { id: "interior", label: "Установка межкомнатных дверей" },
  { id: "entrance", label: "Установка входных дверей" },
];

import { priceData, measurementData, formatPrice, type PriceItem } from "@/data/priceData";

const preparationItems = [
  {
    icon: BoxSelect,
    title: "Подготовленное рабочее пространство",
    points: [
      "Помещение освобождено от мебели, коробок, инструментов и строительных материалов.",
      "Если монтаж выполняется в коридоре или лифтовом холле — зона должна быть хорошо освещена и свободна для работы.",
      "Температура должна быть не ниже +15°C.",
    ],
  },
  {
    icon: Package,
    title: "Материалы находятся на объекте заранее",
    points: [
      "Все двери, коробки, доборы, наличники и фурнитура должны быть доставлены минимум за 24 часа до начала монтажа.",
      "Рекомендуется проверить комплектацию заранее, чтобы избежать задержек.",
    ],
  },
  {
    icon: Ruler,
    title: "Проёмы подготовлены по требованиям замера",
    points: [
      "Размеры, геометрия и состояние проёмов должны соответствовать данным, указанным в бланке замера.",
      "Удалены старые коробки, пена, крепёж и остатки отделки (если это предусмотрено договором).",
    ],
  },
  {
    icon: Wrench,
    title: "Объект готов к монтажу",
    subtitle: "Для скрытых коробов (алюминиевых под отделку):",
    points: [
      "Стены оштукатурены по маякам.",
      "Выполнена стяжка пола, известен точный уровень чистового покрытия.",
      "Нет мокрых процессов, которые могут повлиять на геометрию.",
    ],
    subtitle2: "Для стандартных дверей:",
    points2: [
      "Завершены все отделочные работы: стены покрашены или оклеены обоями.",
      "Уложено напольное покрытие.",
      "Плинтуса не доходят до края проёма минимум на 100 мм.",
      "Влажность в помещении в норме.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Нет параллельных работ",
    points: [
      "В зоне монтажа не должны работать другие специалисты (маляры, плиточники, электрики и т. д.).",
      "Доступ к проёмам должен быть свободным на протяжении всего времени установки.",
    ],
  },
  {
    icon: Lightbulb,
    title: "Достаточное освещение",
    points: [
      "Все помещения, где ведётся монтаж, должны быть освещены.",
      "При необходимости обеспечить временное освещение.",
    ],
  },
  {
    icon: Zap,
    title: "Электропитание",
    points: [
      "На объекте должны быть рабочие розетки или удлинители достаточной длины.",
    ],
  },
  {
    icon: Thermometer,
    title: "Температурный режим",
    points: [
      "Температура в помещении должна быть не ниже +15°C — это важно для корректной работы пены и сохранения геометрии дверей.",
    ],
  },
  {
    icon: KeyRound,
    title: "Доступ к объекту",
    points: [
      "Обеспечить свободный доступ монтажной бригаде: пропуска, ключи, коды домофона, парковка.",
    ],
  },
  {
    icon: Droplets,
    title: "Условия для хранения дверей",
    points: [
      "Если двери доставлены заранее, помещение должно быть сухим, без перепадов температуры и влажности.",
    ],
  },
  {
    icon: SprayCan,
    title: "Пылезащита и чистота рабочей зоны",
    points: [
      "Монтаж дверей — это технологический процесс, при котором неизбежно образуется пыль.",
      "Рекомендуется заранее защитить мебель, технику и элементы интерьера плёнкой.",
      "Если на объекте уже выполнена чистовая отделка, необходимо обеспечить минимальные меры пылезащиты.",
      "Монтажная бригада выполняет локальную уборку в зоне работ, но генеральная уборка после монтажа не входит в перечень услуг.",
    ],
  },
];

const ServicesPage = () => {
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get("type");
  const formRef = useRef<ContactFormRef>(null);

  const [selectedCity, setSelectedCity] = useState<string>("moscow");
  const [selectedService, setSelectedService] = useState<string | null>(
    typeFromUrl && ["interior", "entrance", "reclamation"].includes(typeFromUrl) ? typeFromUrl : null
  );

  useEffect(() => {
    if (typeFromUrl && ["interior", "entrance", "reclamation"].includes(typeFromUrl)) {
      setSelectedService(typeFromUrl);
    }
  }, [typeFromUrl]);

  useEffect(() => {
    document.title = "Услуги — PrimeDoor Service";
  }, []);

  const isUnavailable = selectedCity === "spb" && selectedService === "entrance";
  const prices = selectedService ? priceData[selectedService] : [];
  const cityKey = selectedCity as "moscow" | "spb";

  return (
    <main className="pt-24 pb-0">
      <div className="px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
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
            <p className="section-label mb-4">Город</p>
            <div className="flex flex-wrap gap-3">
              {cities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => setSelectedCity(city.id)}
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
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

          {/* Measurement pricing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            <p className="section-label mb-6">Стоимость замера</p>
            {(() => {
              const measurement = measurementData[cityKey];
              const renderBlock = (block: typeof measurement.main) => (
                <div className="mb-6">
                  <h3
                    className="text-lg md:text-xl font-bold mb-4 tracking-tight"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {block.title}
                  </h3>
                  <div className="border border-border">
                    {block.items.map((item, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[1fr_auto] border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors duration-300"
                      >
                        <div className="px-3 md:px-4 py-3 text-sm text-foreground/80">
                          {item.label || ""}
                        </div>
                        <div className="px-3 md:px-4 py-3 text-sm font-medium text-foreground text-right">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    {renderBlock(measurement.main)}
                  </div>
                  <div>
                    {renderBlock(measurement.extra)}
                  </div>
                </div>
              );
            })()}
          </motion.div>

          {/* Price list */}
          <AnimatePresence>
            {selectedService && !isUnavailable && prices.length > 0 && (
              <motion.div
                key={selectedService + selectedCity}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="mb-16"
              >
                {(() => {
                  const isLargeList = selectedService !== "reclamation" && prices.length > 10;
                  const midpoint = Math.ceil(prices.length / 2);
                  const leftCol = isLargeList ? prices.slice(0, midpoint) : prices;
                  const rightCol = isLargeList ? prices.slice(midpoint) : [];

                  const renderTable = (items: typeof prices, startIndex: number) => (
                    <div className="border border-border">
                      <div className="grid grid-cols-[1fr_50px_minmax(120px,auto)] bg-secondary/50 border-b border-border">
                        <div className="px-3 md:px-4 py-3 text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground">
                          Наименование
                        </div>
                        <div className="px-2 py-3 text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground text-center">
                          Ед.
                        </div>
                        <div className="px-3 md:px-4 py-3 text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground text-right">
                          Цена
                        </div>
                      </div>
                      {items.map((item, i) => (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: (startIndex + i) * 0.02 }}
                          className="grid grid-cols-[1fr_50px_minmax(120px,auto)] border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors duration-300"
                        >
                          <div className="px-3 md:px-4 py-3 text-sm text-foreground/80">
                            {item.name}
                          </div>
                          <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                            {item.unit}
                          </div>
                          <div className="px-3 md:px-4 py-3 text-sm font-medium text-foreground text-right">
                            {formatPrice(item[cityKey])}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  );

                  return (
                    <>
                      {isLargeList ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {renderTable(leftCol, 0)}
                          {renderTable(rightCol, midpoint)}
                        </div>
                      ) : (
                        renderTable(leftCol, 0)
                      )}
                    </>
                  );
                })()}

                <p className="mt-4 text-xs text-muted-foreground">
                  * Указаны ориентировочные цены. Точная стоимость определяется после осмотра объекта.
                </p>

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => formRef.current?.scrollToForm()}
                    className="group flex items-center gap-3 px-8 py-4 border border-foreground/20 hover:border-foreground text-foreground/70 hover:text-foreground transition-all duration-500 text-sm uppercase tracking-[0.15em] font-medium"
                  >
                    Оставить заявку
                    <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform duration-300" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unavailable service message */}
          <AnimatePresence>
            {isUnavailable && (
              <motion.div
                key="unavailable"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-16 border border-border p-10 md:p-16 text-center"
              >
                <p className="text-lg md:text-xl font-heading font-semibold text-foreground mb-4">
                  Услуга временно недоступна в Санкт-Петербурге
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  В настоящее время установка входных дверей выполняется только в Москве. Мы работаем над расширением команды — следите за обновлениями.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Preparation checklist */}
          <AnimatePresence>
            {selectedService && selectedService !== "reclamation" && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mb-24"
              >
                <div className="border-t border-border pt-16">
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    <p className="section-label mb-6">Подготовка к монтажу</p>
                    <h2 className="heading-lg mb-6">
                      Требования к объекту
                    </h2>
                    <p className="text-base md:text-lg text-muted-foreground max-w-3xl mb-16 leading-relaxed">
                      Чтобы установка дверей прошла в назначенный день без задержек и дополнительных расходов, объект должен быть полностью подготовлен. Пожалуйста, убедитесь в следующем:
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    {preparationItems.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.title}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                          className="group"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 border border-border flex items-center justify-center group-hover:border-foreground/50 transition-colors duration-500">
                              <Icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors duration-500" strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-foreground mb-3 uppercase tracking-[0.05em]">
                                {item.title}
                              </h3>

                              {item.subtitle && (
                                <p className="text-sm font-medium text-foreground/70 mb-2 uppercase tracking-[0.05em]">
                                  {item.subtitle}
                                </p>
                              )}

                              <ul className="space-y-2.5">
                                {item.points.map((point, j) => (
                                  <li key={j} className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                                    <span className="text-sm text-muted-foreground leading-relaxed">{point}</span>
                                  </li>
                                ))}
                              </ul>

                              {item.subtitle2 && (
                                <>
                                  <p className="text-sm font-medium text-foreground/70 mb-2 mt-4 uppercase tracking-[0.05em]">
                                    {item.subtitle2}
                                  </p>
                                  <ul className="space-y-2.5">
                                    {item.points2?.map((point, j) => (
                                      <li key={j} className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                                        <span className="text-sm text-muted-foreground leading-relaxed">{point}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Contact form */}
      <ContactForm ref={formRef} />
    </main>
  );
};

export default ServicesPage;
