import { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels, statusColors, requestTypeLabels } from "@/data/mockDashboard";
import type { ServiceRequest } from "@/data/mockDashboard";

// Partner sees their own requests — no executor info
const partnerRequests: Omit<ServiceRequest, "assignedTo" | "assignedRole">[] = [
  { id: "REQ-101", type: "measurement", status: "assigned", clientName: "Объект: ЖК Солнечный", clientPhone: "", address: "ул. Весенняя, 12", date: "2026-02-11" },
  { id: "REQ-102", type: "installation", status: "installation_scheduled", clientName: "Объект: Офис на Ленина", clientPhone: "", address: "ул. Ленина, 45", date: "2026-02-09" },
  { id: "REQ-103", type: "reclamation", status: "new", clientName: "Объект: ЖК Парковый", clientPhone: "", address: "пр. Парковый, 8", date: "2026-02-12" },
];

const PartnerDashboard = () => {
  useEffect(() => { document.title = "Мои заявки — Партнёр"; }, []);

  return (
    <DashboardLayout role="partner" userName="ООО РемонтПро">
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Мои заявки</h1>

        <div className="grid gap-4">
          {partnerRequests.map((r) => (
            <Card key={r.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{r.id}</p>
                    <p className="font-semibold mt-1">{r.clientName}</p>
                    <p className="text-xs text-muted-foreground mt-1">{r.address}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block mb-1">{requestTypeLabels[r.type]}</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                      {statusLabels[r.status]}
                    </span>
                    <p className="text-xs text-muted-foreground mt-2">{r.date}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Исполнитель: <span className="font-medium text-foreground">PrimeDoor Service</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PartnerDashboard;
