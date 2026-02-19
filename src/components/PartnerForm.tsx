import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import api from "@/lib/api";
import { formatPhone } from "@/lib/formatPhone";

function generateCaptcha() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return { question: `${a} + ${b} = ?`, answer: String(a + b) };
}

const PartnerForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [form, setForm] = useState({
    name: "",
    storeName: "",
    storeAddress: "",
    phone: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.phone.replace(/\D/g, "").length < 11) {
      toast.error("Введите корректный номер телефона");
      return;
    }
    if (captchaInput !== captcha.answer) {
      toast.error("Неверный ответ на проверку");
      setCaptcha(generateCaptcha());
      setCaptchaInput("");
      return;
    }

    setSubmitting(true);
    try {
      await api("/api/partner-form", {
        method: "POST",
        body: {
          name: form.name,
          store_name: form.storeName,
          store_address: form.storeAddress,
          phone: form.phone,
          email: form.email,
        },
      });
      toast.success("Заявка отправлена! Мы свяжемся с вами в ближайшее время.");
      setForm({ name: "", storeName: "", storeAddress: "", phone: "", email: "" });
      setCaptcha(generateCaptcha());
      setCaptchaInput("");
    } catch (err: any) {
      toast.error(err.message || "Ошибка отправки");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border-b border-white/20 py-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/60 transition-colors duration-500";

  return (
    <section className="py-16 md:py-24 bg-black text-white">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6">Для партнёров</p>
          <h2
            className="text-2xl md:text-3xl font-bold mb-12 tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Оставить заявку на сотрудничество
          </h2>

          <form onSubmit={handleSubmit} className="space-y-0">
            <input
              type="text"
              placeholder="ФИО"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Название магазина"
              required
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Адрес магазина (ТЦ, рынок)"
              required
              value={form.storeAddress}
              onChange={(e) => setForm({ ...form, storeAddress: e.target.value })}
              className={inputClass}
            />
            <input
              type="tel"
              placeholder="+7 ___ ___ __ __"
              required
              value={form.phone}
              onFocus={(e) => { if (!e.target.value) setForm({ ...form, phone: "+7" }); }}
              onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
              className={inputClass}
            />
            <input
              type="email"
              placeholder="Электронная почта"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass}
            />

            {/* Captcha */}
            <div className="pt-6">
              <label className="text-xs font-medium flex items-center gap-1.5 mb-2 text-white/40">
                <ShieldCheck size={12} /> Проверка: {captcha.question}
              </label>
              <input
                type="text"
                placeholder="Ответ"
                required
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <p className="text-xs text-white/40 max-w-sm">
                Нажимая на кнопку, вы даете согласие на обработку{" "}
                <a href="/privacy" target="_blank" className="underline hover:text-white transition-colors">
                  персональных данных
                </a>
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-medium text-sm uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? "Отправка..." : "Отправить"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default PartnerForm;
