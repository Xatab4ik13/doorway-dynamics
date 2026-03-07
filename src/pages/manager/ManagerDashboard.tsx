import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels, statusColors, requestTypeLabels, getStatusLabel, type RequestStatus, type RequestType } from "@/data/mockDashboard";
import { ClipboardList, Clock, CheckCircle, AlertTriangle, Briefcase, Loader2, Plus, MapPin } from "lucide-react";
import RequestDetailModal from "@/components/dashboard/RequestDetailModal";
import RequestFilters, { type FilterState, defaultFilters } from "@/components/dashboard/RequestFilters";
import CreateRequestModal from "@/components/dashboard/CreateRequestModal";
import Pagination from "@/components/dashboard/Pagination";
import CityToggle, { type CityFilter } from "@/components/dashboard/CityToggle";
import MobileRequestCard from "@/components/dashboard/MobileRequestCard";
import { useUsers, useRequests, type ApiRequest } from "@/hooks/useRequests";
import { usePaginatedRequests } from "@/hooks/usePaginatedRequests";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { exportToCSV, exportToExcel } from "@/lib/exportRequests";
import { motion } from "framer-motion";

const quickFilters = [
  { label: "Все", value: "all", icon: <ClipboardList size={14} /> },
  { label: "Новые", value: "new", icon: <Clock size={14} /> },
  { label: "В работе", value: "in_progress", icon: <CheckCircle size={14} /> },
  { label: "Рекламации", value: "reclamation", icon: <AlertTriangle size={14} /> },
];

