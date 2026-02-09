import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
            Готовы к <span className="text-gold-gradient">идеальным дверям</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
            Оставьте заявку на бесплатный замер, и мы свяжемся с вами в течение 15 минут
          </p>
          <Link
            to="/request"
            className="inline-block px-10 py-4 bg-primary text-primary-foreground text-sm font-semibold tracking-widest uppercase rounded-sm hover:bg-gold-light transition-all duration-300 glow-gold-sm hover:glow-gold"
          >
            Оставить заявку
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
