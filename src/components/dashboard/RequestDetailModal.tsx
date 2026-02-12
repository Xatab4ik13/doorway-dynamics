import { useState } from "react";
import { X, Phone, MapPin, Calendar, User, MessageSquare, Upload, FileText, Briefcase, Loader2 } from "lucide-react";
import { statusLabels, statusColors, requestTypeLabels, type RequestStatus } from "@/data/mockDashboard";
import { useUsers, type ApiRequest } from "@/hooks/useRequests";
import { toast } from "sonner";

interface RequestDetailModalProps {
  request: ApiRequest;
  onClose: () => void;
  onSave?: (id: string, updates: Partial<ApiRequest>) => Promise<void>;
  viewerRole?: "admin" | "manager" | "measurer" | "installer" | "partner";
}

const RequestDetailModal = ({ request, onClose, onSave, viewerRole = "admin" }: RequestDetailModalProps) => {
  const { getByRole } = useUsers();
  const [status, setStatus] = useState<string>(request.status);
  const [measurerId, setMeasurerId] = useState(request.measurer_id || "");
  const [installerId, setInstallerId] = useState(request.installer_id || "");
  const [notes, setNotes] = useState(request.notes || "");
  const [agreedDate, setAgreedDate] = useState(request.agreed_date?.split("T")[0] || "");
  const [saving, setSaving] = useState(false);

  const measurers = getByRole("measurer");
  const installers = getByRole("installer");

  const allStatuses = Object.entries(statusLabels);
  const canEdit = viewerRole === "admin" || viewerRole === "manager";

  const handleSave = async () => {
    if (!onSave) { onClose(); return; }
    setSaving(true);
    try {
      const updates: any = { status, notes };
      if (measurerId) updates.measurer_id = measurerId;
      if (installerId) updates.installer_id = installerId;
      if (agreedDate) updates.agreed_date = agreedDate;
      await onSave(request.id, updates);
      toast.success("Заявка обновлена");
    } catch {
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs text-muted-foreground">{request.number}</p>
              {request.partner_id && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                  <Briefcase size={10} /> Партнёр
                </span>
              )}
              {request.type === "reclamation" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                  Бесплатно
                </span>
              )}
            </div>
            <h2 className="text-xl font-heading font-bold mt-1">{request.client_name}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Phone size={16} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Телефон</p>
                <p className="text-sm font-medium">{request.client_phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Адрес</p>
                <p className="text-sm font-medium">{request.client_address}</p>
                {request.city && <p className="text-xs text-muted-foreground">{request.city}</p>}
              </div>
            </div>

            {request.extra_name && (
              <div className="flex items-start gap-3">
                <User size={16} className="text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Доп. контакт</p>
                  <p className="text-sm font-medium">{request.extra_name}</p>
                  {request.extra_phone && <p className="text-xs text-muted-foreground">{request.extra_phone}</p>}
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Дата создания</p>
                <p className="text-sm font-medium">{request.created_at?.split("T")[0]}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Тип заявки</p>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-accent text-foreground">
                {requestTypeLabels[request.type] || request.type}
              </span>
            </div>
            {/* Agreed date */}
            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Согласованная дата</p>
                {canEdit ? (
                  <input
                    type="date"
                    value={agreedDate}
                    onChange={(e) => setAgreedDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                ) : (
                  <p className="text-sm font-medium text-primary">{agreedDate || "Не назначена"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Work description */}
          {request.work_description && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                <MessageSquare size={14} /> Описание работ
              </label>
              <p className="text-sm bg-accent/50 rounded-lg px-4 py-3">{request.work_description}</p>
            </div>
          )}

          {/* Status change */}
          {canEdit && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Статус</label>
              <div className="flex flex-wrap gap-2">
                {allStatuses.map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setStatus(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      status === key
                        ? statusColors[key as RequestStatus]
                        : "bg-accent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assignment */}
          {canEdit && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Замерщик</label>
                <select
                  value={measurerId}
                  onChange={(e) => setMeasurerId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Не назначен</option>
                  {measurers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Монтажник</label>
                <select
                  value={installerId}
                  onChange={(e) => setInstallerId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Не назначен</option>
                  {installers.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
              <MessageSquare size={14} /> Заметки
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Добавьте заметку к заявке..."
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              readOnly={!canEdit}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-accent text-foreground hover:bg-accent/80 transition-colors"
          >
            Отмена
          </button>
          {canEdit && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : "Сохранить"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetailModal;
