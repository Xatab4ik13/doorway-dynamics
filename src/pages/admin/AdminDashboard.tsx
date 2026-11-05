import { useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statusLabels, statusColors, requestTypeLabels, getStatusLabel, type RequestStatus, type RequestType } from "@/data/mockDashboard";
import { ClipboardList, Clock, CheckCircle, AlertTriangle, TrendingUp, Pause, ChevronRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useRequests, type ApiRequest } from "@/hooks/useRequests";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import OverdueRequestsCard from "@/components/dashboard/OverdueRequestsCard";

const FUNNEL_FILLS: Record<string, string> = {
  new: "hsl(217, 91%, 50%)",
  pending: "hsl(45, 93%, 47%)",
  measurer_assigned: "hsl(38, 92%, 50%)",
  date_agreed: "hsl(190, 80%, 45%)",
  measurement_done: "hsl(280, 65%, 50%)",
  closed: "hsl(142, 71%, 45%)",
};

const STATUS_DOT: Record<string, string> = {
  new: "bg-blue-500",
  pending: "bg-amber-500",
  measurer_assigned: "bg-orange-500",
  date_agreed: "bg-cyan-500",
  measurement_done: "bg-purple-500",
  installer_assigned: "bg-indigo-500",
  closed: "bg-green-500",
  cancelled: "bg-gray-400",
  client_refused: "bg-red-400",
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
  total?: number;
}

/* Animated count-up number */
const AnimatedNumber = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    prevRef.current = value;
    if (from === to) return;
    const duration = 600;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span className="tabular-nums">{display.toLocaleString("ru-RU")}</span>;
};

/* Medal SVG for top-3 */
const Medal = ({ rank }: { rank: number }) => {
  const colors = [
    { ribbon: "hsl(0, 72%, 51%)", disc: "hsl(45, 93%, 47%)", discDark: "hsl(38, 92%, 40%)" },
    { ribbon: "hsl(217, 91%, 50%)", disc: "hsl(220, 13%, 75%)", discDark: "hsl(220, 13%, 55%)" },
    { ribbon: "hsl(142, 71%, 45%)", disc: "hsl(28, 60%, 55%)", discDark: "hsl(28, 60%, 42%)" },
  ][rank - 1];
  if (!colors) return null;
  return (
    <svg width="18" height="22" viewBox="0 0 18 22" fill="none" aria-hidden>
      <path d="M4 0h4l1 6H3L4 0Z" fill={colors.ribbon} />
      <path d="M14 0h-4l-1 6h6L14 0Z" fill={colors.ribbon} opacity="0.75" />
      <circle cx="9" cy="13" r="7" fill={colors.disc} />
      <circle cx="9" cy="13" r="5" fill={colors.discDark} opacity="0.35" />
      <text x="9" y="16.5" textAnchor="middle" fontSize="8" fontWeight="700" fill="white">{rank}</text>
    </svg>
  );
};

const initials = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

