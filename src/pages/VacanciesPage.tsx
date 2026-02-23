import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Wrench, Ruler, DoorOpen, Car, CheckCircle2 } from "lucide-react";

const vacancies = [
  {
    title: "Монтажник межкомнатных дверей",
    icon: <DoorOpen className="w-6 h-6" />,
    requirements: [
      "Опыт установки межкомнатных дверей",
      "Умение качественно врезать фурнитуру",
      
      "Умение монтировать современные системы открывания и интерьерные перегородки",
      "Понимание технологий скрытого монтажа",
      "Наличие собственного профессионального инструмента",
      "Аккуратность и ответственность",
    ],
    note: "Работаем с современными интерьерными решениями — требуется уверенное знание технологий и аккуратное исполнение без переделок.",
  },
  {
    title: "Монтажник входных металлических дверей",
    icon: <Wrench className="w-6 h-6" />,
    requirements: [
      "Опыт установки входных металлических дверей",
      "Наличие собственного инструмента",
      "Наличие автомобиля (обязательно)",
      "Забор дверей со склада",
      "Умение менять панели",
      "Установка порталов",
    ],
    note: "Ответственность, самостоятельность и соблюдение стандартов монтажа обязательны.",
  },
  {
    title: "Замерщик дверных и интерьерных систем",
    icon: <Ruler className="w-6 h-6" />,
    requirements: [
      "Замер межкомнатных дверей",
      "Замер входных групп",
      "Замер плинтусов, стеновых панелей, перегородок",
      "Знание технических характеристик современных систем открывания и перегородок",
      "Умение работать с измерительным инструментом и нивелиром",
      "Грамотное общение с клиентами",
      "Ответственность за точность данных",
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const VacanciesPage = () => {
  useEffect(() => {
    document.title = "Вакансии — PrimeDoor Service";
  }, []);

  return (
    <main className="bg-background text-foreground">
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 px-6 md:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="section-label mb-4"
          >
            Карьера
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Требуются специалисты
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto"
          >
            Компания PrimeDoor Service приглашает к сотрудничеству профессионалов
            с опытом работы в Москве и Санкт-Петербурге
          </motion.p>
        </div>
      </section>

      {/* Vacancies */}
      <section className="pb-20 md:pb-28 px-6 md:px-10">
        <div className="max-w-5xl mx-auto grid gap-8">
          {vacancies.map((vacancy, i) => (
            <motion.article
              key={vacancy.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              className="border border-border rounded-2xl p-6 md:p-10 bg-card hover:shadow-lg transition-shadow duration-500"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground">
                  {vacancy.icon}
                </div>
                <h2
                  className="text-xl md:text-2xl font-bold tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {vacancy.title}
                </h2>
              </div>

              <p className="section-label mb-4">Требования</p>
              <ul className="space-y-2.5 mb-6">
                {vacancy.requirements.map((req) => (
                  <li key={req} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-foreground/40 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>

              {vacancy.note && (
                <p className="text-xs text-muted-foreground border-l-2 border-foreground/10 pl-4 italic">
                  {vacancy.note}
                </p>
              )}
            </motion.article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 md:pb-28 px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center"
        >
          <p className="text-muted-foreground text-sm md:text-base mb-6">
            Если вы профессионал и готовы к стабильной работе — будем рады сотрудничеству.
            Свяжитесь с нами через раздел «Контакты» или отправьте информацию о себе удобным способом.
          </p>
          <Link
            to="/contacts"
            className="inline-block text-xs uppercase tracking-[0.15em] font-medium px-8 py-3 bg-foreground text-background hover:bg-foreground/80 transition-colors duration-300"
          >
            Связаться с нами
          </Link>
        </motion.div>
      </section>
    </main>
  );
};

export default VacanciesPage;
