import { useState, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useRequests, useUsers } from "@/hooks/useRequests";
import { statusLabels, statusColors, requestTypeLabels, type RequestStatus, type RequestType } from "@/data/mockDashboard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SearchableUserSelect from "@/components/dashboard/SearchableUserSelect";
import RequestDetailModal from "@/components/dashboard/RequestDetailModal";
import MobileFullScreen from "@/components/dashboard/MobileFullScreen";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronLeft, ChevronRight, MapPin, Phone, User, Calendar as CalendarIcon, Wrench, FileText, MessageSquare, UserPlus, Check, Loader2, DoorOpen, DoorClosed, Ruler, ExternalLink, Link2, RefreshCw } from "lucide-react";
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
import { toast } from "sonner";
import { api } from "@/lib/api";

// В календаре только активные работы: отменённые, отказы, закрытые
// и заявки «в ожидании» не показываем — они живут в списке заявок.
const HIDDEN_STATUSES = ["cancelled", "client_refused", "closed", "pending"];

import type { ApiRequest, ApiUser } from "@/hooks/useRequests";

// Determine installation door category
type DoorCategory = "interior" | "entrance" | "mixed";

function getDoorCategory(r: ApiRequest): DoorCategory {
  const hasInterior = (r.interior_doors ?? 0) > 0;
  const hasEntrance = (r.entrance_doors ?? 0) > 0;
  if (hasInterior && hasEntrance) return "mixed";
  if (hasEntrance) return "entrance";
  return "interior"; // default if nothing specified
}

const CATEGORY_COLORS: Record<DoorCategory, { bg: string; text: string; ring: string }> = {
  interior: { bg: "bg-emerald-500", text: "text-white", ring: "ring-emerald-400" },
  entrance: { bg: "bg-blue-500", text: "text-white", ring: "ring-blue-400" },
  mixed: { bg: "bg-violet-500", text: "text-white", ring: "ring-violet-400" },
};

const CATEGORY_LABELS: Record<DoorCategory, string> = {
  interior: "Межкомнатные",
  entrance: "Входные",
  mixed: "Межкомн. + Входные",
};

// Colors for measurement and reclamation
const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  measurement: { bg: "bg-amber-500", text: "text-white" },
  reclamation: { bg: "bg-rose-500", text: "text-white" },
};

// Sub-component for installer assignment
const CalendarInstallerAssign = ({ request, installers, getUserName, onAssign }: {
  request: ApiRequest;
  installers: ApiUser[];
  getUserName: (id?: string) => string | undefined;
  onAssign: (requestId: string, installerId: string) => Promise<void>;
}) => {
  const [selectedId, setSelectedId] = useState(request.installer_id || "");
  const [saving, setSaving] = useState(false);
  const hasChanged = selectedId !== (request.installer_id || "");

  const handleConfirm = async () => {
    if (!selectedId || !hasChanged) return;
    setSaving(true);
    try { await onAssign(request.id, selectedId); } finally { setSaving(false); }
  };

  return (
    <div className="flex items-center gap-2 text-xs pt-1 border-t border-border/30" onClick={(e) => e.stopPropagation()}>
      <UserPlus size={12} className="text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <SearchableUserSelect
          value={selectedId}
          onChange={setSelectedId}
          users={installers}
          placeholder={request.installer_id ? "Сменить" : "Назначить монтажника"}
        />
      </div>
      {hasChanged && (
        <button onClick={handleConfirm} disabled={saving}
          className="shrink-0 h-7 px-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1">
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          OK
        </button>
      )}
    </div>
  );
};

// Кнопка «В Doorium» / «Синхр. Doorium» прямо в карточке дня
const CalendarDooriumButton = ({ r, onDoorium }: { r: ApiRequest; onDoorium: (r: ApiRequest) => Promise<void> }) => {
  const [busy, setBusy] = useState(false);
  const linked = !!r.external_id && r.external_system === "doorium";
  if (r.external_id && !linked) return null;
  return (
    <div className="pt-1 border-t border-border/30" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={async () => { setBusy(true); try { await onDoorium(r); } finally { setBusy(false); } }}
        disabled={busy}
        className="h-7 px-2.5 rounded-lg bg-violet-100 text-violet-700 text-xs font-medium hover:bg-violet-200 transition-colors disabled:opacity-50 flex items-center gap-1"
      >
        {busy ? <Loader2 size={12} className="animate-spin" /> : linked ? <RefreshCw size={12} /> : <Link2 size={12} />}
        {linked ? "Синхр. Doorium" : "В Doorium"}
      </button>
    </div>
  );
};

