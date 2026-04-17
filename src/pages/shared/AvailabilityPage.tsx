import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CityToggle, { type CityFilter } from "@/components/dashboard/CityToggle";
import RequestDetailModal from "@/components/dashboard/RequestDetailModal";
import { api } from "@/lib/api";
import { useRequests } from "@/hooks/useRequests";
import type { ApiRequest } from "@/hooks/useRequests";
import { toast } from "sonner";

type AbsenceKind = "dayoff" | "vacation" | "sick";

interface AvailUser {
  id: string;
  name: string;
  role: "installer" | "measurer";
  city: string | null;
}

interface DayRequest {
  id: string;
  number: string;
  type: string;
  status: string;
  client_name: string;
  client_address: string | null;
  city: string | null;
}

interface AvailabilityResponse {
  users: AvailUser[];
  requestsByUserDay: Record<string, Record<string, DayRequest[]>>;
  absences: Record<string, Record<string, AbsenceKind>>;
}

const MONTHS_RU = [
  "Январь","Февраль","Март","Апрель","Май","Июнь",
  "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь",
];

const WEEKDAYS_RU = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

const STATUS_STYLES: Record<string, { bg: string; label: string; textColor?: string }> = {
  free:     { bg: "bg-muted/40",                 label: "Свободен",   textColor: "text-muted-foreground" },
  busy:     { bg: "bg-emerald-500/80 text-white", label: "Занят (1)" },
  loaded:   { bg: "bg-orange-500/85 text-white",  label: "Загружен (2+)" },
  dayoff:   { bg: "bg-sky-500/80 text-white",     label: "Выходной" },
  vacation: { bg: "bg-violet-500/80 text-white",  label: "Отпуск" },
  sick:     { bg: "bg-rose-500/80 text-white",    label: "Больничный" },
};

const ABSENCE_LABELS: Record<AbsenceKind, string> = {
  dayoff: "Выходной",
  vacation: "Отпуск",
  sick: "Больничный",
};

const fmtMonth = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const fmtDay = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const todayKey = () => {
  const d = new Date();
  return fmtDay(d.getFullYear(), d.getMonth(), d.getDate());
};

