import { motion } from "framer-motion";
import { useState } from "react";

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="bg-background py-20 md:py-32">
      {/* Section title */}
      <div className="px-6 md:px-10 mb-12 md:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="section-label mb-4 block">портфолио</span>
          <h2 className="heading-lg">Наши работы</h2>
        </motion.div>
      </div>

      {/* Gallery grid — 5 per row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-1 px-1">
        {images.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: i * 0.05 }}
            className="relative aspect-[3/4] overflow-hidden cursor-pointer group"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              className={`
                w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                group-hover:scale-110
                ${hoveredIndex !== null && hoveredIndex !== i ? "brightness-50 saturate-0" : "brightness-100 saturate-100"}
              `}
            />
            {/* Subtle vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default WorksGallery;
