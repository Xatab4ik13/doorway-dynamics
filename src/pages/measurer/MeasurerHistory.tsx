import { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { mockRequests, statusLabels, statusColors } from "@/data/mockDashboard";

const completedRequests = mockRequests.filter((r) => r.assignedTo === "Сидоров К.В." && r.status === "closed");

const MeasurerHistory = () => {
  useEffect(() => { document.title = "История — Замерщик"; }, []);

  return (
    <DashboardLayout role="measurer" userName="Сидоров К.В.">
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">История заказов</h1>
        {completedRequests.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Нет завершённых заказов</CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {completedRequests.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{r.id}</p>
                    <p className="font-medium text-sm">{r.clientName}</p>
                    <p className="text-xs text-muted-foreground">{r.address}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                      {statusLabels[r.status]}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{r.date}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MeasurerHistory;
