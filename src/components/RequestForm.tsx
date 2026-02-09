import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const RequestForm = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "moscow",
    doorType: "interior",
    doorCount: "1",
    time: "",
    comment: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Заявка отправлена! Мы свяжемся с вами в ближайшее время.");
  };

  const inputClass =
    "w-full bg-secondary border border-border rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-card border border-border/50 rounded-sm p-8 md:p-12 max-w-2xl mx-auto"
    >
      <h3 className="text-2xl font-heading font-bold mb-2">Заявка на замер</h3>
      <p className="text-muted-foreground text-sm mb-8">Заполните форму, и мы свяжемся с вами</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          placeholder="Имя *"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputClass}
        />
        <input
          type="tel"
          placeholder="Телефон *"
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className={inputClass}
        />
      </div>

      <input
        type="text"
        placeholder="Адрес *"
        required
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
        className={`${inputClass} mb-4`}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <select
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          className={inputClass}
        >
          <option value="moscow">Москва</option>
          <option value="spb">Санкт-Петербург</option>
        </select>
        <select
          value={form.doorType}
          onChange={(e) => setForm({ ...form, doorType: e.target.value })}
          className={inputClass}
        >
          <option value="interior">Межкомнатные</option>
          <option value="entrance">Входные</option>
          <option value="both">Оба типа</option>
        </select>
        <input
          type="number"
          min="1"
          placeholder="Кол-во дверей"
          value={form.doorCount}
          onChange={(e) => setForm({ ...form, doorCount: e.target.value })}
          className={inputClass}
        />
      </div>

      <input
        type="text"
        placeholder="Удобное время для связи"
        value={form.time}
        onChange={(e) => setForm({ ...form, time: e.target.value })}
        className={`${inputClass} mb-4`}
      />

      <textarea
        placeholder="Комментарий"
        rows={3}
        value={form.comment}
        onChange={(e) => setForm({ ...form, comment: e.target.value })}
        className={`${inputClass} mb-6 resize-none`}
      />

      <button
        type="submit"
        className="w-full py-4 bg-primary text-primary-foreground text-sm font-semibold tracking-widest uppercase rounded-sm hover:bg-gold-light transition-all duration-300 glow-gold-sm hover:glow-gold"
      >
        Отправить заявку
      </button>
    </motion.form>
  );
};

export default RequestForm;
