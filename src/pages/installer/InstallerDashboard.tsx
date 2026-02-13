import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels, statusColors, type RequestStatus } from "@/data/mockDashboard";
import { Phone, MapPin, Calendar, Upload, CheckCircle2, Camera, X, ChevronRight, AlertCircle, ClipboardCheck, Loader2 } from "lucide-react";
import { useRequests, type ApiRequest } from "@/hooks/useRequests";
import { useAuth } from "@/contexts/AuthContext";
import { uploadFile } from "@/lib/api";
import { toast } from "sonner";

const InstallerDashboard = () => {
  const { user } = useAuth();
  const { requests, loading, updateRequest } = useRequests();
  const [selected, setSelected] = useState<ApiRequest | null>(null);

  const [doorsInstalled, setDoorsInstalled] = useState("");
  const [hardwareInstalled, setHardwareInstalled] = useState("");
  const [clientAccepted, setClientAccepted] = useState(false);
  const [defects, setDefects] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [validationShown, setValidationShown] = useState(false);
  const [agreedDate, setAgreedDate] = useState("");
  const [dateConfirmed, setDateConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);

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
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadFile(file, "installations");
      setUploadedFiles(prev => [...prev, url]);
    } catch (err: any) {
      toast.error(err.message || "Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmDate = async () => {
    if (!agreedDate || !selected) return;
    // Installer can only reschedule (change existing date), not set initial date
    // Initial date must be set by admin/manager
    if (!selected.agreed_date) {
      toast.error("Дата монтажа назначается менеджером");
      return;
    }
    try {
      const updated = await updateRequest(selected.id, { agreed_date: agreedDate });
      setDateConfirmed(true);
      setSelected(updated);
      toast.success("Дата перенесена");
    } catch {}
  };

  const isComplete = dateConfirmed && doorsInstalled.trim() && hardwareInstalled.trim() && clientAccepted && uploadedFiles.length > 0;

  const handleComplete = async () => {
    if (!isComplete) { setValidationShown(true); return; }
    if (!selected) return;
    try {
      const allPhotos = uploadedFiles.map(url => ({ url, type: "image", stage: "general", uploaded_at: new Date().toISOString() }));
      const existingPhotos = selected.photos || [];
      await updateRequest(selected.id, {
        status: "closed" as any,
        notes: `Двери: ${doorsInstalled}, Фурнитура: ${hardwareInstalled}. ${defects ? `Дефекты: ${defects}` : ""}`,
        photos: [...existingPhotos, ...allPhotos] as any,
      });
      setSelected(null);
      toast.success("Монтаж завершён");
    } catch {}
  };

  // No separate "start installation" step needed - installer confirms date then completes

  const activeRequests = requests.filter((r) => !["closed", "cancelled"].includes(r.status));
  const doneRequests = requests.filter((r) => r.status === "closed");

  const missingFields: string[] = [];
  if (validationShown && !isComplete) {
    if (!dateConfirmed) missingFields.push("Согласованная дата");
    if (!doorsInstalled.trim()) missingFields.push("Установленные двери");
    if (!hardwareInstalled.trim()) missingFields.push("Фурнитура");
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
                      </div>
                      <p className="font-semibold">{r.client_name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={12} /> {r.client_address}</div>
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
                  <CheckCircle2 size={16} className="text-green-600" /> Монтаж выполнен
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
          <Card className="border-t-4 border-t-primary">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{selected.number}</p>
                  <h2 className="text-lg font-heading font-bold mt-1">{selected.client_name}</h2>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1"><MapPin size={14} /> {selected.client_address}</div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground"><Phone size={14} /> {selected.client_phone}</div>
                </div>
                <button onClick={() => setSelected(null)} className="p-1 hover:bg-accent rounded"><X size={18} /></button>
              </div>

              {!dateConfirmed && !selected.agreed_date && (
                <div className="border border-amber-300 bg-amber-50 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Ожидание даты монтажа</p>
                      <p className="text-xs text-amber-700">Дата будет назначена менеджером после согласования с клиентом.</p>
                    </div>
                  </div>
                </div>
              )}

              {!dateConfirmed && selected.agreed_date && (
                <div className="border border-blue-200 bg-blue-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <Calendar size={16} className="text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Перенести дату монтажа</p>
                      <p className="text-xs text-blue-700">Только если клиент сам попросил перенести.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="date" value={agreedDate} onChange={(e) => setAgreedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="flex-1 px-3 py-2 rounded-xl border border-blue-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <button onClick={handleConfirmDate} disabled={!agreedDate || agreedDate === selected.agreed_date?.split("T")[0]}
                      className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-40">
                      Перенести
                    </button>
                  </div>
                </div>
              )}

              {dateConfirmed && (
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg border border-primary/20">
                  <Calendar size={14} className="text-primary" />
                  <span className="text-sm font-medium text-primary">Согласованная дата: {agreedDate}</span>
                </div>
              )}

              {dateConfirmed && (
                <div className="border-t border-border pt-4 space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2"><ClipboardCheck size={16} /> Отчёт о монтаже</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Установленные двери <span className="text-destructive">*</span></label>
                      <input type="text" value={doorsInstalled} onChange={(e) => setDoorsInstalled(e.target.value)} placeholder="3 шт. межкомнатные"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Фурнитура <span className="text-destructive">*</span></label>
                      <input type="text" value={hardwareInstalled} onChange={(e) => setHardwareInstalled(e.target.value)} placeholder="Ручки, петли, замки..."
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Дефекты / замечания</label>
                      <textarea value={defects} onChange={(e) => setDefects(e.target.value)} rows={2} placeholder="Если есть замечания..."
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
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
                      <input type="file" className="hidden" onChange={handleUpload} accept="image/*,.pdf" />
                    </label>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                    <input type="checkbox" checked={clientAccepted} onChange={(e) => setClientAccepted(e.target.checked)}
                      className="h-4 w-4 rounded border-primary text-primary focus:ring-primary" />
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
                    <button onClick={handleComplete}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2">
                      <CheckCircle2 size={16} /> Монтаж выполнен
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InstallerDashboard;
