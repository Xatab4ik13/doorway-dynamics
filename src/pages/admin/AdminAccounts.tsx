import { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { mockUsers, roleLabels } from "@/data/mockDashboard";
import { UserPlus, Trash2 } from "lucide-react";

const AdminAccounts = () => {
  useEffect(() => { document.title = "Аккаунты — Админ-панель"; }, []);

  return (
    <DashboardLayout role="admin" userName="Корженевский М.А.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold">Аккаунты</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <UserPlus size={16} /> Создать
          </button>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-3 pr-4">ID</th>
                    <th className="pb-3 pr-4">Имя</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Роль</th>
                    <th className="pb-3 pr-4">Статус</th>
                    <th className="pb-3 pr-4">Создан</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                      <td className="py-3 pr-4 font-mono text-xs">{u.id}</td>
                      <td className="py-3 pr-4 font-medium">{u.name}</td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground">{u.email}</td>
                      <td className="py-3 pr-4">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {roleLabels[u.role]}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-block w-2 h-2 rounded-full ${u.active ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className="ml-2 text-xs">{u.active ? "Активен" : "Неактивен"}</span>
                      </td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground">{u.createdAt}</td>
                      <td className="py-3">
                        <button className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
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

export default AdminAccounts;
