import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels, statusColors, requestTypeLabels, type RequestStatus, type RequestType } from "@/data/mockDashboard";
import { Search, Calendar, MapPin, ChevronDown, ChevronUp, FileText, Filter } from "lucide-react";

interface PartnerHistoryItem {
  id: string;
  type: RequestType;
  status: RequestStatus;
  objectName: string;
  address: string;
  date: string;
  closedDate?: string;
  resultFiles?: string[];
}

const historyItems: PartnerHistoryItem[] = [
  { id: "REQ-098", type: "installation", status: "closed", objectName: "ЖК Центральный, кв. 15", address: "ул. Центральная, 30", date: "2026-01-20", closedDate: "2026-02-01", resultFiles: ["акт_приёмки.pdf", "фото_результат.jpg"] },
  { id: "REQ-085", type: "measurement", status: "closed", objectName: "Офис Парковая 5", address: "ул. Парковая, 5", date: "2025-12-15", closedDate: "2025-12-20" },
  { id: "REQ-072", type: "installation", status: "closed", objectName: "ЖК Солнечный, кв. 8", address: "ул. Весенняя, 12", date: "2025-11-10", closedDate: "2025-11-28", resultFiles: ["акт_монтажа.pdf"] },
  { id: "REQ-060", type: "reclamation", status: "closed", objectName: "ЖК Парковый, кв. 3", address: "пр. Парковый, 8", date: "2025-10-05", closedDate: "2025-10-12" },
];

const PartnerHistory = () => {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { document.title = "История заявок — Партнёр"; }, []);

  const filtered = historyItems.filter((r) =>
    r.objectName.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase()) ||
    r.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="partner" userName="ООО РемонтПро">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-heading font-bold">История заявок</h1>
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

        <p className="text-sm text-muted-foreground">Всего завершено: {filtered.length}</p>

        {filtered.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Нет завершённых заявок</CardContent></Card>
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
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-xs text-muted-foreground">{r.id}</p>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-muted-foreground">
                            {requestTypeLabels[r.type]}
                          </span>
                        </div>
                        <p className="font-medium text-sm mt-1">{r.objectName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                        {statusLabels[r.status]}
                      </span>
                      {expandedId === r.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {expandedId === r.id && (
                    <div className="mt-3 pt-3 border-t border-border space-y-2 text-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin size={14} /> {r.address}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar size={14} /> Создана: {r.date}
                        </div>
                        {r.closedDate && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar size={14} /> Закрыта: {r.closedDate}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Исполнитель: <span className="font-medium text-foreground">PrimeDoor Service</span>
                      </p>
                      {r.resultFiles && r.resultFiles.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <FileText size={12} /> Документы:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {r.resultFiles.map((f, i) => (
                              <span key={i} className="px-2.5 py-1 bg-accent rounded-lg text-xs cursor-pointer hover:bg-accent/80">
                                📎 {f}
                              </span>
                            ))}
                          </div>
                        </div>
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

export default PartnerHistory;
