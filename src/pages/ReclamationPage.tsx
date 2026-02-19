import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ShieldCheck, Clock, CheckCircle, Phone, Upload, Trash2, Loader2 } from "lucide-react";
import AddressInput from "@/components/AddressInput";
import { formatPhone } from "@/lib/formatPhone";

const cities = [
  { id: "moscow", label: "Москва" },
  { id: "spb", label: "Санкт-Петербург" },
];

const ReclamationPage = () => {
  useEffect(() => {
    document.title = "Рекламация — бесплатная диагностика и устранение дефектов | PrimeDoor Service";
  }, []);

  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    description: "",
  });
  const [files, setFiles] = useState<{ file: File; preview?: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const cityMap: Record<string, string> = { moscow: "Москва", spb: "Санкт-Петербург" };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const API_URL = import.meta.env.VITE_API_URL || "https://api.primedoor.ru";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity) {
      toast.error("Пожалуйста, выберите город");
      return;
    }

    setSubmitting(true);
    try {
      // Upload files if any
      let photos: { url: string; type: string; stage: string; uploaded_at: string }[] | undefined;
      if (files.length > 0) {
        const uploaded = await Promise.all(
          files.map(async (f) => {
            const formData = new FormData();
            formData.append("file", f.file);
            const uploadRes = await fetch(`${API_URL}/api/upload/reclamation`, { method: "POST", body: formData });
            const result = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(result.error || "Ошибка загрузки файла");
            return {
              url: result.url,
              type: f.file.type.startsWith("image/") ? "image" : "document",
              stage: "general",
              uploaded_at: new Date().toISOString(),
            };
          })
        );
        photos = uploaded;
      }

      const res = await fetch(`${API_URL}/api/requests/public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: form.name,
          client_phone: form.phone,
          client_address: form.address,
          city: cityMap[selectedCity],
          type: "reclamation",
          work_description: form.description,
          source: "site",
          ...(photos ? { photos } : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка сервера");
      }

      toast.success("Заявка на рекламацию отправлена! Мы свяжемся с вами в ближайшее время.");
      setForm({ name: "", phone: "", address: "", description: "" });
      setSelectedCity(null);
      setFiles([]);
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
              <AddressInput
                value={form.address}
                onChange={(val) => setForm({ ...form, address: val })}
                city={selectedCity ? cityMap[selectedCity] : undefined}
                placeholder="Адрес"
                disabled={!selectedCity}
                className={selectedCity ? inputClass : disabledInputClass}
                dropdownClassName="absolute top-full left-0 right-0 z-50 bg-background border border-border shadow-lg"
              />

              <textarea
                placeholder="Опишите проблему"
                required
                disabled={!selectedCity}
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`${selectedCity ? inputClass : disabledInputClass} resize-none`}
              />

              {/* File upload */}
              <div className="pt-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  disabled={!selectedCity}
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files || []).map(f => ({
                      file: f,
                      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
                    }));
                    setFiles(prev => [...prev, ...newFiles]);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  disabled={!selectedCity}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full py-4 border border-dashed border-border text-xs uppercase tracking-[0.15em] text-muted-foreground hover:border-foreground/50 hover:text-foreground transition-all duration-300 flex items-center justify-center gap-2 ${!selectedCity ? "opacity-30 cursor-not-allowed" : ""}`}
                >
                  <Upload size={14} />
                  Прикрепить фото или документы
                </button>
                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 border border-border/50 text-xs text-muted-foreground">
                        <span className="truncate flex-1">{f.file.name}</span>
                        <button type="button" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-foreground ml-2">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <p className={`text-xs max-w-sm ${selectedCity ? "text-muted-foreground" : "text-muted-foreground/30"}`}>
                  Нажимая на кнопку, вы даете согласие на обработку{" "}
                  <a href="/privacy" target="_blank" className="underline hover:text-foreground transition-colors">персональных данных</a>
                </p>
                <button
                  type="submit"
                  disabled={!selectedCity || submitting}
                  className={`text-xs uppercase tracking-[0.15em] font-medium px-8 py-4 bg-foreground text-background hover:bg-foreground/80 transition-colors duration-300 flex items-center gap-2 ${!selectedCity || submitting ? "opacity-30 cursor-not-allowed" : ""}`}
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {submitting ? "Отправка..." : "Отправить заявку"}
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
