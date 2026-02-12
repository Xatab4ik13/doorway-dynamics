import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { mockRequests, statusLabels, statusColors } from "@/data/mockDashboard";
import { Search, Calendar, MapPin, ChevronDown, ChevronUp } from "lucide-react";

const allCompleted = mockRequests.filter((r) => r.assignedRole === "installer" && (r.status === "closed" || r.status === "installation_done"));

const InstallerHistory = () => {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { document.title = "История — Монтажник"; }, []);

  const filtered = allCompleted.filter((r) =>
    r.clientName.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase()) ||
    r.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="installer" userName="Бригада №3">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-heading font-bold">История заказов</h1>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring w-56"
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">Всего выполнено: {filtered.length}</p>

        {filtered.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Нет завершённых заказов</CardContent></Card>
        ) : (
          <div className="grid gap-3">
            {filtered.map((r) => (
              <Card
                key={r.id}
                className="cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">{r.id}</p>
                      <p className="font-medium text-sm">{r.clientName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                        {statusLabels[r.status]}
                      </span>
                      <span className="text-xs text-muted-foreground">{r.date}</span>
                      {expandedId === r.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {expandedId === r.id && (
                    <div className="mt-3 pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin size={14} /> {r.address}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar size={14} /> {r.date}
                      </div>
                      {r.assignedTo && (
                        <div className="text-muted-foreground text-xs">Исполнитель: {r.assignedTo}</div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InstallerHistory;
