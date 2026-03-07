import { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useRequests, type ApiRequest } from "@/hooks/useRequests";
import { useAuth } from "@/contexts/AuthContext";
import { statusLabels, statusColors, requestTypeLabels, type RequestStatus } from "@/data/mockDashboard";
import { ChevronLeft, ChevronRight, MapPin, Phone, Calendar as CalendarIcon } from "lucide-react";
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
import MobileFullScreen from "@/components/dashboard/MobileFullScreen";
import RequestDetailModal from "@/components/dashboard/RequestDetailModal";
import { useIsMobile } from "@/hooks/use-mobile";

const ACTIVE_STATUSES = ["date_agreed", "installation_rescheduled", "measurer_assigned"];

interface PersonalCalendarProps {
  role: "measurer" | "installer";
}

const PersonalCalendar = ({ role }: PersonalCalendarProps) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { requests, loading } = useRequests();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ApiRequest | null>(null);

  const myRequests = useMemo(() => {
    return requests.filter((r) => r.agreed_date && ACTIVE_STATUSES.includes(r.status));
  }, [requests]);

  const dataByDate = useMemo(() => {
    const map: Record<string, ApiRequest[]> = {};
    myRequests.forEach((r) => {
      const key = r.agreed_date!.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [myRequests]);

  const selectedDayRequests = useMemo(() => {
    if (!selectedDate) return [];
    return dataByDate[format(selectedDate, "yyyy-MM-dd")] || [];
  }, [selectedDate, dataByDate]);

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
    <DashboardLayout role={role} userName={user?.name}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="text-primary" size={24} />
          <h1 className="text-xl md:text-2xl font-bold">Мой календарь</h1>
        </div>

        <div className="flex items-center justify-center gap-4 bg-card rounded-xl border border-border/50 p-3">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold min-w-[200px] text-center capitalize">
            {format(currentMonth, "LLLL yyyy", { locale: ru })}
          </h2>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-accent transition-colors">
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
                const dayRequests = dataByDate[dateKey] || [];
                const inMonth = isSameMonth(d, currentMonth);
                const today = isToday(d);
                const hasAny = dayRequests.length > 0;

                return (
                  <button
                    key={dateKey}
                    onClick={() => hasAny && setSelectedDate(d)}
                    className={`relative min-h-[60px] md:min-h-[80px] p-1.5 md:p-2 border-r border-border/20 last:border-r-0 text-left transition-colors focus:outline-none ${
                      !inMonth ? "bg-muted/30" : ""
                    } ${hasAny ? "hover:bg-accent/50 cursor-pointer" : "cursor-default"}`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full text-xs md:text-sm font-medium ${
                        today ? "bg-destructive text-destructive-foreground" : !inMonth ? "text-muted-foreground/50" : "text-foreground"
                      }`}
                    >
                      {format(d, "d")}
                    </span>
                    {hasAny && (
                      <div className="mt-0.5 flex justify-center">
                        <span className="inline-flex items-center justify-center w-5 h-5 text-[9px] font-bold rounded-full bg-primary text-primary-foreground">
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

        {/* Desktop day details */}
        {!isMobile && selectedDate && selectedDayRequests.length > 0 && (
          <div className="bg-card rounded-xl border border-border/50 p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <CalendarIcon size={16} className="text-primary" />
              {format(selectedDate, "d MMMM yyyy", { locale: ru })}
              <span className="text-xs text-muted-foreground">({selectedDayRequests.length})</span>
            </h3>
            <div className="space-y-2">
              {selectedDayRequests.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRequest(r)}
                  className="w-full text-left border border-border/50 rounded-lg p-3 space-y-1.5 hover:bg-accent/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">{r.number}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-accent text-muted-foreground">
                        {requestTypeLabels[r.type] || r.type}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          statusColors[r.status as RequestStatus] || "bg-muted"
                        }`}
                      >
                        {statusLabels[r.status as RequestStatus] || r.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-medium">{r.client_name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone size={12} />
                    <span>{r.client_phone}</span>
                  </div>
                  <div className="flex items-start gap-1 text-xs text-muted-foreground">
                    <MapPin size={12} className="shrink-0 mt-0.5" />
                    <span>{r.client_address}{r.city ? `, ${r.city}` : ""}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile day details as iOS fullscreen sheet */}
      {isMobile && (
        <MobileFullScreen
          open={!!selectedDate}
          onClose={() => {
            if (!selectedRequest) setSelectedDate(null);
          }}
          title={selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: ru }) : ""}
        >
          <div className="p-4 space-y-2.5">
            {selectedDayRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Нет заявок на выбранный день</p>
            ) : (
              selectedDayRequests.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRequest(r)}
                  className="w-full text-left bg-card rounded-2xl border border-border/40 p-3.5 space-y-2 active:opacity-80"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-primary">{r.number}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        statusColors[r.status as RequestStatus] || "bg-muted text-muted-foreground"
                      }`}
                    >
                      {statusLabels[r.status as RequestStatus] || r.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold">{r.client_name}</p>
                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <MapPin size={12} className="shrink-0 mt-0.5" />
                    <span>{r.client_address}{r.city ? `, ${r.city}` : ""}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </MobileFullScreen>
      )}

      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          viewerRole={role}
        />
      )}
    </DashboardLayout>
  );
};

export default PersonalCalendar;
