import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statusLabels, statusColors, requestTypeLabels, getStatusLabel, type RequestStatus, type RequestType } from "@/data/mockDashboard";
import { ClipboardList, Clock, CheckCircle, AlertTriangle, TrendingUp, Loader2, Pause, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useRequests, useUsers, type ApiRequest } from "@/hooks/useRequests";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, subDays, parseISO, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const FUNNEL_STAGES: { status: RequestStatus; fill: string }[] = [
  { status: "new", fill: "hsl(217, 91%, 50%)" },
  { status: "pending", fill: "hsl(45, 93%, 47%)" },
  { status: "measurer_assigned", fill: "hsl(38, 92%, 50%)" },
  { status: "date_agreed", fill: "hsl(190, 80%, 45%)" },
  { status: "measurement_done", fill: "hsl(280, 65%, 50%)" },
  { status: "closed", fill: "hsl(142, 71%, 45%)" },
];

const IN_PROGRESS_STATUSES: RequestStatus[] = ["measurer_assigned", "installer_assigned", "date_agreed", "installation_rescheduled", "measurement_done"];
const DONE_STATUSES: RequestStatus[] = ["closed"];
const DAY_NAMES = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

function computeStats(requests: ApiRequest[]) {
  const total = requests.length;
  const newCount = requests.filter(r => r.status === "new").length;
  const pendingCount = requests.filter(r => r.status === "pending").length;
  const inProgress = requests.filter(r => IN_PROGRESS_STATUSES.includes(r.status as RequestStatus)).length;
  const completed = requests.filter(r => DONE_STATUSES.includes(r.status as RequestStatus)).length;
  const reclamations = requests.filter(r => r.type === "reclamation").length;
  return { total, newCount, pendingCount, inProgress, completed, reclamations };
}

function computeWeeklyChart(requests: ApiRequest[]) {
  const today = startOfDay(new Date());
  const days: { name: string; заявки: number; выполнено: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const day = subDays(today, i);
    const dayStr = format(day, "yyyy-MM-dd");
    const dayName = DAY_NAMES[day.getDay()];
    const created = requests.filter(r => r.created_at?.startsWith(dayStr)).length;
    const done = requests.filter(r =>
      DONE_STATUSES.includes(r.status as RequestStatus) &&
      r.updated_at?.startsWith(dayStr)
    ).length;
    days.push({ name: dayName, заявки: created, выполнено: done });
  }
  return days;
}

function computeFunnel(requests: ApiRequest[]) {
  const statusOrder: RequestStatus[] = FUNNEL_STAGES.map(s => s.status);

  return FUNNEL_STAGES.map((stage, idx) => {
    const cumulativeValue = idx === 0 ? requests.length : requests.filter(r => {
      const rIdx = statusOrder.indexOf(r.status as RequestStatus);
      return rIdx >= idx;
    }).length;
    return { stage: statusLabels[stage.status], value: cumulativeValue, fill: stage.fill };
  });
}

function computeTopEmployees(requests: ApiRequest[], getUserName: (id?: string) => string | undefined) {
  const counts: Record<string, { name: string; role: string; completed: number }> = {};

  requests.forEach(r => {
    if (!DONE_STATUSES.includes(r.status as RequestStatus)) return;
    
    const checkUser = (id?: string, role?: string) => {
      if (!id) return;
      const name = getUserName(id) || id;
      if (!counts[id]) counts[id] = { name, role: role || "", completed: 0 };
      counts[id].completed++;
    };

    checkUser(r.measurer_id, "Замерщик");
    checkUser(r.installer_id, "Монтажник");
  });

  return Object.values(counts).sort((a, b) => b.completed - a.completed).slice(0, 5);
}

const AdminDashboard = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { requests, loading } = useRequests();
  const { getUserName } = useUsers();
  const navigate = useNavigate();

  useEffect(() => { document.title = "Админ-панель — PrimeDoor Service"; }, []);

  const stats = useMemo(() => computeStats(requests), [requests]);
  const chartData = useMemo(() => computeWeeklyChart(requests), [requests]);
  const funnelData = useMemo(() => computeFunnel(requests), [requests]);
  const topEmployees = useMemo(() => computeTopEmployees(requests, getUserName), [requests, getUserName]);

  const statCards = [
    { label: "Всего заявок", value: stats.total, icon: <ClipboardList size={20} />, color: "text-blue-600 bg-blue-50", onClick: () => navigate("/admin/requests") },
    { label: "Новые", value: stats.newCount, icon: <Clock size={20} />, color: "text-amber-600 bg-amber-50", onClick: () => navigate("/admin/requests?quick=new") },
    { label: "В ожидании", value: stats.pendingCount, icon: <Pause size={20} />, color: "text-yellow-600 bg-yellow-50", onClick: () => navigate("/admin/requests?quick=pending") },
    { label: "В работе", value: stats.inProgress, icon: <TrendingUp size={20} />, color: "text-purple-600 bg-purple-50", onClick: () => navigate("/admin/requests?quick=in_progress") },
    { label: "Выполнено", value: stats.completed, icon: <CheckCircle size={20} />, color: "text-green-600 bg-green-50", onClick: () => navigate("/admin/requests?quick=closed") },
    { label: "Рекламации", value: stats.reclamations, icon: <AlertTriangle size={20} />, color: "text-red-600 bg-red-50", onClick: () => navigate("/admin/requests?quick=reclamation") },
  ];

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
