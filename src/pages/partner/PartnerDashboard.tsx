import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels, statusColors, requestTypeLabels, statusFlows, getStatusLabel, type RequestStatus, type RequestType } from "@/data/mockDashboard";
import { MapPin, Calendar, Package, Clock, CheckCircle2, FileText, Search, Loader2, Image, ExternalLink } from "lucide-react";
import { useRequests, type ApiRequest } from "@/hooks/useRequests";
import { useAuth } from "@/contexts/AuthContext";

const getPartnerSteps = (type?: RequestType): RequestStatus[] => {
  if (!type) return statusFlows.measurement;
  return statusFlows[type];
};

const PartnerDashboard = () => {
  const { user } = useAuth();
  const { requests, loading } = useRequests();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | RequestType>("all");

  useEffect(() => { document.title = "Мои заявки — Партнёр"; }, []);

  const selected = requests.find((r) => r.id === selectedId);

  const filtered = requests.filter((r) => {
    const matchSearch = r.client_name.toLowerCase().includes(search.toLowerCase()) ||
      r.number.toLowerCase().includes(search.toLowerCase()) ||
      (r.client_address || "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || r.type === filterType;
    return matchSearch && matchType;
  });

  const activeRequests = filtered.filter((r) => r.status !== "closed");
  const closedRequests = filtered.filter((r) => r.status === "closed");

  const partnerSteps = selected ? getPartnerSteps(selected.type as RequestType) : [];
  const currentStepIndex = selected ? partnerSteps.indexOf(selected.status as RequestStatus) : -1;

  return (
    <DashboardLayout role="partner" userName={user?.name || "Партнёр"}>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Мои заявки</h1>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по клиенту, адресу, номеру..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-1.5">
            {([
              { value: "all" as const, label: "Все" },
              { value: "measurement" as const, label: "Замер" },
              { value: "installation" as const, label: "Монтаж" },
              { value: "reclamation" as const, label: "Рекламация" },
            ]).map((f) => (
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

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-muted-foreground" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                          <p className="font-mono text-xs text-muted-foreground">{r.number}</p>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-muted-foreground">
                            {requestTypeLabels[r.type] || r.type}
                          </span>
                        </div>
                        <p className="font-semibold text-sm truncate">{r.client_name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin size={12} /> {r.client_address}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status as RequestStatus] || "bg-gray-100 text-gray-500"}`}>
                          {statusLabels[r.status as RequestStatus] || r.status}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar size={12} /> {r.created_at?.split("T")[0]}
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
                          <p className="font-mono text-xs text-muted-foreground">{r.number}</p>
                          <p className="font-medium text-sm">{r.client_name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status as RequestStatus] || "bg-gray-100 text-gray-500"}`}>
                            {statusLabels[r.status as RequestStatus] || r.status}
                          </span>
                          <span className="text-xs text-muted-foreground">{r.created_at?.split("T")[0]}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>

            <div className="lg:col-span-1">
              {selected ? (
                <Card className="sticky top-6 border-t-4 border-t-primary">
                  <CardContent className="p-5 space-y-5">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">{selected.number}</p>
                      <h2 className="text-lg font-heading font-bold mt-1">{selected.client_name}</h2>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin size={14} /> {selected.client_address}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar size={14} /> {selected.created_at?.split("T")[0]}
                      </p>
                    </div>

                    {selected.notes && (
                      <div className="bg-accent/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Заметки:</p>
                        <p className="text-sm">{selected.notes}</p>
                      </div>
                    )}

                    {selected.work_description && (
                      <div className="bg-accent/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Описание:</p>
                        <p className="text-sm">{selected.work_description}</p>
                      </div>
                    )}

                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1">
                        <Clock size={14} /> Прогресс выполнения
                      </h3>
                      <div className="space-y-0">
                        {partnerSteps.map((step, i) => {
                          const isPast = i <= currentStepIndex;
                          const isCurrent = i === currentStepIndex;
                          return (
                            <div key={step} className="flex items-start gap-3">
                              <div className="flex flex-col items-center">
                                <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${
                                  isCurrent ? "border-primary bg-primary"
                                    : isPast ? "border-green-500 bg-green-500"
                                    : "border-border bg-background"
                                }`} />
                                {i < partnerSteps.length - 1 && (
                                  <div className={`w-0.5 h-5 ${isPast ? "bg-green-300" : "bg-border"}`} />
                                )}
                              </div>
                              <p className={`text-xs pb-3 ${
                                isCurrent ? "font-semibold text-primary" : isPast ? "text-foreground" : "text-muted-foreground"
                              }`}>
                                {getStatusLabel(step, selected?.type as RequestType)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Files section for partner */}
                    {selected.photos && selected.photos.length > 0 && (
                      <div className="border-t border-border pt-4">
                        <h3 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1">
                          <Image size={14} /> Файлы ({selected.photos.length})
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {selected.photos.map((file, i) => (
                            <a
                              key={i}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary/40 transition-all"
                            >
                              {file.type === "image" ? (
                                <img src={file.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-accent/50">
                                  <FileText size={20} className="text-muted-foreground" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <ExternalLink size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {selected.agreed_date && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg border border-primary/20">
                        <Calendar size={14} className="text-primary" />
                        <span className="text-xs font-medium text-primary">
                          {selected.type === "measurement" ? "Дата замера" : selected.type === "installation" ? "Дата монтажа" : "Дата визита"}: {selected.agreed_date.split("T")[0]}
                        </span>
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
        )}
      </div>
    </DashboardLayout>
  );
};

export default PartnerDashboard;
