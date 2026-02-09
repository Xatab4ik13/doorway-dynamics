import { motion } from "framer-motion";
import serviceInterior from "@/assets/service-interior-doors.jpg";
import serviceEntrance from "@/assets/service-entrance-doors.jpg";
import serviceLocks from "@/assets/service-locks.jpg";
import serviceAdjustment from "@/assets/service-adjustment.jpg";
import serviceDemolition from "@/assets/service-demolition.jpg";

const services = [
  {
    title: "Установка межкомнатных дверей",
    description: "Профессиональная установка всех типов межкомнатных дверей: распашные, раздвижные, складные, скрытого монтажа. Работаем с любыми материалами — массив, МДФ, шпон, экошпон, стекло.",
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
    description: "Установка замков любой сложности: цилиндровые, сувальдные, электронные, кодовые. Врезка в новые и существующие двери.",
    image: serviceLocks,
    features: ["Все типы замков", "Врезка и замена", "Электронные замки", "Срочный выезд"],
  },
  {
    title: "Регулировка дверей",
    description: "Регулировка петель, замков, доводчиков. Устранение скрипов, провисаний, неплотного прилегания. Замена уплотнителей и фурнитуры.",
    image: serviceAdjustment,
    features: ["Устранение скрипов", "Регулировка петель", "Замена фурнитуры", "Гарантия"],
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
    <main className="pt-24 pb-24">
      <div className="px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20 md:mb-32"
          >
            <p className="section-label mb-6">Услуги</p>
            <h1 className="heading-xl">
              Полный спектр услуг
            </h1>
          </motion.div>

          <div className="space-y-32">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center`}
              >
                <div className={`overflow-hidden ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full aspect-[4/3] object-cover"
                    loading="lazy"
                  />
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <h2 className="heading-md mb-6">{service.title}</h2>
                  <p className="body-text mb-8">{service.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    {service.features.map((f) => (
                      <div key={f} className="flex items-center gap-3 text-xs tracking-wide">
                        <span className="w-1 h-1 bg-foreground flex-shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ServicesPage;
