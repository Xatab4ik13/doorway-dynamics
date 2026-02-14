import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

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
        <motion.a
          href="https://disk.yandex.ru/d/Fx-0Cm8rK08ZGQ"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 inline-block text-sm md:text-base uppercase tracking-[0.2em] text-foreground/60 border-b border-foreground/30 pb-1 hover:text-foreground hover:border-foreground transition-all duration-500"
        >
          Портфолио →
        </motion.a>
      </div>

      {isMobile ? (
        <div className="relative px-4">
          <div className="relative overflow-hidden rounded-xl aspect-[3/4] max-w-[85vw] mx-auto">
            <motion.img
              key={current}
              src={images[current]}
              alt={`Работа ${current + 1}`}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full object-cover"
            />
          </div>

          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-full text-foreground/70 hover:text-foreground transition-colors"
            aria-label="Предыдущая"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-full text-foreground/70 hover:text-foreground transition-colors"
            aria-label="Следующая"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="flex justify-center gap-2 mt-4">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === current ? "bg-foreground w-6" : "bg-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
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
      )}
    </section>
  );
};

export default WorksGallery;
