import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels, statusColors, type RequestStatus } from "@/data/mockDashboard";
import { Search, Calendar, MapPin, Loader2 } from "lucide-react";
import { useRequests, type ApiRequest } from "@/hooks/useRequests";
import { useAuth } from "@/contexts/AuthContext";
import RequestDetailModal from "@/components/dashboard/RequestDetailModal";

const MeasurerHistory = () => {
  const { user } = useAuth();
  const { requests, loading } = useRequests();
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<ApiRequest | null>(null);

  useEffect(() => { document.title = "История — Замерщик"; }, []);

  const completed = requests.filter((r) => r.status === "measurement_done" || r.status === "closed");

  const filtered = completed.filter((r) =>
    r.client_name.toLowerCase().includes(search.toLowerCase()) ||
    r.number.toLowerCase().includes(search.toLowerCase()) ||
    (r.client_address || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="measurer" userName={user?.name || "Замерщик"}>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-heading font-bold">История заказов</h1>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск..."
              className="pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring w-56" />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">Всего выполнено: {filtered.length}</p>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={32} /></div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Нет завершённых заказов</CardContent></Card>
        ) : (
          <div className="grid gap-3">
            {filtered.map((r) => (
              <Card key={r.id} className="cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => setSelectedRequest(r)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">{r.number}</p>
                      <p className="font-medium text-sm">{r.client_name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status as RequestStatus] || "bg-gray-100"}`}>
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
          viewerRole="measurer"
        />
      )}
    </DashboardLayout>
  );
};

export default MeasurerHistory;
