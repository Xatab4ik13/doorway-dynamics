import { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { FileSpreadsheet, PlusCircle } from "lucide-react";

const AdminEstimates = () => {
  useEffect(() => { document.title = "Сметы — Админ-панель"; }, []);

  return (
    <DashboardLayout role="admin" userName="Корженевский М.А.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold">Сметы</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <PlusCircle size={16} /> Новая смета
          </button>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <FileSpreadsheet size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Генератор смет</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Здесь будет конструктор смет с прайс-листами, логотипом PrimeDoor и возможностью выгрузки в PDF.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminEstimates;
