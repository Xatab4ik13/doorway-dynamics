import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Send, MapPin, FileText, Upload, X, CheckCircle2 } from "lucide-react";

const requestTypes = [
  { value: "measurement", label: "Замер", desc: "Выезд специалиста для замера проёмов" },
  { value: "installation", label: "Монтаж", desc: "Установка дверей на объекте" },
  { value: "reclamation", label: "Рекламация", desc: "Гарантийное обслуживание" },
];

const cities = ["Москва", "Санкт-Петербург", "Казань", "Екатеринбург", "Новосибирск", "Краснодар"];

const PartnerNewRequest = () => {
  const [type, setType] = useState("measurement");
  const [city, setCity] = useState("");
  const [objectName, setObjectName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [contactName, setContactName] = useState("");
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [agree, setAgree] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { document.title = "Новая заявка — Партнёр"; }, []);

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const addMockFile = () => {
    const mockNames = ["план_объекта.pdf", "фото_проёмов.jpg", "ТЗ_двери.docx", "чертёж.dwg"];
    setFiles((prev) => [...prev, mockNames[prev.length % mockNames.length]]);
  };

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!city) e.city = "Выберите город";
    if (!objectName.trim()) e.objectName = "Укажите название объекта";
    if (!address.trim()) e.address = "Укажите адрес";
    if (phone.replace(/\D/g, "").length < 11) e.phone = "Введите корректный номер";
    if (type !== "reclamation" && !contactName.trim()) e.contactName = "Укажите контактное лицо";
    if (type === "reclamation" && !comment.trim()) e.comment = "Опишите проблему";
    if (!agree) e.agree = "Необходимо согласие";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitted(true);
    toast.success("Заявка успешно отправлена!");
  };

  const handleReset = () => {
    setType("measurement");
    setCity("");
    setObjectName("");
    setAddress("");
    setPhone("");
    setContactName("");
    setComment("");
    setFiles([]);
    setAgree(false);
    setSubmitted(false);
    setErrors({});
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring ${
      errors[field] ? "border-destructive" : "border-border"
    }`;

  if (submitted) {
    return (
      <DashboardLayout role="partner" userName="ООО РемонтПро">
        <div className="max-w-lg mx-auto mt-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-heading font-bold">Заявка отправлена!</h1>
          <p className="text-muted-foreground text-sm">
            Ваша заявка принята в обработку. Вы можете отслеживать её статус в разделе «Мои заявки».
          </p>
          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-accent text-foreground hover:bg-accent/80 transition-colors"
            >
              Создать ещё
            </button>
            <a
              href="/partner"
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-block"
            >
              К моим заявкам
            </a>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="partner" userName="ООО РемонтПро">
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-heading font-bold">Новая заявка</h1>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Request type */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Тип заявки</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {requestTypes.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`p-3 rounded-lg text-left transition-colors border-2 ${
                        type === t.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <p className={`text-sm font-medium ${type === t.value ? "text-primary" : ""}`}>{t.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* City */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Город <span className="text-destructive">*</span>
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputClass("city")}
                >
                  <option value="">Выберите город</option>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
              </div>

              {/* Object name */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Название объекта <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={objectName}
                  onChange={(e) => setObjectName(e.target.value)}
                  className={inputClass("objectName")}
                  placeholder="ЖК Солнечный, кв. 42"
                />
                {errors.objectName && <p className="text-xs text-destructive mt-1">{errors.objectName}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1">
                  <MapPin size={14} /> Адрес <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputClass("address")}
                  placeholder="ул. Ленина, 15"
                />
                {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Телефон на объекте <span className="text-destructive">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  className={inputClass("phone")}
                  placeholder="+7 999 999 99 99"
                />
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
              </div>

              {/* Contact name (hidden for reclamation) */}
              {type !== "reclamation" && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Контактное лицо <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className={inputClass("contactName")}
                    placeholder="Иванов Иван Иванович"
                  />
                  {errors.contactName && <p className="text-xs text-destructive mt-1">{errors.contactName}</p>}
                </div>
              )}

              {/* Comment */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  {type === "reclamation" ? "Описание проблемы" : "Комментарий"}{" "}
                  {type === "reclamation" && <span className="text-destructive">*</span>}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className={inputClass("comment") + " resize-none"}
                  placeholder={type === "reclamation" ? "Опишите проблему подробно..." : "Дополнительная информация..."}
                />
                {errors.comment && <p className="text-xs text-destructive mt-1">{errors.comment}</p>}
              </div>

              {/* Files */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                  <FileText size={14} /> Документы и файлы
                </label>
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {files.map((f, i) => (
                      <span key={i} className="flex items-center gap-1 px-2.5 py-1.5 bg-accent rounded-lg text-xs">
                        📎 {f}
                        <button type="button" onClick={() => removeFile(i)} className="hover:text-destructive">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={addMockFile}
                  className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Upload size={16} /> Прикрепить файл
                </button>
              </div>

              {/* Agreement */}
              <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-lg border transition-colors ${
                errors.agree ? "border-destructive" : "border-border hover:bg-accent/50"
              }`}>
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="h-4 w-4 mt-0.5 rounded border-primary text-primary focus:ring-primary"
                />
                <span className="text-xs text-muted-foreground">
                  Я согласен(а) с{" "}
                  <a href="/privacy" className="text-primary underline" target="_blank">политикой конфиденциальности</a>{" "}
                  и даю согласие на обработку персональных данных
                </span>
              </label>
              {errors.agree && <p className="text-xs text-destructive -mt-3">{errors.agree}</p>}

              {/* Submit */}
              <button
                type="submit"
                className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Send size={16} /> Отправить заявку
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PartnerNewRequest;
