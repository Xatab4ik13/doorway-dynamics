import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MobileFullScreen from "@/components/dashboard/MobileFullScreen";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels, statusColors, requestTypeLabels, type RequestStatus } from "@/data/mockDashboard";
import { Phone, MapPin, Calendar, Upload, CheckCircle2, Camera, X, ChevronRight, AlertCircle, ClipboardCheck, Loader2 } from "lucide-react";
import { useRequests, type ApiRequest } from "@/hooks/useRequests";
import { useAuth } from "@/contexts/AuthContext";
import { uploadFile } from "@/lib/api";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const InstallerDashboard = () => {
  const { user } = useAuth();
  const { requests, loading, updateRequest } = useRequests();
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState<ApiRequest | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [doorsInstalled, setDoorsInstalled] = useState("");
  const [hardwareInstalled, setHardwareInstalled] = useState("");
  const [clientAccepted, setClientAccepted] = useState(false);
  const [defects, setDefects] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [validationShown, setValidationShown] = useState(false);
  const [agreedDate, setAgreedDate] = useState("");
  const [dateConfirmed, setDateConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleComment, setRescheduleComment] = useState("");

  useEffect(() => { document.title = "Мои заявки — Монтажник"; }, []);

  const handleSelectRequest = (r: ApiRequest) => {
    setSelected(r);
    setDoorsInstalled("");
    setHardwareInstalled("");
    setClientAccepted(false);
    setDefects("");
    setUploadedFiles([]);
    setValidationShown(false);
    setAgreedDate(r.agreed_date?.split("T")[0] || "");
    setDateConfirmed(!!r.agreed_date);
    setRescheduleOpen(false);
    setRescheduleComment("");
  };

  // Auto-open request from push notification deep link
  useEffect(() => {
    if (loading || requests.length === 0) return;
    const highlightId = searchParams.get("highlight");
    if (highlightId) {
      const found = requests.find(r => r.id === highlightId);
      if (found) handleSelectRequest(found);
      setSearchParams({}, { replace: true });
    }
  }, [loading, requests]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    let success = 0;
    let failed = 0;
    try {
      for (const file of files) {
        try {
          const { url } = await uploadFile(file, "installations");
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

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmDate = async () => {
    if (!agreedDate || !selected) return;
    if (!selected.agreed_date) {
      toast.error(selected.type === "reclamation" ? "Дата визита назначается менеджером" : "Дата монтажа назначается менеджером");
      return;
    }
    if (!rescheduleComment.trim()) {
      toast.error("Укажите причину переноса");
      return;
    }
    try {
      const updated = await updateRequest(selected.id, {
        agreed_date: agreedDate,
        status_comment: rescheduleComment.trim(),
        status: (selected.type === "reclamation" ? "date_agreed" : "installation_rescheduled") as any,
      });
      setDateConfirmed(true);
      setRescheduleOpen(false);
      setSelected(updated);
      toast.success("Дата перенесена");
    } catch {}
  };

  const isReclamation = selected?.type === "reclamation";
  const isComplete = dateConfirmed && doorsInstalled.trim() && (isReclamation || hardwareInstalled.trim()) && clientAccepted && uploadedFiles.length > 0;

  const handleComplete = async () => {
    if (!isComplete) { setValidationShown(true); return; }
    if (!selected) return;
    try {
      const allPhotos = uploadedFiles.map(url => ({ url, type: "image", stage: "general", uploaded_at: new Date().toISOString() }));
      const existingPhotos = selected.photos || [];
      await updateRequest(selected.id, {
        status: "closed" as any,
        notes: selected.type === "reclamation"
          ? `Результат: ${doorsInstalled}. ${defects ? `Замечания: ${defects}` : ""}`
          : `Двери: ${doorsInstalled}, Фурнитура: ${hardwareInstalled}. ${defects ? `Дефекты: ${defects}` : ""}`,
        photos: [...existingPhotos, ...allPhotos] as any,
      });
      setSelected(null);
      toast.success(selected.type === "reclamation" ? "Рекламация закрыта" : "Монтаж завершён");
    } catch {}
  };

  // No separate "start installation" step needed - installer confirms date then completes

  const activeRequests = requests.filter((r) => !["closed", "cancelled"].includes(r.status));
  const doneRequests = requests.filter((r) => r.status === "closed");

  const missingFields: string[] = [];
  if (validationShown && !isComplete) {
    if (!dateConfirmed) missingFields.push("Согласованная дата");
    if (!doorsInstalled.trim()) missingFields.push(isReclamation ? "Описание работ" : "Установленные двери");
    if (!isReclamation && !hardwareInstalled.trim()) missingFields.push("Фурнитура");
    if (!clientAccepted) missingFields.push("Подтверждение клиента");
    if (uploadedFiles.length === 0) missingFields.push("Фото / файлы");
  }

  return (
    <DashboardLayout role="installer" userName={user?.name || "Монтажник"}>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Мои заявки</h1>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={32} /></div>
        ) : activeRequests.length === 0 && doneRequests.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Нет активных заявок</CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {activeRequests.map((r) => (
              <Card key={r.id}
                className={`hover:shadow-md transition-shadow cursor-pointer border-l-4 ${
                  selected?.id === r.id ? "border-l-primary ring-2 ring-primary/20" : "border-l-orange-400"
                }`}
                onClick={() => handleSelectRequest(r)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs text-muted-foreground">{r.number}</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status as RequestStatus] || "bg-gray-100"}`}>
                          {statusLabels[r.status as RequestStatus] || r.status}
                        </span>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent text-muted-foreground">
                          {requestTypeLabels[r.type] || r.type}
                        </span>
                        {r.accepted_at && (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">Принято</span>
                        )}
                      </div>
                      <p className="font-semibold">{r.client_name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={12} /> <a href={`https://yandex.ru/maps/?text=${encodeURIComponent(r.client_address + (r.city ? ", " + r.city : ""))}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{r.client_address}</a></div>
                      {r.agreed_date && (
                        <div className="flex items-center gap-1 text-xs text-primary font-medium">
                          <Calendar size={12} /> Согласовано: {r.agreed_date.split("T")[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar size={14} /><span className="text-xs">{r.created_at?.split("T")[0]}</span><ChevronRight size={16} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {doneRequests.length > 0 && (
              <>
                <h2 className="text-sm font-medium text-muted-foreground mt-4 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" /> Выполнено
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
          isMobile ? (
            <MobileFullScreen open={true} onClose={() => setSelected(null)} title={selected.number}>
              <Card className="border-t-4 border-t-primary bg-card border-0 shadow-none rounded-none min-h-full">
                <CardContent className="p-4 space-y-5 pb-24">
                  <div className="space-y-5">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">{selected.number}</p>
                      <h2 className="text-lg font-heading font-bold mt-1">{selected.client_name}</h2>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1"><MapPin size={14} /> <a href={`https://yandex.ru/maps/?text=${encodeURIComponent(selected.client_address + (selected.city ? ", " + selected.city : ""))}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{selected.client_address}</a></div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground"><Phone size={14} /> <a href={`tel:${selected.client_phone?.replace(/\s/g, "")}`} className="text-primary hover:underline">{selected.client_phone}</a></div>
                    </div>

                    {selected.notes && (
                      <div className="p-4 rounded-xl bg-accent/30 border border-border">
                        <p className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">Заметки</p>
                        <p className="text-sm leading-relaxed">{selected.notes}</p>
                      </div>
                    )}

                    {selected.work_description && (
                      <div className="p-4 rounded-xl bg-accent/30 border border-border">
                        <p className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">Описание работ</p>
                        <p className="text-sm leading-relaxed">{selected.work_description}</p>
                      </div>
                    )}

                    <div className="border border-border rounded-xl p-4">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Camera size={14} /> Прикреплённые файлы {(selected.photos || []).length > 0 && `(${selected.photos.length})`}
                      </h3>
                      {(selected.photos || []).length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {selected.photos.map((file: any, i: number) => (
                            <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary/40 transition-all">
                              {file.type === "image" ? (
                                <img src={file.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-accent/50">
                                  <Upload size={20} className="text-muted-foreground" />
                                  <p className="text-[10px] text-muted-foreground mt-1 px-1 truncate w-full text-center">{file.url.split("/").pop()}</p>
                                </div>
                              )}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">Нет прикреплённых файлов</p>
                      )}
                    </div>

                    {!selected.accepted_at && selected.status !== "closed" && (
                      <div className="border border-blue-200 bg-blue-50 rounded-xl p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="text-blue-600 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-blue-800">Подтвердите принятие заявки</p>
                              <p className="text-xs text-blue-600">Нажмите, чтобы подтвердить что вы приняли эту заявку в работу</p>
                            </div>
                          </div>
                          <button onClick={async () => {
                            try {
                              const updated = await updateRequest(selected.id, { accepted_at: new Date().toISOString() } as any);
                              setSelected(updated);
                              toast.success("Заявка принята");
                            } catch {}
                          }} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap">
                            Принял
                          </button>
                        </div>
                      </div>
                    )}

                    {selected.accepted_at && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                        <CheckCircle2 size={14} className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Принято: {new Date(selected.accepted_at).toLocaleString("ru-RU")}</span>
                      </div>
                    )}

                    {!selected.agreed_date && (
                      <div className="border border-amber-300 bg-amber-50 rounded-xl p-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-amber-800">{selected.type === "reclamation" ? "Ожидание даты визита" : "Ожидание даты монтажа"}</p>
                            <p className="text-xs text-amber-700">Дата будет назначена менеджером после согласования с клиентом.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selected.agreed_date && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-3 py-2 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-primary" />
                            <span className="text-sm font-medium text-primary">{selected.type === "reclamation" ? "Дата визита" : "Дата монтажа"}: {selected.agreed_date.split("T")[0]}</span>
                          </div>
                          <button onClick={() => setRescheduleOpen(!rescheduleOpen)} className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
                            {rescheduleOpen ? "Отменить перенос" : "Перенести дату"}
                          </button>
                        </div>

                        {rescheduleOpen && (
                          <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 space-y-3">
                            <div className="flex items-start gap-2">
                              <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-amber-800">Перенос даты монтажа</p>
                                <p className="text-xs text-amber-700">Укажите новую дату и причину переноса.</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <input type="date" value={agreedDate} onChange={(e) => setAgreedDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                              <textarea value={rescheduleComment} onChange={(e) => setRescheduleComment(e.target.value)} placeholder="Причина переноса (обязательно)..." rows={2} className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                            </div>
                            <button onClick={handleConfirmDate} disabled={!agreedDate || agreedDate === selected.agreed_date?.split("T")[0] || !rescheduleComment.trim()} className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-40">
                              Подтвердить перенос
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {dateConfirmed && (
                      <div className="border-t border-border pt-4 space-y-4">
                        <h3 className="text-sm font-semibold flex items-center gap-2"><ClipboardCheck size={16} /> {isReclamation ? "Отчёт о рекламации" : "Отчёт о монтаже"}</h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">{isReclamation ? "Что сделано" : "Установленные двери"} <span className="text-destructive">*</span></label>
                            <input type="text" value={doorsInstalled} onChange={(e) => setDoorsInstalled(e.target.value)} placeholder={isReclamation ? "Описание выполненных работ" : "3 шт. межкомнатные"} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                          </div>
                          {!isReclamation && (
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Фурнитура <span className="text-destructive">*</span></label>
                              <input type="text" value={hardwareInstalled} onChange={(e) => setHardwareInstalled(e.target.value)} placeholder="Ручки, петли, замки..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                            </div>
                          )}
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Дефекты / замечания</label>
                            <textarea value={defects} onChange={(e) => setDefects(e.target.value)} rows={2} placeholder="Если есть замечания..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                              <Camera size={14} /> Фото / файлы <span className="text-destructive">*</span>
                            </label>
                            {uploadedFiles.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {uploadedFiles.map((f, i) => (
                                  <span key={i} className="flex items-center gap-1 px-2 py-1 bg-accent rounded text-xs">
                                    📎 {f.split("/").pop()}
                                    <button onClick={() => removeFile(i)} className="hover:text-destructive"><X size={10} /></button>
                                  </span>
                                ))}
                              </div>
                            )}
                            <label className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-border rounded-lg text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors w-full justify-center cursor-pointer">
                              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Загрузить
                              <input type="file" multiple className="hidden" onChange={handleUpload} accept="image/*,video/*,.pdf" />
                            </label>
                          </div>
                          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                            <input type="checkbox" checked={clientAccepted} onChange={(e) => setClientAccepted(e.target.checked)} className="h-4 w-4 rounded border-primary text-primary focus:ring-primary" />
                            <span className="text-sm">Клиент принял работу</span>
                          </label>
                          {missingFields.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                              <p className="text-xs text-amber-700 font-medium mb-1">Не заполнено:</p>
                              <ul className="text-xs text-amber-600 list-disc pl-4">
                                {missingFields.map((f, i) => <li key={i}>{f}</li>)}
                              </ul>
                            </div>
                          )}
                          <div className="pt-3 space-y-3 pb-6">
                            <button onClick={handleComplete} className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                              <CheckCircle2 size={16} /> {isReclamation ? "Рекламация закрыта" : "Монтаж выполнен"}
                            </button>
                            <button onClick={() => setSelected(null)} className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-accent text-foreground hover:bg-accent/80 transition-colors">Отмена</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </MobileFullScreen>
          ) : (
            <Card className="border-t-4 border-t-primary bg-card">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{selected.number}</p>
                    <h2 className="text-lg font-heading font-bold mt-1">{selected.client_name}</h2>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1"><MapPin size={14} /> <a href={`https://yandex.ru/maps/?text=${encodeURIComponent(selected.client_address + (selected.city ? ", " + selected.city : ""))}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{selected.client_address}</a></div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground"><Phone size={14} /> <a href={`tel:${selected.client_phone?.replace(/\s/g, "")}`} className="text-primary hover:underline">{selected.client_phone}</a></div>
                    {(selected.interior_doors != null || selected.entrance_doors != null || selected.partitions != null) && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selected.interior_doors != null && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-accent text-xs font-medium">Межкомнатные: {selected.interior_doors}</span>}
                        {selected.entrance_doors != null && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-accent text-xs font-medium">Входные: {selected.entrance_doors}</span>}
                        {selected.partitions != null && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-accent text-xs font-medium">Перегородка (кол-во створок): {selected.partitions}</span>}
                      </div>
                    )}
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

                {selected.notes && (
                  <div className="p-4 rounded-xl bg-accent/30 border border-border">
                    <p className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">Заметки</p>
                    <p className="text-sm leading-relaxed">{selected.notes}</p>
                  </div>
                )}

                {selected.work_description && (
                  <div className="p-4 rounded-xl bg-accent/30 border border-border">
                    <p className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">Описание работ</p>
                    <p className="text-sm leading-relaxed">{selected.work_description}</p>
                  </div>
                )}

                <div className="border border-border rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Camera size={14} /> Прикреплённые файлы {(selected.photos || []).length > 0 && `(${selected.photos.length})`}
                  </h3>
                  {(selected.photos || []).length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {selected.photos.map((file: any, i: number) => (
                        <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary/40 transition-all">
                          {file.type === "image" ? (
                            <img src={file.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-accent/50">
                              <Upload size={20} className="text-muted-foreground" />
                              <p className="text-[10px] text-muted-foreground mt-1 px-1 truncate w-full text-center">{file.url.split("/").pop()}</p>
                            </div>
                          )}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Нет прикреплённых файлов</p>
                  )}
                </div>

                {!selected.accepted_at && selected.status !== "closed" && (
                  <div className="border border-blue-200 bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-blue-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">Подтвердите принятие заявки</p>
                          <p className="text-xs text-blue-600">Нажмите, чтобы подтвердить что вы приняли эту заявку в работу</p>
                        </div>
                      </div>
                      <button onClick={async () => {
                        try {
                          const updated = await updateRequest(selected.id, { accepted_at: new Date().toISOString() } as any);
                          setSelected(updated);
                          toast.success("Заявка принята");
                        } catch {}
                      }} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap">
                        Принял
                      </button>
                    </div>
                  </div>
                )}

                {selected.accepted_at && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                    <CheckCircle2 size={14} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Принято: {new Date(selected.accepted_at).toLocaleString("ru-RU")}</span>
                  </div>
                )}

                {!selected.agreed_date && (
                  <div className="border border-amber-300 bg-amber-50 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">{selected.type === "reclamation" ? "Ожидание даты визита" : "Ожидание даты монтажа"}</p>
                        <p className="text-xs text-amber-700">Дата будет назначена менеджером после согласования с клиентом.</p>
                      </div>
                    </div>
                  </div>
                )}

                {selected.agreed_date && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-3 py-2 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-primary" />
                        <span className="text-sm font-medium text-primary">{selected.type === "reclamation" ? "Дата визита" : "Дата монтажа"}: {selected.agreed_date.split("T")[0]}</span>
                      </div>
                      <button onClick={() => setRescheduleOpen(!rescheduleOpen)} className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
                        {rescheduleOpen ? "Отменить перенос" : "Перенести дату"}
                      </button>
                    </div>

                    {rescheduleOpen && (
                      <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-amber-800">Перенос даты монтажа</p>
                            <p className="text-xs text-amber-700">Укажите новую дату и причину переноса.</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <input type="date" value={agreedDate} onChange={(e) => setAgreedDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                          <textarea value={rescheduleComment} onChange={(e) => setRescheduleComment(e.target.value)} placeholder="Причина переноса (обязательно)..." rows={2} className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                        </div>
                        <button onClick={handleConfirmDate} disabled={!agreedDate || agreedDate === selected.agreed_date?.split("T")[0] || !rescheduleComment.trim()} className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-40">
                          Подтвердить перенос
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {dateConfirmed && (
                  <div className="border-t border-border pt-4 space-y-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2"><ClipboardCheck size={16} /> {isReclamation ? "Отчёт о рекламации" : "Отчёт о монтаже"}</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">{isReclamation ? "Что сделано" : "Установленные двери"} <span className="text-destructive">*</span></label>
                        <input type="text" value={doorsInstalled} onChange={(e) => setDoorsInstalled(e.target.value)} placeholder={isReclamation ? "Описание выполненных работ" : "3 шт. межкомнатные"} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                      {!isReclamation && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">Фурнитура <span className="text-destructive">*</span></label>
                          <input type="text" value={hardwareInstalled} onChange={(e) => setHardwareInstalled(e.target.value)} placeholder="Ручки, петли, замки..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                      )}
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Дефекты / замечания</label>
                        <textarea value={defects} onChange={(e) => setDefects(e.target.value)} rows={2} placeholder="Если есть замечания..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                        <Camera size={14} /> Фото / файлы <span className="text-destructive">*</span>
                      </label>
                      {uploadedFiles.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {uploadedFiles.map((f, i) => (
                            <span key={i} className="flex items-center gap-1 px-2 py-1 bg-accent rounded text-xs">
                              📎 {f.split("/").pop()}
                              <button onClick={() => removeFile(i)} className="hover:text-destructive"><X size={10} /></button>
                            </span>
                          ))}
                        </div>
                      )}
                      <label className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-border rounded-lg text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors w-full justify-center cursor-pointer">
                        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Загрузить
                        <input type="file" multiple className="hidden" onChange={handleUpload} accept="image/*,video/*,.pdf" />
                      </label>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                      <input type="checkbox" checked={clientAccepted} onChange={(e) => setClientAccepted(e.target.checked)} className="h-4 w-4 rounded border-primary text-primary focus:ring-primary" />
                      <span className="text-sm">Клиент принял работу</span>
                    </label>

                    {missingFields.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                        <p className="text-xs text-amber-700 font-medium mb-1">Не заполнено:</p>
                        <ul className="text-xs text-amber-600 list-disc pl-4">
                          {missingFields.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                      <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-lg text-sm font-medium bg-accent text-foreground hover:bg-accent/80 transition-colors">Отмена</button>
                      <button onClick={handleComplete} className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2">
                        <CheckCircle2 size={16} /> {isReclamation ? "Рекламация закрыта" : "Монтаж выполнен"}
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        )}
      </div>
    </DashboardLayout>
  );
};

export default InstallerDashboard;
