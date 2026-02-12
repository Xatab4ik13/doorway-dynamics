import { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { mockRequests, statusLabels, statusColors } from "@/data/mockDashboard";

const myRequests = mockRequests.filter((r) => r.assignedTo === "Сидоров К.В." && r.status !== "closed");

const MeasurerDashboard = () => {
  useEffect(() => { document.title = "Мои заявки — Замерщик"; }, []);

  return (
    <DashboardLayout role="measurer" userName="Сидоров К.В.">
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Мои заявки</h1>

        {myRequests.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Нет активных заявок</CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {myRequests.map((r) => (
              <Card key={r.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">{r.id}</p>
                      <p className="font-semibold mt-1">{r.clientName}</p>
                      <p className="text-xs text-muted-foreground mt-1">{r.address}</p>
                      <p className="text-xs text-muted-foreground">{r.clientPhone}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                        {statusLabels[r.status]}
                      </span>
                      <p className="text-xs text-muted-foreground mt-2">{r.date}</p>
                    </div>
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

export default MeasurerDashboard;
