import { motion } from "framer-motion";

import work1 from "@/assets/work-1.jpg";
import work2 from "@/assets/work-2.jpg";
import work3 from "@/assets/work-3.jpg";
import work4 from "@/assets/work-4.jpg";
import work5 from "@/assets/work-5.jpg";
import work6 from "@/assets/work-6.jpg";
import work7 from "@/assets/work-7.jpg";
import work8 from "@/assets/work-8.jpg";

const images = [work1, work2, work3, work4, work5, work6, work7, work8];

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
          {images.map((src, i) => (
            <div
              key={i}
              className={`works-box works-box-${i + 1}`}
              style={{ "--img": `url(${src})` } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorksGallery;
