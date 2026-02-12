import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { roleLabels, type UserRole } from "@/data/mockDashboard";
import { UserPlus, Trash2, Search, Loader2 } from "lucide-react";
import CreateAccountModal from "@/components/dashboard/CreateAccountModal";
import DeleteConfirmModal from "@/components/dashboard/DeleteConfirmModal";
import { toast } from "sonner";
import api from "@/lib/api";

interface UserAccount {
  id: string;
  name: string;
  role: UserRole;
  telegram_id?: string;
  email?: string;
  active: boolean;
  created_at: string;
}

const roleColorMap: Record<UserRole, string> = {
  admin: "bg-red-50 text-red-700",
  manager: "bg-blue-50 text-blue-700",
  measurer: "bg-purple-50 text-purple-700",
  installer: "bg-orange-50 text-orange-700",
  partner: "bg-green-50 text-green-700",
};

const AdminAccounts = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserAccount | null>(null);

  useEffect(() => {
    document.title = "Аккаунты — Админ-панель";
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api<UserAccount[]>("/api/users", { auth: true });
      setUsers(data);
    } catch (err: any) {
      toast.error(err.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    if (u.role === "admin") return false;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || (u.telegram_id || "").includes(search);
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const handleCreate = async (data: { name: string; role: UserRole; telegramId: string }) => {
    try {
      const newUser = await api<UserAccount>("/api/users", {
        method: "POST",
        body: data,
        auth: true,
      });
      setUsers([newUser, ...users]);
      setShowCreate(false);
      toast.success(`Аккаунт "${data.name}" создан`);
    } catch (err: any) {
      toast.error(err.message || "Ошибка создания");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api(`/api/users/${deleteTarget.id}`, { method: "DELETE", auth: true });
      setUsers(users.filter((u) => u.id !== deleteTarget.id));
      toast.success(`Аккаунт "${deleteTarget.name}" удалён`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Ошибка удаления");
    }
  };

  return (
    <DashboardLayout role="admin" userName="Корженевский М.А.">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-heading font-bold">Аккаунты</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <UserPlus size={16} /> Создать
          </button>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Поиск по имени или Telegram ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Все роли</option>
                {Object.entries(roleLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-3 pr-4">ID</th>
                    <th className="pb-3 pr-4">Имя</th>
                    <th className="pb-3 pr-4">Telegram ID</th>
                    <th className="pb-3 pr-4">Роль</th>
                    <th className="pb-3 pr-4">Статус</th>
                    <th className="pb-3 pr-4">Создан</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                      <td className="py-3 pr-4 font-mono text-xs">{u.id}</td>
                      <td className="py-3 pr-4 font-medium">{u.name}</td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground font-mono">{u.telegram_id || "—"}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${roleColorMap[u.role]}`}>
                          {roleLabels[u.role]}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-block w-2 h-2 rounded-full ${u.active ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className="ml-2 text-xs">{u.active ? "Активен" : "Неактивен"}</span>
                      </td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground">{u.created_at?.split("T")[0]}</td>
                      <td className="py-3">
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-8 text-sm">Аккаунты не найдены</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {showCreate && <CreateAccountModal onClose={() => setShowCreate(false)} onSave={handleCreate} />}
      {deleteTarget && (
        <DeleteConfirmModal
          title="Удалить аккаунт?"
          description={`Аккаунт "${deleteTarget.name}" будет удалён без возможности восстановления.`}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminAccounts;
