import { motion } from "framer-motion";

import work1 from "@/assets/work-1.jpg";
import work2 from "@/assets/work-2.jpg";
import work3 from "@/assets/work-3.jpg";
import work4 from "@/assets/work-4.jpg";
import work5 from "@/assets/work-5.jpg";

const boxes = [
  { src: work1, text: "Классика" },
  { src: work2, text: "Модерн" },
  { src: work3, text: "Экошпон" },
  { src: work4, text: "Фрезеровка" },
  { src: work5, text: "Дизайн" },
];

const WorksGallery = () => {
  return (
    <section className="bg-background py-20 md:py-32">
      <div className="px-6 md:px-10 mb-12 md:mb-16 text-center">
        <motion.span
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-lg md:text-2xl lg:text-3xl font-medium uppercase tracking-[0.3em] text-foreground"
        >
          наши работы
        </motion.span>
      </div>

      <div className="flex justify-center px-4 md:px-10">
        <div className="works-container">
          {boxes.map((box, i) => (
            <div
              key={i}
              className={`works-box works-box-${i + 1}`}
              style={{ "--img": `url(${box.src})` } as React.CSSProperties}
              data-text={box.text}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorksGallery;
