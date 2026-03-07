import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { roleLabels, type UserRole } from "@/data/mockDashboard";
import { UserPlus, Trash2, Search, Loader2, CheckCircle } from "lucide-react";
import CreateAccountModal from "@/components/dashboard/CreateAccountModal";
import AccountDetailModal from "@/components/dashboard/AccountDetailModal";
import DeleteConfirmModal from "@/components/dashboard/DeleteConfirmModal";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface UserAccount {
  id: string;
  name: string;
  role: UserRole;
  telegram_id?: string;
  phone?: string;
  email?: string;
  notes?: string;
  pin?: string;
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
  const isMobile = useIsMobile();
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserAccount | null>(null);
  const [detailTarget, setDetailTarget] = useState<UserAccount | null>(null);

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

  const handleCreate = async (data: { name: string; role: UserRole; phone: string; pin: string; email?: string; notes?: string }) => {
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

  const handleUpdate = async (id: string, updates: Partial<UserAccount>) => {
    try {
      const updated = await api<UserAccount>(`/api/users/${id}`, {
        method: "PUT",
        body: updates,
        auth: true,
      });
      setUsers(users.map((u) => (u.id === id ? { ...u, ...updated } : u)));
      toast.success("Аккаунт обновлён");
    } catch (err: any) {
      toast.error(err.message || "Ошибка обновления");
      throw err;
    }
  };

  const handleActivate = async (u: UserAccount) => {
    try {
      await handleUpdate(u.id, { active: true });
      toast.success(`Аккаунт "${u.name}" активирован`);
    } catch {}
  };

  return (
    <DashboardLayout role="admin" userName={authUser?.name || "Админ"}>
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
                  autoComplete="off"
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

            {isMobile ? (
              /* Mobile card view */
              <div className="space-y-2">
                {filtered.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => setDetailTarget(u)}
                    className={`p-3.5 rounded-xl border border-border/50 active:scale-[0.98] transition-transform cursor-pointer ${!u.active ? "bg-amber-50/30" : "bg-background"}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-medium text-sm">{u.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${u.active ? "bg-green-500" : "bg-amber-400"}`} />
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${roleColorMap[u.role]}`}>
                          {roleLabels[u.role]}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-mono">{u.phone || "—"}</span>
                      <div className="flex gap-1">
                        {!u.active && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleActivate(u); }}
                            className="text-green-600 p-1.5 rounded-lg hover:bg-green-50"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(u); }}
                          className="text-muted-foreground p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p className="text-center text-muted-foreground py-8 text-sm">Аккаунты не найдены</p>
                )}
              </div>
            ) : (
              /* Desktop table view */
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                     <tr className="border-b border-border text-left text-xs text-muted-foreground">
                       <th className="pb-3 pr-4">Имя</th>
                       <th className="pb-3 pr-4">Телефон</th>
                       <th className="pb-3 pr-4">Роль</th>
                       <th className="pb-3 pr-4">Статус</th>
                       <th className="pb-3 pr-4">Создан</th>
                       <th className="pb-3"></th>
                     </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u.id} className={`border-b border-border last:border-0 hover:bg-accent/50 transition-colors cursor-pointer ${!u.active ? "bg-amber-50/50" : ""}`} onClick={() => setDetailTarget(u)}>
                        <td className="py-3 pr-4 font-medium">{u.name}</td>
                        <td className="py-3 pr-4 text-xs text-muted-foreground font-mono">{u.phone || "—"}</td>
                        <td className="py-3 pr-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${roleColorMap[u.role]}`}>
                            {roleLabels[u.role]}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`inline-block w-2 h-2 rounded-full ${u.active ? "bg-green-500" : "bg-amber-400"}`} />
                          <span className="ml-2 text-xs">{u.active ? "Активен" : "Ожидает"}</span>
                        </td>
                        <td className="py-3 pr-4 text-xs text-muted-foreground">{u.created_at?.split("T")[0]}</td>
                        <td className="py-3 flex items-center gap-1">
                          {!u.active && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleActivate(u); }}
                              className="text-green-600 hover:text-green-700 transition-colors p-1"
                              title="Активировать"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(u); }}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
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
            )}
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
      {detailTarget && (
        <AccountDetailModal
          user={detailTarget}
          onClose={() => setDetailTarget(null)}
          onSave={handleUpdate}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminAccounts;
