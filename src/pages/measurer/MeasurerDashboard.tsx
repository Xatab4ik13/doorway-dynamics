import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels, statusColors, type RequestStatus } from "@/data/mockDashboard";
import { Phone, MapPin, Calendar, Upload, CheckCircle2, FileText, Camera, X, ChevronRight, AlertCircle, Loader2, Briefcase } from "lucide-react";
import { useRequests, type ApiRequest } from "@/hooks/useRequests";
import { useAuth } from "@/contexts/AuthContext";
import { uploadFile } from "@/lib/api";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const MeasurerDashboard = () => {
  const { user } = useAuth();
  const { requests, loading, updateRequest } = useRequests();
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState<ApiRequest | null>(null);

  const [measurementNotes, setMeasurementNotes] = useState("");
  
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [agreedDate, setAgreedDate] = useState("");
  const [dateConfirmed, setDateConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  useEffect(() => { document.title = "Мои заявки — Замерщик"; }, []);

  const handleSelectRequest = (r: ApiRequest) => {
    setSelected(r);
    setMeasurementNotes("");
    setMeasurementNotes(r.notes || "");
    setUploadedFiles([]);
    setAgreedDate(r.agreed_date?.split("T")[0] || "");
    setDateConfirmed(!!r.agreed_date);
    setRescheduleOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    let success = 0;
    let failed = 0;
    try {
      for (const file of files) {
        try {
          const { url } = await uploadFile(file, "measurements");
          setUploadedFiles(prev => [...prev, url]);
          success++;
        } catch {
          failed++;
        }
      }
      if (success > 0) toast.success(`Загружено: ${success}`);
      if (failed > 0) toast.error(`Не удалось: ${failed}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmDate = async () => {
    if (!agreedDate || !selected) return;
    try {
      const updated = await updateRequest(selected.id, { agreed_date: agreedDate, status: "date_agreed" as any });
      setDateConfirmed(true);
      setSelected(updated);
      toast.success("Дата согласована");
    } catch {}
  };

  const canComplete = dateConfirmed && measurementNotes.trim() && uploadedFiles.length > 0;

  const handleComplete = async () => {
    if (!selected || !canComplete) return;
    try {
      const newPhotos = uploadedFiles.map(url => ({ url, type: "image", stage: "general", uploaded_at: new Date().toISOString() }));
      const existingPhotos = selected.photos || [];
      await updateRequest(selected.id, {
        status: "measurement_done" as any,
        notes: measurementNotes,
        photos: [...existingPhotos, ...newPhotos] as any,
      });
      setSelected(null);
      toast.success("Замер завершён");
    } catch {}
  };

  const activeRequests = requests.filter((r) => !["measurement_done", "closed", "cancelled"].includes(r.status));
  const doneRequests = requests.filter((r) => ["measurement_done", "closed"].includes(r.status));

  return (
    <DashboardLayout role="measurer" userName={user?.name || "Замерщик"}>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Мои заявки</h1>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={32} /></div>
        ) : activeRequests.length === 0 && doneRequests.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Нет активных заявок</CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {activeRequests.map((r) => (
              <Card
                key={r.id}
                className={`hover:shadow-md transition-shadow cursor-pointer border-l-4 ${
                  selected?.id === r.id ? "border-l-primary ring-2 ring-primary/20" : "border-l-amber-400"
                }`}
                onClick={() => handleSelectRequest(r)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-mono text-xs text-muted-foreground">{r.number}</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status as RequestStatus] || "bg-gray-100"}`}>
                          {statusLabels[r.status as RequestStatus] || r.status}
                        </span>
                        {r.partner_id && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                            <Briefcase size={10} /> {r.partner_name || "Партнёр"}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold">{r.client_name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin size={12} /> 
                        <a href={`https://yandex.ru/maps/?text=${encodeURIComponent(r.client_address + (r.city ? ", " + r.city : ""))}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{r.client_address}</a>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone size={12} /> <a href={`tel:${r.client_phone?.replace(/\s/g, "")}`} className="text-primary hover:underline">{r.client_phone}</a>
                      </div>
                      {r.agreed_date && (
                        <div className="flex items-center gap-1 text-xs text-primary font-medium">
                          <Calendar size={12} /> Согласовано: {r.agreed_date.split("T")[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar size={14} />
                      <span className="text-xs">{r.created_at?.split("T")[0]}</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {doneRequests.length > 0 && (
              <>
                <h2 className="text-sm font-medium text-muted-foreground mt-4 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" /> Замер выполнен
                </h2>
                {doneRequests.map((r) => (
                  <Card key={r.id} className="border-l-4 border-l-green-400 opacity-70">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-mono text-xs text-muted-foreground">{r.number}</p>
                        <p className="font-medium text-sm">{r.client_name}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status as RequestStatus] || "bg-gray-100"}`}>
                        {statusLabels[r.status as RequestStatus] || r.status}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}

        {selected && (
          <>
            {isMobile && (
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="fixed inset-0 z-[84] bg-foreground/40"
                aria-label="Закрыть заявку"
              />
            )}
            <Card className={`border-t-4 border-t-primary bg-card ${isMobile ? "fixed inset-x-2 top-[calc(env(safe-area-inset-top,0px)+8px)] bottom-[calc(env(safe-area-inset-bottom,0px)+8px)] z-[85] overflow-y-auto shadow-2xl" : ""}`}>
              <CardContent className="p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-mono text-xs text-muted-foreground">{selected.number}</p>
                    {selected.partner_id && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                        <Briefcase size={10} /> {selected.partner_name || "Партнёр"}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-heading font-bold mt-1">{selected.client_name}</h2>
                  <p className="text-sm text-muted-foreground">
                    <a href={`https://yandex.ru/maps/?text=${encodeURIComponent(selected.client_address + (selected.city ? ", " + selected.city : ""))}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{selected.client_address}</a>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <a href={`tel:${selected.client_phone?.replace(/\s/g, "")}`} className="text-primary hover:underline">{selected.client_phone}</a>
                  </p>
                  {selected.extra_name && (
                    <div className="mt-2 p-2 rounded-lg bg-accent/50">
                      <p className="text-xs text-muted-foreground">Доп. контакт</p>
                      <p className="text-sm font-medium">{selected.extra_name}</p>
                      {selected.extra_phone && <p className="text-xs text-muted-foreground">{selected.extra_phone}</p>}
                    </div>
                  )}
                </div>
                <button onClick={() => setSelected(null)} className="p-1 hover:bg-accent rounded"><X size={18} /></button>
              </div>

              {/* Notes from admin/manager */}
              {selected.notes && (
                <div className="p-4 rounded-xl bg-accent/30 border border-border">
                  <p className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">Заметки</p>
                  <p className="text-sm leading-relaxed">{selected.notes}</p>
                </div>
              )}

              {/* Work description */}
              {selected.work_description && (
                <div className="p-4 rounded-xl bg-accent/30 border border-border">
                  <p className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">Описание работ</p>
                  <p className="text-sm leading-relaxed">{selected.work_description}</p>
                </div>
              )}

              {!dateConfirmed && (
                <div className="border border-amber-300 bg-amber-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Выберите дату замера</p>
                      <p className="text-xs text-amber-700">Укажите дату, которую согласовали с клиентом.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="date" value={agreedDate} onChange={(e) => setAgreedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="flex-1 px-3 py-2 rounded-lg border border-amber-300 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <button onClick={handleConfirmDate} disabled={!agreedDate}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40">
                      Подтвердить
                    </button>
                  </div>
                </div>
              )}

              {dateConfirmed && (
                <>
                  <div className="flex items-center justify-between px-3 py-2 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-primary" />
                      <span className="text-sm font-medium text-primary">Согласованная дата: {agreedDate}</span>
                    </div>
                    {selected.status !== "measurement_done" && selected.status !== "closed" && (
                      <button
                        onClick={() => setRescheduleOpen(!rescheduleOpen)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                      >
                        {rescheduleOpen ? "Отменить" : "Перенести дату"}
                      </button>
                    )}
                  </div>

                  {rescheduleOpen && (
                    <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">Перенос даты замера</p>
                          <p className="text-xs text-amber-700">Укажите новую дату.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input type="date" value={agreedDate} onChange={(e) => setAgreedDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          className="flex-1 px-3 py-2 rounded-lg border border-amber-300 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <button
                          onClick={async () => {
                            if (!agreedDate || !selected) return;
                            try {
                              const updated = await updateRequest(selected.id, { agreed_date: agreedDate, status: "date_agreed" as any });
                              setDateConfirmed(true);
                              setRescheduleOpen(false);
                              setSelected(updated);
                              toast.success("Дата перенесена");
                            } catch {}
                          }}
                          disabled={!agreedDate || agreedDate === selected.agreed_date?.split("T")[0]}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
                        >
                          Подтвердить
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-border pt-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><FileText size={16} /> Данные замера</h3>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Заметки по замеру <span className="text-destructive">*</span></label>
                      <textarea
                        value={measurementNotes}
                        onChange={(e) => setMeasurementNotes(e.target.value)}
                        rows={5}
                        placeholder="Опишите результаты замера: количество проёмов, размеры, материал стен, особенности объекта..."
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      />
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Camera size={16} /> Фото проёмов <span className="text-destructive text-xs">*</span>
                    </h3>
                    {uploadedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {uploadedFiles.map((f, i) => (
                          <span key={i} className="flex items-center gap-1 px-3 py-1.5 bg-accent rounded-lg text-xs">
                            📎 {f.split("/").pop()}
                            <button onClick={() => handleRemoveFile(i)} className="text-muted-foreground hover:text-destructive"><X size={12} /></button>
                          </span>
                        ))}
                      </div>
                    )}
                    <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer">
                      {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      {uploading ? "Загрузка..." : "Загрузить файл"}
                      <input type="file" multiple className="hidden" onChange={handleFileUpload} accept="image/*,video/*,.pdf" />
                    </label>
                  </div>

                  {!canComplete && (
                    <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                      ⚠ Заполните все обязательные поля и загрузите хотя бы одно фото
                    </p>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-lg text-sm font-medium bg-accent text-foreground hover:bg-accent/80 transition-colors">Отмена</button>
                    <button onClick={handleComplete} disabled={!canComplete}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center gap-2">
                      <CheckCircle2 size={16} /> Замер выполнен
                    </button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MeasurerDashboard;
