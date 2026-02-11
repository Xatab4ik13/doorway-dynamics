import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";

const cities = [
  { id: "moscow", label: "Москва" },
  { id: "spb", label: "Санкт-Петербург" },
];

const requestTypes = [
  { id: "measurement", label: "Заявка на замер" },
  { id: "installation", label: "Заявка на монтаж" },
];

const workItems = [
  "Межкомнатные двери",
  "Входные двери",
  "Перегородка",
  "Портал",
  "Плинтуса",
  "Стеновые панели",
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
    workType: "",
  });

  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addressTimeout = useRef<ReturnType<typeof setTimeout>>();

  const handleAddressChange = (value: string) => {
    setForm({ ...form, address: value });

    if (addressTimeout.current) clearTimeout(addressTimeout.current);

    if (value.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // DaData-style suggestions (local mock for now, can be replaced with real API)
    addressTimeout.current = setTimeout(() => {
      const city = selectedCity === "moscow" ? "Москва" : "Санкт-Петербург";
      const mockSuggestions = [
        `${city}, ул. ${value}`,
        `${city}, пр-т ${value}`,
        `${city}, ${value}, д. 1`,
      ];
      setAddressSuggestions(mockSuggestions);
      setShowSuggestions(true);
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity || !selectedType) {
      toast.error("Пожалуйста, выберите город и тип заявки");
      return;
    }
    toast.success("Заявка отправлена! Мы свяжемся с вами в ближайшее время.");
    setForm({ name: "", phone: "", extraName: "", extraPhone: "", address: "", workType: "" });
    setSelectedCity(null);
    setSelectedType(null);
  };

  const inputClass =
    "w-full bg-transparent border-b border-border py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors duration-500";

  const selectClass =
    `w-full bg-transparent border-b border-border py-4 text-sm text-foreground focus:outline-none focus:border-foreground transition-colors duration-500 appearance-none cursor-pointer bg-background [&>option]:bg-background [&>option]:text-foreground`;

  const actionLabel = selectedType === "measurement" ? "Что мерим" : "Что монтируем";

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
          <AnimatePresence>
            {selectedCity && (
              <motion.div
                initial={{ opacity: 0, y: 15, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-10 overflow-hidden"
              >
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form fields */}
          <AnimatePresence>
            {selectedCity && selectedType && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
              >
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
                    type="tel"
                    placeholder="Номер телефона"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={inputClass}
                  />

                  {/* Separator */}
                  <div className="pt-6 pb-2">
                    <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Доп. контакт</p>
                  </div>

                  <input
                    type="text"
                    placeholder="ФИО доп. контакта"
                    value={form.extraName}
                    onChange={(e) => setForm({ ...form, extraName: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    type="tel"
                    placeholder="Номер доп. контакта"
                    value={form.extraPhone}
                    onChange={(e) => setForm({ ...form, extraPhone: e.target.value })}
                    className={inputClass}
                  />

                  {/* Address with suggestions */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Адрес"
                      required
                      value={form.address}
                      onChange={(e) => handleAddressChange(e.target.value)}
                      onFocus={() => form.address.length >= 3 && setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className={inputClass}
                    />
                    <AnimatePresence>
                      {showSuggestions && addressSuggestions.length > 0 && (
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

                  {/* Work type select */}
                  <div className="relative">
                    <select
                      required
                      value={form.workType}
                      onChange={(e) => setForm({ ...form, workType: e.target.value })}
                      className={selectClass}
                    >
                      <option value="" disabled>
                        {actionLabel}
                      </option>
                      {workItems.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>

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
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
});

ContactForm.displayName = "ContactForm";

export default ContactForm;
