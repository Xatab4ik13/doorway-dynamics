import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import serviceInterior from "@/assets/service-interior-doors.jpg";
import serviceEntrance from "@/assets/service-entrance-doors.jpg";
import serviceLocks from "@/assets/service-locks.jpg";

const services = [
  {
    title: "Межкомнатные двери",
    description: "Установка всех типов: распашные, раздвижные, скрытого монтажа",
    image: serviceInterior,
    link: "/services",
  },
  {
    title: "Входные двери",
    description: "Монтаж стальных и деревянных дверей с отделкой откосов",
    image: serviceEntrance,
    link: "/services",
  },
  {
    title: "Врезка замков",
    description: "Установка замков любой сложности, от цилиндровых до электронных",
    image: serviceLocks,
    link: "/services",
  },
];

const ServicesSection = () => {
  return (
    <section className="py-24 md:py-40 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
            >
              <Link to={service.link} className="project-card block">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="project-card-image"
                    loading="lazy"
                  />
                  <div className="project-card-overlay" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <p className="section-label mb-3">{service.description}</p>
                  <h3 className="text-xl md:text-2xl font-heading font-bold uppercase tracking-tight">
                    {service.title}
                  </h3>
                  <span className="inline-block mt-4 text-xs tracking-[0.2em] uppercase text-foreground/60 border-b border-foreground/30 pb-1 group-hover:text-foreground group-hover:border-foreground transition-all duration-500">
                    Подробнее
                  </span>
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
