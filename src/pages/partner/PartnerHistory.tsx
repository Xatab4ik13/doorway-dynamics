import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels, statusColors, requestTypeLabels, type RequestStatus } from "@/data/mockDashboard";
import { Search, Loader2 } from "lucide-react";
import { useRequests, type ApiRequest } from "@/hooks/useRequests";
import { useAuth } from "@/contexts/AuthContext";
import RequestDetailModal from "@/components/dashboard/RequestDetailModal";

const PartnerHistory = () => {
  const { user } = useAuth();
  const { requests, loading } = useRequests();
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<ApiRequest | null>(null);

  useEffect(() => { document.title = "История заявок — Партнёр"; }, []);

  const closed = requests.filter((r) => r.status === "closed" || r.status === "cancelled");

  const filtered = closed.filter((r) => {
    const q = search.toLowerCase().replace(/\s/g, "");
    return r.client_name.toLowerCase().includes(search.toLowerCase()) ||
      r.number.toLowerCase().includes(search.toLowerCase()) ||
      (r.client_address || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.client_phone || "").replace(/\s/g, "").includes(q);
  });

  return (
    <DashboardLayout role="partner" userName={user?.name || "Партнёр"}>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-heading font-bold">История заявок</h1>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" autoComplete="off" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск..."
              className="pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring w-56" />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">Всего завершено: {filtered.length}</p>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={32} /></div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Нет завершённых заявок</CardContent></Card>
        ) : (
          <div className="grid gap-3">
            {filtered.map((r) => (
              <Card key={r.id} className="cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => setSelectedRequest(r)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs text-muted-foreground">{r.number}</p>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-muted-foreground">
                          {requestTypeLabels[r.type] || r.type}
                        </span>
                      </div>
                      <p className="font-medium text-sm mt-1">{r.client_name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status as RequestStatus] || "bg-gray-100 text-gray-500"}`}>
                        {statusLabels[r.status as RequestStatus] || r.status}
                      </span>
                      <span className="text-xs text-muted-foreground">{r.created_at?.split("T")[0]}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          viewerRole="partner"
        />
      )}
    </DashboardLayout>
  );
};

export default PartnerHistory;
