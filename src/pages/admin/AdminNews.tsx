import { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { articles } from "@/data/articles";
import { PlusCircle, Trash2, Edit } from "lucide-react";

const AdminNews = () => {
  useEffect(() => { document.title = "Новости — Админ-панель"; }, []);

  return (
    <DashboardLayout role="admin" userName="Корженевский М.А.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold">Новости</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <PlusCircle size={16} /> Создать статью
          </button>
        </div>

        <div className="grid gap-4">
          {articles.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <img src={a.image} alt={a.title} className="w-20 h-14 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold truncate">{a.title}</h3>
                  <p className="text-xs text-muted-foreground">{a.date} · {a.readTime}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                    <Edit size={16} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                    <Trash2 size={16} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminNews;
