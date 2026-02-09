import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

// Generate random polygon clip paths for Delaunay-like effect
const generateTriangles = () => {
  const triangles: string[] = [];
  const cols = 4;
  const rows = 3;
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x1 = (c / cols) * 100;
      const y1 = (r / rows) * 100;
      const x2 = ((c + 1) / cols) * 100;
      const y2 = ((r + 1) / rows) * 100;
      
      // Add some randomness to internal points
      const mx = x1 + (x2 - x1) * (0.3 + Math.random() * 0.4);
      const my = y1 + (y2 - y1) * (0.3 + Math.random() * 0.4);
      
      // Two triangles per cell
      triangles.push(`polygon(${x1}% ${y1}%, ${x2}% ${y1}%, ${mx}% ${my}%)`);
      triangles.push(`polygon(${x2}% ${y1}%, ${x2}% ${y2}%, ${mx}% ${my}%)`);
      triangles.push(`polygon(${x2}% ${y2}%, ${x1}% ${y2}%, ${mx}% ${my}%)`);
      triangles.push(`polygon(${x1}% ${y2}%, ${x1}% ${y1}%, ${mx}% ${my}%)`);
    }
  }
  return triangles;
};

const WorksGallery = () => {
  const [current, setCurrent] = useState(0);
  const [triangles] = useState(() => generateTriangles());
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback((index: number) => {
    if (isTransitioning || index === current) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 1200);
  }, [current, isTransitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % images.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + images.length) % images.length);
  }, [current, goTo]);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isTransitioning) next();
    }, 5000);
    return () => clearInterval(timer);
  }, [next, isTransitioning]);

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

      <div className="px-4 md:px-10 max-w-[1170px] mx-auto">
        {/* Main viewer */}
        <div 
          className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl cursor-pointer select-none"
          style={{ boxShadow: "0 26px 70px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08)" }}
        >
          {/* Base image (previous) */}
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Работа ${i + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                zIndex: i === current ? 1 : 0,
                opacity: i === current ? 1 : 0,
                transition: "opacity 0.1s",
              }}
              loading="lazy"
            />
          ))}

          {/* Delaunay triangle transition overlay */}
          <AnimatePresence>
            {isTransitioning && (
              <div className="absolute inset-0 z-10">
                {triangles.map((clipPath, i) => (
                  <motion.div
                    key={`tri-${current}-${i}`}
                    className="absolute inset-0"
                    style={{ clipPath }}
                    initial={{ opacity: 1, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.6 + Math.random() * 0.6,
                      delay: Math.random() * 0.4,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <img
                      src={images[(current - 1 + images.length) % images.length]}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{ position: "absolute", inset: 0 }}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Navigation arrows */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-background/30 backdrop-blur-sm border border-border/30 rounded-full text-foreground/70 hover:text-foreground hover:bg-background/50 transition-all duration-300"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-background/30 backdrop-blur-sm border border-border/30 rounded-full text-foreground/70 hover:text-foreground hover:bg-background/50 transition-all duration-300"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8 z-20 text-xs uppercase tracking-[0.2em] text-foreground/50 font-medium">
            {String(current + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </div>
        </div>

        {/* Thumbnail strip */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`relative flex-shrink-0 w-20 h-14 md:w-24 md:h-16 rounded-lg overflow-hidden transition-all duration-500 ${
                i === current
                  ? "ring-1 ring-foreground/50 opacity-100"
                  : "opacity-30 hover:opacity-60 grayscale hover:grayscale-0"
              }`}
            >
              <img
                src={src}
                alt={`Миниатюра ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorksGallery;
