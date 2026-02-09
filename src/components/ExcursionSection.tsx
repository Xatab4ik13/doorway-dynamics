import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const ExcursionSection = () => {
  return (
    <section className="relative h-[70vh] min-h-[500px] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/50" />
      </div>

      <div className="relative px-6 md:px-10 w-full max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="section-label mb-6">Бесплатный замер</p>
          <h2 className="heading-lg max-w-3xl mb-6">
            Запишитесь на бесплатный замер
          </h2>
          <p className="body-text max-w-xl mb-10">
            У нас сейчас 57 активных проектов, подберём для вас удобное время. 
            Замерщик приедет в день обращения.
          </p>
          <Link to="/request" className="btn-primary">
            Записаться
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ExcursionSection;
