import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  // Ensure starts with 7
  const d = digits.startsWith("7") ? digits : digits.startsWith("8") ? "7" + digits.slice(1) : "7" + digits;
  let result = "+7";
  if (d.length > 1) result += " " + d.slice(1, 4);
  if (d.length > 4) result += " " + d.slice(4, 7);
  if (d.length > 7) result += " " + d.slice(7, 9);
  if (d.length > 9) result += " " + d.slice(9, 11);
  return result;
};

const cities = [
  { id: "moscow", label: "Москва" },
  { id: "spb", label: "Санкт-Петербург" },
];

const requestTypes = [
  { id: "measurement", label: "Заявка на замер" },
  { id: "installation", label: "Заявка на монтаж" },
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

  const [form, setForm] = useState({
    name: "",
    phone: "",
    extraName: "",
    extraPhone: "",
    address: "",
    workDescription: "",
  });

  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addressTimeout = useRef<ReturnType<typeof setTimeout>>();

  const filtersSelected = selectedCity && selectedType;

  const handleAddressChange = (value: string) => {
    setForm({ ...form, address: value });
    if (addressTimeout.current) clearTimeout(addressTimeout.current);
    if (value.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    addressTimeout.current = setTimeout(() => {
      const city = selectedCity === "moscow" ? "Москва" : "Санкт-Петербург";
      setAddressSuggestions([
        `${city}, ул. ${value}`,
        `${city}, пр-т ${value}`,
        `${city}, ${value}, д. 1`,
      ]);
      setShowSuggestions(true);
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filtersSelected) {
      toast.error("Пожалуйста, выберите город и тип заявки");
      return;
    }
    toast.success("Заявка отправлена! Мы свяжемся с вами в ближайшее время.");
    setForm({ name: "", phone: "", extraName: "", extraPhone: "", address: "", workDescription: "" });
    setSelectedCity(null);
    setSelectedType(null);
  };

  const inputClass =
    "w-full bg-transparent border-b border-border py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors duration-500";

  const disabledInputClass =
    "w-full bg-transparent border-b border-border/50 py-4 text-sm text-muted-foreground/40 placeholder:text-muted-foreground/30 cursor-not-allowed";

  const actionLabel = selectedType === "measurement" ? "Что замеряем" : selectedType === "installation" ? "Что монтируем" : "Опишите задачу";

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

          {/* Form — always visible, disabled until filters selected */}
          <form onSubmit={handleSubmit} className="space-y-0 relative">
            {/* Overlay blocker when filters not selected */}
            {!filtersSelected && (
              <div className="absolute inset-0 z-10 cursor-not-allowed" onClick={() => toast.info("Сначала выберите город и тип заявки")} />
            )}

            <input
              type="text"
              placeholder="ФИО"
              required
              disabled={!filtersSelected}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={filtersSelected ? inputClass : disabledInputClass}
            />
            <input
              type="tel"
              placeholder="+7 ___ ___ __ __"
              required
              disabled={!filtersSelected}
              value={form.phone}
              onFocus={(e) => { if (!e.target.value) setForm({ ...form, phone: "+7" }); }}
              onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
              className={filtersSelected ? inputClass : disabledInputClass}
            />

            <div className="pt-6 pb-2">
              <p className={`text-xs uppercase tracking-[0.15em] ${filtersSelected ? "text-muted-foreground" : "text-muted-foreground/30"}`}>
                Доп. контакт
              </p>
            </div>

            <input
              type="text"
              placeholder="ФИО доп. контакта"
              disabled={!filtersSelected}
              value={form.extraName}
              onChange={(e) => setForm({ ...form, extraName: e.target.value })}
              className={filtersSelected ? inputClass : disabledInputClass}
            />
            <input
              type="tel"
              placeholder="+7 ___ ___ __ __"
              disabled={!filtersSelected}
              value={form.extraPhone}
              onFocus={(e) => { if (!e.target.value) setForm({ ...form, extraPhone: "+7" }); }}
              onChange={(e) => setForm({ ...form, extraPhone: formatPhone(e.target.value) })}
              className={filtersSelected ? inputClass : disabledInputClass}
            />

            {/* Address */}
            <div className="relative">
              <input
                type="text"
                placeholder="Адрес"
                required
                disabled={!filtersSelected}
                value={form.address}
                onChange={(e) => handleAddressChange(e.target.value)}
                onFocus={() => form.address.length >= 3 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className={filtersSelected ? inputClass : disabledInputClass}
              />
              <AnimatePresence>
                {showSuggestions && addressSuggestions.length > 0 && filtersSelected && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 z-50 bg-background border border-border shadow-lg"
                  >
                    {addressSuggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        className="w-full text-left px-4 py-3 text-sm text-foreground/80 hover:bg-secondary/50 transition-colors duration-200"
                        onMouseDown={() => {
                          setForm({ ...form, address: s });
                          setShowSuggestions(false);
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Work description - free text */}
            <textarea
              placeholder={actionLabel}
              required
              disabled={!filtersSelected}
              rows={3}
              value={form.workDescription}
              onChange={(e) => setForm({ ...form, workDescription: e.target.value })}
              className={`${filtersSelected ? inputClass : disabledInputClass} resize-none`}
            />

            <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <p className={`text-xs max-w-sm ${filtersSelected ? "text-muted-foreground" : "text-muted-foreground/30"}`}>
                Нажимая на кнопку, вы даете согласие на обработку персональных данных
              </p>
              <button
                type="submit"
                disabled={!filtersSelected}
                className={`btn-primary ${!filtersSelected ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                Отправить
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
