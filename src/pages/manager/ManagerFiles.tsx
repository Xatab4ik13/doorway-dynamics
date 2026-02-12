import { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";

const ManagerFiles = () => {
  useEffect(() => { document.title = "Файлы — Менеджер"; }, []);

  return (
    <DashboardLayout role="manager" userName="Смирнова Е.П.">
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Файлы</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <Upload size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Файловое хранилище</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Доступ ко всем файлам заявок — фото замеров, монтажных работ и документов.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManagerFiles;
