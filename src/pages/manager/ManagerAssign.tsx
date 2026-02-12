import { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

const ManagerAssign = () => {
  useEffect(() => { document.title = "Распределение — Менеджер"; }, []);

  return (
    <DashboardLayout role="manager" userName="Смирнова Е.П.">
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Распределение заявок</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <Users size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Назначение исполнителей</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Здесь менеджер распределяет заявки по замерщикам и монтажным бригадам.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManagerAssign;