const AvailabilityPage = ({ role }: { role: "admin" | "manager" }) => {
  const [monthDate, setMonthDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [city, setCity] = useState<CityFilter>("Москва");
  const [data, setData] = useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeCell, setActiveCell] = useState<{ userId: string; date: string } | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ApiRequest | null>(null);

  const { requests, updateRequest } = useRequests();

  const month = fmtMonth(monthDate);
  const year = monthDate.getFullYear();
  const monthIdx = monthDate.getMonth();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth]
  );

  const load = async () => {
    setLoading(true);
    try {
      const res = await api<AvailabilityResponse>(
        `/api/availability?month=${month}&city=${encodeURIComponent(city)}`,
        { auth: true }
      );
      setData(res);
    } catch (e: any) {
      toast.error(e?.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, city]);

  const installers = (data?.users || []).filter((u) => u.role === "installer");
  const measurers = (data?.users || []).filter((u) => u.role === "measurer");

  const getCellStatus = (userId: string, dateKey: string): keyof typeof STATUS_STYLES => {
    const abs = data?.absences[userId]?.[dateKey];
    if (abs) return abs;
    const reqs = data?.requestsByUserDay[userId]?.[dateKey] || [];
    if (reqs.length === 0) return "free";
    if (reqs.length === 1) return "busy";
    return "loaded";
  };

  const setAbsence = async (userId: string, date: string, kind: AbsenceKind | null) => {
    try {
      await api(`/api/availability/absence`, {
        method: "POST",
        auth: true,
        body: { user_id: userId, date, kind },
      });
      // Локально обновляем без перезагрузки всей сетки
      setData((prev) => {
        if (!prev) return prev;
        const next = { ...prev, absences: { ...prev.absences } };
        const userAbs = { ...(next.absences[userId] || {}) };
        if (kind) userAbs[date] = kind;
        else delete userAbs[date];
        next.absences[userId] = userAbs;
        return next;
      });
      toast.success(kind ? `Отмечено: ${ABSENCE_LABELS[kind]}` : "Снято");
    } catch (e: any) {
      toast.error(e?.message || "Ошибка");
    }
  };

  const openRequest = async (id: string) => {
    setActiveCell(null);
    // Используем существующий список requests; если нет — грузим всё
    const found = requests.find((r) => String(r.id) === String(id));
    if (found) {
      setSelectedRequest(found);
    } else {
      try {
        const r = await api<ApiRequest>(`/api/requests/${id}`, { auth: true });
        setSelectedRequest(r);
      } catch {
        toast.error("Не удалось открыть заявку");
      }
    }
  };

  const goPrev = () => setMonthDate(new Date(year, monthIdx - 1, 1));
  const goNext = () => setMonthDate(new Date(year, monthIdx + 1, 1));
  const goToday = () => {
    const d = new Date();
    setMonthDate(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const today = todayKey();

  const renderRow = (u: AvailUser) => (
    <tr key={u.id} className="border-b border-border/40">
      <td className="sticky left-0 z-10 bg-card px-3 py-2 text-sm font-medium whitespace-nowrap border-r border-border/40">
        {u.name}
      </td>
      {days.map((d) => {
        const dateKey = fmtDay(year, monthIdx, d);
        const status = getCellStatus(u.id, dateKey);
        const style = STATUS_STYLES[status];
        const reqs = data?.requestsByUserDay[u.id]?.[dateKey] || [];
        const isToday = dateKey === today;
        return (
          <td
            key={d}
            className={`p-0 text-center align-middle border-r border-border/30 ${isToday ? "ring-1 ring-primary/40 ring-inset" : ""}`}
          >
            <button
              type="button"
              onClick={() => setActiveCell({ userId: u.id, date: dateKey })}
              className={`relative w-9 h-9 flex items-center justify-center text-[11px] font-medium transition-opacity hover:opacity-80 ${style.bg} ${style.textColor || ""}`}
              title={style.label}
            >
              {reqs.length > 0 ? reqs.length : ""}
            </button>
          </td>
        );
      })}
    </tr>
  );

  const activeUser = activeCell ? data?.users.find((u) => u.id === activeCell.userId) : null;
  const activeReqs = activeCell
    ? data?.requestsByUserDay[activeCell.userId]?.[activeCell.date] || []
    : [];
  const activeAbs = activeCell ? data?.absences[activeCell.userId]?.[activeCell.date] : undefined;

  return (
    <DashboardLayout role={role} onRefresh={load}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">Занятость</h1>
          <div className="flex items-center gap-1 ml-auto">
            <button onClick={goPrev} className="p-2 rounded-lg hover:bg-accent transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goToday}
              className="px-3 py-1.5 text-sm rounded-lg hover:bg-accent transition-colors font-medium"
            >
              {MONTHS_RU[monthIdx]} {year}
            </button>
            <button onClick={goNext} className="p-2 rounded-lg hover:bg-accent transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
          <CityToggle value={city} onChange={setCity} />
        </div>

        {/* Легенда */}
        <div className="flex flex-wrap gap-3 p-3 rounded-xl bg-card border border-border/50">
          {Object.entries(STATUS_STYLES).map(([k, s]) => (
            <div key={k} className="flex items-center gap-2 text-xs">
              <span className={`inline-block w-4 h-4 rounded ${s.bg.split(" ")[0]}`} />
              <span className="text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Таблица */}
        <div className="rounded-xl border border-border/50 bg-card overflow-auto">
          <table className="border-collapse">
            <thead className="sticky top-0 z-20 bg-card">
              <tr className="border-b border-border/50">
                <th className="sticky left-0 z-30 bg-card px-3 py-2 text-left text-xs font-medium text-muted-foreground border-r border-border/40 min-w-[180px]">
                  Сотрудник
                </th>
                {days.map((d) => {
                  const dt = new Date(year, monthIdx, d);
                  const wd = (dt.getDay() + 6) % 7; // Пн=0
                  const weekend = wd >= 5;
                  return (
                    <th
                      key={d}
                      className={`px-0 py-1 text-center text-[10px] font-medium border-r border-border/30 w-9 ${weekend ? "text-rose-500" : "text-muted-foreground"}`}
                    >
                      <div>{d}</div>
                      <div className="text-[9px] opacity-70">{WEEKDAYS_RU[wd]}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {installers.length > 0 && (
                <>
                  <tr className="bg-muted/30">
                    <td colSpan={days.length + 1} className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Монтажники ({installers.length})
                    </td>
                  </tr>
                  {installers.map(renderRow)}
                </>
              )}
              {measurers.length > 0 && (
                <>
                  <tr className="bg-muted/30">
                    <td colSpan={days.length + 1} className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Замерщики ({measurers.length})
                    </td>
                  </tr>
                  {measurers.map(renderRow)}
                </>
              )}
              {!loading && (data?.users.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={days.length + 1} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Нет сотрудников для города «{city}»
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Попап ячейки */}
      {activeCell && activeUser && (
        <div
          className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setActiveCell(null)}
        >
          <div
            className="bg-card rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <div>
                <p className="text-sm font-semibold">{activeUser.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(activeCell.date).toLocaleDateString("ru-RU", {
                    day: "2-digit", month: "2-digit", year: "numeric", weekday: "short",
                  })}
                </p>
              </div>
              <button onClick={() => setActiveCell(null)} className="p-1 rounded hover:bg-accent">
                <X size={18} />
              </button>
            </div>

            {/* Заявки */}
            <div className="p-4 space-y-2">
              {activeReqs.length === 0 ? (
                <p className="text-xs text-muted-foreground">Заявок на этот день нет</p>
              ) : (
                activeReqs.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => openRequest(r.id)}
                    className="w-full text-left p-3 rounded-lg border border-border/50 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-muted-foreground">{r.number}</span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{r.type}</span>
                    </div>
                    <p className="text-sm font-medium mt-1">{r.client_name}</p>
                    {r.client_address && (
                      <p className="text-xs text-muted-foreground truncate">{r.client_address}</p>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Управление отсутствием */}
            <div className="p-4 border-t border-border/50 space-y-2">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Отметить день</p>
              <div className="grid grid-cols-3 gap-2">
                {(["dayoff", "vacation", "sick"] as AbsenceKind[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setAbsence(activeCell.userId, activeCell.date, k)}
                    className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${STATUS_STYLES[k].bg} ${activeAbs === k ? "ring-2 ring-foreground/30" : "opacity-90 hover:opacity-100"}`}
                  >
                    {ABSENCE_LABELS[k]}
                  </button>
                ))}
              </div>
              {activeAbs && (
                <button
                  onClick={() => setAbsence(activeCell.userId, activeCell.date, null)}
                  className="w-full mt-2 px-3 py-2 rounded-lg text-xs font-medium border border-border/50 hover:bg-accent"
                >
                  Снять отметку
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Модалка заявки */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSave={async (id, updates) => {
            await updateRequest(id, updates);
            await load();
          }}
          viewerRole={role}
        />
      )}
    </DashboardLayout>
  );
};

export default AvailabilityPage;
