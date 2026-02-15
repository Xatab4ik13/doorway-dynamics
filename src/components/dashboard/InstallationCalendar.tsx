import { useState, useMemo } from "react";
import { useRequests, useUsers } from "@/hooks/useRequests";
import { statusLabels, statusColors, type RequestStatus } from "@/data/mockDashboard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, MapPin, Phone, User, Calendar as CalendarIcon, Wrench, FileText, MessageSquare } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
} from "date-fns";
import { ru } from "date-fns/locale";

const ACTIVE_STATUSES = ["date_agreed", "installation_rescheduled"];

const InstallationCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { requests, loading } = useRequests();
  const { getUserName } = useUsers();

  const installationsByDate = useMemo(() => {
    const map: Record<string, typeof requests> = {};
    requests
      .filter((r) => r.type === "installation" && r.agreed_date && ACTIVE_STATUSES.includes(r.status))
      .forEach((r) => {
        const dateKey = r.agreed_date!.slice(0, 10);
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(r);
      });
    return map;
  }, [requests]);

  const selectedDateRequests = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    return installationsByDate[key] || [];
  }, [selectedDate, installationsByDate]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const weeks: Date[][] = [];
  let day = calStart;
  while (day <= calEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="text-primary" size={24} />
            Календарь монтажей
          </h1>
        </div>

        <div className="flex items-center justify-center gap-4 bg-card rounded-xl border border-border/50 p-3">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold min-w-[200px] text-center capitalize">
            {format(currentMonth, "LLLL yyyy", { locale: ru })}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border/50">
            {weekDays.map((wd) => (
              <div key={wd} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {wd}
              </div>
            ))}
          </div>

          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 border-b border-border/30 last:border-b-0">
              {week.map((d) => {
                const dateKey = format(d, "yyyy-MM-dd");
                const dayRequests = installationsByDate[dateKey] || [];
                const inMonth = isSameMonth(d, currentMonth);
                const today = isToday(d);
                const hasRequests = dayRequests.length > 0;

                return (
                  <button
                    key={dateKey}
                    onClick={() => hasRequests && setSelectedDate(d)}
                    className={`relative min-h-[60px] md:min-h-[80px] p-1.5 md:p-2 border-r border-border/20 last:border-r-0 text-left transition-colors focus:outline-none focus:ring-1 focus:ring-primary/30 ${
                      !inMonth ? "bg-muted/30" : ""
                    } ${hasRequests ? "hover:bg-accent/50 cursor-pointer" : "cursor-default"}`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full text-xs md:text-sm font-medium ${
                        today
                          ? "bg-primary text-primary-foreground"
                          : !inMonth
                          ? "text-muted-foreground/50"
                          : "text-foreground"
                      }`}
                    >
                      {format(d, "d")}
                    </span>

                    {hasRequests && (
                      <div className="mt-1 flex justify-center">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-bold rounded-full bg-primary text-primary-foreground">
                          {dayRequests.length}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {loading && <p className="text-center text-sm text-muted-foreground">Загрузка заявок...</p>}
      </div>

      {/* Dark modal */}
      <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench size={18} className="text-primary" />
              Монтажи на {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: ru })}
            </DialogTitle>
          </DialogHeader>

          {selectedDateRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Нет запланированных монтажей на этот день</p>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {selectedDateRequests.map((r) => (
                <div
                  key={r.id}
                  className="border border-border/50 rounded-xl p-3 space-y-2 bg-accent/30 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">{r.number}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        statusColors[r.status as RequestStatus] || "bg-muted text-muted-foreground"
                      }`}
                    >
                      {statusLabels[r.status as RequestStatus] || r.status}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <User size={14} className="text-muted-foreground shrink-0" />
                      <span className="font-medium text-foreground">{r.client_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone size={14} className="shrink-0" />
                      <a href={`tel:${r.client_phone}`} className="hover:text-primary">{r.client_phone}</a>
                    </div>
                    {r.extra_name && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User size={14} className="shrink-0" />
                        <span>{r.extra_name}{r.extra_phone ? ` · ${r.extra_phone}` : ""}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin size={14} className="shrink-0 mt-0.5" />
                      <span>{r.client_address}{r.city ? `, ${r.city}` : ""}</span>
                    </div>
                  </div>

                  {r.work_description && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground pt-1 border-t border-border/30">
                      <FileText size={12} className="shrink-0 mt-0.5" />
                      <span>{r.work_description}</span>
                    </div>
                  )}

                  {r.notes && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground pt-1 border-t border-border/30">
                      <MessageSquare size={12} className="shrink-0 mt-0.5" />
                      <span>{r.notes}</span>
                    </div>
                  )}

                  {r.installer_id && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border/30">
                      <Wrench size={12} />
                      <span>{getUserName(r.installer_id) || "Назначен"}</span>
                    </div>
                  )}

                  {r.status_comment && (
                    <div className="text-xs bg-amber-50 text-amber-700 rounded-lg px-2 py-1.5">
                      💬 {r.status_comment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstallationCalendar;
