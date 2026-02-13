import { useState } from "react";
import { X, Send, Loader2, MapPin, Phone, User, FileText, Building2 } from "lucide-react";
import { type ApiRequest } from "@/hooks/useRequests";
import { requestTypeLabels } from "@/data/mockDashboard";
import { motion, AnimatePresence } from "framer-motion";

const cities = ["Москва", "Санкт-Петербург"];

interface CreateRequestModalProps {
  onClose: () => void;
  onCreate: (data: Partial<ApiRequest>) => Promise<any>;
}

const CreateRequestModal = ({ onClose, onCreate }: CreateRequestModalProps) => {
  const [type, setType] = useState<"measurement" | "installation" | "reclamation">("measurement");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [city, setCity] = useState("");
  const [extraName, setExtraName] = useState("");
  const [extraPhone, setExtraPhone] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length === 0) return "";
    let formatted = "+7";
    if (digits.length > 1) formatted += " " + digits.slice(1, 4);
    if (digits.length > 4) formatted += " " + digits.slice(4, 7);
    if (digits.length > 7) formatted += " " + digits.slice(7, 9);
    if (digits.length > 9) formatted += " " + digits.slice(9, 11);
    return formatted;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!clientName.trim()) e.clientName = "Обязательно";
    if (clientPhone.replace(/\D/g, "").length < 11) e.clientPhone = "Некорректный номер";
    if (!clientAddress.trim()) e.clientAddress = "Обязательно";
    if (!city) e.city = "Выберите город";
    return e;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    try {
      await onCreate({
        type,
        client_name: clientName,
        client_phone: clientPhone,
        client_address: clientAddress,
        city,
        extra_name: extraName || undefined,
        extra_phone: extraPhone || undefined,
        work_description: workDescription || undefined,
        source: "site",
      });
      onClose();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
      errors[field] ? "border-destructive ring-1 ring-destructive/20" : "border-border hover:border-primary/40"
    }`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
          className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto"
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-lg font-heading font-bold">Новая заявка</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-accent transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Type */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Тип заявки</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(requestTypeLabels) as [string, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setType(key as any)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium transition-all ${
                      type === key
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                        : "bg-accent text-muted-foreground hover:text-foreground hover:bg-accent/80"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Client name */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <User size={12} /> Имя клиента <span className="text-destructive">*</span>
              </label>
              <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputClass("clientName")} placeholder="Иванов Иван Иванович" />
              {errors.clientName && <p className="text-xs text-destructive mt-1">{errors.clientName}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Phone size={12} /> Телефон <span className="text-destructive">*</span>
              </label>
              <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(formatPhone(e.target.value))} className={inputClass("clientPhone")} placeholder="+7 999 999 99 99" />
              {errors.clientPhone && <p className="text-xs text-destructive mt-1">{errors.clientPhone}</p>}
            </div>

            {/* City */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Building2 size={12} /> Город <span className="text-destructive">*</span>
              </label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className={inputClass("city")}>
                <option value="">Выберите город</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <MapPin size={12} /> Адрес <span className="text-destructive">*</span>
              </label>
              <input type="text" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className={inputClass("clientAddress")} placeholder="ул. Ленина, 15, кв. 42" />
              {errors.clientAddress && <p className="text-xs text-destructive mt-1">{errors.clientAddress}</p>}
            </div>

            {/* Extra contact */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Доп. контакт</label>
                <input type="text" value={extraName} onChange={(e) => setExtraName(e.target.value)} className={inputClass("")} placeholder="ФИО" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Доп. телефон</label>
                <input type="tel" value={extraPhone} onChange={(e) => setExtraPhone(formatPhone(e.target.value))} className={inputClass("")} placeholder="+7 ..." />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <FileText size={12} /> Описание работ
              </label>
              <textarea value={workDescription} onChange={(e) => setWorkDescription(e.target.value)} rows={3} className={inputClass("") + " resize-none"} placeholder="Опишите что нужно сделать..." />
            </div>
          </div>

          <div className="flex justify-end gap-3 p-5 border-t border-border">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-accent text-foreground hover:bg-accent/80 transition-colors">
              Отмена
            </button>
            <button onClick={handleSubmit} disabled={saving}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/25 disabled:opacity-50 flex items-center gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Создать
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateRequestModal;
