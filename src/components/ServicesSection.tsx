import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import serviceCardInterior from "@/assets/service-card-interior.jpg";
import serviceCardEntrance from "@/assets/service-card-entrance.jpg";
import serviceCardLocks from "@/assets/service-card-locks.jpg";
import serviceCardAdjustment from "@/assets/service-card-adjustment.jpg";
import serviceCardDemolition from "@/assets/service-card-demolition.jpg";

const services = [
  {
    title: "Межкомнатные двери",
    description: "Установка всех типов: распашные, раздвижные, скрытого монтажа",
    image: serviceCardInterior,
    link: "/services/interior",
  },
  {
    title: "Входные двери",
    description: "Монтаж стальных и деревянных дверей с отделкой откосов",
    image: serviceCardEntrance,
    link: "/services/entrance",
  },
  {
    title: "Врезка замков",
    description: "Установка замков любой сложности, от цилиндровых до электронных",
    image: serviceCardLocks,
    link: "/services/locks",
  },
  {
    title: "Регулировка",
    description: "Регулировка петель, замков, доводчиков и устранение скрипов",
    image: serviceCardAdjustment,
    link: "/services/adjustment",
  },
  {
    title: "Демонтаж",
    description: "Аккуратный демонтаж старых дверей и подготовка проёмов",
    image: serviceCardDemolition,
    link: "/services/demolition",
  },
];

const ServicesSection = () => {
  return (
    <section className="py-24 md:py-40 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12 md:mb-16 text-center"
        >
          <span className="text-lg md:text-2xl lg:text-3xl font-medium uppercase tracking-[0.3em] text-foreground">
            Наши услуги
          </span>
        </motion.div>

        {/* Top row: 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {services.slice(0, 3).map((service, i) => (
            <ServiceCard key={service.title} service={service} index={i} />
          ))}
        </div>

        {/* Bottom row: 2 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.slice(3).map((service, i) => (
            <ServiceCard key={service.title} service={service} index={i + 3} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ServiceCard = ({
  service,
  index,
}: {
  service: (typeof services)[0];
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
    >
      <Link
        to={service.link}
        className="group relative block overflow-hidden rounded-2xl aspect-[4/5] md:aspect-[3/4]"
      >
        <img
          src={service.image}
          alt={service.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-all duration-[1.5s] group-hover:from-black/90" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 translate-y-2 group-hover:translate-y-0 transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)]">
          <p className="section-label mb-3 opacity-70 group-hover:opacity-100 transition-opacity duration-500">
            {service.description}
          </p>
          <h3 className="text-xl md:text-2xl font-heading font-bold uppercase tracking-tight text-foreground">
            {service.title}
          </h3>
          <span className="inline-block mt-4 text-xs tracking-[0.2em] uppercase text-foreground/60 border-b border-foreground/30 pb-1 group-hover:text-foreground group-hover:border-foreground transition-all duration-500">
            Подробнее
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

export default ServicesSection;
