import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { mockRequests, statusLabels, statusColors, requestTypeLabels, type ServiceRequest, type RequestStatus } from "@/data/mockDashboard";
import { Search, ClipboardList, Clock, CheckCircle, AlertTriangle, Briefcase } from "lucide-react";
import RequestDetailModal from "@/components/dashboard/RequestDetailModal";

const quickFilters = [
  { label: "Все", value: "all", icon: <ClipboardList size={14} /> },
  { label: "Новые", value: "new", icon: <Clock size={14} /> },
  { label: "В работе", value: "in_progress", icon: <CheckCircle size={14} /> },
  { label: "Рекламации", value: "reclamation", icon: <AlertTriangle size={14} /> },
];

const ManagerDashboard = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [quickFilter, setQuickFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  useEffect(() => { document.title = "Заявки — Менеджер"; }, []);

  const filtered = mockRequests.filter((r) => {
    const matchSearch = r.clientName.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()) || r.address.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    const matchType = filterType === "all" || r.type === filterType;

    let matchQuick = true;
    if (quickFilter === "new") matchQuick = r.status === "new";
    else if (quickFilter === "in_progress") matchQuick = !["new", "closed"].includes(r.status);
    else if (quickFilter === "reclamation") matchQuick = r.type === "reclamation";

    return matchSearch && matchStatus && matchType && matchQuick;
  });

  const counts = {
    all: mockRequests.length,
    new: mockRequests.filter((r) => r.status === "new").length,
    in_progress: mockRequests.filter((r) => !["new", "closed"].includes(r.status)).length,
    reclamation: mockRequests.filter((r) => r.type === "reclamation").length,
  };

  return (
    <DashboardLayout role="manager" userName="Смирнова Е.П.">
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Все заявки</h1>

        {/* Quick filters */}
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setQuickFilter(f.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                quickFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.icon}
              {f.label}
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                quickFilter === f.value ? "bg-primary-foreground/20 text-primary-foreground" : "bg-accent"
              }`}>
                {counts[f.value as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Поиск по имени, номеру или адресу..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Все типы</option>
                {Object.entries(requestTypeLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Все статусы</option>
                {Object.entries(statusLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-3 pr-4">№</th>
                    <th className="pb-3 pr-4">Клиент</th>
                    <th className="pb-3 pr-4">Город</th>
                    <th className="pb-3 pr-4">Тип</th>
                    <th className="pb-3 pr-4">Статус</th>
                    <th className="pb-3 pr-4">Источник</th>
                    <th className="pb-3 pr-4">Исполнитель</th>
                    <th className="pb-3">Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRequest(r)}
                      className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 pr-4 font-mono text-xs">{r.id}</td>
                      <td className="py-3 pr-4 font-medium">{r.clientName}</td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground">{r.city}</td>
                      <td className="py-3 pr-4 text-xs">
                        {requestTypeLabels[r.type]}
                        {r.type === "reclamation" && (
                          <span className="ml-1 text-[10px] text-green-600">Бесплатно</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                          {statusLabels[r.status]}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-xs">
                        {r.source === "partner" ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-medium">
                            <Briefcase size={10} /> {r.partnerName || "Партнёр"}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Сайт</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground">{r.assignedTo || "—"}</td>
                      <td className="py-3 text-xs text-muted-foreground">{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-8 text-sm">Заявки не найдены</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedRequest && (
        <RequestDetailModal request={selectedRequest} onClose={() => setSelectedRequest(null)} viewerRole="manager" />
      )}
    </DashboardLayout>
  );
};

export default ManagerDashboard;
