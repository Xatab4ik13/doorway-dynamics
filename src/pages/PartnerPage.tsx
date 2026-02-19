import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Handshake, CheckCircle2, Users, Gift, ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const howWeWork = [
  "Выполняем установку дверей любой сложности — аккуратно, чисто и в согласованные сроки.",
  "Берём на себя коммуникацию с клиентом.",
  "Поддерживаем партнёров: быстро реагируем, держим связь, соблюдаем договорённости.",
  "Работаем в Москве и Санкт‑Петербурге — с отдельными командами в каждом городе.",
  "Гарантируем прозрачные условия и стабильное качество на каждом объекте.",
  "Предоставляем гарантии на все выполненные работы.",
  "Обеспечиваем бесплатное обслуживание в рамках гарантийных обязательств.",
  "Используем собственную удобную CRM‑систему, где партнёры могут отслеживать заявки, статусы, сроки и отчёты.",
];

const whoWeWorkWith = [
  { title: "Дизайнеры интерьеров", desc: "аккуратная установка дверей в проектах с высокими требованиями." },
  { title: "Прорабы и строительные бригады", desc: "монтаж без задержек и переделок." },
  { title: "Розничные магазины дверей", desc: "бережное обслуживание ваших клиентов." },
  { title: "Оптовые магазины", desc: "стабильный сервис при больших объёмах." },
  { title: "Сетевые магазины", desc: "соблюдение стандартов и единое качество на всех объектах." },
  { title: "Производители дверей", desc: "сервисный партнёр, который поддерживает вашу репутацию." },
];

const partnerBenefits = [
  "Надёжного исполнителя, который не подводит.",
  "Чистую, аккуратную работу без переделок.",
  "Партнёрскую поддержку и предсказуемый сервис.",
  "Бонус за каждого приведённого клиента — фиксированный и прозрачный.",
  "Удобную CRM‑систему для контроля всех процессов.",
];

const PartnerPage = () => {
  useEffect(() => {
    document.title = "Стать партнёром — PrimeDoor Service";
  }, []);

  return (
    <main className="bg-background text-foreground">
      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/95" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <Handshake className="w-14 h-14 mx-auto mb-6 text-white/60" strokeWidth={1.2} />
          </motion.div>
          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Стать партнёром PrimeDoor Service
          </motion.h1>
          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-white/60 text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
          >
            Мы строим сотрудничество на аккуратности, ответственности и уважении к каждому проекту.
            Если вам важен стабильный сервис и предсказуемый результат, PrimeDoor&nbsp;Service станет
            надёжным партнёром в установке и обслуживании дверей.
          </motion.p>
        </div>
      </section>

      {/* Как мы работаем */}
      <section className="py-16 md:py-24 max-w-5xl mx-auto px-6">
        <motion.h2
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          className="text-2xl md:text-3xl font-bold mb-10"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Как мы работаем
        </motion.h2>
        <div className="grid gap-4">
          {howWeWork.map((item, i) => (
            <motion.div
              key={i}
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              className="flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 mt-0.5 text-primary shrink-0" strokeWidth={1.5} />
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{item}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* С кем мы сотрудничаем */}
      <section className="py-16 md:py-24 bg-muted/40">
        <div className="max-w-5xl mx-auto px-6">
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            С кем мы сотрудничаем
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="text-muted-foreground mb-10 text-sm md:text-base"
          >
            Мы работаем с профессионалами и компаниями, которым важна надёжность:
          </motion.p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whoWeWorkWith.map((item, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <Users className="w-6 h-6 text-primary mb-3" strokeWidth={1.5} />
                <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Что получает партнёр */}
      <section className="py-16 md:py-24 max-w-5xl mx-auto px-6">
        <motion.h2
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          className="text-2xl md:text-3xl font-bold mb-10"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Что получает партнёр
        </motion.h2>
        <div className="grid gap-4">
          {partnerBenefits.map((item, i) => (
            <motion.div
              key={i}
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              className="flex items-start gap-3"
            >
              <Gift className="w-5 h-5 mt-0.5 text-primary shrink-0" strokeWidth={1.5} />
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{item}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Мы за долгосрочное сотрудничество */}
      <section className="py-16 md:py-24 bg-black text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="text-2xl md:text-3xl font-bold mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Мы за долгосрочное сотрудничество
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="text-white/60 text-sm md:text-base leading-relaxed mb-10"
          >
            PrimeDoor Service — это спокойная, профессиональная работа без лишних обещаний.
            Мы ценим партнёров, которые разделяют такой подход, и строим отношения,
            основанные на доверии и качестве.
          </motion.p>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
          >
            <Link
              to="/request"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-medium text-sm uppercase tracking-widest hover:bg-white/90 transition-colors"
            >
              Оставить заявку
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default PartnerPage;
