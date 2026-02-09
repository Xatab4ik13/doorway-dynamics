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

const images = [work1, work2, work3, work4, work5, work6, work7, work8, work9, work10];

const WorksGallery = () => {
  return (
    <section className="bg-background py-20 md:py-32">
      {/* Section title */}
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

      {/* Gallery grid — 5 per row, grayscale → color on hover */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-1 px-1">
        {images.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: i * 0.05 }}
            className="relative aspect-[3/4] overflow-hidden cursor-pointer group"
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] grayscale group-hover:grayscale-0 group-hover:contrast-[1.15] group-hover:saturate-[1.3] group-hover:scale-105"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default WorksGallery;
