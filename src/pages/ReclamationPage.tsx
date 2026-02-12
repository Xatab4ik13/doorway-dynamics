import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ShieldCheck, Clock, CheckCircle, Phone } from "lucide-react";

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "");
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

const ReclamationPage = () => {
  useEffect(() => {
    document.title = "Рекламация — бесплатная диагностика и устранение дефектов | PrimeDoor Service";
  }, []);

  const formRef = useRef<HTMLDivElement>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    description: "",
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

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity) {
      toast.error("Пожалуйста, выберите город");
      return;
    }
    toast.success("Заявка на рекламацию отправлена! Мы свяжемся с вами в ближайшее время.");
    setForm({ name: "", phone: "", address: "", description: "" });
    setSelectedCity(null);
  };

  const inputClass =
    "w-full bg-transparent border-b border-border py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors duration-500";
  const disabledInputClass =
    "w-full bg-transparent border-b border-border/50 py-4 text-sm text-muted-foreground/40 placeholder:text-muted-foreground/30 cursor-not-allowed";

  const benefits = [
    {
      icon: ShieldCheck,
      title: "Бесплатная диагностика",
      text: "Мастер выезжает на объект, осматривает дверь и определяет причину неисправности — без каких-либо затрат с вашей стороны.",
    },
    {
      icon: Clock,
      title: "Оперативный выезд",
      text: "Мы свяжемся с вами в течение 24 часов после подачи заявки и назначим удобное время визита мастера.",
    },
    {
      icon: CheckCircle,
      title: "Гарантийные обязательства",
      text: "Если дефект возник по вине монтажа — устранение выполняется бесплатно в рамках гарантии.",
    },
    {
      icon: Phone,
      title: "Прозрачные условия",
      text: "Если неисправность не является гарантийным случаем — мастер озвучит стоимость ремонта до начала работ.",
    },
  ];

  return (
    <main className="pt-28 pb-24">
      {/* Hero */}
      <section className="px-6 md:px-10 pb-20 md:pb-32">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Бесплатная услуга</p>
            <h1 className="text-3xl md:text-5xl font-heading font-bold uppercase tracking-tight mb-6">
              Рекламация
            </h1>
            <p className="text-foreground/70 text-lg md:text-xl max-w-2xl leading-relaxed mb-8">
              Если после установки двери вы обнаружили дефект или неисправность — оставьте заявку на рекламацию. 
              Диагностика и выезд мастера абсолютно <strong className="text-foreground">бесплатны</strong>.
            </p>
            <button
              onClick={scrollToForm}
              className="text-xs uppercase tracking-[0.15em] font-medium px-6 py-3 bg-foreground text-background hover:bg-foreground/80 transition-colors duration-300"
            >
              Оставить заявку
            </button>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-6 md:px-10 pb-24 md:pb-40">
        <div className="max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-lg md:text-2xl font-medium uppercase tracking-[0.3em] text-foreground mb-12"
          >
            Как это работает
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="flex gap-5"
              >
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-border rounded-lg">
                  <b.icon className="w-5 h-5 text-foreground/70" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process steps */}
      <section className="px-6 md:px-10 pb-24 md:pb-40">
        <div className="max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-lg md:text-2xl font-medium uppercase tracking-[0.3em] text-foreground mb-12"
          >
            Этапы рекламации
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Заявка", text: "Заполните форму ниже или позвоните нам" },
              { step: "02", title: "Согласование", text: "Мы свяжемся с вами и назначим время визита" },
              { step: "03", title: "Диагностика", text: "Мастер осмотрит дверь и определит причину" },
              { step: "04", title: "Устранение", text: "Ремонт на месте или согласование сроков" },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="border border-border rounded-2xl p-6"
              >
                <span className="text-3xl font-heading font-bold text-foreground/20 mb-3 block">{s.step}</span>
                <h4 className="font-heading font-semibold mb-2">{s.title}</h4>
                <p className="text-sm text-muted-foreground">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-24 md:py-40 px-6 md:px-10" ref={formRef}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">Бесплатно</p>
            <h2 className="text-2xl md:text-4xl font-heading font-bold uppercase tracking-tight mb-16">
              Заявка на рекламацию
            </h2>

            {/* City */}
            <div className="mb-10">
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

            <form onSubmit={handleSubmit} className="space-y-0 relative">
              {!selectedCity && (
                <div
                  className="absolute inset-0 z-10 cursor-not-allowed"
                  onClick={() => toast.info("Сначала выберите город")}
                />
              )}

              <input
                type="text"
                placeholder="ФИО"
                required
                disabled={!selectedCity}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={selectedCity ? inputClass : disabledInputClass}
              />
              <input
                type="tel"
                placeholder="+7 ___ ___ __ __"
                required
                disabled={!selectedCity}
                value={form.phone}
                onFocus={(e) => { if (!e.target.value) setForm({ ...form, phone: "+7" }); }}
                onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
                className={selectedCity ? inputClass : disabledInputClass}
              />

              {/* Address */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Адрес"
                  required
                  disabled={!selectedCity}
                  value={form.address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  onFocus={() => form.address.length >= 3 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className={selectedCity ? inputClass : disabledInputClass}
                />
                <AnimatePresence>
                  {showSuggestions && addressSuggestions.length > 0 && selectedCity && (
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

              <textarea
                placeholder="Опишите проблему"
                required
                disabled={!selectedCity}
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`${selectedCity ? inputClass : disabledInputClass} resize-none`}
              />

              <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <p className={`text-xs max-w-sm ${selectedCity ? "text-muted-foreground" : "text-muted-foreground/30"}`}>
                  Нажимая на кнопку, вы даете согласие на обработку{" "}
                  <a href="/privacy" target="_blank" className="underline hover:text-foreground transition-colors">персональных данных</a>
                </p>
                <button
                  type="submit"
                  disabled={!selectedCity}
                  className={`text-xs uppercase tracking-[0.15em] font-medium px-8 py-4 bg-foreground text-background hover:bg-foreground/80 transition-colors duration-300 ${!selectedCity ? "opacity-30 cursor-not-allowed" : ""}`}
                >
                  Отправить заявку
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Рекламация — PrimeDoor Service",
          "description": "Бесплатная диагностика и устранение дефектов после установки дверей",
          "provider": { "@type": "Organization", "name": "PrimeDoor Service" },
          "areaServed": ["Москва", "Санкт-Петербург"],
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "RUB", "description": "Бесплатный выезд мастера на диагностику" },
        })
      }} />
    </main>
  );
};

export default ReclamationPage;
