import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { mockRequests, statusLabels, statusColors, type ServiceRequest, type RequestStatus } from "@/data/mockDashboard";
import { Phone, MapPin, Calendar, Upload, CheckCircle2, Camera, X, ChevronRight, AlertCircle, Wrench, ClipboardCheck } from "lucide-react";

const INSTALLER_NAME = "Бригада №3";

const InstallerDashboard = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>(
    mockRequests.filter((r) => r.assignedTo === INSTALLER_NAME && r.status !== "closed")
  );
  const [selected, setSelected] = useState<ServiceRequest | null>(null);

  // Report form state
  const [doorsInstalled, setDoorsInstalled] = useState("");
  const [hardwareInstalled, setHardwareInstalled] = useState("");
  const [clientAccepted, setClientAccepted] = useState(false);
  const [defects, setDefects] = useState("");
  const [photosBefore, setPhotosBefore] = useState<string[]>([]);
  const [photosAfter, setPhotosAfter] = useState<string[]>([]);
  const [validationShown, setValidationShown] = useState(false);

  // Agreed date state
  const [agreedDate, setAgreedDate] = useState("");
  const [dateConfirmed, setDateConfirmed] = useState(false);

  useEffect(() => { document.title = "Мои заявки — Монтажник"; }, []);

  const handleSelectRequest = (r: ServiceRequest) => {
    setSelected(r);
    setDoorsInstalled("");
    setHardwareInstalled("");
    setClientAccepted(false);
    setDefects("");
    setPhotosBefore([]);
    setPhotosAfter([]);
    setValidationShown(false);
    setAgreedDate(r.agreedDate || "");
    setDateConfirmed(!!r.agreedDate);
  };

  const addMockPhoto = (type: "before" | "after") => {
    const mockNames = type === "before"
      ? ["до_монтажа_1.jpg", "до_монтажа_2.jpg", "до_монтажа_3.jpg"]
      : ["после_монтажа_1.jpg", "после_монтажа_2.jpg", "результат_3.jpg"];
    const setter = type === "before" ? setPhotosBefore : setPhotosAfter;
    const current = type === "before" ? photosBefore : photosAfter;
    const next = mockNames[current.length % mockNames.length];
    setter((prev) => [...prev, next]);
  };

  const removePhoto = (type: "before" | "after", index: number) => {
    const setter = type === "before" ? setPhotosBefore : setPhotosAfter;
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirmDate = () => {
    if (!agreedDate || !selected) return;
    setDateConfirmed(true);
    setRequests((prev) =>
      prev.map((r) => r.id === selected.id ? { ...r, agreedDate: agreedDate, status: "date_agreed" as RequestStatus } : r)
    );
    setSelected({ ...selected, agreedDate, status: "date_agreed" as RequestStatus });
  };

  const isComplete =
    dateConfirmed &&
    doorsInstalled.trim() !== "" &&
    hardwareInstalled.trim() !== "" &&
    clientAccepted &&
    photosBefore.length > 0 &&
    photosAfter.length > 0;

  const handleComplete = () => {
    if (!isComplete) {
      setValidationShown(true);
      return;
    }
    if (!selected) return;
    setRequests((prev) =>
      prev.map((r) => r.id === selected.id ? { ...r, status: "installation_done" as RequestStatus, executorFiles: [...photosBefore, ...photosAfter] } : r)
    );
    setSelected(null);
  };

  const handleStartInstallation = () => {
    if (!selected || !dateConfirmed) return;
    setRequests((prev) =>
      prev.map((r) => r.id === selected.id ? { ...r, status: "installation_scheduled" as RequestStatus } : r)
    );
    setSelected({ ...selected, status: "installation_scheduled" as RequestStatus });
  };

  const activeRequests = requests.filter((r) => r.status !== "installation_done");
  const doneRequests = requests.filter((r) => r.status === "installation_done");

  const missingFields: string[] = [];
  if (validationShown && !isComplete) {
    if (!dateConfirmed) missingFields.push("Согласованная дата");
    if (!doorsInstalled.trim()) missingFields.push("Установленные двери");
    if (!hardwareInstalled.trim()) missingFields.push("Фурнитура");
    if (!clientAccepted) missingFields.push("Подтверждение клиента");
    if (photosBefore.length === 0) missingFields.push("Фото до монтажа");
    if (photosAfter.length === 0) missingFields.push("Фото после монтажа");
  }

  return (
    <DashboardLayout role="installer" userName={INSTALLER_NAME}>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Мои заявки</h1>

        {activeRequests.length === 0 && doneRequests.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Нет активных заявок</CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {activeRequests.map((r) => (
              <Card
                key={r.id}
                className={`hover:shadow-md transition-shadow cursor-pointer border-l-4 ${
                  selected?.id === r.id ? "border-l-primary ring-2 ring-primary/20" : "border-l-orange-400"
                }`}
                onClick={() => handleSelectRequest(r)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs text-muted-foreground">{r.id}</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                          {statusLabels[r.status]}
                        </span>
                        {r.source === "partner" && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-medium">
                            Партнёр
                          </span>
                        )}
                      </div>
                      <p className="font-semibold">{r.clientName}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin size={12} /> {r.address}
                      </div>
                      {r.agreedDate && (
                        <div className="flex items-center gap-1 text-xs text-primary font-medium">
                          <Calendar size={12} /> Согласовано: {r.agreedDate}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar size={14} />
                      <span className="text-xs">{r.date}</span>
                      <ChevronRight size={16} />
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
                        <p className="font-mono text-xs text-muted-foreground">{r.id}</p>
                        <p className="font-medium text-sm">{r.clientName}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                        {statusLabels[r.status]}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}

        {/* Detail / Report panel */}
        {selected && (
          <Card className="border-t-4 border-t-primary">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{selected.id}</p>
                  <h2 className="text-lg font-heading font-bold mt-1">{selected.clientName}</h2>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin size={14} /> {selected.address}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone size={14} /> {selected.clientPhone}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="p-1 hover:bg-accent rounded">
                  <X size={18} />
                </button>
              </div>

              {/* Mandatory date selection */}
              {!dateConfirmed && (
                <div className="border border-amber-300 bg-amber-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Выберите дату монтажа</p>
                      <p className="text-xs text-amber-700">Укажите дату, которую согласовали с клиентом. Это обязательно.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="date"
                      value={agreedDate}
                      onChange={(e) => setAgreedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="flex-1 px-3 py-2 rounded-lg border border-amber-300 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={handleConfirmDate}
                      disabled={!agreedDate}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Подтвердить
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

              {/* Status action for measurement_done → installation_scheduled */}
              {dateConfirmed && selected.status === "measurement_done" && (
                <button
                  onClick={handleStartInstallation}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-primary rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  <Wrench size={16} /> Начать монтаж
                </button>
              )}

              {/* Report form (visible for installation_scheduled) */}
              {dateConfirmed && (selected.status === "installation_scheduled" || selected.status === "installation_done") && (
                <div className="border-t border-border pt-4 space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <ClipboardCheck size={16} /> Отчёт о монтаже
                  </h3>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-2">
                    <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700">
                      Заявка не может быть закрыта без заполнения всех обязательных полей и загрузки фотоотчёта.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Установленные двери <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        value={doorsInstalled}
                        onChange={(e) => setDoorsInstalled(e.target.value)}
                        placeholder="Напр. 3 шт. межкомнатные"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Фурнитура <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        value={hardwareInstalled}
                        onChange={(e) => setHardwareInstalled(e.target.value)}
                        placeholder="Ручки, петли, замки..."
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Дефекты / замечания</label>
                      <textarea
                        value={defects}
                        onChange={(e) => setDefects(e.target.value)}
                        rows={2}
                        placeholder="Если есть замечания..."
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      />
                    </div>
                  </div>

                  {/* Photo uploads */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Before */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                        <Camera size={14} /> Фото ДО монтажа <span className="text-destructive">*</span>
                      </label>
                      {photosBefore.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {photosBefore.map((f, i) => (
                            <span key={i} className="flex items-center gap-1 px-2 py-1 bg-accent rounded text-xs">
                              {f}
                              <button onClick={() => removePhoto("before", i)} className="hover:text-destructive">
                                <X size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => addMockPhoto("before")}
                        className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-border rounded-lg text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors w-full justify-center"
                      >
                        <Upload size={14} /> Загрузить
                      </button>
                    </div>

                    {/* After */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                        <Camera size={14} /> Фото ПОСЛЕ монтажа <span className="text-destructive">*</span>
                      </label>
                      {photosAfter.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {photosAfter.map((f, i) => (
                            <span key={i} className="flex items-center gap-1 px-2 py-1 bg-accent rounded text-xs">
                              {f}
                              <button onClick={() => removePhoto("after", i)} className="hover:text-destructive">
                                <X size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => addMockPhoto("after")}
                        className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-border rounded-lg text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors w-full justify-center"
                      >
                        <Upload size={14} /> Загрузить
                      </button>
                    </div>
                  </div>

                  {/* Client acceptance */}
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={clientAccepted}
                      onChange={(e) => setClientAccepted(e.target.checked)}
                      className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                    />
                    <span className="text-sm">
                      Клиент принял работу <span className="text-destructive">*</span>
                    </span>
                  </label>

                  {/* Validation errors */}
                  {validationShown && missingFields.length > 0 && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3">
                      <p className="text-xs font-medium text-destructive mb-1">Не заполнены обязательные поля:</p>
                      <ul className="text-xs text-destructive list-disc pl-4">
                        {missingFields.map((f) => <li key={f}>{f}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setSelected(null)}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-accent text-foreground hover:bg-accent/80 transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={handleComplete}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
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
