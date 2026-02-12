import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Image, FolderOpen, Search, Download, Eye, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { useRequests, type ApiRequest } from "@/hooks/useRequests";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "https://api.primedoor.ru";

const ManagerFiles = () => {
  const { user } = useAuth();
  const { requests, loading } = useRequests();
  const [search, setSearch] = useState("");
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());

  useEffect(() => { document.title = "Файлы — Менеджер"; }, []);

  // Filter requests that might have files (stage_photos table or executor uploads)
  const requestsWithContext = requests.filter(r => {
    const matchSearch = !search || 
      r.number.toLowerCase().includes(search.toLowerCase()) ||
      r.client_name.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const toggleExpand = (id: string) => {
    const next = new Set(expandedRequests);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedRequests(next);
  };

  const stats = {
    total: requests.length,
    withFiles: requests.filter(r => ["measurement_done", "installation_done", "closed"].includes(r.status)).length,
  };

  if (loading) {
    return (
      <DashboardLayout role="manager" userName={user?.name || "Менеджер"}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="manager" userName={user?.name || "Менеджер"}>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Файлы</h1>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm">
            <FolderOpen size={16} className="text-muted-foreground" />
            <span className="font-medium">{stats.total}</span>
            <span className="text-muted-foreground">заявок</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm">
            <Image size={16} className="text-blue-500" />
            <span className="font-medium">{stats.withFiles}</span>
            <span className="text-muted-foreground">с отчётами</span>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Поиск по номеру или клиенту..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div className="space-y-3">
          {requestsWithContext.map((req) => {
            const isExpanded = expandedRequests.has(req.id);
            return (
              <Card key={req.id}>
                <div onClick={() => toggleExpand(req.id)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronRight size={16} className="text-muted-foreground" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{req.number}</span>
                        <span className="text-sm font-medium">{req.client_name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{req.client_address}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-accent px-2 py-0.5 rounded-full text-muted-foreground">
                    {req.type === "measurement" ? "Замер" : req.type === "installation" ? "Монтаж" : "Рекламация"}
                  </span>
                </div>

                {isExpanded && (
                  <CardContent className="pt-0 pb-4">
                    <div className="border-t border-border pt-3">
                      <p className="text-xs text-muted-foreground text-center py-4">
                        Файлы загружаются исполнителями через их кабинеты. Здесь будут отображаться фото и документы, прикреплённые к заявке.
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
          {requestsWithContext.length === 0 && (
            <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Заявки не найдены</CardContent></Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerFiles;
