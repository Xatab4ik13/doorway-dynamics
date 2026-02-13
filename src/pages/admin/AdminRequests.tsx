import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels, statusColors, requestTypeLabels, type RequestStatus } from "@/data/mockDashboard";
import { Download, Briefcase, Loader2, Plus, MapPin } from "lucide-react";
import RequestDetailModal from "@/components/dashboard/RequestDetailModal";
import RequestFilters, { type FilterState, defaultFilters } from "@/components/dashboard/RequestFilters";
import CreateRequestModal from "@/components/dashboard/CreateRequestModal";
import { useRequests, useUsers, type ApiRequest } from "@/hooks/useRequests";
import { useAuth } from "@/contexts/AuthContext";
import { exportToCSV, exportToExcel } from "@/lib/exportRequests";
import { motion } from "framer-motion";

const AdminRequests = () => {
  const { user } = useAuth();
  const { requests, loading, updateRequest, createRequest } = useRequests();
  const { users, getUserName } = useUsers();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [selectedRequest, setSelectedRequest] = useState<ApiRequest | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { document.title = "Заявки — Админ-панель"; }, []);

  const filtered = requests.filter((r) => {
    const s = filters.search.toLowerCase();
    const matchSearch = !s ||
      r.client_name.toLowerCase().includes(s) ||
      r.number.toLowerCase().includes(s) ||
      (r.client_address || "").toLowerCase().includes(s) ||
      (r.client_phone || "").toLowerCase().includes(s) ||
      (r.city || "").toLowerCase().includes(s);
    const matchStatus = filters.status === "all" || r.status === filters.status;
    const matchType = filters.type === "all" || r.type === filters.type;
    const matchMeasurer = filters.measurerId === "all" || r.measurer_id === filters.measurerId;
    const matchInstaller = filters.installerId === "all" || r.installer_id === filters.installerId;
    const matchPartner = filters.partnerId === "all" || r.partner_id === filters.partnerId;
    const created = r.created_at?.split("T")[0] || "";
    const matchDateFrom = !filters.dateFrom || created >= filters.dateFrom;
    const matchDateTo = !filters.dateTo || created <= filters.dateTo;
    return matchSearch && matchStatus && matchType && matchMeasurer && matchInstaller && matchPartner && matchDateFrom && matchDateTo;
  });

  const handleExport = (format: "csv" | "xlsx") => {
    if (format === "csv") exportToCSV(filtered, getUserName);
    else exportToExcel(filtered, getUserName);
  };

  const handleSave = async (id: string, updates: Partial<ApiRequest>) => {
    await updateRequest(id, updates);
    setSelectedRequest(null);
  };

  return (
    <DashboardLayout role="admin" userName={user?.name || "Админ"}>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-heading font-bold">Заявки</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-md shadow-primary/25"
          >
            <Plus size={16} /> Создать заявку
          </button>
        </div>

        <Card className="overflow-hidden border-0 shadow-lg">
          <CardContent className="p-5">
            <RequestFilters
              filters={filters}
              onChange={setFilters}
              users={users}
              onExport={handleExport}
              resultCount={filtered.length}
            />

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-primary" size={36} />
              </div>
            ) : (
              <div className="overflow-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-border text-left text-[10px] text-muted-foreground uppercase tracking-wider">
                      <th className="pb-3 pr-4">№</th>
                      <th className="pb-3 pr-4">Клиент</th>
                      <th className="pb-3 pr-4">Телефон</th>
                      <th className="pb-3 pr-4">Адрес</th>
                      <th className="pb-3 pr-4">Город</th>
                      <th className="pb-3 pr-4">Тип</th>
                      <th className="pb-3 pr-4">Статус</th>
                      <th className="pb-3 pr-4">Источник</th>
                      <th className="pb-3 pr-4">Исполнитель</th>
                      <th className="pb-3">Дата</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, i) => (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02, duration: 0.2 }}
                        onClick={() => setSelectedRequest(r)}
                        className="border-b border-border/50 last:border-0 hover:bg-primary/5 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 pr-4 font-mono text-xs text-primary">{r.number}</td>
                        <td className="py-3.5 pr-4 font-medium">{r.client_name}</td>
                        <td className="py-3.5 pr-4 text-xs text-muted-foreground">{r.client_phone}</td>
                        <td className="py-3.5 pr-4 text-xs text-muted-foreground max-w-[200px] truncate">
                          <span className="flex items-center gap-1"><MapPin size={10} className="shrink-0" />{r.client_address || "—"}</span>
                        </td>
                        <td className="py-3.5 pr-4 text-xs text-muted-foreground">{r.city || "—"}</td>
                        <td className="py-3.5 pr-4 text-xs">
                          {requestTypeLabels[r.type] || r.type}
                          {r.type === "reclamation" && (
                            <span className="ml-1 text-[10px] text-emerald-600 font-medium">Бесплатно</span>
                          )}
                        </td>
                        <td className="py-3.5 pr-4">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[r.status as RequestStatus] || "bg-gray-100 text-gray-500"}`}>
                            {statusLabels[r.status as RequestStatus] || r.status}
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
                        <td className="py-3.5 text-xs text-muted-foreground">{r.created_at?.split("T")[0]}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <p className="text-center text-muted-foreground py-12 text-sm">Заявки не найдены</p>
                )}
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
          viewerRole="admin"
        />
      )}

      {showCreate && (
        <CreateRequestModal
          onClose={() => setShowCreate(false)}
          onCreate={createRequest}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminRequests;
