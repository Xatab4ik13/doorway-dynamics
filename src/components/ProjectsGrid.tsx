import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";
import project4 from "@/assets/project-4.jpg";

const projects = [
  {
    title: "ЖК Пресня Сити",
    subtitle: "Межкомнатные двери",
    year: "2024",
    location: "Москва, 12 дверей",
    image: project1,
  },
  {
    title: "ЖК Лахта Парк",
    subtitle: "Входные двери",
    year: "2024",
    location: "Санкт-Петербург, 8 дверей",
    image: project2,
  },
  {
    title: "ЖК Садовые Кварталы",
    subtitle: "Скрытый монтаж",
    year: "2023",
    location: "Москва, 15 дверей",
    image: project3,
  },
  {
    title: "Бизнес-центр Невский",
    subtitle: "Офисные перегородки",
    year: "2023",
    location: "Санкт-Петербург, 20 дверей",
    image: project4,
  },
];

const ProjectsGrid = () => {
  return (
    <section className="py-0">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {projects.map((project, i) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
          >
            <Link to="/portfolio" className="project-card block aspect-[4/3] md:aspect-[16/12]">
              <img
                src={project.image}
                alt={project.title}
                className="project-card-image"
                loading="lazy"
              />
              <div className="project-card-overlay" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl md:text-2xl font-heading font-bold">
                      {project.title}
                    </h3>
                    <p className="text-xs tracking-[0.15em] uppercase text-foreground/60 mt-1">
                      {project.subtitle}
                    </p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-heading font-medium">
                      {project.year}
                    </p>
                    <p className="text-xs tracking-[0.15em] uppercase text-foreground/60 mt-1">
                      {project.location}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ProjectsGrid;
