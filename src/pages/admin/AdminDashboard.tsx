import { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockStats, mockChartData, mockFunnelData, mockTopEmployees, mockRequests, statusLabels, statusColors } from "@/data/mockDashboard";
import { ClipboardList, Clock, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const statCards = [
  { label: "Всего заявок", value: mockStats.totalRequests, icon: <ClipboardList size={20} />, color: "text-blue-600 bg-blue-50" },
  { label: "Новые", value: mockStats.newRequests, icon: <Clock size={20} />, color: "text-amber-600 bg-amber-50" },
  { label: "В работе", value: mockStats.inProgress, icon: <TrendingUp size={20} />, color: "text-purple-600 bg-purple-50" },
  { label: "Выполнено", value: mockStats.completed, icon: <CheckCircle size={20} />, color: "text-green-600 bg-green-50" },
  { label: "Рекламации", value: mockStats.reclamations, icon: <AlertTriangle size={20} />, color: "text-red-600 bg-red-50" },
];

const AdminDashboard = () => {
  useEffect(() => { document.title = "Админ-панель — PrimeDoor Service"; }, []);

  return (
    <DashboardLayout role="admin" userName="Корженевский М.А.">
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Дашборд</h1>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((s) => (
            <Card key={s.label}>
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
                <BarChart data={mockChartData}>
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
                {mockFunnelData.map((item, i) => (
                  <div key={item.stage}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{item.stage}</span>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                    <div className="h-6 rounded bg-muted overflow-hidden">
                      <div
                        className="h-full rounded transition-all duration-700"
                        style={{
                          width: `${(item.value / mockFunnelData[0].value) * 100}%`,
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
              <div className="space-y-3">
                {mockTopEmployees.map((emp, i) => (
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
            </CardContent>
          </Card>

          {/* Recent requests */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Последние заявки</CardTitle>
            </CardHeader>
            <CardContent>
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
                    {mockRequests.slice(0, 6).map((r) => (
                      <tr key={r.id} className="border-b border-border last:border-0">
                        <td className="py-2.5 pr-4 font-mono text-xs">{r.id}</td>
                        <td className="py-2.5 pr-4">{r.clientName}</td>
                        <td className="py-2.5 pr-4 capitalize text-xs">
                          {r.type === "measurement" ? "Замер" : r.type === "installation" ? "Монтаж" : "Рекламация"}
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                            {statusLabels[r.status]}
                          </span>
                        </td>
                        <td className="py-2.5 text-xs text-muted-foreground">{r.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
