import { useEffect, useState } from "react";
import { X, Save, Loader2, Upload, FileText, Trash2, Eye, Phone, Calendar, MapPin, Car, IdCard, StickyNote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api, { uploadFile } from "@/lib/api";
import FileViewer from "./FileViewer";

interface FileEntry {
  url: string;
  key: string;
  name: string;
  uploaded_at?: string;
}

interface EmployeeProfile {
  user_id: number;
  name: string;
  role: string;
  full_name: string | null;
  phone: string | null;
  birth_date: string | null;
  city: string | null;
  car_plate: string | null;
  passport_files: FileEntry[];
  license_files: FileEntry[];
  comment: string | null;
}

interface Props {
  userId: string | number;
  userName: string;
  onClose: () => void;
}

const EmployeeProfileModal = ({ userId, userName, onClose }: Props) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingTo, setUploadingTo] = useState<"passport" | "license" | null>(null);
  const [viewingFile, setViewingFile] = useState<{ url: string; type?: string } | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [city, setCity] = useState("");
  const [carPlate, setCarPlate] = useState("");
  const [comment, setComment] = useState("");
  const [passportFiles, setPassportFiles] = useState<FileEntry[]>([]);
  const [licenseFiles, setLicenseFiles] = useState<FileEntry[]>([]);

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 hover:border-primary/40 transition-all";

  useEffect(() => {
    (async () => {
      try {
        const data = await api<EmployeeProfile>(`/api/employee-profiles/${userId}`, { auth: true });
        setFullName(data.full_name || data.name || "");
        setPhone(data.phone || "");
        setBirthDate(data.birth_date ? data.birth_date.split("T")[0] : "");
        setCity(data.city || "");
        setCarPlate(data.car_plate || "");
        setComment(data.comment || "");
        setPassportFiles(Array.isArray(data.passport_files) ? data.passport_files : []);
        setLicenseFiles(Array.isArray(data.license_files) ? data.license_files : []);
      } catch (err: any) {
        toast.error(err.message || "Ошибка загрузки карточки");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const handleUpload = async (kind: "passport" | "license", files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingTo(kind);
    const uploaded: FileEntry[] = [];
    try {
      for (const file of Array.from(files)) {
        const { url, key } = await uploadFile(file, "employees");
        uploaded.push({ url, key, name: file.name, uploaded_at: new Date().toISOString() });
      }
      if (kind === "passport") setPassportFiles((prev) => [...prev, ...uploaded]);
      else setLicenseFiles((prev) => [...prev, ...uploaded]);
      toast.success(`Загружено: ${uploaded.length}`);
    } catch (err: any) {
      toast.error(err.message || "Ошибка загрузки");
    } finally {
      setUploadingTo(null);
    }
  };

  const removeFile = (kind: "passport" | "license", idx: number) => {
    if (kind === "passport") setPassportFiles((prev) => prev.filter((_, i) => i !== idx));
    else setLicenseFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api(`/api/employee-profiles/${userId}`, {
        method: "PUT",
        auth: true,
        body: {
          full_name: fullName || null,
          phone: phone || null,
          birth_date: birthDate || null,
          city: city || null,
          car_plate: carPlate || null,
          passport_files: passportFiles,
          license_files: licenseFiles,
          comment: comment || null,
        },
      });
      toast.success("Карточка сохранена");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const FileList = ({ kind, files }: { kind: "passport" | "license"; files: FileEntry[] }) => (
    <div className="space-y-2">
      {files.map((f, i) => (
        <div key={f.key || i} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-background">
          <FileText size={16} className="text-muted-foreground shrink-0" />
          <span className="flex-1 text-xs truncate">{f.name}</span>
          <button
            type="button"
            onClick={() => setViewingFile({ url: f.url })}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
            title="Просмотр"
          >
            <Eye size={14} />
          </button>
          <button
            type="button"
            onClick={() => removeFile(kind, i)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Убрать из карточки"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      {files.length === 0 && (
        <p className="text-xs text-muted-foreground italic">Файлы не загружены</p>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
            <div>
              <h2 className="text-lg font-heading font-bold">Карточка сотрудника</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{userName}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground">
              <X size={20} />
            </button>
          </div>

          {loading ? (
            <div className="p-10 flex justify-center">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">ФИО</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} placeholder="Иванов Иван Иванович" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <Phone size={12} /> Телефон
                    </label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+7 999 999 99 99" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <Calendar size={12} /> Дата рождения
                    </label>
                    <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <MapPin size={12} /> Город
                    </label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="Москва" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <Car size={12} /> Гос. номер авто
                    </label>
                    <input type="text" value={carPlate} onChange={(e) => setCarPlate(e.target.value.toUpperCase())} className={inputClass} placeholder="А123БВ77" />
                  </div>
                </div>

                {/* Паспорт */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <IdCard size={12} /> Паспорт
                    </label>
                    <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                      {uploadingTo === "passport" ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                      Загрузить
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => { handleUpload("passport", e.target.files); e.target.value = ""; }}
                        disabled={uploadingTo !== null}
                      />
                    </label>
                  </div>
                  <FileList kind="passport" files={passportFiles} />
                </div>

                {/* ВУ */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <IdCard size={12} /> Водительское удостоверение
                    </label>
                    <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                      {uploadingTo === "license" ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                      Загрузить
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => { handleUpload("license", e.target.files); e.target.value = ""; }}
                        disabled={uploadingTo !== null}
                      />
                    </label>
                  </div>
                  <FileList kind="license" files={licenseFiles} />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <StickyNote size={12} /> Комментарий
                  </label>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className={inputClass + " resize-none"} placeholder="Любая дополнительная информация..." />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-5 border-t border-border sticky bottom-0 bg-card">
                <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-accent text-foreground hover:bg-accent/80 transition-colors">
                  Отмена
                </button>
                <button onClick={handleSave} disabled={saving || uploadingTo !== null}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/25 disabled:opacity-50 flex items-center gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Сохранить</>}
                </button>
              </div>
            </>
          )}
        </motion.div>

        {viewingFile && (
          <FileViewer url={viewingFile.url} type={viewingFile.type} onClose={() => setViewingFile(null)} />
        )}
      </div>
    </AnimatePresence>
  );
};

export default EmployeeProfileModal;
