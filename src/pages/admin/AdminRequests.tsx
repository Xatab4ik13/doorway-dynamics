import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels, statusColors, requestTypeLabels, type RequestStatus } from "@/data/mockDashboard";
import { Search, Download, Trash2, Briefcase, Loader2 } from "lucide-react";
import RequestDetailModal from "@/components/dashboard/RequestDetailModal";
import { useRequests, useUsers, type ApiRequest } from "@/hooks/useRequests";
import { useAuth } from "@/contexts/AuthContext";

const AdminRequests = () => {
  const { user } = useAuth();
  const { requests, loading, updateRequest } = useRequests();
  const { getUserName } = useUsers();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<ApiRequest | null>(null);

  useEffect(() => { document.title = "Заявки — Админ-панель"; }, []);

  const filtered = requests.filter((r) => {
    const matchSearch = r.client_name.toLowerCase().includes(search.toLowerCase()) || r.number.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    const matchType = filterType === "all" || r.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const getAssignedName = (r: ApiRequest) => getUserName(r.measurer_id) || getUserName(r.installer_id) || "—";

  const handleSave = async (id: string, updates: Partial<ApiRequest>) => {
    await updateRequest(id, updates);
    setSelectedRequest(null);
  };

  return (
    <DashboardLayout role="admin" userName={user?.name || "Админ"}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-heading font-bold">Заявки</h1>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <Download size={16} /> Экспорт
            </button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Поиск по имени или номеру..."
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

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-muted-foreground" size={32} />
              </div>
            ) : (
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="pb-3 pr-4">№</th>
                      <th className="pb-3 pr-4">Клиент</th>
                      <th className="pb-3 pr-4">Телефон</th>
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
                        <td className="py-3 pr-4 font-mono text-xs">{r.number}</td>
                        <td className="py-3 pr-4 font-medium">{r.client_name}</td>
                        <td className="py-3 pr-4 text-xs text-muted-foreground">{r.client_phone}</td>
                        <td className="py-3 pr-4 text-xs text-muted-foreground">{r.city || "—"}</td>
                        <td className="py-3 pr-4 text-xs">
                          {requestTypeLabels[r.type] || r.type}
                          {r.type === "reclamation" && (
                            <span className="ml-1 text-[10px] text-green-600">Бесплатно</span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status as RequestStatus] || "bg-gray-100 text-gray-500"}`}>
                            {statusLabels[r.status as RequestStatus] || r.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs">
                          {r.partner_id ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-medium">
                              <Briefcase size={10} /> {getUserName(r.partner_id) || "Партнёр"}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Сайт</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-xs text-muted-foreground">{getAssignedName(r)}</td>
                        <td className="py-3 text-xs text-muted-foreground">{r.created_at?.split("T")[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <p className="text-center text-muted-foreground py-8 text-sm">Заявки не найдены</p>
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
    </DashboardLayout>
  );
};

export default AdminRequests;