const TopList = ({ title, items, valueLabel, delay }: { title: string; items: TopEmployee[]; valueLabel?: (e: TopEmployee) => string | number; delay: number }) => {
  const max = Math.max(1, ...items.map((e) => Number(valueLabel ? valueLabel(e) : e.completed) || 0));
  return (
    <Card className="animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{title}</CardTitle>
        <span className="text-xs text-muted-foreground">{items.length}</span>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Нет данных</p>
        ) : (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {items.map((emp, i) => {
              const val = Number(valueLabel ? valueLabel(emp) : emp.completed) || 0;
              return (
                <div key={emp.id} className="flex items-center gap-3 group">
                  <div className="w-7 flex justify-center shrink-0">
                    {i < 3 ? (
                      <Medal rank={i + 1} />
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[11px] font-bold">
                        {i + 1}
                      </span>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {initials(emp.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{emp.name}</p>
                    <div className="flex items-center gap-2">
                      <div className="h-1 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/70 transition-all duration-700"
                          style={{ width: `${(val / max) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{emp.role}</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold tabular-nums">{val}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
          <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="skeleton-shimmer h-8 w-40 rounded-lg" />
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton-shimmer h-[76px] rounded-xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="skeleton-shimmer h-[320px] rounded-xl" />
      <div className="skeleton-shimmer h-[320px] rounded-xl" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="skeleton-shimmer h-[240px] rounded-xl" />
      ))}
    </div>
  </div>
);

const AdminDashboard = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { requests, loading: reqLoading } = useRequests();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topEmployees, setTopEmployees] = useState<TopEmployee[]>([]);
  const [topPartners, setTopPartners] = useState<TopEmployee[]>([]);
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
        api<TopEmployee[]>("/api/dashboard/top-partners", { auth: true }).then((p) => { if (!cancelled) setTopPartners(p); }).catch(() => {});
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
    { label: "Всего заявок", value: t?.total ?? 0, icon: <ClipboardList size={20} />, color: "text-blue-600 bg-blue-50", bar: "bg-blue-500", onClick: () => navigate("/admin/requests") },
    { label: "Новые", value: t?.new_count ?? 0, icon: <Clock size={20} />, color: "text-amber-600 bg-amber-50", bar: "bg-amber-500", onClick: () => navigate("/admin/requests?quick=new") },
    { label: "В ожидании", value: t?.pending_count ?? 0, icon: <Pause size={20} />, color: "text-yellow-600 bg-yellow-50", bar: "bg-yellow-500", onClick: () => navigate("/admin/requests?quick=pending") },
    { label: "В работе", value: t?.in_progress ?? 0, icon: <TrendingUp size={20} />, color: "text-purple-600 bg-purple-50", bar: "bg-purple-500", onClick: () => navigate("/admin/requests?quick=work") },
    { label: "Выполнено", value: t?.completed ?? 0, icon: <CheckCircle size={20} />, color: "text-green-600 bg-green-50", bar: "bg-green-500", onClick: () => navigate("/admin/requests?quick=done") },
    { label: "Рекламации", value: t?.reclamations ?? 0, icon: <AlertTriangle size={20} />, color: "text-red-600 bg-red-50", bar: "bg-red-500", onClick: () => navigate("/admin/requests?quick=reclamation_open") },
  ];

  const loading = reqLoading || statsLoading;

  if (loading) {
    return (
      <DashboardLayout role="admin" userName={user?.name || "Админ"}>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" userName={user?.name || "Админ"}>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold animate-fade-up">Дашборд</h1>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((s, i) => (
            <Card
              key={s.label}
              className="relative overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
              onClick={s.onClick}
            >
              <span className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar}`} />
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.color}`}>{s.icon}</div>
                <div>
                  <p className="text-2xl font-bold font-heading">
                    <AnimatedNumber value={s.value} />
                  </p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <OverdueRequestsCard requests={requests} onOpen={(r) => navigate(`/admin/requests?search=${encodeURIComponent(r.number)}`)} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly chart */}
          <Card className="animate-fade-up" style={{ animationDelay: "200ms" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Динамика за неделю</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(217, 91%, 50%)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(217, 91%, 50%)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gradDone" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="заявки" stroke="hsl(217, 91%, 50%)" strokeWidth={2.5} fill="url(#gradCreated)" dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} />
                  <Area type="monotone" dataKey="выполнено" stroke="hsl(142, 71%, 45%)" strokeWidth={2.5} fill="url(#gradDone)" dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" />Заявки</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" />Выполнено</span>
              </div>
            </CardContent>
          </Card>

          {/* Funnel */}
          <Card className="animate-fade-up" style={{ animationDelay: "260ms" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Воронка конверсии</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {funnelData.map((item, i) => {
                  const prev = i > 0 ? funnelData[i - 1].value : 0;
                  const conv = i > 0 && prev > 0 ? Math.round((item.value / prev) * 100) : null;
                  return (
                    <div key={item.stage}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.fill }} />
                          {item.stage}
                          {conv !== null && (
                            <span className="text-[10px] px-1.5 py-px rounded-full bg-muted text-muted-foreground">{conv}%</span>
                          )}
                        </span>
                        <span className="font-semibold tabular-nums">{item.value}</span>
                      </div>
                      <div className="h-6 rounded bg-muted overflow-hidden">
                        <div
                          className="h-full rounded transition-all duration-700"
                          style={{
                            width: `${funnelData[0].value > 0 ? (item.value / funnelData[0].value) * 100 : 0}%`,
                            background: `linear-gradient(90deg, ${item.fill}, ${item.fill}cc)`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TopList title="Топ монтажников" items={topEmployees.filter((e) => e.role === "Монтажник")} delay={320} />
          <TopList title="Топ замерщиков" items={topEmployees.filter((e) => e.role === "Замерщик")} delay={380} />
          <TopList title="Топ партнёров" items={topPartners} valueLabel={(e) => e.total ?? e.completed} delay={440} />
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Recent requests */}
          <Card className="animate-fade-up" style={{ animationDelay: "500ms" }}>
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
                        <tr
                          key={r.id}
                          onClick={() => navigate("/admin/requests")}
                          className="border-b border-border last:border-0 hover:bg-accent/40 transition-colors cursor-pointer"
                        >
                          <td className="py-2.5 pr-4 font-mono text-xs">{r.number}</td>
                          <td className="py-2.5 pr-4">{r.client_name}</td>
                          <td className="py-2.5 pr-4 capitalize text-xs">
                            {r.type === "measurement" ? "Замер" : r.type === "installation" ? "Монтаж" : "Рекламация"}
                          </td>
                          <td className="py-2.5 pr-4">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status as RequestStatus] || "bg-gray-100 text-gray-500"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[r.status] || "bg-gray-400"}`} />
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
