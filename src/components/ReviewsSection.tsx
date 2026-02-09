import { motion } from "framer-motion";

const reviews = [
  {
    name: "Алексей М.",
    location: "Москва",
    text: "Установили 8 межкомнатных дверей в новостройке. Работа выполнена за один день, качество отличное. Особенно порадовала аккуратность — ни одной царапины.",
    rating: 5,
  },
  {
    name: "Ольга К.",
    location: "Санкт-Петербург",
    text: "Заказывала установку входной двери. Замерщик приехал вовремя, дал профессиональные рекомендации. Монтаж прошёл без нареканий.",
    rating: 5,
  },
  {
    name: "Дмитрий В.",
    location: "Москва",
    text: "Обращаюсь уже второй раз. Первый раз делали квартиру, теперь офис. Всегда довольны результатом. Рекомендую!",
    rating: 5,
  },
];

const ReviewsSection = () => {
  return (
    <section className="py-24 md:py-32 bg-gradient-dark">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary mb-4 block">
            Отзывы
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold">
            Нам <span className="text-gold-gradient">доверяют</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="bg-gradient-card border border-border/50 rounded-sm p-8 hover:border-primary/20 transition-colors duration-500"
            >
              <div className="flex gap-1 mb-6">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <span key={j} className="text-primary text-lg">★</span>
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                «{review.text}»
              </p>
              <div className="line-gold mb-6" />
              <div>
                <p className="font-semibold text-sm">{review.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{review.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
