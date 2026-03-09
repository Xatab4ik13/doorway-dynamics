import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useRequests, useUsers } from "@/hooks/useRequests";
import { statusLabels, statusColors, requestTypeLabels, type RequestStatus, type RequestType } from "@/data/mockDashboard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SearchableUserSelect from "@/components/dashboard/SearchableUserSelect";
import RequestDetailModal from "@/components/dashboard/RequestDetailModal";
import MobileFullScreen from "@/components/dashboard/MobileFullScreen";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronLeft, ChevronRight, MapPin, Phone, User, Calendar as CalendarIcon, Wrench, FileText, MessageSquare, UserPlus, Check, Loader2, DoorOpen, DoorClosed, Ruler, ExternalLink } from "lucide-react";
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

const ACTIVE_STATUSES = ["date_agreed", "installation_rescheduled"];

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

// Request card shown in modals
const RequestCard = ({ r, installers, getUserName, onAssign, onRestore, basePath, onOpenDetail }: {
  r: ApiRequest;
  installers: ApiUser[];
  getUserName: (id?: string) => string | undefined;
  onAssign: (id: string, iid: string) => Promise<void>;
  onRestore: (id: string) => Promise<void>;
  basePath?: string;
  onOpenDetail?: (r: ApiRequest) => void;
}) => {
  return (
  <div
    className="border border-border/50 rounded-xl p-3 space-y-2 bg-accent/30 hover:bg-accent/50 transition-colors cursor-pointer"
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

    {r.status_comment && (
      <div className="text-xs bg-amber-50 text-amber-700 rounded-lg px-2 py-1.5">
        💬 {r.status_comment}
      </div>
    )}
  </div>
);
};

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [detailRequest, setDetailRequest] = useState<ApiRequest | null>(null);
  const { requests, loading, updateRequest } = useRequests();
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
    setDetailRequest(null);
    toast.success("Заявка обновлена");
  }, [updateRequest]);

  const dataByDate = useMemo(() => {
    const map: Record<string, DayData> = {};
    const filtered = requests
      .filter((r) => r.agreed_date && ACTIVE_STATUSES.includes(r.status))
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
        <div className="flex items-center justify-between flex-wrap gap-2">
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

                return (
                  <button
                    key={dateKey}
                    onClick={() => hasAny && setSelectedDate(d)}
                    className={`relative min-h-[60px] md:min-h-[80px] p-1.5 md:p-2 border-r border-border/20 last:border-r-0 text-left transition-colors focus:outline-none focus:ring-1 focus:ring-primary/30 ${
                      !inMonth ? "bg-muted/30" : ""
                    } ${hasAny ? "hover:bg-accent/50 cursor-pointer" : "cursor-default"}`}
                  >
                    <span className={`inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full text-xs md:text-sm font-medium ${
                      today ? "bg-destructive text-destructive-foreground" : !inMonth ? "text-muted-foreground/50" : "text-foreground"
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

        {loading && <p className="text-center text-sm text-muted-foreground">Загрузка заявок...</p>}
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
                    installers={installers} getUserName={getUserName} onAssign={handleAssignInstaller} onRestore={handleRestoreDateAgreed} basePath={basePath} onOpenDetail={setDetailRequest} />
                )}
                {selectedDayData.entranceInstalls.length > 0 && (
                  <Section title="Входные" icon={<DoorClosed size={14} />} color="text-blue-500" requests={selectedDayData.entranceInstalls}
                    installers={installers} getUserName={getUserName} onAssign={handleAssignInstaller} onRestore={handleRestoreDateAgreed} basePath={basePath} onOpenDetail={setDetailRequest} />
                )}
                {selectedDayData.mixedInstalls.length > 0 && (
                  <Section title="Смешанные" icon={<Wrench size={14} />} color="text-violet-500" requests={selectedDayData.mixedInstalls}
                    installers={installers} getUserName={getUserName} onAssign={handleAssignInstaller} onRestore={handleRestoreDateAgreed} basePath={basePath} onOpenDetail={setDetailRequest} />
                )}
                {selectedDayData.measurements.length > 0 && (
                  <Section title="Замеры" icon={<Ruler size={14} />} color="text-amber-500" requests={selectedDayData.measurements}
                    installers={installers} getUserName={getUserName} onAssign={handleAssignInstaller} onRestore={handleRestoreDateAgreed} basePath={basePath} onOpenDetail={setDetailRequest} />
                )}
                {selectedDayData.reclamations.length > 0 && (
                  <Section title="Рекламации" icon={<MessageSquare size={14} />} color="text-rose-500" requests={selectedDayData.reclamations}
                    installers={installers} getUserName={getUserName} onAssign={handleAssignInstaller} onRestore={handleRestoreDateAgreed} basePath={basePath} onOpenDetail={setDetailRequest} />
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
              className={`dashboard-theme max-w-5xl max-h-[85vh] overflow-y-auto bg-card border-border text-card-foreground ${detailRequest ? "pointer-events-none" : ""}`}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarIcon size={18} className="text-primary" />
                  {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: ru })}
                </DialogTitle>
              </DialogHeader>

              {selectedDayData && (
                <div className="flex gap-4 max-h-[65vh] overflow-x-auto pr-1">
                  {selectedDayData.interiorInstalls.length > 0 && (
                    <Section title="Межкомнатные двери" icon={<DoorOpen size={14} />} color="text-emerald-500" requests={selectedDayData.interiorInstalls}
                      installers={installers} getUserName={getUserName} onAssign={handleAssignInstaller} onRestore={handleRestoreDateAgreed} basePath={basePath} onOpenDetail={setDetailRequest} />
                  )}
                  {selectedDayData.entranceInstalls.length > 0 && (
                    <Section title="Входные двери" icon={<DoorClosed size={14} />} color="text-blue-500" requests={selectedDayData.entranceInstalls}
                      installers={installers} getUserName={getUserName} onAssign={handleAssignInstaller} onRestore={handleRestoreDateAgreed} basePath={basePath} onOpenDetail={setDetailRequest} />
                  )}
                  {selectedDayData.mixedInstalls.length > 0 && (
                    <Section title="Межкомн. + Входные" icon={<Wrench size={14} />} color="text-violet-500" requests={selectedDayData.mixedInstalls}
                      installers={installers} getUserName={getUserName} onAssign={handleAssignInstaller} onRestore={handleRestoreDateAgreed} basePath={basePath} onOpenDetail={setDetailRequest} />
                  )}
                  {selectedDayData.measurements.length > 0 && (
                    <Section title="Замеры" icon={<Ruler size={14} />} color="text-amber-500" requests={selectedDayData.measurements}
                      installers={installers} getUserName={getUserName} onAssign={handleAssignInstaller} onRestore={handleRestoreDateAgreed} basePath={basePath} onOpenDetail={setDetailRequest} />
                  )}
                  {selectedDayData.reclamations.length > 0 && (
                    <Section title="Рекламации" icon={<MessageSquare size={14} />} color="text-rose-500" requests={selectedDayData.reclamations}
                      installers={installers} getUserName={getUserName} onAssign={handleAssignInstaller} onRestore={handleRestoreDateAgreed} basePath={basePath} onOpenDetail={setDetailRequest} />
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
            />
          )}
        </>
      )}
    </>
  );
};

// Collapsible section for each category
const Section = ({ title, icon, color, requests, installers, getUserName, onAssign, onRestore, basePath, onOpenDetail }: {
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
}) => (
  <div className="flex-1 min-w-[300px]">
    <div className={`flex items-center gap-2 mb-2 font-semibold text-sm ${color} sticky top-0 bg-card py-1`}>
      {icon}
      {title}
      <span className="text-xs font-normal text-muted-foreground">({requests.length})</span>
    </div>
    <div className="space-y-2 overflow-y-auto max-h-[55vh] pr-1">
      {requests.map((r) => (
        <RequestCard key={r.id} r={r} installers={installers} getUserName={getUserName} onAssign={onAssign} onRestore={onRestore} basePath={basePath} onOpenDetail={onOpenDetail} />
      ))}
    </div>
  </div>
);

export default InstallationCalendar;
