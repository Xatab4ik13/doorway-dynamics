import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels, statusColors, type RequestStatus } from "@/data/mockDashboard";
import { Search, Calendar, MapPin, Phone, User, MessageSquare, ChevronDown, ChevronUp, Loader2, Image, FileText, ExternalLink } from "lucide-react";
import { useRequests, type ApiRequest } from "@/hooks/useRequests";
import { useAuth } from "@/contexts/AuthContext";

const InstallerHistory = () => {
  const { user } = useAuth();
  const { requests, loading } = useRequests();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { document.title = "История — Монтажник"; }, []);

  const completed = requests.filter((r) => r.status === "closed");

  const filtered = completed.filter((r) =>
    r.client_name.toLowerCase().includes(search.toLowerCase()) ||
    r.number.toLowerCase().includes(search.toLowerCase()) ||
    (r.client_address || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="installer" userName={user?.name || "Монтажник"}>
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
                onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
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
                      {expandedId === r.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {expandedId === r.id && (
                    <div className="mt-3 pt-3 border-t border-border space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground"><Phone size={14} /> {r.client_phone}</div>
                        <div className="flex items-center gap-2 text-muted-foreground"><MapPin size={14} /> {r.client_address}</div>
                        {r.city && <div className="flex items-center gap-2 text-muted-foreground"><MapPin size={14} /> {r.city}</div>}
                        <div className="flex items-center gap-2 text-muted-foreground"><Calendar size={14} /> Создана: {r.created_at?.split("T")[0]}</div>
                        {r.agreed_date && <div className="flex items-center gap-2 text-primary"><Calendar size={14} /> Дата монтажа: {r.agreed_date.split("T")[0]}</div>}
                      </div>
                      {r.extra_name && (
                        <div className="p-2 rounded-lg bg-accent/50">
                          <p className="text-xs text-muted-foreground">Доп. контакт</p>
                          <p className="text-sm font-medium">{r.extra_name} {r.extra_phone && `· ${r.extra_phone}`}</p>
                        </div>
                      )}
                      {r.work_description && (
                        <div className="p-3 rounded-lg bg-accent/30 border border-border">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Описание работ</p>
                          <p className="text-sm">{r.work_description}</p>
                        </div>
                      )}
                      {r.notes && (
                        <div className="p-3 rounded-lg bg-accent/30 border border-border">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Заметки</p>
                          <p className="text-sm">{r.notes}</p>
                        </div>
                      )}
                      {r.photos && r.photos.length > 0 && (
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Файлы ({r.photos.length})</p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {r.photos.map((file, i) => (
                              <a key={i} href={file.url} target="_blank" rel="noopener noreferrer"
                                className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary/40 transition-all">
                                {file.type === "image" ? (
                                  <img src={file.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-accent/50"><FileText size={20} className="text-muted-foreground" /></div>
                                )}
                              </a>
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

export default InstallerHistory;
