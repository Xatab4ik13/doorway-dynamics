import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Image, FolderOpen, Search, Download, Eye, ChevronDown, ChevronRight, Loader2, Camera } from "lucide-react";
import { useRequests, type ApiRequest } from "@/hooks/useRequests";
import { useAuth } from "@/contexts/AuthContext";


const ManagerFiles = () => {
  const { user } = useAuth();
  const { requests, loading } = useRequests();
  const [search, setSearch] = useState("");
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => { document.title = "Файлы — Менеджер"; }, []);

  const requestsWithFiles = requests.filter(r => {
    const hasPhotos = (r.photos && r.photos.length > 0);
    const matchSearch = !search ||
      r.number.toLowerCase().includes(search.toLowerCase()) ||
      r.client_name.toLowerCase().includes(search.toLowerCase());
    return matchSearch && hasPhotos;
  });

  const allRequests = requests.filter(r => {
    return !search ||
      r.number.toLowerCase().includes(search.toLowerCase()) ||
      r.client_name.toLowerCase().includes(search.toLowerCase());
  });

  const toggleExpand = (id: string) => {
    const next = new Set(expandedRequests);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedRequests(next);
  };

  const totalFiles = requests.reduce((sum, r) => sum + (r.photos?.length || 0), 0);

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
            <span className="font-medium">{requestsWithFiles.length}</span>
            <span className="text-muted-foreground">заявок с файлами</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm">
            <Image size={16} className="text-primary" />
            <span className="font-medium">{totalFiles}</span>
            <span className="text-muted-foreground">файлов</span>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" autoComplete="off" placeholder="Поиск по номеру или клиенту..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div className="space-y-3">
          {(search ? allRequests : requestsWithFiles).map((req) => {
            const isExpanded = expandedRequests.has(req.id);
            const photos = req.photos || [];
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
                        {photos.length > 0 && (
                          <span className="flex items-center gap-1 text-xs text-primary">
                            <Camera size={12} /> {photos.length}
                          </span>
                        )}
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
                      {photos.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          Файлы ещё не загружены исполнителями
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {photos.map((photo, i) => (
                            <div key={i} className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-accent/30">
                              <img src={photo.url} alt={`Файл ${i + 1}`}
                                className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                <button onClick={(e) => { e.stopPropagation(); setPreviewUrl(photo.url); }}
                                  className="p-1.5 bg-white/90 rounded-lg hover:bg-white transition-colors">
                                  <Eye size={14} />
                                </button>
                                <a href={photo.url} download target="_blank" rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 bg-white/90 rounded-lg hover:bg-white transition-colors">
                                  <Download size={14} />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
          {(search ? allRequests : requestsWithFiles).length === 0 && (
            <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">
              {search ? "Заявки не найдены" : "Нет заявок с загруженными файлами"}
            </CardContent></Card>
          )}
        </div>
      </div>

      {/* Lightbox preview */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setPreviewUrl(null)}>
          <img src={previewUrl} alt="Preview" className="max-w-full max-h-full rounded-lg shadow-2xl" />
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManagerFiles;