const ManagerDashboard = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { users, getUserName } = useUsers();
  const [city, setCity] = useState<CityFilter>("Москва");
  const [filters, setFilters] = useState<FilterState>({ ...defaultFilters, city: "Москва" });
  const [quickFilter, setQuickFilter] = useState("all");
  const { requests, total, page, totalPages, limit, counts, loading, setPage, refetch } = usePaginatedRequests(filters, { quickFilter });
  const { createRequest, updateRequest } = useRequests();
  const [selectedRequest, setSelectedRequest] = useState<ApiRequest | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { document.title = "Заявки — Менеджер"; }, []);

  const displayCounts = counts || { all: 0, new: 0, in_progress: 0, reclamation: 0 };

  const handleExport = (format: "csv" | "xlsx") => {
    if (format === "csv") exportToCSV(requests, getUserName);
    else exportToExcel(requests, getUserName);
  };

  const handleSave = async (id: string, updates: Partial<ApiRequest>) => {
    await updateRequest(id, updates);
    setSelectedRequest(null);
    refetch();
  };

  const handleCreate = async (data: Partial<ApiRequest>) => {
    const created = await createRequest(data);
    refetch();
    return created;
  };

  return (
    <DashboardLayout role="manager" userName={user?.name || "Менеджер"}>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-heading font-bold">Все заявки</h1>
            <CityToggle value={city} onChange={(c) => { setCity(c); setFilters(f => ({ ...f, city: c })); }} />
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-md shadow-primary/25"
          >
            <Plus size={16} /> Создать заявку
          </button>
        </div>

        {/* Quick filters */}
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setQuickFilter(f.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                quickFilter === f.value
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              {f.icon}
              {f.label}
              <span className={`ml-1 text-xs px-2 py-0.5 rounded-full font-bold ${
                quickFilter === f.value ? "bg-primary-foreground/20 text-primary-foreground" : "bg-accent"
              }`}>
                {displayCounts[f.value as keyof typeof displayCounts] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <Card className="overflow-hidden border-0 shadow-lg">
          <CardContent className="p-5">
            <RequestFilters
              filters={filters}
              onChange={setFilters}
              users={users}
              onExport={handleExport}
              resultCount={total}
            />

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-primary" size={36} />
              </div>
            ) : (
              <div className="mt-4">
                {isMobile ? (
                  <div className="space-y-2.5">
                    {requests.map((r, i) => (
                      <MobileRequestCard
                        key={r.id}
                        request={r}
                        index={i}
                        onClick={() => setSelectedRequest(r)}
                        getUserName={getUserName}
                      />
                    ))}
                    {requests.length === 0 && (
                      <p className="text-center text-muted-foreground py-12 text-sm">Заявки не найдены</p>
                    )}
                  </div>
                ) : (
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-border text-left text-[10px] text-muted-foreground uppercase tracking-wider">
                          <th className="pb-3 pr-4">№</th>
                          <th className="pb-3 pr-4">Клиент</th>
                          <th className="pb-3 pr-4">Адрес</th>
                          <th className="pb-3 pr-4">Город</th>
                          <th className="pb-3 pr-4">Тип</th>
                          <th className="pb-3 pr-4">Статус</th>
                          <th className="pb-3 pr-4">Источник</th>
                          <th className="pb-3 pr-4">Исполнитель</th>
                          <th className="pb-3 pr-4">Межком.</th>
                          <th className="pb-3 pr-4">Входные</th>
                          <th className="pb-3 pr-4">Перег.</th>
                          <th className="pb-3 pr-4">Сумма</th>
                          <th className="pb-3">Дата</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map((r, i) => (
                          <motion.tr
                            key={r.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02, duration: 0.2 }}
                            onClick={() => setSelectedRequest(r)}
                            className="border-b border-border/50 last:border-0 hover:bg-primary/5 transition-colors cursor-pointer"
                          >
                            <td className="py-3.5 pr-4 font-mono text-xs text-primary">{r.number}</td>
                            <td className="py-3.5 pr-4 font-medium">{r.client_name}</td>
                            <td className="py-3.5 pr-4 text-xs text-muted-foreground max-w-[200px] truncate">
                              <span className="flex items-center gap-1"><MapPin size={10} className="shrink-0" />{r.client_address || "—"}</span>
                            </td>
                            <td className="py-3.5 pr-4 text-xs text-muted-foreground">{r.city || "—"}</td>
                            <td className="py-3.5 pr-4 text-xs">
                              {requestTypeLabels[r.type] || r.type}
                            </td>
                            <td className="py-3.5 pr-4">
                              <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[r.status as RequestStatus] || "bg-gray-100 text-gray-500"}`}>
                                {getStatusLabel(r.status as RequestStatus, r.type as RequestType)}
                              </span>
                            </td>
                            <td className="py-3.5 pr-4 text-xs">
                              {r.partner_id ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-medium">
                                  <Briefcase size={10} /> {getUserName(r.partner_id) || "Партнёр"}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Сайт</span>
                              )}
                            </td>
                            <td className="py-3.5 pr-4 text-xs text-muted-foreground">
                              {getUserName(r.measurer_id) || getUserName(r.installer_id) || "—"}
                            </td>
                            <td className="py-3.5 pr-4 text-xs text-center text-muted-foreground">{r.interior_doors ?? "—"}</td>
                            <td className="py-3.5 pr-4 text-xs text-center text-muted-foreground">{r.entrance_doors ?? "—"}</td>
                            <td className="py-3.5 pr-4 text-xs text-center text-muted-foreground">{r.partitions ?? "—"}</td>
                            <td className="py-3.5 pr-4 text-xs text-muted-foreground">
                              {r.amount != null ? `${r.amount.toLocaleString("ru-RU")} ₽` : "—"}
                            </td>
                            <td className="py-3.5 text-xs text-muted-foreground">{r.created_at?.split("T")[0]}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                    {requests.length === 0 && (
                      <p className="text-center text-muted-foreground py-12 text-sm">Заявки не найдены</p>
                    )}
                  </div>
                )}

                <Pagination
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  limit={limit}
                  onPageChange={setPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSave={handleSave}
          viewerRole="manager"
          onSendToInstallation={async (req) => {
            await createRequest({
              type: "installation",
              client_name: req.client_name,
              client_phone: req.client_phone,
              client_address: req.client_address,
              city: req.city,
              extra_name: req.extra_name,
              extra_phone: req.extra_phone,
              work_description: req.work_description,
              notes: req.notes,
              photos: req.photos,
              source: req.source,
              partner_id: req.partner_id,
            });
          }}
        />
      )}

      {showCreate && (
        <CreateRequestModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </DashboardLayout>
  );
};

export default ManagerDashboard;
