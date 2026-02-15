import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statusLabels, statusColors, requestTypeLabels } from "@/data/mockDashboard";
import { UserCheck, ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRequests, useUsers, type ApiRequest } from "@/hooks/useRequests";
import { useAuth } from "@/contexts/AuthContext";

const ManagerAssign = () => {
  const { user } = useAuth();
  const { requests, loading, updateRequest } = useRequests();
  const { getByRole, loading: usersLoading } = useUsers();
  const [selectedRequest, setSelectedRequest] = useState<ApiRequest | null>(null);
  const [selectedExecutorId, setSelectedExecutorId] = useState<string>("");

  useEffect(() => { document.title = "Распределение — Менеджер"; }, []);

  const unassigned = requests.filter((r) => !r.measurer_id && !r.installer_id && r.status === "new");
  const measurers = getByRole("measurer");
  const installers = getByRole("installer");

  const handleAssign = async () => {
    if (!selectedRequest || !selectedExecutorId) return;
    const executor = [...measurers, ...installers].find(u => u.id === selectedExecutorId);
    if (!executor) return;

    const updates: Partial<ApiRequest> = {};
    if (executor.role === "measurer") {
      (updates as any).status = "measurer_assigned";
      (updates as any).measurer_id = executor.id;
    } else {
      // For installers, just assign without changing status
      (updates as any).installer_id = executor.id;
    }

    try {
      await updateRequest(selectedRequest.id, updates);
      toast.success(`${selectedRequest.number} назначена → ${executor.name}`);
      setSelectedRequest(null);
      setSelectedExecutorId("");
    } catch {}
  };

  const isLoading = loading || usersLoading;

  return (
    <DashboardLayout role="manager" userName={user?.name || "Менеджер"}>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Распределение заявок</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-muted-foreground" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Unassigned requests */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  Нераспределённые
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    {unassigned.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {unassigned.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Все заявки распределены 🎉</p>
                ) : (
                  unassigned.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => { setSelectedRequest(r); setSelectedExecutorId(""); }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedRequest?.id === r.id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs text-muted-foreground">{r.number}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          r.type === "reclamation" ? "bg-red-50 text-red-700" : r.type === "measurement" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"
                        }`}>
                          {requestTypeLabels[r.type] || r.type}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{r.client_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.client_address}</p>
                      <p className="text-xs text-muted-foreground mt-1">{r.created_at?.split("T")[0]}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Assignment panel */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Назначение</CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedRequest ? (
                  <div className="text-center py-12">
                    <UserCheck size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">Выберите заявку слева для назначения</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-accent/50 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs">{selectedRequest.number}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedRequest.status as keyof typeof statusColors] || "bg-gray-100"}`}>
                          {statusLabels[selectedRequest.status as keyof typeof statusLabels] || selectedRequest.status}
                        </span>
                      </div>
                      <p className="font-semibold">{selectedRequest.client_name}</p>
                      <p className="text-sm text-muted-foreground">{selectedRequest.client_address}</p>
                      <p className="text-sm text-muted-foreground">{selectedRequest.client_phone}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold mb-3">Замерщики</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {measurers.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setSelectedExecutorId(m.id)}
                            className={`p-3 rounded-lg border text-left transition-all ${
                              selectedExecutorId === m.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{m.name}</span>
                              {selectedExecutorId === m.id && <Check size={16} className="text-primary" />}
                            </div>
                          </button>
                        ))}
                        {measurers.length === 0 && (
                          <p className="text-xs text-muted-foreground col-span-2">Нет активных замерщиков</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold mb-3">Монтажные бригады</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {installers.map((inst) => (
                          <button
                            key={inst.id}
                            onClick={() => setSelectedExecutorId(inst.id)}
                            className={`p-3 rounded-lg border text-left transition-all ${
                              selectedExecutorId === inst.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{inst.name}</span>
                              {selectedExecutorId === inst.id && <Check size={16} className="text-primary" />}
                            </div>
                          </button>
                        ))}
                        {installers.length === 0 && (
                          <p className="text-xs text-muted-foreground col-span-3">Нет активных бригад</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleAssign}
                      disabled={!selectedExecutorId}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowRight size={16} />
                      {selectedExecutorId
                        ? `Назначить → ${[...measurers, ...installers].find(u => u.id === selectedExecutorId)?.name}`
                        : "Выберите исполнителя"}
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManagerAssign;
