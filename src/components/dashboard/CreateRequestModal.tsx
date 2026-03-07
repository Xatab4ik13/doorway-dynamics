import { useState, useRef } from "react";
import { X, Send, Loader2, MapPin, Phone, User, FileText, Building2, Upload, Trash2, Handshake } from "lucide-react";
import { type ApiRequest, useUsers } from "@/hooks/useRequests";
import { requestTypeLabels } from "@/data/mockDashboard";
import { motion, AnimatePresence } from "framer-motion";
import AddressInput from "@/components/AddressInput";
import { uploadFile } from "@/lib/api";
import { formatPhone } from "@/lib/formatPhone";
import SearchableUserSelect from "@/components/dashboard/SearchableUserSelect";

const cities = ["Москва", "Санкт-Петербург"];

interface CreateRequestModalProps {
  onClose: () => void;
  onCreate: (data: Partial<ApiRequest>) => Promise<any>;
}

const CreateRequestModal = ({ onClose, onCreate }: CreateRequestModalProps) => {
  const { getByRole } = useUsers();
  const partners = getByRole("partner");
  
  const [type, setType] = useState<"measurement" | "installation" | "reclamation">("measurement");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [city, setCity] = useState("");
  const [extraName, setExtraName] = useState("");
  const [extraPhone, setExtraPhone] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [interiorDoors, setInteriorDoors] = useState("");
  const [entranceDoors, setEntranceDoors] = useState("");
  const [partitions, setPartitions] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<{ file: File; preview?: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Upload files if any
      let photos: { url: string; type: string; stage: string; uploaded_at: string }[] | undefined;
      if (files.length > 0) {
        setUploading(true);
        const uploaded = await Promise.all(
          files.map(async (f) => {
            const result = await uploadFile(f.file, "requests");
            return {
              url: result.url,
              type: f.file.type.startsWith("image/") ? "image" : "document",
              stage: "general",
              uploaded_at: new Date().toISOString(),
            };
          })
        );
        photos = uploaded;
        setUploading(false);
      }

      await onCreate({
        type,
        client_name: clientName,
        client_phone: clientPhone,
        client_address: clientAddress,
        city,
        extra_name: extraName || undefined,
        extra_phone: extraPhone || undefined,
        work_description: workDescription || undefined,
        source: partnerId ? "partner" : "site",
        partner_id: partnerId || undefined,
        ...(type === "installation" ? {
          interior_doors: interiorDoors ? parseInt(interiorDoors) : undefined,
          entrance_doors: entranceDoors ? parseInt(entranceDoors) : undefined,
          partitions: partitions ? parseInt(partitions) : undefined,
        } : {}),
        ...(photos ? { photos } : {}),
      });
      onClose();
    } catch {
      setUploading(false);
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
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
        <div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative bg-card shadow-2xl w-full max-w-lg overflow-auto rounded-t-2xl md:rounded-2xl h-[95vh] md:h-auto md:max-h-[90vh]"
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
              <AddressInput
                value={clientAddress}
                onChange={setClientAddress}
                city={city}
                placeholder="ул. Ленина, 15, кв. 42"
                className={inputClass("clientAddress")}
                error={errors.clientAddress}
              />
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

            {/* Partner */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Handshake size={12} /> Партнёр
              </label>
              <SearchableUserSelect
                value={partnerId}
                onChange={setPartnerId}
                users={partners}
                placeholder="Без партнёра (заявка с сайта)"
              />
            </div>

            {/* Door quantities — only for installation */}
            {type === "installation" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Количество изделий</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block text-center">Межкомнатные</label>
                    <input type="number" min="0" value={interiorDoors} onChange={(e) => setInteriorDoors(e.target.value)} className={inputClass("") + " text-center"} placeholder="0" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block text-center">Входные</label>
                    <input type="number" min="0" value={entranceDoors} onChange={(e) => setEntranceDoors(e.target.value)} className={inputClass("") + " text-center"} placeholder="0" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block text-center">Перегородка (кол-во створок)</label>
                    <input type="number" min="0" value={partitions} onChange={(e) => setPartitions(e.target.value)} className={inputClass("") + " text-center"} placeholder="0" />
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <FileText size={12} /> Описание работ
              </label>
              <textarea value={workDescription} onChange={(e) => setWorkDescription(e.target.value)} rows={3} className={inputClass("") + " resize-none"} placeholder="Опишите что нужно сделать..." />
            </div>

            {/* File upload */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Upload size={12} /> Файлы (необязательно)
              </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
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
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 border-2 border-dashed border-border rounded-xl text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all"
                >
                  Нажмите для выбора файлов
                </button>
                {files.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-accent/50 text-xs">
                        <span className="truncate flex-1">{f.file.name}</span>
                        <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive ml-2">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
