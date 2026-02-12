import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { mockRequests, statusLabels, statusColors, type ServiceRequest, type RequestStatus } from "@/data/mockDashboard";
import { Phone, MapPin, Calendar, Upload, CheckCircle2, FileText, Camera, X, ChevronRight, AlertCircle } from "lucide-react";

const MEASURER_NAME = "Сидоров К.В.";

const MeasurerDashboard = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>(
    mockRequests.filter((r) => r.assignedTo === MEASURER_NAME && r.status !== "closed")
  );
  const [selected, setSelected] = useState<ServiceRequest | null>(null);

  // Form state for measurement report
  const [roomCount, setRoomCount] = useState("");
  const [doorSizes, setDoorSizes] = useState("");
  const [wallMaterial, setWallMaterial] = useState("");
  const [notes, setNotes] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Agreed date state
  const [agreedDate, setAgreedDate] = useState("");
  const [dateConfirmed, setDateConfirmed] = useState(false);

  useEffect(() => { document.title = "Мои заявки — Замерщик"; }, []);

  const handleSelectRequest = (r: ServiceRequest) => {
    setSelected(r);
    setRoomCount("");
    setDoorSizes("");
    setWallMaterial("");
    setNotes("");
    setUploadedFiles([]);
    setAgreedDate(r.agreedDate || "");
    setDateConfirmed(!!r.agreedDate);
  };

  const handleMockUpload = () => {
    const mockFiles = ["photo_проём_1.jpg", "photo_проём_2.jpg", "замер_схема.pdf"];
    const newFile = mockFiles[uploadedFiles.length % mockFiles.length];
    setUploadedFiles((prev) => [...prev, `${newFile}`]);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirmDate = () => {
    if (!agreedDate || !selected) return;
    setDateConfirmed(true);
    setRequests((prev) =>
      prev.map((r) => r.id === selected.id ? { ...r, agreedDate: agreedDate } : r)
    );
    setSelected({ ...selected, agreedDate });
  };

  const canComplete = dateConfirmed && roomCount.trim() !== "" && doorSizes.trim() !== "" && wallMaterial.trim() !== "" && uploadedFiles.length > 0;

  const handleComplete = () => {
    if (!selected || !canComplete) return;
    setRequests((prev) =>
      prev.map((r) => r.id === selected.id ? { ...r, status: "measurement_done" as RequestStatus, executorFiles: uploadedFiles } : r)
    );
    setSelected(null);
  };

  const activeRequests = requests.filter((r) => r.status !== "measurement_done");
  const doneRequests = requests.filter((r) => r.status === "measurement_done");

  return (
    <DashboardLayout role="measurer" userName={MEASURER_NAME}>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Мои заявки</h1>

        {/* Active requests */}
        {activeRequests.length === 0 && doneRequests.length === 0 ? (
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
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone size={12} /> {r.clientPhone}
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

            {/* Done today */}
            {doneRequests.length > 0 && (
              <>
                <h2 className="text-sm font-medium text-muted-foreground mt-4 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" /> Замер выполнен
                </h2>
                {doneRequests.map((r) => (
                  <Card key={r.id} className="border-l-4 border-l-green-400 opacity-70">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-xs text-muted-foreground">{r.id}</p>
                          <p className="font-medium text-sm">{r.clientName}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                          {statusLabels[r.status]}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}

        {/* Detail panel */}
        {selected && (
          <Card className="border-t-4 border-t-primary">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{selected.id}</p>
                  <h2 className="text-lg font-heading font-bold mt-1">{selected.clientName}</h2>
                  <p className="text-sm text-muted-foreground">{selected.address}</p>
                  <p className="text-sm text-muted-foreground">{selected.clientPhone}</p>
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
                      <p className="text-sm font-medium text-amber-800">Выберите дату замера</p>
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

              {/* Measurement form (only after date confirmed) */}
              {dateConfirmed && (
                <>
                  <div className="border-t border-border pt-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <FileText size={16} /> Данные замера
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Количество проёмов <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="number"
                          value={roomCount}
                          onChange={(e) => setRoomCount(e.target.value)}
                          placeholder="Напр. 3"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Размеры проёмов <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          value={doorSizes}
                          onChange={(e) => setDoorSizes(e.target.value)}
                          placeholder="800x2000, 900x2100..."
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Материал стен <span className="text-destructive">*</span>
                        </label>
                        <select
                          value={wallMaterial}
                          onChange={(e) => setWallMaterial(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Выберите</option>
                          <option value="brick">Кирпич</option>
                          <option value="concrete">Бетон</option>
                          <option value="gas_block">Газоблок</option>
                          <option value="wood">Дерево</option>
                          <option value="drywall">Гипсокартон</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Примечания</label>
                        <input
                          type="text"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Особенности объекта..."
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                  </div>

                  {/* File upload */}
                  <div className="border-t border-border pt-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Camera size={16} /> Фото проёмов <span className="text-destructive text-xs">*</span>
                    </h3>

                    {uploadedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {uploadedFiles.map((f, i) => (
                          <span key={i} className="flex items-center gap-1 px-3 py-1.5 bg-accent rounded-lg text-xs">
                            {f}
                            <button onClick={() => handleRemoveFile(i)} className="text-muted-foreground hover:text-destructive">
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={handleMockUpload}
                      className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      <Upload size={16} /> Загрузить файл
                    </button>
                  </div>

                  {/* Validation message */}
                  {!canComplete && (
                    <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                      ⚠ Заполните все обязательные поля и загрузите хотя бы одно фото для завершения замера
                    </p>
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
                      disabled={!canComplete}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
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
