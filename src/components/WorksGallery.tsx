import { motion } from "framer-motion";

import work1 from "@/assets/work-1.jpg";
import work2 from "@/assets/work-2.jpg";
import work3 from "@/assets/work-3.jpg";
import work4 from "@/assets/work-4.jpg";
import work5 from "@/assets/work-5.jpg";
import work6 from "@/assets/work-6.jpg";
import work7 from "@/assets/work-7.jpg";
import work8 from "@/assets/work-8.jpg";
import work9 from "@/assets/work-9.jpg";
import work10 from "@/assets/work-10.jpg";

const row1 = [work1, work2, work3, work4, work5];
const row2 = [work6, work7, work8, work9, work10];

const WorksGallery = () => {
  return (
    <section className="bg-background py-20 md:py-32">
      <div className="px-6 md:px-10 mb-12 md:mb-16 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="heading-lg"
        >
          Наши работы
        </motion.h2>
      </div>

      <div className="flex flex-col gap-4 px-4 md:px-10 max-w-[1170px] mx-auto">
        <div className="cards-row">
          {row1.map((src, i) => (
            <div
              key={i}
              className="card-item"
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>
        <div className="cards-row">
          {row2.map((src, i) => (
            <div
              key={i}
              className="card-item"
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorksGallery;
