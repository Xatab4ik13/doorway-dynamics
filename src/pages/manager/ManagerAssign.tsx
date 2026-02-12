import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockRequests, statusLabels, statusColors, requestTypeLabels, type ServiceRequest } from "@/data/mockDashboard";
import { UserCheck, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

const measurers = [
  { id: "m1", name: "Сидоров К.В.", active: 2 },
  { id: "m2", name: "Морозов А.И.", active: 1 },
];

const installers = [
  { id: "i1", name: "Бригада №1", active: 1 },
  { id: "i2", name: "Бригада №2", active: 0 },
  { id: "i3", name: "Бригада №3", active: 1 },
];

const ManagerAssign = () => {
  const [unassigned, setUnassigned] = useState<ServiceRequest[]>(
    mockRequests.filter((r) => !r.assignedTo && r.status === "new")
  );
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [selectedExecutor, setSelectedExecutor] = useState<string>("");

  useEffect(() => { document.title = "Распределение — Менеджер"; }, []);

  const handleAssign = () => {
    if (!selectedRequest || !selectedExecutor) return;
    setUnassigned(unassigned.filter((r) => r.id !== selectedRequest.id));
    toast.success(`${selectedRequest.id} назначена → ${selectedExecutor}`);
    setSelectedRequest(null);
    setSelectedExecutor("");
  };

  const needsMeasurer = selectedRequest?.type === "measurement" || selectedRequest?.status === "new";

  return (
    <DashboardLayout role="manager" userName="Смирнова Е.П.">
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Распределение заявок</h1>

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
                    onClick={() => { setSelectedRequest(r); setSelectedExecutor(""); }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedRequest?.id === r.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        r.type === "reclamation" ? "bg-red-50 text-red-700" : r.type === "measurement" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"
                      }`}>
                        {requestTypeLabels[r.type]}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{r.clientName}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.address}</p>
                    <p className="text-xs text-muted-foreground mt-1">{r.date}</p>
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
                  {/* Selected request info */}
                  <div className="p-4 rounded-lg bg-accent/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs">{selectedRequest.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedRequest.status]}`}>
                        {statusLabels[selectedRequest.status]}
                      </span>
                    </div>
                    <p className="font-semibold">{selectedRequest.clientName}</p>
                    <p className="text-sm text-muted-foreground">{selectedRequest.address}</p>
                    <p className="text-sm text-muted-foreground">{selectedRequest.clientPhone}</p>
                  </div>

                  {/* Executor selection */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Замерщики</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {measurers.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setSelectedExecutor(m.name)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            selectedExecutor === m.name
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{m.name}</span>
                            {selectedExecutor === m.name && <Check size={16} className="text-primary" />}
                          </div>
                          <span className="text-xs text-muted-foreground">Активных: {m.active}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-3">Монтажные бригады</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {installers.map((inst) => (
                        <button
                          key={inst.id}
                          onClick={() => setSelectedExecutor(inst.name)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            selectedExecutor === inst.name
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{inst.name}</span>
                            {selectedExecutor === inst.name && <Check size={16} className="text-primary" />}
                          </div>
                          <span className="text-xs text-muted-foreground">Активных: {inst.active}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Assign button */}
                  <button
                    onClick={handleAssign}
                    disabled={!selectedExecutor}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowRight size={16} />
                    {selectedExecutor
                      ? `Назначить → ${selectedExecutor}`
                      : "Выберите исполнителя"}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerAssign;
