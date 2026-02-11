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
  { id: "reclamation", label: "Рекламация" },
];

type PriceItem = {
  name: string;
  unit: string;
  moscow: string;
  spb: string;
};

const priceData: Record<string, PriceItem[]> = {
  interior: [
    { name: "Стандартный монтаж двери INVISIBLE (выезд на одну дверь)", unit: "шт", moscow: "7 500", spb: "7 000" },
    { name: "Стандартный монтаж 1-й двери (шпон, плёнка, массив, эмаль, глянец)", unit: "шт", moscow: "6 500", spb: "6 000" },
    { name: "Стандартный монтаж от 2-х дверей (шпон, плёнка, массив, эмаль, глянец, компланар AVERS)", unit: "шт", moscow: "4 500", spb: "4 000" },
    { name: "Стандартный монтаж дверей ProfilDoors с коробом Моноблок / Integral / SLIM / ROTO / MAGIC / DIVA AIR / INFINITY", unit: "шт", moscow: "6 500", spb: "6 000" },
    { name: "Стандартный монтаж двери компланар REVERS", unit: "шт", moscow: "6 500", spb: "6 000" },
    { name: "Установка двери Книжка / Компакт", unit: "шт", moscow: "6 500", spb: "6 000" },
    { name: "Установка двери INVISIBLE AVERS / REVERSE", unit: "шт", moscow: "6 000", spb: "5 500" },
    { name: "Установка декоративных реек / стеновых панелей (1 м²)", unit: "м²", moscow: "2 000 / 2 750", spb: "1 800 / 2 500" },
    { name: "Установка КАССЕТОНА без обрамления (под одно / два полотна)", unit: "шт", moscow: "8 500 / 10 000", spb: "8 000 / 9 500" },
    { name: "Установка ПЕРЕГОРОДОК 2-х / 3-х / 4-х створчатой до 2100 мм", unit: "шт", moscow: "15 000 / 22 500 / 32 500", spb: "14 000 / 21 000 / 30 000" },
    { name: "Установка межкомнатной складной гармошки", unit: "м²", moscow: "5 500", spb: "5 000" },
    { name: "Выезд бригады на установку трека под дверь купе Invisible", unit: "выезд", moscow: "18 000", spb: "17 000" },
    { name: "Установка двери КУПЕ 1 ст. (без отделки проёма)", unit: "шт", moscow: "7 000", spb: "6 500" },
    { name: "Установка двери КУПЕ 2 ст. (без отделки проёма)", unit: "шт", moscow: "13 000", spb: "12 000" },
    { name: "Установка синхронного механизма", unit: "шт", moscow: "2 000", spb: "1 800" },
    { name: "Установка нестандартных дверей / перегородок", unit: "—", moscow: "+30% / +50%", spb: "+30% / +50%" },
    { name: "Установка ДОБОРА до 10 см", unit: "шт", moscow: "1 300", spb: "1 200" },
    { name: "Установка ДОБОРА от 10 до 20 см / под выключатель", unit: "шт", moscow: "1 800", spb: "1 600" },
    { name: "Установка ДОБОРА от 20 до 50 см", unit: "шт", moscow: "3 000 / 4 000", spb: "2 800 / 3 700" },
    { name: "Установка декоративных элементов / Капитель (на одну сторону)", unit: "шт", moscow: "350 / 700", spb: "300 / 650" },
    { name: "Корректировка полотна по высоте (одна сторона)", unit: "шт", moscow: "1 500", spb: "1 300" },
    { name: "Корректировка полотна по высоте (две стороны)", unit: "шт", moscow: "2 500", spb: "2 300" },
    { name: "Корректировка коробки по толщине / Подготовка короба 180°", unit: "шт", moscow: "500 / 1 500", spb: "450 / 1 400" },
    { name: "Обрамление проёма в арку (портал), добор до 20 см", unit: "шт", moscow: "2 500", spb: "2 300" },
    { name: "Обрамление проёма в арку (портал), добор 20–30 см", unit: "шт", moscow: "3 000", spb: "2 800" },
    { name: "Обрамление проёма в арку (портал), добор 30–50 см", unit: "шт", moscow: "3 500", spb: "3 200" },
    { name: "Расширение проёма (одна сторона)", unit: "шт", moscow: "1 500", spb: "1 300" },
    { name: "Сужение проёма брусом (одна сторона, без материала)", unit: "шт", moscow: "750", spb: "700" },
    { name: "Подрезка плинтуса", unit: "шт", moscow: "200", spb: "180" },
    { name: "Установка плинтуса (подрезка углов, евро запил)", unit: "м.п.", moscow: "650", spb: "600" },
    { name: "Врезка замка / ответной части в алюминий / ответной части", unit: "шт", moscow: "750 / 600 / 300", spb: "700 / 550 / 280" },
    { name: "Установка порога деревянного / автопорога / автопорога в алюминий", unit: "шт", moscow: "500 / 1 500 / 2 500", spb: "450 / 1 400 / 2 300" },
    { name: "Роспуск наличника вдоль (по линейке)", unit: "шт", moscow: "300", spb: "280" },
    { name: "Установка ограничителя / доводчика", unit: "шт", moscow: "500 / 1 000", spb: "450 / 900" },
    { name: "Установка фиксатора / Цилиндра", unit: "шт", moscow: "500", spb: "450" },
    { name: "Врезка скрытой петли (1 шт.)", unit: "шт", moscow: "750", spb: "700" },
    { name: "Врезка замка / скрытой петли в алюминий / замка для двери купе", unit: "шт", moscow: "1 500", spb: "1 400" },
    { name: "Врезка ригеля / установка притворной планки", unit: "шт", moscow: "500 / 500", spb: "450 / 450" },
    { name: "Врезка 3-й дополнительной петли (карточной)", unit: "шт", moscow: "350", spb: "320" },
    { name: "Демонтаж дверного блока (без сохранения / с сохранением)", unit: "шт", moscow: "750 / 1 000", spb: "700 / 900" },
    { name: "Установка нестандартных наличников (от 110 мм) / на клей (одна сторона)", unit: "шт", moscow: "350 / 350", spb: "320 / 320" },
    { name: "Расходные материалы (1 комплект)", unit: "комп", moscow: "750", spb: "700" },
    { name: "Монтаж ручек Luxury (комплект)", unit: "комп", moscow: "1 500", spb: "1 400" },
    { name: "Выезд за МКАД", unit: "км", moscow: "50", spb: "—" },
    { name: "Повторный выезд по просьбе клиента", unit: "выезд", moscow: "2 500", spb: "2 300" },
    { name: "Выезд бригады на объект без замера (не подготовлены стены/полы)", unit: "выезд", moscow: "1 500", spb: "1 400" },
  ],
  entrance: [
    { name: "Доставка двери по Москве + подъём на грузовом лифте", unit: "шт", moscow: "2 500", spb: "2 300" },
    { name: "Выезд за МКАД", unit: "км", moscow: "50", spb: "—" },
    { name: "Подъём двери без лифта (за этаж)", unit: "этаж", moscow: "500", spb: "450" },
    { name: "Установка стандартной двери в готовый проём", unit: "шт", moscow: "5 500", spb: "5 000" },
    { name: "Установка стандартной двери в готовый проём (дверь на месте)", unit: "шт", moscow: "7 500", spb: "7 000" },
    { name: "Установка стандартной двери с биометрическим замком", unit: "шт", moscow: "9 500", spb: "9 000" },
    { name: "Установка стандартной полуторостворчатой двери (до 1400×2050)", unit: "шт", moscow: "9 500", spb: "9 000" },
    { name: "Установка стандартной двери Термо с технологией тёплый монтаж", unit: "шт", moscow: "10 000", spb: "9 500" },
    { name: "Установка стандартной полуторостворчатой двери Термо (до 1400×2050)", unit: "шт", moscow: "15 000", spb: "14 000" },
    { name: "Демонтаж деревянной двери / с фрамугой", unit: "шт", moscow: "750 / 1 200", spb: "700 / 1 100" },
    { name: "Демонтаж металлической двери / с фрамугой", unit: "шт", moscow: "1 000 / 1 700", spb: "900 / 1 500" },
    { name: "Расширение проёма (одна сторона)", unit: "шт", moscow: "от 1 000", spb: "от 900" },
    { name: "Расширение проёма П 44 (под 88 / под 96 размер)", unit: "шт", moscow: "6 500 / 8 000", spb: "6 000 / 7 500" },
    { name: "Сужение проёма (столбик из пеноблока с одной стороны)", unit: "шт", moscow: "5 000", spb: "4 500" },
    { name: "Кладка пеноблоком (верх до 20 см) включая материал", unit: "шт", moscow: "3 000", spb: "2 800" },
    { name: "Кладка пеноблоком (верх свыше 20 см) включая материал", unit: "шт", moscow: "5 000", spb: "4 500" },
    { name: "Установка доп. креплений-ушей (шт.)", unit: "шт", moscow: "300", spb: "280" },
    { name: "Установка доборов (до 300 мм) на входную дверь", unit: "шт", moscow: "5 500", spb: "5 000" },
    { name: "Замена панели (внутренней / внешней / 2-х)", unit: "шт", moscow: "6 500 / 9 000 / 10 000", spb: "6 000 / 8 500 / 9 500" },
    { name: "Подрезка панели (без обкатки)", unit: "шт", moscow: "1 500", spb: "1 400" },
    { name: "Подрезка и установка плитки (шт.)", unit: "шт", moscow: "500", spb: "450" },
    { name: "Роспуск наличника (металл / дерево)", unit: "шт", moscow: "1 000 / 750", spb: "900 / 700" },
    { name: "Упаковка двери / утилизация старой двери", unit: "шт", moscow: "1 000 / 2 000", spb: "900 / 1 800" },
    { name: "Установка готовой фрамуги (до 265)", unit: "шт", moscow: "2 500", spb: "2 300" },
    { name: "Замена замка (без снятия панели / со снятием панели)", unit: "шт", moscow: "2 500 / 6 500", spb: "2 300 / 6 000" },
    { name: "Замена цилиндра / врезка глазка / установка доводчика", unit: "шт", moscow: "2 000", spb: "1 800" },
    { name: "Усиление проёма (линейное / уголками, с материалом)", unit: "шт", moscow: "6 000 / 7 500", spb: "5 500 / 7 000" },
    { name: "Выезд на установку доборов (до 300 мм) с материалом заказчика", unit: "выезд", moscow: "6 500", spb: "6 000" },
    { name: "Расходные материалы (1 комплект)", unit: "комп", moscow: "1 000", spb: "900" },
    { name: "Установка нестандартных размеров дверей / доборов / накладок", unit: "—", moscow: "+30%", spb: "+30%" },
    { name: "Повторный выезд по просьбе заказчика", unit: "выезд", moscow: "2 500", spb: "2 300" },
  ],
  reclamation: [
    { name: "Выезд мастера на диагностику", unit: "выезд", moscow: "Бесплатно", spb: "Бесплатно" },
    { name: "Регулировка петель", unit: "шт", moscow: "1 500", spb: "1 300" },
    { name: "Регулировка замка", unit: "шт", moscow: "1 500", spb: "1 300" },
    { name: "Устранение скрипа двери", unit: "шт", moscow: "1 000", spb: "800" },
    { name: "Замена уплотнителя", unit: "комп", moscow: "1 200", spb: "1 000" },
    { name: "Подтяжка крепления коробки", unit: "шт", moscow: "2 000", spb: "1 800" },
    { name: "Замена фурнитуры (ручка)", unit: "шт", moscow: "800", spb: "700" },
    { name: "Перенавеска полотна", unit: "шт", moscow: "2 500", spb: "2 200" },
    { name: "Устранение провисания двери", unit: "шт", moscow: "2 000", spb: "1 800" },
  ],
};

const formatPrice = (price: string) => {
  return price + (price !== "Бесплатно" && !price.startsWith("+") && price !== "—" ? " ₽" : "");
};

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

          {/* Price list */}
          <AnimatePresence>
            {selectedService && prices.length > 0 && (
              <motion.div
                key={selectedService + selectedCity}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="mb-16"
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
                      className="grid grid-cols-[1fr_80px_120px] md:grid-cols-[1fr_100px_140px] border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors duration-300"
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
