import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const ContactForm = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "moscow",
    comment: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Заявка отправлена! Мы свяжемся с вами в ближайшее время.");
    setForm({ name: "", phone: "", city: "moscow", comment: "" });
  };

  const inputClass =
    "w-full bg-transparent border-b border-border py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors duration-500";

  return (
    <section className="py-24 md:py-40 px-6 md:px-10">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="section-label mb-6">Написать нам</p>
          <h2 className="heading-lg mb-16">Оставьте заявку</h2>

          <form onSubmit={handleSubmit} className="space-y-0">
            <input
              type="text"
              placeholder="Имя"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
            <input
              type="tel"
              placeholder="Телефон"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass}
            />
            <select
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className={`${inputClass} bg-background`}
            >
              <option value="moscow">Москва</option>
              <option value="spb">Санкт-Петербург</option>
            </select>
            <textarea
              placeholder="Расскажите о вашем проекте"
              rows={3}
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              className={`${inputClass} resize-none`}
            />

            <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground max-w-sm">
                Нажимая на кнопку, вы даете согласие на обработку персональных данных
              </p>
              <button type="submit" className="btn-primary">
                Отправить
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactForm;
