import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statusLabels, statusColors, requestTypeLabels, getStatusLabel, type RequestStatus, type RequestType } from "@/data/mockDashboard";
import { ClipboardList, Clock, CheckCircle, AlertTriangle, TrendingUp, Loader2, Pause, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useRequests, type ApiRequest } from "@/hooks/useRequests";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

const FUNNEL_FILLS: Record<string, string> = {
  new: "hsl(217, 91%, 50%)",
  pending: "hsl(45, 93%, 47%)",
  measurer_assigned: "hsl(38, 92%, 50%)",
  date_agreed: "hsl(190, 80%, 45%)",
  measurement_done: "hsl(280, 65%, 50%)",
  closed: "hsl(142, 71%, 45%)",
};

const DAY_NAMES = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

interface DashboardStats {
  totals: {
    total: number;
    new_count: number;
    pending_count: number;
    in_progress: number;
    completed: number;
    reclamations: number;
  };
  weekly: { day: string; created: number; done: number }[];
  funnel: { status: string; value: number }[];
}

interface TopEmployee {
  id: string;
  name: string;
  role: string;
  completed: number;
}

const AdminDashboard = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { requests, loading: reqLoading } = useRequests();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topEmployees, setTopEmployees] = useState<TopEmployee[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => { document.title = "Админ-панель — PrimeDoor Service"; }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [s, t] = await Promise.all([
          api<DashboardStats>("/api/dashboard/stats", { auth: true }),
          api<TopEmployee[]>("/api/dashboard/top-employees", { auth: true }),
        ]);
        if (cancelled) return;
        setStats(s);
        setTopEmployees(t);
      } catch (e) {
        // ошибки покажет toast в api()
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    };
    load();
    const id = setInterval(load, 15000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const chartData = useMemo(() => {
    if (!stats) return [];
    return stats.weekly.map((d) => {
      const date = new Date(d.day);
      return { name: DAY_NAMES[date.getDay()], заявки: d.created, выполнено: d.done };
    });
  }, [stats]);

  const funnelData = useMemo(() => {
    if (!stats) return [];
    return stats.funnel.map((f) => ({
      stage: statusLabels[f.status as RequestStatus] || f.status,
      value: f.value,
      fill: FUNNEL_FILLS[f.status] || "hsl(220, 13%, 60%)",
    }));
  }, [stats]);

  const t = stats?.totals;
  const statCards = [
    { label: "Всего заявок", value: t?.total ?? 0, icon: <ClipboardList size={20} />, color: "text-blue-600 bg-blue-50", onClick: () => navigate("/admin/requests") },
    { label: "Новые", value: t?.new_count ?? 0, icon: <Clock size={20} />, color: "text-amber-600 bg-amber-50", onClick: () => navigate("/admin/requests?quick=new") },
    { label: "В ожидании", value: t?.pending_count ?? 0, icon: <Pause size={20} />, color: "text-yellow-600 bg-yellow-50", onClick: () => navigate("/admin/requests?quick=pending") },
    { label: "В работе", value: t?.in_progress ?? 0, icon: <TrendingUp size={20} />, color: "text-purple-600 bg-purple-50", onClick: () => navigate("/admin/requests?quick=in_progress") },
    { label: "Выполнено", value: t?.completed ?? 0, icon: <CheckCircle size={20} />, color: "text-green-600 bg-green-50", onClick: () => navigate("/admin/requests?quick=closed") },
    { label: "Рекламации", value: t?.reclamations ?? 0, icon: <AlertTriangle size={20} />, color: "text-red-600 bg-red-50", onClick: () => navigate("/admin/requests?quick=reclamation") },
  ];

  const loading = reqLoading || statsLoading;

  if (loading) {
    return (
      <DashboardLayout role="admin" userName={user?.name || "Админ"}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" userName={user?.name || "Админ"}>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Дашборд</h1>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((s) => (
            <Card key={s.label} className={s.onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""} onClick={s.onClick}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.color}`}>{s.icon}</div>
                <div>
                  <p className="text-2xl font-bold font-heading">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Динамика за неделю</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="заявки" fill="hsl(217, 91%, 50%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="выполнено" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Funnel */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Воронка конверсии</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {funnelData.map((item) => (
                  <div key={item.stage}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{item.stage}</span>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                    <div className="h-6 rounded bg-muted overflow-hidden">
                      <div
                        className="h-full rounded transition-all duration-700"
                        style={{
                          width: `${funnelData[0].value > 0 ? (item.value / funnelData[0].value) * 100 : 0}%`,
                          backgroundColor: item.fill,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top employees */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Топ сотрудников</CardTitle>
            </CardHeader>
            <CardContent>
              {topEmployees.length === 0 ? (
                <p className="text-sm text-muted-foreground">Нет данных</p>
              ) : (
                <div className="space-y-3">
                  {topEmployees.map((emp, i) => (
                    <div key={emp.name} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">{emp.role}</p>
                      </div>
                      <span className="text-sm font-bold">{emp.completed}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent requests */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Последние заявки</CardTitle>
            </CardHeader>
            <CardContent>
              {isMobile ? (
                <div className="space-y-2">
                  {requests.slice(0, 6).map((r) => (
                    <div
                      key={r.id}
                      onClick={() => navigate("/admin/requests")}
                      className="flex items-center justify-between p-3 rounded-xl bg-accent/30 active:scale-[0.98] transition-transform cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-xs text-primary">{r.number}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-muted-foreground">
                            {requestTypeLabels[r.type] || r.type}
                          </span>
                        </div>
                        <p className="text-sm font-medium truncate">{r.client_name}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium ${statusColors[r.status as RequestStatus] || "bg-muted text-muted-foreground"}`}>
                          {getStatusLabel(r.status as RequestStatus, r.type as RequestType)}
                        </span>
                        <ChevronRight size={14} className="text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs text-muted-foreground">
                        <th className="pb-2 pr-4">№</th>
                        <th className="pb-2 pr-4">Клиент</th>
                        <th className="pb-2 pr-4">Тип</th>
                        <th className="pb-2 pr-4">Статус</th>
                        <th className="pb-2">Дата</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.slice(0, 6).map((r) => (
                        <tr key={r.id} className="border-b border-border last:border-0">
                          <td className="py-2.5 pr-4 font-mono text-xs">{r.number}</td>
                          <td className="py-2.5 pr-4">{r.client_name}</td>
                          <td className="py-2.5 pr-4 capitalize text-xs">
                            {r.type === "measurement" ? "Замер" : r.type === "installation" ? "Монтаж" : "Рекламация"}
                          </td>
                          <td className="py-2.5 pr-4">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status as RequestStatus] || "bg-gray-100 text-gray-500"}`}>
                              {statusLabels[r.status as RequestStatus] || r.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-xs text-muted-foreground">
                            {r.created_at ? format(parseISO(r.created_at), "dd.MM.yyyy") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
