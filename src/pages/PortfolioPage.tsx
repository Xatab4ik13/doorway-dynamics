import { motion } from "framer-motion";
import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";
import portfolio4 from "@/assets/portfolio-4.jpg";

const projects = [
  { image: portfolio1, title: "ЖК Пресня Сити", location: "Москва", count: "12 дверей", type: "Межкомнатные" },
  { image: portfolio2, title: "ЖК Балтийская Жемчужина", location: "Санкт-Петербург", count: "8 дверей", type: "Входные" },
  { image: portfolio3, title: "ЖК Донской Олимп", location: "Москва", count: "15 дверей", type: "Межкомнатные" },
  { image: portfolio4, title: "ЖК Лахта Парк", location: "Санкт-Петербург", count: "6 дверей", type: "Межкомнатные + Входные" },
  { image: portfolio1, title: "ЖК Садовые Кварталы", location: "Москва", count: "20 дверей", type: "Межкомнатные" },
  { image: portfolio3, title: "ЖК Петровский Остров", location: "Санкт-Петербург", count: "10 дверей", type: "Межкомнатные" },
];

const PortfolioPage = () => {
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
            Портфолио
          </span>
          <h1 className="text-4xl md:text-6xl font-heading font-bold">
            Наши <span className="text-gold-gradient">проекты</span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={`${project.title}-${i}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-sm cursor-pointer"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent opacity-80" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  <span>{project.location}</span>
                  <span className="w-1 h-1 rounded-full bg-primary" />
                  <span>{project.count}</span>
                </div>
                <h3 className="text-lg font-heading font-semibold group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{project.type}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default PortfolioPage;
