import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import serviceInterior from "@/assets/service-interior-doors.jpg";
import serviceEntrance from "@/assets/service-entrance-doors.jpg";
import serviceLocks from "@/assets/service-locks.jpg";
import serviceAdjustment from "@/assets/service-adjustment.jpg";
import serviceDemolition from "@/assets/service-demolition.jpg";

const services = [
  {
    title: "Межкомнатные двери",
    description: "Установка дверей любых типов: распашные, раздвижные, скрытого монтажа",
    image: serviceInterior,
  },
  {
    title: "Входные двери",
    description: "Монтаж стальных и деревянных входных дверей с полной отделкой откосов",
    image: serviceEntrance,
  },
  {
    title: "Врезка замков",
    description: "Установка и врезка замков любой сложности, от цилиндровых до электронных",
    image: serviceLocks,
  },
  {
    title: "Регулировка",
    description: "Регулировка петель, замков, доводчиков. Устранение скрипов и провисаний",
    image: serviceAdjustment,
  },
  {
    title: "Демонтаж",
    description: "Аккуратный демонтаж старых дверей и подготовка проёмов к установке новых",
    image: serviceDemolition,
  },
];

const ServicesSection = () => {
  return (
    <section className="py-24 md:py-32 bg-gradient-dark">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary mb-4 block">
            Наши услуги
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold">
            Полный цикл
            <br />
            <span className="text-gold-gradient">работ с дверями</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Link
                to="/services"
                className="group block relative overflow-hidden rounded-sm bg-gradient-card border border-border/50 hover:border-primary/30 transition-all duration-500"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-background/40 group-hover:bg-background/20 transition-colors duration-500" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-heading font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
