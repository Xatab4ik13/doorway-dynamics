import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const requestTypes = [
  { value: "measurement", label: "Замер" },
  { value: "installation", label: "Монтаж" },
  { value: "reclamation", label: "Гарантия / Рекламация" },
];

const PartnerNewRequest = () => {
  const [type, setType] = useState("measurement");

  useEffect(() => { document.title = "Новая заявка — Партнёр"; }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Заявка отправлена (мок)");
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <DashboardLayout role="partner" userName="ООО РемонтПро">
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-heading font-bold">Новая заявка</h1>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Тип заявки</label>
                <div className="flex gap-2 flex-wrap">
                  {requestTypes.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        type === t.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Название объекта</label>
                <input type="text" required className={inputClass} placeholder="ЖК Солнечный, кв. 42" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Адрес</label>
                <input type="text" required className={inputClass} placeholder="ул. Ленина, 15" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Комментарий</label>
                <textarea rows={3} className={inputClass} placeholder="Дополнительная информация..." />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Отправить заявку
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PartnerNewRequest;
