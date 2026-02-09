import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-screen min-h-[700px] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block text-sm font-semibold tracking-[0.3em] uppercase text-primary mb-6">
              Москва · Санкт-Петербург
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold leading-[1.1] mb-6"
          >
            Профессиональная
            <br />
            <span className="text-gold-gradient">установка дверей</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed"
          >
            Повышаем качество жизни, исключая посредственность. 
            Межкомнатные и входные двери любой сложности.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/request"
              className="px-8 py-4 bg-primary text-primary-foreground text-sm font-semibold tracking-widest uppercase rounded-sm hover:bg-gold-light transition-all duration-300 glow-gold-sm hover:glow-gold text-center"
            >
              Заказать замер
            </Link>
            <Link
              to="/portfolio"
              className="px-8 py-4 border border-border text-foreground text-sm font-semibold tracking-widest uppercase rounded-sm hover:border-primary hover:text-primary transition-all duration-300 text-center"
            >
              Портфолио
            </Link>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="absolute bottom-12 left-4 right-4 md:left-auto md:right-auto"
        >
          <div className="flex gap-12 md:gap-16">
            {[
              { value: "10+", label: "лет опыта" },
              { value: "5000+", label: "установок" },
              { value: "35", label: "бригад" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-heading font-bold text-gold-gradient">
                  {stat.value}
                </div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
