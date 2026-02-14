import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const stats = [
  { end: 19, suffix: "", label: "лет опыта", sublabel: "Работаем с 2007 года" },
  { end: 35, suffix: "", label: "бригад", sublabel: "Команда профессионалов" },
  { end: 8, suffix: "", label: "замерщиков", sublabel: "Точные замеры" },
  { end: 182400, suffix: "+", label: "установленных дверей", sublabel: "Реализовано проектов" },
];

const AnimatedNumber = ({ end, suffix, delay }: { end: number; suffix: string; delay: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const timeout = setTimeout(() => {
      const duration = 1500;
      const steps = 40;
      const stepTime = duration / steps;
      let current = 0;
      const increment = end / steps;
      const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, stepTime);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(timeout);
  }, [isInView, end, delay]);

  return (
    <div ref={ref} className="stat-number">
      {count.toLocaleString()}{suffix}
    </div>
  );
};

const StatsSection = () => {
  return (
    <section className="py-24 md:py-40 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <AnimatedNumber end={stat.end} suffix={stat.suffix} delay={i * 150} />
              <p className="stat-label">{stat.label}</p>
              <p className="text-xs text-muted-foreground/60 mt-2">{stat.sublabel}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
