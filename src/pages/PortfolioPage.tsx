import { useEffect } from "react";
import { motion } from "framer-motion";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";
import project4 from "@/assets/project-4.jpg";
import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";
import portfolio4 from "@/assets/portfolio-4.jpg";

const projects = [
  { image: project1, title: "ЖК Пресня Сити", location: "Москва", count: "12 дверей", year: "2024" },
  { image: project2, title: "ЖК Лахта Парк", location: "Санкт-Петербург", count: "8 дверей", year: "2024" },
  { image: project3, title: "ЖК Садовые Кварталы", location: "Москва", count: "15 дверей", year: "2023" },
  { image: project4, title: "Бизнес-центр Невский", location: "Санкт-Петербург", count: "20 дверей", year: "2023" },
  { image: portfolio1, title: "ЖК Донской Олимп", location: "Москва", count: "10 дверей", year: "2023" },
  { image: portfolio2, title: "ЖК Балтийская Жемчужина", location: "Санкт-Петербург", count: "6 дверей", year: "2022" },
  { image: portfolio3, title: "ЖК Крестовский Де Люкс", location: "Санкт-Петербург", count: "14 дверей", year: "2022" },
  { image: portfolio4, title: "ЖК Триколор", location: "Москва", count: "9 дверей", year: "2022" },
];

const PortfolioPage = () => {
  useEffect(() => {
    document.title = "Портфолио — PrimeDoor Service";
  }, []);

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
            <p className="section-label mb-6">Портфолио</p>
            <h1 className="heading-xl">Наши проекты</h1>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {projects.map((project, i) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.05 }}
            className="project-card aspect-[4/3]"
          >
            <img
              src={project.image}
              alt={project.title}
              className="project-card-image"
              loading="lazy"
            />
            <div className="project-card-overlay" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-lg md:text-xl font-heading font-bold">{project.title}</h3>
                  <p className="text-xs tracking-[0.15em] uppercase text-foreground/60 mt-1">
                    {project.count}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-heading">{project.year}</p>
                  <p className="text-xs tracking-[0.15em] uppercase text-foreground/60 mt-1">
                    {project.location}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  );
};

export default PortfolioPage;
