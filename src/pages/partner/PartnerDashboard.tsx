import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels, statusColors, requestTypeLabels, type RequestStatus, type RequestType } from "@/data/mockDashboard";
import { MapPin, Calendar, Search, Loader2, CheckCircle2 } from "lucide-react";
import { useRequests, type ApiRequest } from "@/hooks/useRequests";
import { useAuth } from "@/contexts/AuthContext";
import RequestDetailModal from "@/components/dashboard/RequestDetailModal";

const PartnerDashboard = () => {
  const { user } = useAuth();
  const { requests, loading, updateRequest, createRequest } = useRequests();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | RequestType>("all");
  const [selectedRequest, setSelectedRequest] = useState<ApiRequest | null>(null);

  useEffect(() => { document.title = "Мои заявки — Партнёр"; }, []);

  const filtered = requests.filter((r) => {
    const matchSearch = r.client_name.toLowerCase().includes(search.toLowerCase()) ||
      r.number.toLowerCase().includes(search.toLowerCase()) ||
      (r.client_address || "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || r.type === filterType;
    return matchSearch && matchType;
  });

  const activeRequests = filtered.filter((r) => r.status !== "closed");
  const closedRequests = filtered.filter((r) => r.status === "closed");

  const handleSave = async (id: string, updates: Partial<ApiRequest>) => {
    await updateRequest(id, updates);
    // Update selected request in place
    setSelectedRequest(prev => prev ? { ...prev, ...updates } : null);
  };

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
              autoComplete="off"
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
          <div className="space-y-3">
            {activeRequests.length === 0 && closedRequests.length === 0 && (
              <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Заявок не найдено</CardContent></Card>
            )}

            {activeRequests.map((r) => (
              <Card
                key={r.id}
                className="hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedRequest(r)}
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
                    className="opacity-70 hover:opacity-100 transition-all cursor-pointer"
                    onClick={() => setSelectedRequest(r)}
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
        )}
      </div>

      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSave={handleSave}
          viewerRole="partner"
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
    </DashboardLayout>
  );
};

export default PartnerDashboard;
