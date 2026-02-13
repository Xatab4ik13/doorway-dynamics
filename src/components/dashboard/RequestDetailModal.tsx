import { useState } from "react";
import { X, Phone, MapPin, Calendar, User, MessageSquare, Briefcase, Loader2, Image, FileText, ExternalLink, Trash2 } from "lucide-react";
import { statusLabels, statusColors, requestTypeLabels, statusFlows, getStatusLabel, type RequestStatus, type RequestType } from "@/data/mockDashboard";
import { useUsers, type ApiRequest } from "@/hooks/useRequests";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface RequestDetailModalProps {
  request: ApiRequest;
  onClose: () => void;
  onSave?: (id: string, updates: Partial<ApiRequest>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  viewerRole?: "admin" | "manager" | "measurer" | "installer" | "partner";
}

const RequestDetailModal = ({ request, onClose, onSave, onDelete, viewerRole = "admin" }: RequestDetailModalProps) => {
  const { getByRole } = useUsers();
  const [status, setStatus] = useState<string>(request.status);
  const [measurerId, setMeasurerId] = useState(request.measurer_id || "");
  const [installerId, setInstallerId] = useState(request.installer_id || "");
  const [notes, setNotes] = useState(request.notes || "");
  const [agreedDate, setAgreedDate] = useState(request.agreed_date?.split("T")[0] || "");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "files">("details");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const measurers = getByRole("measurer");
  const installers = getByRole("installer");

  const canEdit = viewerRole === "admin" || viewerRole === "manager";
  const canChangeDateInstaller = viewerRole === "installer" && !!request.agreed_date;
  const canChangeDate = canEdit || canChangeDateInstaller;

  // Get valid statuses for this request type
  const validStatuses = statusFlows[request.type as RequestType] || Object.keys(statusLabels);
  // Add terminal statuses
  const allValidStatuses = [...new Set([...validStatuses, "cancelled", ...(request.type === "measurement" ? ["client_refused"] : [])])];

  const photos = request.photos || [];
  const hasFiles = photos.length > 0;

  // Determine which assignment fields to show based on request type
  const showMeasurerField = request.type === "measurement";
  const showInstallerField = request.type === "installation";
  const showDateField = true; // All types have date agreement

  const handleSave = async () => {
    if (!onSave) { onClose(); return; }
    setSaving(true);
    try {
      const updates: any = { status, notes };
      if (canEdit) {
        if (showMeasurerField && measurerId) updates.measurer_id = measurerId;
        if (showInstallerField && installerId) updates.installer_id = installerId;
      }
      if (canChangeDate && agreedDate) updates.agreed_date = agreedDate;
      await onSave(request.id, updates);
      toast.success("Заявка обновлена");
    } catch {
    } finally {
      setSaving(false);
    }
  };


  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10 rounded-t-2xl">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-mono text-xs text-muted-foreground">{request.number}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent text-muted-foreground">
                  {requestTypeLabels[request.type] || request.type}
                </span>
                {request.partner_id && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                    <Briefcase size={10} /> Партнёр
                  </span>
                )}
                {request.type === "reclamation" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                    Бесплатно
                  </span>
                )}
              </div>
              <h2 className="text-lg font-heading font-bold mt-1">{request.client_name}</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground">
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          {(canEdit || viewerRole === "partner") && (
            <div className="flex border-b border-border px-5">
              <button
                onClick={() => setActiveTab("details")}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "details" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Детали
              </button>
              <button
                onClick={() => setActiveTab("files")}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === "files" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Image size={14} /> Файлы
                {hasFiles && (
                  <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold">{photos.length}</span>
                )}
              </button>
            </div>
          )}

          {activeTab === "details" && (
            <div className="p-5 space-y-5">
              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/50">
                  <Phone size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Телефон</p>
                    <p className="text-sm font-medium">{request.client_phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/50">
                  <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Адрес</p>
                    <p className="text-sm font-medium">{request.client_address}</p>
                    {request.city && <p className="text-xs text-muted-foreground">{request.city}</p>}
                  </div>
                </div>

                {request.extra_name && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/50">
                    <User size={16} className="text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Доп. контакт</p>
                      <p className="text-sm font-medium">{request.extra_name}</p>
                      {request.extra_phone && <p className="text-xs text-muted-foreground">{request.extra_phone}</p>}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/50">
                  <Calendar size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Создана</p>
                    <p className="text-sm font-medium">{request.created_at?.split("T")[0]}</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-accent/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Тип</p>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-card text-foreground border border-border">
                    {requestTypeLabels[request.type] || request.type}
                  </span>
                </div>
                {/* Agreed date */}
                {showDateField && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/50">
                    <Calendar size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                        {request.type === "measurement" ? "Дата замера" : request.type === "installation" ? "Дата монтажа" : "Дата визита"}
                      </p>
                      {canChangeDate ? (
                        <input
                          type="date"
                          value={agreedDate}
                          onChange={(e) => setAgreedDate(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      ) : (
                        <p className="text-sm font-medium text-emerald-600">{agreedDate || "Не назначена"}</p>
                      )}
                      {canChangeDateInstaller && !canEdit && (
                        <p className="text-[10px] text-muted-foreground mt-1">Можно перенести по просьбе клиента</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Work description */}
              {request.work_description && (
                <div className="p-4 rounded-xl bg-accent/30 border border-border">
                  <label className="text-[10px] font-medium text-muted-foreground mb-2 block uppercase tracking-wider flex items-center gap-1">
                    <MessageSquare size={12} /> Описание работ
                  </label>
                  <p className="text-sm leading-relaxed">{request.work_description}</p>
                </div>
              )}

              {/* Status change — only for admin/manager */}
              {canEdit && (
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground mb-2 block uppercase tracking-wider">Статус</label>
                  <div className="flex flex-wrap gap-1.5">
                    {allValidStatuses.map((key) => (
                      <button
                        key={key}
                        onClick={() => setStatus(key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          status === key
                            ? statusColors[key as RequestStatus] + " shadow-sm"
                            : "bg-accent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {getStatusLabel(key as RequestStatus, request.type as RequestType)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Assignment — context-dependent */}
              {canEdit && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {showMeasurerField && (
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground mb-2 block uppercase tracking-wider">Замерщик</label>
                      <select
                        value={measurerId}
                        onChange={(e) => setMeasurerId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="">Не назначен</option>
                        {measurers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                  )}
                  {showInstallerField && (
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground mb-2 block uppercase tracking-wider">Монтажник</label>
                      <select
                        value={installerId}
                        onChange={(e) => setInstallerId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="">Не назначен</option>
                        {installers.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-2 block uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare size={12} /> Заметки
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Добавьте заметку к заявке..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  readOnly={!canEdit}
                />
              </div>
            </div>
          )}

          {activeTab === "files" && (
            <div className="p-5">
              {photos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Image size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Нет файлов по этой заявке</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {photos.map((file, i) => (
                    <a
                      key={i}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all"
                    >
                      {file.type === "image" ? (
                        <img src={file.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-accent/50">
                          <FileText size={24} className="text-muted-foreground" />
                          <p className="text-[10px] text-muted-foreground mt-1">{file.url.split("/").pop()}</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ExternalLink size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] px-2 py-1 truncate">
                        {file.uploaded_at?.split("T")[0]}
                      </p>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between p-5 border-t border-border sticky bottom-0 bg-card rounded-b-2xl">
            <div>
              {viewerRole === "admin" && onDelete && !confirmDelete && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={14} /> Удалить заявку
                </button>
              )}
              {viewerRole === "admin" && onDelete && confirmDelete && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-destructive font-medium">Удалить безвозвратно?</span>
                  <button
                    onClick={async () => {
                      setDeleting(true);
                      try {
                        await onDelete(request.id);
                        onClose();
                        toast.success("Заявка удалена");
                      } catch {} finally { setDeleting(false); }
                    }}
                    disabled={deleting}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
                  >
                    {deleting ? <Loader2 size={12} className="animate-spin" /> : "Да, удалить"}
                  </button>
                  <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-foreground hover:bg-accent/80 transition-colors">
                    Отмена
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-accent text-foreground hover:bg-accent/80 transition-colors">
                Отмена
              </button>
              {(canEdit || canChangeDateInstaller) && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/25 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : "Сохранить"}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RequestDetailModal;