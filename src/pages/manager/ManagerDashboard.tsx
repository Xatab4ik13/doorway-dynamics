import { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { mockRequests, statusLabels, statusColors, requestTypeLabels } from "@/data/mockDashboard";

const ManagerDashboard = () => {
  useEffect(() => { document.title = "Заявки — Менеджер"; }, []);

  return (
    <DashboardLayout role="manager" userName="Смирнова Е.П.">
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Все заявки</h1>

        <Card>
          <CardContent className="p-4">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-3 pr-4">№</th>
                    <th className="pb-3 pr-4">Клиент</th>
                    <th className="pb-3 pr-4">Адрес</th>
                    <th className="pb-3 pr-4">Тип</th>
                    <th className="pb-3 pr-4">Статус</th>
                    <th className="pb-3 pr-4">Исполнитель</th>
                    <th className="pb-3">Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {mockRequests.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors cursor-pointer">
                      <td className="py-3 pr-4 font-mono text-xs">{r.id}</td>
                      <td className="py-3 pr-4 font-medium">{r.clientName}</td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground max-w-[200px] truncate">{r.address}</td>
                      <td className="py-3 pr-4 text-xs">{requestTypeLabels[r.type]}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                          {statusLabels[r.status]}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground">{r.assignedTo || "—"}</td>
                      <td className="py-3 text-xs text-muted-foreground">{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
