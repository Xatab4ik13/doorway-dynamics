import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import api from "@/lib/api";
import AddressInput from "@/components/AddressInput";
import { formatPhone } from "@/lib/formatPhone";

function generateCaptcha() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return { question: `${a} + ${b} = ?`, answer: String(a + b) };
}

const cities = [
  { id: "moscow", label: "Москва" },
  { id: "spb", label: "Санкт-Петербург" },
];

const cityMap: Record<string, string> = { moscow: "Москва", spb: "Санкт-Петербург" };

const requestTypes = [
  { id: "measurement", label: "Заявка на замер" },
  { id: "installation", label: "Заявка на монтаж" },
  { id: "reclamation", label: "Рекламация" },
];

export interface ContactFormRef {
  scrollToForm: () => void;
}

const ContactForm = forwardRef<ContactFormRef>((_, ref) => {
  const formRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    scrollToForm: () => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  }));

  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    extraName: "",
    extraPhone: "",
    address: "",
    workDescription: "",
  });

  const filtersSelected = selectedCity && selectedType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filtersSelected) {
      toast.error("Пожалуйста, выберите город и тип заявки");
      return;
    }
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
      await api("/api/requests/public", {
        method: "POST",
        body: {
          client_name: form.name,
          client_phone: form.phone,
          client_address: form.address,
          city: cityMap[selectedCity!],
          type: selectedType,
          work_description: form.workDescription,
          extra_name: form.extraName || undefined,
          extra_phone: form.extraPhone || undefined,
          source: "site",
        },
      });
      toast.success("Заявка отправлена! Мы свяжемся с вами в ближайшее время.");
      setForm({ name: "", phone: "", extraName: "", extraPhone: "", address: "", workDescription: "" });
      setSelectedCity(null);
      setSelectedType(null);
      setCaptcha(generateCaptcha());
      setCaptchaInput("");
    } catch (err: any) {
      toast.error(err.message || "Ошибка отправки заявки");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border-b border-border py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors duration-500";

  const disabledInputClass =
    "w-full bg-transparent border-b border-border/50 py-4 text-sm text-muted-foreground/40 placeholder:text-muted-foreground/30 cursor-not-allowed";

  const isReclamation = selectedType === "reclamation";
  const actionLabel = selectedType === "measurement" ? "Что замеряем" : selectedType === "installation" ? "Что монтируем" : isReclamation ? "Опишите проблему" : "Опишите задачу";

  return (
    <section className="py-24 md:py-40 px-6 md:px-10" ref={formRef}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="section-label mb-6">Написать нам</p>
          <h2 className="heading-lg mb-16">Оставьте заявку</h2>

          {/* City selection */}
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-4">Выберите город</p>
            <div className="flex flex-wrap gap-3">
              {cities.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => setSelectedCity(city.id)}
                  className={`px-6 py-3 text-sm font-medium uppercase tracking-[0.15em] transition-all duration-500 border ${
                    selectedCity === city.id
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-foreground/60 border-border hover:text-foreground hover:border-foreground/50"
                  }`}
                >
                  {city.label}
                </button>
              ))}
            </div>
          </div>

          {/* Request type selection */}
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-4">Тип заявки</p>
            <div className="flex flex-wrap gap-3">
              {requestTypes.map((rt) => (
                <button
                  key={rt.id}
                  type="button"
                  onClick={() => setSelectedType(rt.id)}
                  className={`px-6 py-3 text-sm font-medium uppercase tracking-[0.1em] transition-all duration-500 border ${
                    selectedType === rt.id
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-foreground/60 border-border hover:text-foreground hover:border-foreground/50"
                  }`}
                >
                  {rt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-0 relative">
            {!filtersSelected && (
              <div className="absolute inset-0 z-10 cursor-not-allowed" onClick={() => toast.info("Сначала выберите город и тип заявки")} />
            )}

            <input type="text" placeholder="ФИО" required disabled={!filtersSelected}
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={filtersSelected ? inputClass : disabledInputClass} />
            <input type="tel" placeholder="+7 ___ ___ __ __" required disabled={!filtersSelected}
              value={form.phone}
              onFocus={(e) => { if (!e.target.value) setForm({ ...form, phone: "+7" }); }}
              onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
              className={filtersSelected ? inputClass : disabledInputClass} />

            {!isReclamation && (
              <>
                <div className="pt-6 pb-2">
                  <p className={`text-xs uppercase tracking-[0.15em] ${filtersSelected ? "text-muted-foreground" : "text-muted-foreground/30"}`}>
                    Доп. контакт
                  </p>
                </div>
                <input type="text" placeholder="ФИО доп. контакта" disabled={!filtersSelected}
                  value={form.extraName} onChange={(e) => setForm({ ...form, extraName: e.target.value })}
                  className={filtersSelected ? inputClass : disabledInputClass} />
                <input type="tel" placeholder="+7 ___ ___ __ __" disabled={!filtersSelected}
                  value={form.extraPhone}
                  onFocus={(e) => { if (!e.target.value) setForm({ ...form, extraPhone: "+7" }); }}
                  onChange={(e) => setForm({ ...form, extraPhone: formatPhone(e.target.value) })}
                  className={filtersSelected ? inputClass : disabledInputClass} />
              </>
            )}

            {/* Address */}
            <AddressInput
              value={form.address}
              onChange={(val) => setForm({ ...form, address: val })}
              city={selectedCity ? cityMap[selectedCity] : undefined}
              placeholder="Адрес"
              disabled={!filtersSelected}
              className={filtersSelected ? inputClass : disabledInputClass}
              dropdownClassName="absolute top-full left-0 right-0 z-50 bg-background border border-border shadow-lg"
            />

            <textarea placeholder={actionLabel} required disabled={!filtersSelected} rows={3}
              value={form.workDescription} onChange={(e) => setForm({ ...form, workDescription: e.target.value })}
              className={`${filtersSelected ? inputClass : disabledInputClass} resize-none`} />

            {/* Captcha */}
            <div className="pt-6">
              <label className={`text-xs font-medium flex items-center gap-1.5 mb-2 ${filtersSelected ? "text-muted-foreground" : "text-muted-foreground/30"}`}>
                <ShieldCheck size={12} /> Проверка: {captcha.question}
              </label>
              <input
                type="text"
                placeholder="Ответ"
                required
                disabled={!filtersSelected}
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className={filtersSelected ? inputClass : disabledInputClass}
              />
            </div>

            <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <p className={`text-xs max-w-sm ${filtersSelected ? "text-muted-foreground" : "text-muted-foreground/30"}`}>
                Нажимая на кнопку, вы даете согласие на обработку{" "}
                <a href="/privacy" target="_blank" className="underline hover:text-foreground transition-colors">персональных данных</a>
              </p>
              <button type="submit" disabled={!filtersSelected || submitting}
                className={`btn-primary flex items-center gap-2 ${!filtersSelected ? "opacity-30 cursor-not-allowed" : ""}`}>
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? "Отправка..." : "Отправить"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
});

ContactForm.displayName = "ContactForm";

export default ContactForm;
