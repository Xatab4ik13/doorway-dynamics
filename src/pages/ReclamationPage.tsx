import { useEffect } from "react";
import { motion } from "framer-motion";
import ContactForm from "@/components/ContactForm";

const ReclamationPage = () => {
  useEffect(() => {
    document.title = "Рекламация — PrimeDoor Service";
  }, []);

  return (
    <main className="pt-24 pb-0">
      <div className="px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16 md:mb-20"
          >
            <p className="section-label mb-6">Рекламация</p>
            <h1 className="heading-xl mb-10">Гарантийное обслуживание</h1>
            <p className="body-text max-w-2xl">
              Если после установки возникли проблемы с дверью — скрип, провисание, неплотное прилегание, 
              проблемы с замком — мы бесплатно выедем на диагностику и устраним неисправность в рамках гарантии. 
              Для негарантийных случаев действуют фиксированные цены на ремонтные работы.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-20"
          >
            <h2 className="heading-md mb-8">Что входит в рекламацию</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "Регулировка петель и замков",
                "Устранение скрипов и провисаний",
                "Замена уплотнителей и фурнитуры",
                "Подтяжка крепления коробки",
                "Перенавеска дверного полотна",
                "Бесплатный выезд мастера на диагностику",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-foreground/80">
                  <span className="w-1.5 h-1.5 bg-foreground flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <ContactForm />
    </main>
  );
};

export default ReclamationPage;
