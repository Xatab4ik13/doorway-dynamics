import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockRequests } from "@/data/mockDashboard";
import { Upload, FileText, Image, FolderOpen, Search, Download, Eye, ChevronDown, ChevronRight } from "lucide-react";

interface MockFile {
  id: string;
  name: string;
  type: "image" | "document";
  size: string;
  date: string;
  requestId: string;
}

const mockFiles: MockFile[] = [
  { id: "f1", name: "замер_план.jpg", type: "image", size: "2.4 MB", date: "2026-02-09", requestId: "REQ-002" },
  { id: "f2", name: "замер_фото_1.jpg", type: "image", size: "3.1 MB", date: "2026-02-09", requestId: "REQ-002" },
  { id: "f3", name: "проём_размеры.pdf", type: "document", size: "540 KB", date: "2026-02-08", requestId: "REQ-003" },
  { id: "f4", name: "монтаж_до.jpg", type: "image", size: "4.2 MB", date: "2026-02-07", requestId: "REQ-004" },
  { id: "f5", name: "монтаж_после_1.jpg", type: "image", size: "3.8 MB", date: "2026-02-05", requestId: "REQ-005" },
  { id: "f6", name: "монтаж_после_2.jpg", type: "image", size: "4.0 MB", date: "2026-02-05", requestId: "REQ-005" },
  { id: "f7", name: "акт_выполненных_работ.pdf", type: "document", size: "120 KB", date: "2026-02-05", requestId: "REQ-005" },
  { id: "f8", name: "рекламация_фото.jpg", type: "image", size: "2.9 MB", date: "2026-02-11", requestId: "REQ-006" },
  { id: "f9", name: "замер_чертёж.pdf", type: "document", size: "1.2 MB", date: "2026-01-28", requestId: "REQ-007" },
];

const ManagerFiles = () => {
  const [search, setSearch] = useState("");
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set(["REQ-002", "REQ-005"]));

  useEffect(() => { document.title = "Файлы — Менеджер"; }, []);

  // Group files by request
  const requestIds = [...new Set(mockFiles.map((f) => f.requestId))];
  const filteredFiles = search
    ? mockFiles.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()) || f.requestId.toLowerCase().includes(search.toLowerCase()))
    : mockFiles;
  const filteredRequestIds = [...new Set(filteredFiles.map((f) => f.requestId))];

  const toggleExpand = (id: string) => {
    const next = new Set(expandedRequests);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedRequests(next);
  };

  const getRequestInfo = (id: string) => mockRequests.find((r) => r.id === id);

  const stats = {
    total: mockFiles.length,
    images: mockFiles.filter((f) => f.type === "image").length,
    documents: mockFiles.filter((f) => f.type === "document").length,
  };

  return (
    <DashboardLayout role="manager" userName="Смирнова Е.П.">
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Файлы</h1>

        {/* Stats */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm">
            <FolderOpen size={16} className="text-muted-foreground" />
            <span className="font-medium">{stats.total}</span>
            <span className="text-muted-foreground">файлов</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm">
            <Image size={16} className="text-blue-500" />
            <span className="font-medium">{stats.images}</span>
            <span className="text-muted-foreground">фото</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm">
            <FileText size={16} className="text-orange-500" />
            <span className="font-medium">{stats.documents}</span>
            <span className="text-muted-foreground">документов</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск по имени файла или номеру заявки..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* File groups */}
        <div className="space-y-3">
          {filteredRequestIds.map((reqId) => {
            const reqInfo = getRequestInfo(reqId);
            const reqFiles = filteredFiles.filter((f) => f.requestId === reqId);
            const isExpanded = expandedRequests.has(reqId);

            return (
              <Card key={reqId}>
                <div
                  onClick={() => toggleExpand(reqId)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronRight size={16} className="text-muted-foreground" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{reqId}</span>
                        <span className="text-sm font-medium">{reqInfo?.clientName || "—"}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{reqInfo?.address}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-accent px-2 py-0.5 rounded-full text-muted-foreground">
                    {reqFiles.length} файлов
                  </span>
                </div>

                {isExpanded && (
                  <CardContent className="pt-0 pb-4">
                    <div className="border-t border-border pt-3 space-y-2">
                      {reqFiles.map((file) => (
                        <div key={file.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors">
                          {file.type === "image" ? (
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                              <Image size={18} className="text-blue-500" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                              <FileText size={18} className="text-orange-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{file.size} · {file.date}</p>
                          </div>
                          <div className="flex gap-1">
                            <button className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                              <Eye size={14} />
                            </button>
                            <button className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                              <Download size={14} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Upload area */}
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/40 transition-colors cursor-pointer mt-3">
                        <Upload size={20} className="mx-auto text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">Загрузить файлы к заявке {reqId}</p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
          {filteredRequestIds.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground text-sm">
                Файлы не найдены
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerFiles;
