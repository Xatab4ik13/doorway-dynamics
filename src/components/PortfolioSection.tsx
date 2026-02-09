import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";
import portfolio4 from "@/assets/portfolio-4.jpg";

const projects = [
  { image: portfolio1, title: "ЖК Пресня Сити", location: "Москва", count: "12 дверей" },
  { image: portfolio2, title: "ЖК Балтийская Жемчужина", location: "Санкт-Петербург", count: "8 дверей" },
  { image: portfolio3, title: "ЖК Донской Олимп", location: "Москва", count: "15 дверей" },
  { image: portfolio4, title: "ЖК Лахта Парк", location: "Санкт-Петербург", count: "6 дверей" },
];

const PortfolioSection = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary mb-4 block">
              Портфолио
            </span>
            <h2 className="text-3xl md:text-5xl font-heading font-bold">
              Наши <span className="text-gold-gradient">проекты</span>
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              to="/portfolio"
              className="text-sm font-semibold tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors border-b border-border hover:border-primary pb-1"
            >
              Все проекты →
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="group relative overflow-hidden rounded-sm cursor-pointer"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  <span>{project.location}</span>
                  <span className="w-1 h-1 rounded-full bg-primary" />
                  <span>{project.count}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-heading font-semibold group-hover:text-primary transition-colors duration-300">
                  {project.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
