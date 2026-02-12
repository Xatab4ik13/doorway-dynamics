import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels, statusColors, requestTypeLabels, type RequestStatus, type RequestType } from "@/data/mockDashboard";
import { MapPin, Calendar, ChevronRight, Package, Clock, CheckCircle2, FileText, Search, Filter } from "lucide-react";

interface PartnerRequest {
  id: string;
  type: RequestType;
  status: RequestStatus;
  objectName: string;
  address: string;
  date: string;
  comment?: string;
  resultFiles?: string[];
}

const initialRequests: PartnerRequest[] = [
  { id: "REQ-101", type: "measurement", status: "assigned", objectName: "ЖК Солнечный, кв. 42", address: "ул. Весенняя, 12", date: "2026-02-11" },
  { id: "REQ-102", type: "installation", status: "installation_scheduled", objectName: "Офис на Ленина", address: "ул. Ленина, 45", date: "2026-02-09", comment: "Двери межкомнатные, 5 шт." },
  { id: "REQ-103", type: "reclamation", status: "new", objectName: "ЖК Парковый, кв. 8", address: "пр. Парковый, 8", date: "2026-02-12", comment: "Скрипит петля на входной двери" },
  { id: "REQ-098", type: "installation", status: "closed", objectName: "ЖК Центральный, кв. 15", address: "ул. Центральная, 30", date: "2026-01-20", resultFiles: ["акт_приёмки.pdf", "фото_результат.jpg"] },
  { id: "REQ-095", type: "measurement", status: "measurement_done", objectName: "Коттедж Лесная", address: "пос. Лесной, д. 7", date: "2026-02-06" },
];

const statusSteps: RequestStatus[] = ["new", "assigned", "measurement_done", "installation_scheduled", "installation_done", "closed"];

const PartnerDashboard = () => {
  const [requests] = useState<PartnerRequest[]>(initialRequests);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | RequestType>("all");

  useEffect(() => { document.title = "Мои заявки — Партнёр"; }, []);

  const selected = requests.find((r) => r.id === selectedId);

  const filtered = requests.filter((r) => {
    const matchSearch = r.objectName.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.address.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || r.type === filterType;
    return matchSearch && matchType;
  });

  const activeRequests = filtered.filter((r) => r.status !== "closed");
  const closedRequests = filtered.filter((r) => r.status === "closed");

  const currentStepIndex = selected ? statusSteps.indexOf(selected.status) : -1;

  return (
    <DashboardLayout role="partner" userName="ООО РемонтПро">
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Мои заявки</h1>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по объекту, адресу, номеру..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-1.5">
            {[
              { value: "all" as const, label: "Все" },
              { value: "measurement" as const, label: "Замер" },
              { value: "installation" as const, label: "Монтаж" },
              { value: "reclamation" as const, label: "Рекламация" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilterType(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterType === f.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Request list */}
          <div className="lg:col-span-2 space-y-3">
            {activeRequests.length === 0 && closedRequests.length === 0 && (
              <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Заявок не найдено</CardContent></Card>
            )}

            {activeRequests.map((r) => (
              <Card
                key={r.id}
                className={`hover:shadow-md transition-all cursor-pointer border-l-4 ${
                  selectedId === r.id ? "border-l-primary ring-2 ring-primary/20" : "border-l-transparent"
                }`}
                onClick={() => setSelectedId(selectedId === r.id ? null : r.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-mono text-xs text-muted-foreground">{r.id}</p>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-muted-foreground">
                          {requestTypeLabels[r.type]}
                        </span>
                      </div>
                      <p className="font-semibold text-sm truncate">{r.objectName}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin size={12} /> {r.address}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                        {statusLabels[r.status]}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar size={12} /> {r.date}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Исполнитель: <span className="font-medium text-foreground">PrimeDoor Service</span>
                  </p>
                </CardContent>
              </Card>
            ))}

            {closedRequests.length > 0 && (
              <>
                <h2 className="text-sm font-medium text-muted-foreground mt-4 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" /> Завершённые
                </h2>
                {closedRequests.map((r) => (
                  <Card
                    key={r.id}
                    className={`opacity-70 hover:opacity-100 transition-all cursor-pointer ${
                      selectedId === r.id ? "ring-2 ring-primary/20" : ""
                    }`}
                    onClick={() => setSelectedId(selectedId === r.id ? null : r.id)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-mono text-xs text-muted-foreground">{r.id}</p>
                        <p className="font-medium text-sm">{r.objectName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                          {statusLabels[r.status]}
                        </span>
                        <span className="text-xs text-muted-foreground">{r.date}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>

          {/* Detail / Tracking panel */}
          <div className="lg:col-span-1">
            {selected ? (
              <Card className="sticky top-6 border-t-4 border-t-primary">
                <CardContent className="p-5 space-y-5">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{selected.id}</p>
                    <h2 className="text-lg font-heading font-bold mt-1">{selected.objectName}</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin size={14} /> {selected.address}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar size={14} /> {selected.date}
                    </p>
                  </div>

                  {selected.comment && (
                    <div className="bg-accent/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Комментарий:</p>
                      <p className="text-sm">{selected.comment}</p>
                    </div>
                  )}

                  {/* Status tracker */}
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1">
                      <Clock size={14} /> Прогресс выполнения
                    </h3>
                    <div className="space-y-0">
                      {statusSteps.map((step, i) => {
                        const isPast = i <= currentStepIndex;
                        const isCurrent = i === currentStepIndex;
                        return (
                          <div key={step} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${
                                isCurrent
                                  ? "border-primary bg-primary"
                                  : isPast
                                    ? "border-green-500 bg-green-500"
                                    : "border-border bg-background"
                              }`} />
                              {i < statusSteps.length - 1 && (
                                <div className={`w-0.5 h-5 ${isPast ? "bg-green-300" : "bg-border"}`} />
                              )}
                            </div>
                            <p className={`text-xs pb-3 ${
                              isCurrent ? "font-semibold text-primary" : isPast ? "text-foreground" : "text-muted-foreground"
                            }`}>
                              {statusLabels[step]}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Result files for closed */}
                  {selected.resultFiles && selected.resultFiles.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                        <FileText size={14} /> Документы результата
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.resultFiles.map((f, i) => (
                          <span key={i} className="px-3 py-1.5 bg-accent rounded-lg text-xs cursor-pointer hover:bg-accent/80 transition-colors">
                            📎 {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
                    Исполнитель: <span className="font-medium text-foreground">PrimeDoor Service</span>
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Package size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Выберите заявку для просмотра деталей и трекинга</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PartnerDashboard;