// Request card shown in modals — memo, чтобы не перерисовывать все карточки при любом изменении
const RequestCard = memo(({ r, installers, getUserName, onAssign, onRestore, basePath, onOpenDetail, onDoorium }: {
  r: ApiRequest;
  installers: ApiUser[];
  getUserName: (id?: string) => string | undefined;
  onAssign: (id: string, iid: string) => Promise<void>;
  onRestore: (id: string) => Promise<void>;
  basePath?: string;
  onOpenDetail?: (r: ApiRequest) => void;
  onDoorium?: (r: ApiRequest) => Promise<void>;
}) => {
  return (
  <div
    className="border border-border/50 rounded-xl p-3 space-y-2 bg-accent/30 hover:bg-accent/60 hover:border-border transition-colors cursor-pointer"
    onClick={() => onOpenDetail?.(r)}
  >
    <div className="flex items-center justify-between">
      <span className="text-xs font-mono text-primary flex items-center gap-1">
        {r.number} <ExternalLink size={10} />
      </span>
      <div className="flex items-center gap-1.5">
        {r.type === "installation" && ((r.interior_doors ?? 0) > 0 || (r.entrance_doors ?? 0) > 0 || (r.partitions ?? 0) > 0) && (
          <div className="flex flex-wrap gap-1">
            {(r.interior_doors ?? 0) > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                Межком. {r.interior_doors}
              </span>
            )}
            {(r.entrance_doors ?? 0) > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                Входные {r.entrance_doors}
              </span>
            )}
            {(r.partitions ?? 0) > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">
                Перег. {r.partitions} ств.
              </span>
            )}
          </div>
        )}
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[r.status as RequestStatus] || "bg-muted text-muted-foreground"}`}>
          {statusLabels[r.status as RequestStatus] || r.status}
        </span>
        {r.accepted_at && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary border border-primary/20">
            ✓ Принято {new Date(r.accepted_at).toLocaleDateString("ru-RU")}
          </span>
        )}
      </div>
    </div>

    <div className="space-y-1.5">
      {(r.partner_name || r.partner_id) && (
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Партнёр: {r.partner_name || getUserName(r.partner_id) || "—"}
            {r.partner_phone && (
              <a href={`tel:${r.partner_phone}`} className="ml-1 underline" onClick={(e) => e.stopPropagation()}>{r.partner_phone}</a>
            )}
          </span>
        </div>
      )}
      <div className="flex items-center gap-2 text-sm">
        <User size={14} className="text-muted-foreground shrink-0" />
        <span className="font-medium text-foreground">{r.client_name}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Phone size={14} className="shrink-0" />
        <a href={`tel:${r.client_phone}`} className="hover:text-primary" onClick={(e) => e.stopPropagation()}>{r.client_phone}</a>
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

    {(r.type === "installation" || r.type === "reclamation") && (
      <CalendarInstallerAssign request={r} installers={installers} getUserName={getUserName} onAssign={onAssign} />
    )}

    {onDoorium && <CalendarDooriumButton r={r} onDoorium={onDoorium} />}

    {r.status_comment && (
      <div className="text-xs bg-amber-50 text-amber-700 rounded-lg px-2 py-1.5">
        💬 {r.status_comment}
      </div>
    )}
  </div>
);
});

interface InstallationCalendarProps {
  cityFilter?: string;
  basePath?: string;
  viewerRole?: "admin" | "manager" | "measurer" | "installer" | "partner";
}

interface DayData {
  interiorInstalls: ApiRequest[];
  entranceInstalls: ApiRequest[];
  mixedInstalls: ApiRequest[];
  measurements: ApiRequest[];
  reclamations: ApiRequest[];
}

const InstallationCalendar = ({ cityFilter, basePath, viewerRole = "admin" }: InstallationCalendarProps) => {
  const isMobile = useIsMobile();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [slideDir, setSlideDir] = useState<"left" | "right">("left");
  const goMonth = useCallback((next: Date) => {
    setSlideDir(next > currentMonth ? "left" : "right");
    setCurrentMonth(next);
  }, [currentMonth]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [detailRequest, setDetailRequest] = useState<ApiRequest | null>(null);
  // scheduled=1 — забираем только заявки с датой, иначе старые не попадают в лимит 1000
  const { requests, loading, updateRequest, fetchRequests } = useRequests("scheduled=1");
  const canDoorium = viewerRole === "admin" || viewerRole === "manager";
  const handleDoorium = useCallback(async (r: ApiRequest) => {
    const linked = !!r.external_id && r.external_system === "doorium";
    try {
      const result = await api(`/api/bridge/${linked ? "sync" : "send"}/${r.id}`, { method: "POST", auth: true });
      setDetailRequest(prev => prev && prev.id === r.id ? { ...prev, ...result } : prev);
      toast.success(linked ? "Синхронизировано с Doorium" : "Заявка отправлена в Doorium");
      fetchRequests();
    } catch (e: any) {
      toast.error(e?.message || "Ошибка Doorium");
      throw e;
    }
  }, [fetchRequests]);
  const { getUserName, getByRole } = useUsers();
  const installers = useMemo(() => getByRole("installer"), [getByRole]);

  const handleAssignInstaller = useCallback(async (requestId: string, installerId: string) => {
    try { await updateRequest(requestId, { installer_id: installerId }); toast.success("Монтажник назначен"); } catch {}
  }, [updateRequest]);

  const handleRestoreDateAgreed = useCallback(async (requestId: string) => {
    try { await updateRequest(requestId, { status: "date_agreed" } as any); toast.success("Статус изменён"); } catch {}
  }, [updateRequest]);

  const handleSaveRequest = useCallback(async (id: string, updates: Partial<ApiRequest>) => {
    await updateRequest(id, updates);
    const isFileOnly = Object.keys(updates).length === 1 && updates.photos !== undefined;
    if (isFileOnly) {
      setDetailRequest(prev => prev ? { ...prev, ...updates } : null);
    } else {
      setDetailRequest(null);
      setSelectedDate(null);
      toast.success("Заявка обновлена");
    }
  }, [updateRequest]);

  const dataByDate = useMemo(() => {
    const map: Record<string, DayData> = {};
    const filtered = requests
      .filter((r) => {
        if (!r.agreed_date) return false;
        if (HIDDEN_STATUSES.includes(r.status)) return false;
        // Выполненные замеры в календаре не показываем
        if (r.type === "measurement" && r.status === "measurement_done") return false;
        return true;
      })
      .filter((r) => !cityFilter || r.city === cityFilter);

    filtered.forEach((r) => {
      const dateKey = r.agreed_date!.slice(0, 10);
      if (!map[dateKey]) map[dateKey] = { interiorInstalls: [], entranceInstalls: [], mixedInstalls: [], measurements: [], reclamations: [] };
      const d = map[dateKey];

      if (r.type === "measurement") {
        d.measurements.push(r);
      } else if (r.type === "reclamation") {
        d.reclamations.push(r);
      } else if (r.type === "installation") {
        const cat = getDoorCategory(r);
        if (cat === "interior") d.interiorInstalls.push(r);
        else if (cat === "entrance") d.entranceInstalls.push(r);
        else d.mixedInstalls.push(r);
      }
    });
    // Стабильный порядок: карточки не прыгают после назначения монтажника
    const byNumber = (x: ApiRequest, y: ApiRequest) => String(x.number).localeCompare(String(y.number), "ru", { numeric: true });
    Object.values(map).forEach((d) => {
      d.interiorInstalls.sort(byNumber); d.entranceInstalls.sort(byNumber); d.mixedInstalls.sort(byNumber);
      d.measurements.sort(byNumber); d.reclamations.sort(byNumber);
    });
    return map;
  }, [requests, cityFilter]);

  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null;
    const key = format(selectedDate, "yyyy-MM-dd");
    return dataByDate[key] || null;
  }, [selectedDate, dataByDate]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const weeks: Date[][] = [];
  let day = calStart;
  while (day <= calEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) { week.push(day); day = addDays(day, 1); }
    weeks.push(week);
  }

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 animate-fade-up">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="text-primary" size={24} />
            Календарь
          </h1>
          {/* Legend */}
          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Межкомнатные</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500" /> Входные</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-violet-500" /> Смешанные</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500" /> Замеры</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-rose-500" /> Рекламации</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 md:gap-4 bg-card rounded-xl border border-border/50 p-3 animate-fade-up" style={{ animationDelay: "60ms" }}>
          <button onClick={() => goMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-accent hover:scale-110 active:scale-95 transition-all">
            <ChevronLeft size={20} />
          </button>
          <h2 key={format(currentMonth, "yyyy-MM")} className={`text-lg font-semibold min-w-[200px] text-center capitalize ${slideDir === "left" ? "calendar-slide-left" : "calendar-slide-right"}`}>
            {format(currentMonth, "LLLL yyyy", { locale: ru })}
          </h2>
          <button onClick={() => goMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-accent hover:scale-110 active:scale-95 transition-all">
            <ChevronRight size={20} />
          </button>
          {!isToday(currentMonth) && (
            <button
              onClick={() => goMonth(new Date())}
              className="ml-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              Сегодня
            </button>
          )}
        </div>

        <div key={format(currentMonth, "yyyy-MM")} className={`bg-card rounded-xl border border-border/50 overflow-hidden ${slideDir === "left" ? "calendar-slide-left" : "calendar-slide-right"}`}>
          <div className="grid grid-cols-7 border-b border-border/50">
            {weekDays.map((wd) => (
              <div key={wd} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">{wd}</div>
            ))}
          </div>

          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 border-b border-border/30 last:border-b-0">
              {week.map((d) => {
                const dateKey = format(d, "yyyy-MM-dd");
                const dayData = dataByDate[dateKey];
                const inMonth = isSameMonth(d, currentMonth);
                const today = isToday(d);
                const hasAny = dayData && (dayData.interiorInstalls.length + dayData.entranceInstalls.length + dayData.mixedInstalls.length + dayData.measurements.length + dayData.reclamations.length > 0);
                const weekend = d.getDay() === 0 || d.getDay() === 6;

                return (
                  <button
                    key={dateKey}
                    onClick={() => hasAny && setSelectedDate(d)}
                    className={`relative min-h-[60px] md:min-h-[80px] p-1.5 md:p-2 border-r border-border/20 last:border-r-0 text-left transition-colors focus:outline-none focus:ring-1 focus:ring-primary/30 ${
                      !inMonth ? "bg-muted/30" : weekend ? "bg-accent/20" : ""
                    } ${hasAny ? "hover:bg-accent/60 cursor-pointer" : "cursor-default"}`}
                  >
                    <span className={`inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full text-xs md:text-sm font-medium ${
                      today ? "bg-destructive text-destructive-foreground font-bold shadow-md shadow-destructive/40 ring-2 ring-destructive/20" : !inMonth ? "text-muted-foreground/50" : "text-foreground"
                    }`}>
                      {format(d, "d")}
                    </span>

                    {hasAny && dayData && (() => {
                      const allReqs = [...dayData.interiorInstalls, ...dayData.entranceInstalls, ...dayData.mixedInstalls, ...dayData.measurements, ...dayData.reclamations];
                      const assigned = allReqs.filter(r => r.installer_id || r.measurer_id).length;
                      const total = allReqs.length;
                      return (
                        <div className="mt-0.5 space-y-0.5">
                          {assigned > 0 && assigned < total && (
                            <div className="text-center">
                              <span className="text-[8px] md:text-[9px] font-medium text-primary">✓{assigned}</span>
                            </div>
                          )}
                          {assigned === total && (
                            <div className="text-center">
                              <span className="text-[8px] md:text-[9px] font-medium text-emerald-600">✓ все</span>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-0.5 justify-center">
                            {dayData.interiorInstalls.length > 0 && (
                              <span className="inline-flex items-center justify-center px-1 h-4 md:px-1.5 md:h-5 text-[8px] md:text-[10px] font-bold rounded-full bg-emerald-500 text-white gap-0.5" title="Межкомнатные">
                                <span className="hidden md:inline">МК</span>{dayData.interiorInstalls.length}
                              </span>
                            )}
                            {dayData.entranceInstalls.length > 0 && (
                              <span className="inline-flex items-center justify-center px-1 h-4 md:px-1.5 md:h-5 text-[8px] md:text-[10px] font-bold rounded-full bg-blue-500 text-white gap-0.5" title="Входные">
                                <span className="hidden md:inline">Вх</span>{dayData.entranceInstalls.length}
                              </span>
                            )}
                            {dayData.mixedInstalls.length > 0 && (
                              <span className="inline-flex items-center justify-center px-1 h-4 md:px-1.5 md:h-5 text-[8px] md:text-[10px] font-bold rounded-full bg-violet-500 text-white gap-0.5" title="Смешанные">
                                <span className="hidden md:inline">См</span>{dayData.mixedInstalls.length}
                              </span>
                            )}
                            {dayData.measurements.length > 0 && (
                              <span className="inline-flex items-center justify-center px-1 h-4 md:px-1.5 md:h-5 text-[8px] md:text-[10px] font-bold rounded-full bg-amber-500 text-white gap-0.5" title="Замеры">
                                <span className="hidden md:inline">З</span>{dayData.measurements.length}
                              </span>
                            )}
                            {dayData.reclamations.length > 0 && (
                              <span className="inline-flex items-center justify-center px-1 h-4 md:px-1.5 md:h-5 text-[8px] md:text-[10px] font-bold rounded-full bg-rose-500 text-white gap-0.5" title="Рекламации">
                                <span className="hidden md:inline">Р</span>{dayData.reclamations.length}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {loading && (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-12 md:h-16 rounded-lg" style={{ opacity: 1 - (i % 7) * 0.08 }} />
            ))}
          </div>
        )}
      </div>

      {/* Day detail — mobile: fullscreen sheet, desktop: dialog */}
      {isMobile ? (
        <>
          <MobileFullScreen
            open={!!selectedDate}
            onClose={() => { if (!detailRequest) setSelectedDate(null); }}
            title={selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: ru }) : ""}
          >
            {selectedDayData && (
              <div className="p-4 space-y-4">
                {selectedDayData.interiorInstalls.length > 0 && (
                  <Section title="Межкомнатные" icon={<DoorOpen size={14} />} color="text-emerald-500" requests={selectedDayData.interiorInstalls}
                    installers={installers} getUserName={getUserName} onAssign={handleAssignInstaller} onRestore={handleRestoreDateAgreed} basePath={basePath} onOpenDetail={setDetailRequest} onDoorium={canDoorium ? handleDoorium : undefined} />
                )}
                {selectedDayData.entranceInstalls.length > 0 && (
                  <Section title="Входные" icon={<DoorClosed size={14} />} color="text-blue-500" requests={selectedDayData.entranceInstalls}
                    installers={installers} getUserName={getUserName} onAssign={handleAssignInstaller} onRestore={handleRestoreDateAgreed} basePath={basePath} onOpenDetail={setDetailRequest} onDoorium={canDoorium ? handleDoorium : undefined} />
                )}
                {selectedDayData.mixedInstalls.length > 0 && (
                  <Section title="Смешанные" icon={<Wrench size={14} />} color="text-violet-500" requests={selectedDayData.mixedInstalls}
                    installers={installers} getUserName={getUserName} onAssign={handleAssignInstaller} onRestore={handleRestoreDateAgreed} basePath={basePath} onOpenDetail={setDetailRequest} onDoorium={canDoorium ? handleDoorium : undefined} />
                )}
                {selectedDayData.measurements.length > 0 && (
                  <Section title="Замеры" icon={<Ruler size={14} />} color="text-amber-500" requests={selectedDayData.measurements}
                    installers={installers} getUserName={getUserName} onAssign={handleAssignInstaller} onRestore={handleRestoreDateAgreed} basePath={basePath} onOpenDetail={setDetailRequest} onDoorium={canDoorium ? handleDoorium : undefined} />
                )}
                {selectedDayData.reclamations.length > 0 && (
                  <Section title="Рекламации" icon={<MessageSquare size={14} />} color="text-rose-500" requests={selectedDayData.reclamations}
                    installers={installers} getUserName={getUserName} onAssign={handleAssignInstaller} onRestore={handleRestoreDateAgreed} basePath={basePath} onOpenDetail={setDetailRequest} onDoorium={canDoorium ? handleDoorium : undefined} />
                )}
              </div>
            )}
          </MobileFullScreen>

          {/* Request detail opens as another fullscreen (stacks on top) */}
          {detailRequest && (
            <RequestDetailModal
              request={detailRequest}
              onClose={() => setDetailRequest(null)}
              onSave={handleSaveRequest}
              viewerRole={viewerRole}
              onSendToDoorium={canDoorium ? handleDoorium : undefined}
              onSyncDoorium={canDoorium ? handleDoorium : undefined}
            />
          )}
        </>
      ) : (
        <>
          {/* Desktop: Dialog */}
          <Dialog
            modal={!detailRequest}
            open={!!selectedDate}
            onOpenChange={(open) => { if (!open && !detailRequest) setSelectedDate(null); }}
          >
            <DialogContent
              onInteractOutside={(e) => { if (detailRequest) e.preventDefault(); }}
              onEscapeKeyDown={(e) => { if (detailRequest) e.preventDefault(); }}
              overlayClassName="backdrop-blur-none"
              className={`dialog-lite shadow-xl dashboard-theme w-[95vw] max-w-[95vw] h-[90vh] max-h-[90vh] overflow-hidden bg-card border-border text-card-foreground ${detailRequest ? "pointer-events-none" : ""}`}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarIcon size={18} className="text-primary" />
                  {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: ru })}
                </DialogTitle>
              </DialogHeader>

              {selectedDayData && (
                <div className="flex gap-4 flex-1 overflow-x-auto overflow-y-hidden pr-1" style={{ height: "calc(90vh - 80px)" }}>
                  {selectedDayData.interiorInstalls.length > 0 && (
                    <Section title="Межкомнатные двери" icon={<DoorOpen size={14} />} color="text-emerald-500" requests={selectedDayData.interiorInstalls}
                      installers={installers} getUserName={getUserName} onAssign={handleAssignInstaller} onRestore={handleRestoreDateAgreed} basePath={basePath} onOpenDetail={setDetailRequest} onDoorium={canDoorium ? handleDoorium : undefined} />
                  )}
                  {selectedDayData.entranceInstalls.length > 0 && (
                    <Section title="Входные двери" icon={<DoorClosed size={14} />} color="text-blue-500" requests={selectedDayData.entranceInstalls}
                      installers={installers} getUserName={getUserName} onAssign={handleAssignInstaller} onRestore={handleRestoreDateAgreed} basePath={basePath} onOpenDetail={setDetailRequest} onDoorium={canDoorium ? handleDoorium : undefined} />
                  )}
                  {selectedDayData.mixedInstalls.length > 0 && (
                    <Section title="Межкомн. + Входные" icon={<Wrench size={14} />} color="text-violet-500" requests={selectedDayData.mixedInstalls}
                      installers={installers} getUserName={getUserName} onAssign={handleAssignInstaller} onRestore={handleRestoreDateAgreed} basePath={basePath} onOpenDetail={setDetailRequest} onDoorium={canDoorium ? handleDoorium : undefined} />
                  )}
                  {selectedDayData.measurements.length > 0 && (
                    <Section title="Замеры" icon={<Ruler size={14} />} color="text-amber-500" requests={selectedDayData.measurements}
                      installers={installers} getUserName={getUserName} onAssign={handleAssignInstaller} onRestore={handleRestoreDateAgreed} basePath={basePath} onOpenDetail={setDetailRequest} onDoorium={canDoorium ? handleDoorium : undefined} />
                  )}
                  {selectedDayData.reclamations.length > 0 && (
                    <Section title="Рекламации" icon={<MessageSquare size={14} />} color="text-rose-500" requests={selectedDayData.reclamations}
                      installers={installers} getUserName={getUserName} onAssign={handleAssignInstaller} onRestore={handleRestoreDateAgreed} basePath={basePath} onOpenDetail={setDetailRequest} onDoorium={canDoorium ? handleDoorium : undefined} />
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {detailRequest && (
            <RequestDetailModal
              request={detailRequest}
              onClose={() => setDetailRequest(null)}
              onSave={handleSaveRequest}
              viewerRole={viewerRole}
              onSendToDoorium={canDoorium ? handleDoorium : undefined}
              onSyncDoorium={canDoorium ? handleDoorium : undefined}
            />
          )}
        </>
      )}
    </>
  );
};

// Collapsible section for each category
const Section = ({ title, icon, color, requests, installers, getUserName, onAssign, onRestore, basePath, onOpenDetail, onDoorium }: {
  title: string;
  icon: React.ReactNode;
  color: string;
  requests: ApiRequest[];
  installers: ApiUser[];
  getUserName: (id?: string) => string | undefined;
  onAssign: (id: string, iid: string) => Promise<void>;
  onRestore: (id: string) => Promise<void>;
  basePath?: string;
  onOpenDetail?: (r: ApiRequest) => void;
  onDoorium?: (r: ApiRequest) => Promise<void>;
}) => (
  <div className="flex-1 min-w-[300px] flex flex-col h-full">
    <div className={`flex items-center gap-2 mb-2 font-semibold text-sm ${color} shrink-0`}>
      {icon}
      {title}
      <span className="text-xs font-normal text-muted-foreground">({requests.length})</span>
    </div>
    <div className="space-y-2 overflow-y-auto flex-1 pr-1">
      {requests.map((r) => (
        <RequestCard key={r.id} r={r} installers={installers} getUserName={getUserName} onAssign={onAssign} onRestore={onRestore} basePath={basePath} onOpenDetail={onOpenDetail} onDoorium={onDoorium} />
      ))}
    </div>
  </div>
);

export default InstallationCalendar;
