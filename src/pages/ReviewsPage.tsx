import { motion } from "framer-motion";

const reviews = [
  { name: "Алексей М.", location: "Москва", text: "Установили 8 межкомнатных дверей в новостройке. Работа выполнена за один день, качество отличное. Особенно порадовала аккуратность — ни одной царапины.", year: "2024" },
  { name: "Ольга К.", location: "Санкт-Петербург", text: "Заказывала установку входной двери. Замерщик приехал вовремя, дал профессиональные рекомендации. Монтаж прошёл без нареканий.", year: "2024" },
  { name: "Дмитрий В.", location: "Москва", text: "Обращаюсь уже второй раз. Первый раз делали квартиру, теперь офис. Всегда довольны результатом. Рекомендую!", year: "2023" },
  { name: "Ирина С.", location: "Санкт-Петербург", text: "Нужно было срочно заменить замок на входной двери. Мастер приехал в тот же день, всё сделал быстро и качественно.", year: "2023" },
  { name: "Павел Т.", location: "Москва", text: "Заказали установку 15 дверей в частном доме. Бригада работала слаженно, уложились в срок. Качество на высшем уровне.", year: "2024" },
  { name: "Марина Л.", location: "Санкт-Петербург", text: "Двери скрытого монтажа — это нечто! Выглядят потрясающе. Спасибо за аккуратную установку и терпение.", year: "2024" },
];

const ReviewsPage = () => {
  return (
    <main className="pt-24 pb-24">
      <div className="px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20 md:mb-32"
          >
            <p className="section-label mb-6">Отзывы</p>
            <h1 className="heading-xl">Что говорят клиенты</h1>
          </motion.div>

          <div className="space-y-0">
            {reviews.map((review, i) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="border-t border-border py-10 md:py-14 grid grid-cols-1 md:grid-cols-[200px_1fr_100px] gap-6 items-start"
              >
                <div>
                  <p className="text-sm font-heading font-semibold">{review.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{review.location}</p>
                </div>
                <p className="body-text">«{review.text}»</p>
                <p className="text-xs text-muted-foreground text-right">{review.year}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ReviewsPage;
