import { motion } from "framer-motion";
import serviceInterior from "@/assets/service-interior-doors.jpg";
import serviceEntrance from "@/assets/service-entrance-doors.jpg";
import serviceLocks from "@/assets/service-locks.jpg";
import serviceAdjustment from "@/assets/service-adjustment.jpg";
import serviceDemolition from "@/assets/service-demolition.jpg";

const services = [
  {
    title: "Установка межкомнатных дверей",
    description: "Профессиональная установка всех типов межкомнатных дверей: распашные, раздвижные, складные, скрытого монтажа. Работаем с любыми материалами — массив, МДФ, шпон, экошпон, стекло. Включает установку коробки, наличников, доборов и фурнитуры.",
    image: serviceInterior,
    features: ["Все типы дверей", "Установка за 1 день", "Гарантия 2 года", "Уборка после работ"],
  },
  {
    title: "Установка входных дверей",
    description: "Монтаж стальных и деревянных входных дверей с полной отделкой откосов. Установка уплотнителей, порога, глазка, цепочки. Демонтаж старой двери входит в стоимость.",
    image: serviceEntrance,
    features: ["Стальные и деревянные", "Отделка откосов", "Демонтаж старой двери", "Утепление"],
  },
  {
    title: "Врезка замков",
    description: "Установка замков любой сложности: цилиндровые, сувальдные, электронные, кодовые. Врезка в новые и существующие двери. Замена замков с сохранением целостности двери.",
    image: serviceLocks,
    features: ["Все типы замков", "Врезка и замена", "Электронные замки", "Срочный выезд"],
  },
  {
    title: "Регулировка дверей",
    description: "Регулировка петель, замков, доводчиков. Устранение скрипов, провисаний, неплотного прилегания. Замена уплотнителей и фурнитуры.",
    image: serviceAdjustment,
    features: ["Устранение скрипов", "Регулировка петель", "Замена фурнитуры", "Гарантия на работы"],
  },
  {
    title: "Демонтаж дверей",
    description: "Аккуратный демонтаж старых дверей и коробок. Подготовка проёмов к установке новых дверей. Вывоз строительного мусора.",
    image: serviceDemolition,
    features: ["Аккуратный демонтаж", "Подготовка проёмов", "Вывоз мусора", "Быстро и чисто"],
  },
];

const ServicesPage = () => {
  return (
    <main className="pt-32 pb-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary mb-4 block">
            Услуги
          </span>
          <h1 className="text-4xl md:text-6xl font-heading font-bold">
            Полный спектр <span className="text-gold-gradient">услуг</span>
          </h1>
        </motion.div>

        <div className="space-y-16">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${
                i % 2 === 1 ? "lg:direction-rtl" : ""
              }`}
            >
              <div className={`overflow-hidden rounded-sm ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full aspect-[4/3] object-cover"
                  loading="lazy"
                />
              </div>
              <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">
                  {service.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {service.description}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {service.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default ServicesPage;
