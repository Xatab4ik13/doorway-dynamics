import { useState, useRef } from "react";
import { X, Phone, MapPin, Calendar, User, MessageSquare, Briefcase, Loader2, Image, FileText, ExternalLink, Trash2, ArrowRight, Upload, AlertTriangle, Pencil, Link2, RefreshCw } from "lucide-react";
import SearchableUserSelect from "./SearchableUserSelect";
import { statusLabels, statusColors, requestTypeLabels, statusFlows, getStatusLabel, type RequestStatus, type RequestType } from "@/data/mockDashboard";
import { useUsers, type ApiRequest } from "@/hooks/useRequests";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { uploadFile } from "@/lib/api";
import { formatPhone } from "@/lib/formatPhone";
import { formatDate, formatDateTime } from "@/lib/formatDate";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileFullScreen from "./MobileFullScreen";
import FileViewer from "./FileViewer";

/** iOS-style grouped row for mobile detail view */
const InfoRow = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
  <div className="flex items-start gap-3 px-4 py-3">
    <div className="mt-0.5 shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      {children}
    </div>
  </div>
);

interface RequestDetailModalProps {
  request: ApiRequest;
  onClose: () => void;
  onSave?: (id: string, updates: Partial<ApiRequest>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onSendToInstallation?: (request: ApiRequest) => Promise<void>;
  onSendToReclamation?: (request: ApiRequest) => Promise<void>;
  onSendToDoorium?: (request: ApiRequest) => Promise<void>;
  onSyncDoorium?: (request: ApiRequest) => Promise<void>;
  viewerRole?: "admin" | "manager" | "measurer" | "installer" | "partner";
}

const RequestDetailModal = ({ request, onClose, onSave, onDelete, onSendToInstallation, onSendToReclamation, onSendToDoorium, onSyncDoorium, viewerRole = "admin" }: RequestDetailModalProps) => {
  const isMobile = useIsMobile();
  const canEdit = viewerRole === "admin" || viewerRole === "manager";
  const canPartnerEdit = viewerRole === "partner";
  const { getByRole, getUserName, getUser } = useUsers(!canEdit);
  const [status, setStatus] = useState<string>(request.status);
  const [measurerId, setMeasurerId] = useState(request.measurer_id || "");
  const [installerId, setInstallerId] = useState(request.installer_id || "");
  const [installer2Id, setInstaller2Id] = useState(request.installer_2_id || "");
  const [installer3Id, setInstaller3Id] = useState(request.installer_3_id || "");
  const [installer4Id, setInstaller4Id] = useState(request.installer_4_id || "");
  const [notes, setNotes] = useState(request.notes || "");
  const [agreedDate, setAgreedDate] = useState(request.agreed_date?.split("T")[0] || "");
  const [amount, setAmount] = useState<string>(request.amount != null ? String(request.amount) : "");
  const [interiorDoors, setInteriorDoors] = useState<string>(request.interior_doors != null ? String(request.interior_doors) : "");
  const [entranceDoors, setEntranceDoors] = useState<string>(request.entrance_doors != null ? String(request.entrance_doors) : "");
  const [partitions, setPartitions] = useState<string>(request.partitions != null ? String(request.partitions) : "");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "files">("details");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sendingToInstall, setSendingToInstall] = useState(false);
  const [sendingToReclamation, setSendingToReclamation] = useState(false);
  const [sendingToDoorium, setSendingToDoorium] = useState(false);
  const [syncingDoorium, setSyncingDoorium] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Editable client fields for admin/manager/partner
  const [clientName, setClientName] = useState(request.client_name || "");
  const [clientPhone, setClientPhone] = useState(request.client_phone || "");
  const [clientAddress, setClientAddress] = useState(request.client_address || "");
  const [city, setCity] = useState(request.city || "");
  const [extraName, setExtraName] = useState(request.extra_name || "");
  const [extraPhone, setExtraPhone] = useState(request.extra_phone || "");
  const [workDescription, setWorkDescription] = useState(request.work_description || "");
  const [source, setSource] = useState<string>(request.source || "site");
  const [partnerId, setPartnerId] = useState<string>(request.partner_id || "");
  const [requestType, setRequestType] = useState<string>(request.type || "measurement");
  
  // Edit mode toggle for admin/manager
  const [isEditing, setIsEditing] = useState(false);
  
  // Confirmation dialog
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<any>(null);
  const [viewingFile, setViewingFile] = useState<{ url: string; type: string } | null>(null);

  const measurers = getByRole("measurer");
  const installers = getByRole("installer");
  const partners = getByRole("partner");
  const partnerUser = getUser(partnerId || request.partner_id);
  const partnerName = partnerUser?.name || request.partner_name;
  const partnerPhone = partnerUser?.phone || request.partner_phone;

  const canChangeDateInstaller = viewerRole === "installer" && !!request.agreed_date;
  const canChangeDateMeasurer = viewerRole === "measurer";
  const canChangeDate = canEdit || canChangeDateInstaller || canChangeDateMeasurer;

  // Get valid statuses for this request type
  const validStatuses = statusFlows[request.type as RequestType] || Object.keys(statusLabels);
  // Add terminal statuses + pending from any non-closed
  const allValidStatuses = [...new Set([...validStatuses, "pending", "cancelled", ...(request.type === "measurement" ? ["client_refused"] : [])])];

  const photos = request.photos || [];
  const hasFiles = photos.length > 0;

  // Determine which assignment fields to show based on request type
  const showMeasurerField = request.type === "measurement";
  const showInstallerField = request.type === "installation" || request.type === "reclamation";
  const showDateField = true;

  const buildUpdates = () => {
    const updates: any = { status, notes };
    
    if (canEdit) {
      // Admin/Manager can edit everything
      updates.client_name = clientName;
      updates.client_phone = clientPhone;
      updates.client_address = clientAddress;
      updates.city = city;
      updates.extra_name = extraName || null;
      updates.extra_phone = extraPhone || null;
      updates.work_description = workDescription || null;
      updates.source = partnerId ? "partner" : source;
      updates.partner_id = partnerId || null;
      updates.type = requestType;
      
      if (showMeasurerField) updates.measurer_id = measurerId || null;
      if (showInstallerField) updates.installer_id = installerId || null;
      if (showInstallerField) {
        updates.installer_2_id = installer2Id || null;
        updates.installer_3_id = installer3Id || null;
        updates.installer_4_id = installer4Id || null;
      }
      updates.amount = amount ? parseFloat(amount) : null;
      updates.interior_doors = interiorDoors ? parseInt(interiorDoors) : null;
      updates.entrance_doors = entranceDoors ? parseInt(entranceDoors) : null;
      updates.partitions = partitions ? parseInt(partitions) : null;
    }
    
    if (canPartnerEdit) {
      updates.client_name = clientName;
      updates.client_phone = clientPhone;
      updates.client_address = clientAddress;
      updates.city = city;
      updates.extra_name = extraName || null;
      updates.extra_phone = extraPhone || null;
      updates.work_description = workDescription || null;
      updates.interior_doors = interiorDoors ? parseInt(interiorDoors) : null;
      updates.entrance_doors = entranceDoors ? parseInt(entranceDoors) : null;
      updates.partitions = partitions ? parseInt(partitions) : null;
      // Remove status/notes for partners
      delete updates.status;
      delete updates.notes;
    }
    
    // Only send agreed_date if it actually changed to prevent backend from triggering 'installation_rescheduled'
    if (canChangeDate) {
      const originalDate = request.agreed_date?.split("T")[0] || "";
      if (agreedDate !== originalDate) {
        updates.agreed_date = agreedDate || null;
      }
    }
    
    return updates;
  };

  const handleSave = async () => {
    if (!onSave) { onClose(); return; }
    
    const updates = buildUpdates();
    
    // Show confirmation for admin/manager edits
    if (canEdit) {
      setPendingUpdates(updates);
      setShowConfirm(true);
      return;
    }
    
    // Direct save for others
    await executeSave(updates);
  };
  
  const executeSave = async (updates: any) => {
    setSaving(true);
    try {
      await onSave!(request.id, updates);
      toast.success("Заявка обновлена");
      onClose();
    } catch {
    } finally {
      setSaving(false);
      setShowConfirm(false);
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  const editButton = canEdit ? (
    <button
      onClick={() => setIsEditing(!isEditing)}
      className={`p-2 rounded-xl transition-colors ${isEditing ? "bg-primary/10 text-primary" : "hover:bg-accent text-muted-foreground"}`}
      title={isEditing ? "Отключить редактирование" : "Редактировать"}
    >
      <Pencil size={18} />
    </button>
  ) : null;

  // Extracted render helpers for reuse between mobile and desktop
  const renderConfirmation = () => showConfirm ? (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[90] dashboard-theme">
      <div className="bg-card rounded-2xl p-6 max-w-sm mx-4 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <AlertTriangle size={24} className="text-amber-500" />
          <h3 className="font-heading font-bold">Подтверждение</h3>
        </div>
        <p className="text-sm text-muted-foreground">Вы уверены, что хотите сохранить изменения в этой заявке?</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setShowConfirm(false)} className="px-4 py-2.5 rounded-xl text-sm bg-accent text-foreground active:opacity-60 transition-opacity">
            Отмена
          </button>
          <button 
            onClick={() => executeSave(pendingUpdates)} 
            disabled={saving}
            className="px-4 py-2.5 rounded-xl text-sm bg-primary text-primary-foreground active:opacity-60 transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : "Подтвердить"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  const renderFooter = () => (
    <div className="flex items-center justify-between p-4 border-t border-border/30 bg-card sticky bottom-0">
      <div>
        {viewerRole === "admin" && onDelete && !confirmDelete && (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-destructive active:opacity-60 transition-opacity"
          >
            <Trash2 size={14} /> Удалить
          </button>
        )}
        {viewerRole === "admin" && onDelete && confirmDelete && (
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                setDeleting(true);
                try { await onDelete(request.id); onClose(); toast.success("Заявка удалена"); } catch {} finally { setDeleting(false); }
              }}
              disabled={deleting}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-destructive text-destructive-foreground disabled:opacity-50"
            >
              {deleting ? <Loader2 size={12} className="animate-spin" /> : "Удалить"}
            </button>
            <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-accent text-foreground">
              Отмена
            </button>
          </div>
        )}
      </div>
      <div className="flex gap-2 flex-wrap">
        {/* Doorium: send */}
        {canEdit && onSendToDoorium && !request.external_id && (
          <button
            onClick={async () => {
              setSendingToDoorium(true);
              try { await onSendToDoorium(request); toast.success("Заявка отправлена в Doorium"); } catch (e: any) { toast.error(e.message || "Ошибка отправки"); } finally { setSendingToDoorium(false); }
            }}
            disabled={sendingToDoorium}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-violet-500 text-white disabled:opacity-50 flex items-center gap-2 active:opacity-80"
          >
            {sendingToDoorium ? <Loader2 size={16} className="animate-spin" /> : <><Link2 size={16} /> В Doorium</>}
          </button>
        )}
        {/* Doorium: sync */}
        {canEdit && onSyncDoorium && request.external_id && request.external_system === "doorium" && (
          <button
            onClick={async () => {
              setSyncingDoorium(true);
              try { await onSyncDoorium(request); toast.success("Статус синхронизирован"); } catch (e: any) { toast.error(e.message || "Ошибка синхронизации"); } finally { setSyncingDoorium(false); }
            }}
            disabled={syncingDoorium}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-violet-100 text-violet-700 disabled:opacity-50 flex items-center gap-2 active:opacity-80"
          >
            {syncingDoorium ? <Loader2 size={16} className="animate-spin" /> : <><RefreshCw size={16} /> Синхр.</>}
          </button>
        )}
        {request.type === "measurement" && (canEdit || viewerRole === "partner") && onSendToInstallation && (
          <button
            onClick={async () => {
              setSendingToInstall(true);
              try { await onSendToInstallation(request); toast.success("Заявка на монтаж создана"); } catch {} finally { setSendingToInstall(false); }
            }}
            disabled={sendingToInstall}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-orange-500 text-white disabled:opacity-50 flex items-center gap-2 active:opacity-80"
          >
            {sendingToInstall ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} /> На монтаж</>}
          </button>
        )}
        {request.type === "installation" && canEdit && onSendToReclamation && (
          <button
            onClick={async () => {
              setSendingToReclamation(true);
              try { await onSendToReclamation(request); toast.success("Рекламация создана"); } catch {} finally { setSendingToReclamation(false); }
            }}
            disabled={sendingToReclamation}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-destructive text-destructive-foreground disabled:opacity-50 flex items-center gap-2 active:opacity-80"
          >
            {sendingToReclamation ? <Loader2 size={16} className="animate-spin" /> : <><AlertTriangle size={16} /> На рекламацию</>}
          </button>
        )}
        {(canEdit || canChangeDateInstaller || canChangeDateMeasurer || canPartnerEdit) && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground shadow-md shadow-primary/25 disabled:opacity-50 flex items-center gap-2 active:opacity-80"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : "Сохранить"}
          </button>
        )}
      </div>
    </div>
  );

  // === MOBILE: fullscreen iOS sheet ===
  if (isMobile) {
    return (
      <>
        <MobileFullScreen open={true} onClose={onClose} title={request.number} headerRight={editButton}>
          {/* Partner badge for measurer */}
          {viewerRole === "measurer" && partnerName && (
            <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
              <Briefcase size={14} className="text-emerald-600 shrink-0" />
              <span className="text-xs font-medium text-emerald-700">{partnerName}</span>
            </div>
          )}
          {/* Segmented tabs */}
          <div className="flex border-b border-border/30 bg-card sticky top-0 z-10">
            <button onClick={() => setActiveTab("details")}
              className={`flex-1 py-3 text-[13px] font-medium transition-colors ${activeTab === "details" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}>
              Детали
            </button>
            <button onClick={() => setActiveTab("files")}
              className={`flex-1 py-3 text-[13px] font-medium transition-colors flex items-center justify-center gap-1.5 ${activeTab === "files" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}>
              Файлы {hasFiles && <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold">{photos.length}</span>}
            </button>
          </div>

          {activeTab === "details" && (
            <div className="p-4 space-y-4">
              {/* Editable client data — when pencil is active or partner */}
              {((canEdit && isEditing) || canPartnerEdit) ? (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-accent/30 overflow-hidden divide-y divide-border/30">
                    <div className="px-4 py-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Клиент</p>
                      <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputClass} />
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Телефон</p>
                      <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(formatPhone(e.target.value))} className={inputClass} />
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Город</p>
                      <select value={city} onChange={(e) => setCity(e.target.value)} className={inputClass}>
                        <option value="">Не указан</option>
                        <option value="Москва">Москва</option>
                        <option value="Санкт-Петербург">Санкт-Петербург</option>
                      </select>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Адрес</p>
                      <input type="text" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className={inputClass} />
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Доп. контакт</p>
                      <input type="text" value={extraName} onChange={(e) => setExtraName(e.target.value)} className={inputClass} placeholder="ФИО" />
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Доп. телефон</p>
                      <input type="tel" value={extraPhone} onChange={(e) => setExtraPhone(formatPhone(e.target.value))} className={inputClass} placeholder="+7 ..." />
                    </div>
                  </div>
                  {canEdit && (
                    <div className="rounded-2xl bg-accent/30 overflow-hidden divide-y divide-border/30">
                      <div className="px-4 py-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Партнёр</p>
                        <SearchableUserSelect
                          value={partnerId}
                          onChange={(val) => { setPartnerId(val); setSource(val ? "partner" : "site"); }}
                          users={partners}
                          placeholder="Без партнёра (заявка с сайта)"
                        />
                      </div>
                      <div className="px-4 py-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Тип заявки</p>
                        <select value={requestType} onChange={(e) => setRequestType(e.target.value)} className={inputClass}>
                          <option value="measurement">Замер</option>
                          <option value="installation">Монтаж</option>
                          <option value="reclamation">Рекламация</option>
                        </select>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Описание работ</p>
                    <textarea value={workDescription} onChange={(e) => setWorkDescription(e.target.value)} rows={2} className={inputClass + " resize-none"} placeholder="Описание работ..." />
                  </div>
                  {/* Agreed date in edit mode */}
                  {showDateField && (
                    <div className="rounded-2xl bg-accent/30 px-4 py-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                        {request.type === "measurement" ? "Дата замера" : request.type === "installation" ? "Дата монтажа" : "Дата визита"}
                      </p>
                      {canChangeDate ? (
                        <input type="date" value={agreedDate} onChange={(e) => setAgreedDate(e.target.value)} className="text-sm font-medium bg-transparent focus:outline-none text-primary" />
                      ) : (
                        <p className="text-sm font-medium text-emerald-600">{agreedDate || "Не назначена"}</p>
                      )}
                    </div>
                  )}
                  {/* Door quantities in edit mode */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-3 rounded-2xl bg-accent/30">
                      <p className="text-[10px] text-muted-foreground mb-1">МК</p>
                      <input type="number" min="0" value={interiorDoors} onChange={(e) => setInteriorDoors(e.target.value)} className="w-full text-center text-lg font-bold text-foreground bg-transparent outline-none" placeholder="0" />
                    </div>
                    <div className="text-center p-3 rounded-2xl bg-accent/30">
                      <p className="text-[10px] text-muted-foreground mb-1">Входные</p>
                      <input type="number" min="0" value={entranceDoors} onChange={(e) => setEntranceDoors(e.target.value)} className="w-full text-center text-lg font-bold text-foreground bg-transparent outline-none" placeholder="0" />
                    </div>
                    <div className="text-center p-3 rounded-2xl bg-accent/30">
                      <p className="text-[10px] text-muted-foreground mb-1">Перегор.</p>
                      <input type="number" min="0" value={partitions} onChange={(e) => setPartitions(e.target.value)} className="w-full text-center text-lg font-bold text-foreground bg-transparent outline-none" placeholder="0" />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Read-only iOS grouped info cards */}
                  <div className="rounded-2xl bg-accent/30 overflow-hidden divide-y divide-border/30">
                    <InfoRow icon={<Phone size={16} className="text-primary" />} label="Телефон">
                      <a href={`tel:${request.client_phone?.replace(/\s/g, "")}`} className="text-sm font-medium text-primary">{request.client_phone}</a>
                    </InfoRow>
                    <InfoRow icon={<MapPin size={16} className="text-primary" />} label="Адрес">
                      <a href={`https://yandex.ru/maps/?text=${encodeURIComponent((request.client_address || "") + (request.city ? ", " + request.city : ""))}`}
                        target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary">
                        {request.client_address}{request.city ? `, ${request.city}` : ""}
                      </a>
                    </InfoRow>
                    {request.extra_name && (
                      <InfoRow icon={<User size={16} className="text-primary" />} label="Доп. контакт">
                        <p className="text-sm font-medium text-foreground">{request.extra_name}</p>
                        {request.extra_phone && <a href={`tel:${request.extra_phone?.replace(/\s/g, "")}`} className="text-xs text-primary">{request.extra_phone}</a>}
                      </InfoRow>
                    )}
                    <InfoRow icon={<Calendar size={16} className="text-primary" />} label="Создана">
                      <p className="text-sm font-medium text-foreground">{formatDate(request.created_at)}</p>
                    </InfoRow>
                    {showDateField && (
                      <InfoRow icon={<Calendar size={16} className="text-emerald-600" />} label={request.type === "measurement" ? "Дата замера" : request.type === "installation" ? "Дата монтажа" : "Дата визита"}>
                        {canChangeDate ? (
                          <input type="date" value={agreedDate} onChange={(e) => setAgreedDate(e.target.value)} className="text-sm font-medium bg-transparent focus:outline-none text-foreground" />
                        ) : (
                          <p className="text-sm font-medium text-emerald-600">{agreedDate || "Не назначена"}</p>
                        )}
                      </InfoRow>
                    )}
                  </div>

                  {/* Work description */}
                  {request.work_description && (
                    <div className="p-3.5 rounded-2xl bg-accent/30">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Описание работ</p>
                      <p className="text-sm text-foreground">{request.work_description}</p>
                    </div>
                  )}
                  {request.status_comment && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                      <p className="text-[10px] text-amber-700 uppercase tracking-wider mb-1">Комментарий</p>
                      <p className="text-sm text-amber-900">{request.status_comment}</p>
                    </div>
                  )}
                  {(request.interior_doors || request.entrance_doors || request.partitions) && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-3 rounded-2xl bg-accent/30"><p className="text-[10px] text-muted-foreground">МК</p><p className="text-lg font-bold text-foreground">{request.interior_doors || 0}</p></div>
                      <div className="text-center p-3 rounded-2xl bg-accent/30"><p className="text-[10px] text-muted-foreground">Входные</p><p className="text-lg font-bold text-foreground">{request.entrance_doors || 0}</p></div>
                      <div className="text-center p-3 rounded-2xl bg-accent/30"><p className="text-[10px] text-muted-foreground">Перегор.</p><p className="text-lg font-bold text-foreground">{request.partitions || 0}</p></div>
                    </div>
                  )}
                </>
              )}

              {/* Operational fields — always visible for admin/manager */}
              {canEdit && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Статус</p>
                  <div className="flex flex-wrap gap-1.5">
                    {allValidStatuses.map((key) => (
                      <button key={key} onClick={() => setStatus(key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium active:scale-95 ${status === key ? statusColors[key as RequestStatus] + " shadow-sm" : "bg-accent text-muted-foreground"}`}>
                        {getStatusLabel(key as RequestStatus, request.type as RequestType)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {canEdit && (
                <div className="space-y-3">
                  {showMeasurerField && <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Замерщик</p><SearchableUserSelect value={measurerId} onChange={setMeasurerId} users={measurers} placeholder="Не назначен" /></div>}
                  {showInstallerField && (
                    <><div><p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Монтажник 1</p><SearchableUserSelect value={installerId} onChange={setInstallerId} users={installers} placeholder="Не назначен" /></div>
                    <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Монтажник 2</p><SearchableUserSelect value={installer2Id} onChange={setInstaller2Id} users={installers} placeholder="Не назначен" /></div></>
                  )}
                </div>
              )}
              {canEdit && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Сумма</p>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} placeholder="0" />
                </div>
              )}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Заметки</p>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Добавьте заметку..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-border bg-background text-sm focus:outline-none resize-none" readOnly={!canEdit && !canPartnerEdit} />
              </div>
            </div>
          )}

          {activeTab === "files" && (
            <div className="p-4 space-y-4">
              {(canEdit || viewerRole === "partner") && onSave && (
                <div>
                  <input ref={fileInputRef} type="file" multiple className="hidden" accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={async (e) => {
                      const selectedFiles = Array.from(e.target.files || []);
                      if (!selectedFiles.length) return;
                      setUploadingFile(true);
                      try {
                        const uploaded: typeof photos = [];
                        for (const f of selectedFiles) {
                          try { const result = await uploadFile(f, "requests"); uploaded.push({ url: result.url, type: f.type.startsWith("image/") ? "image" : "document", stage: "general", uploaded_at: new Date().toISOString() }); }
                          catch { toast.error(`Не удалось: ${f.name}`); }
                        }
                        if (uploaded.length > 0) {
                          const updatedPhotos = [...photos, ...uploaded];
                          await onSave(request.id, { photos: updatedPhotos as any });
                          request.photos = updatedPhotos;
                          toast.success(`Загружено: ${uploaded.length}`);
                        }
                      } finally { setUploadingFile(false); e.target.value = ""; }
                    }} />
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploadingFile}
                    className="w-full py-3.5 border-2 border-dashed border-border rounded-2xl text-xs text-muted-foreground flex items-center justify-center gap-2 active:bg-accent/50 disabled:opacity-50">
                    {uploadingFile ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {uploadingFile ? "Загрузка..." : "Загрузить файлы"}
                  </button>
                </div>
              )}
              {photos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground"><Image size={40} className="mx-auto mb-3 opacity-30" /><p className="text-sm">Нет файлов</p></div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {photos.map((file, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-border group">
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                        {file.type === "image" ? <img src={file.url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-accent/50"><FileText size={24} className="text-muted-foreground" /></div>}
                      </a>
                      <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] px-2 py-1 truncate">
                        {formatDate(file.uploaded_at)}
                      </p>
                      {viewerRole === "admin" && onSave && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            const updatedPhotos = photos.filter((_, idx) => idx !== i);
                            try {
                              await onSave(request.id, { photos: updatedPhotos as any });
                              request.photos = updatedPhotos;
                              toast.success("Файл удалён");
                            } catch {
                              toast.error("Ошибка удаления файла");
                            }
                          }}
                          className="absolute top-1.5 right-1.5 p-2 rounded-xl bg-black/60 text-white active:bg-destructive transition-all z-10"
                          title="Удалить файл"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {renderFooter()}
          {renderConfirmation()}
        </MobileFullScreen>
      </>
    );
  }

  // Desktop: original modal
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative bg-card shadow-2xl w-full max-w-2xl overflow-auto rounded-2xl max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10 rounded-t-2xl">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-mono text-xs text-muted-foreground">{request.number}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent text-muted-foreground">
                  {requestTypeLabels[request.type] || request.type}
                </span>
                {(partnerName || request.partner_id) && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                    <Briefcase size={10} />
                    {partnerName || "Партнёр"}
                    {partnerPhone && viewerRole !== "measurer" && (
                      <a href={`tel:${partnerPhone.replace(/\s/g, "")}`} className="ml-1 underline hover:no-underline" onClick={(e) => e.stopPropagation()}>
                        {partnerPhone}
                      </a>
                    )}
                  </span>
                )}
                {request.accepted_at && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                    ✓ Принято монтажником {formatDate(request.accepted_at)}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-heading font-bold mt-1">{request.client_name}</h2>
            </div>
            <div className="flex items-center gap-1">
              {canEdit && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-2 rounded-xl transition-colors ${isEditing ? "bg-primary/10 text-primary" : "hover:bg-accent text-muted-foreground"}`}
                  title={isEditing ? "Отключить редактирование" : "Редактировать"}
                >
                  <Pencil size={18} />
                </button>
              )}
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground">
                <X size={20} />
              </button>
            </div>
          </div>
          {/* Tabs */}
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

          {activeTab === "details" && (
            <div className="p-5 space-y-5">
              {/* Progress tracker for partner */}
              {viewerRole === "partner" && (
                <div className="space-y-2">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Прогресс заявки</p>
                  <div className="flex items-center gap-1">
                    {(statusFlows[request.type as RequestType] || []).map((step, i, arr) => {
                      const flow = statusFlows[request.type as RequestType] || [];
                      const currentIdx = flow.indexOf(request.status as RequestStatus);
                      const stepIdx = i;
                      const isCompleted = stepIdx < currentIdx || request.status === "closed";
                      const isCurrent = stepIdx === currentIdx && request.status !== "closed";
                      const isCancelled = request.status === "cancelled" || request.status === "client_refused";

                      return (
                        <div key={step} className="flex items-center flex-1">
                          <div className="flex flex-col items-center flex-1">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                isCancelled
                                  ? "bg-destructive/10 text-destructive"
                                  : isCompleted
                                  ? "bg-emerald-500 text-white"
                                  : isCurrent
                                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                                  : "bg-accent text-muted-foreground"
                              }`}
                            >
                              {isCompleted ? "✓" : stepIdx + 1}
                            </div>
                            <p className={`text-[9px] mt-1 text-center leading-tight max-w-[70px] ${
                              isCurrent ? "text-primary font-medium" : isCompleted ? "text-emerald-600" : "text-muted-foreground"
                            }`}>
                              {getStatusLabel(step, request.type as RequestType)}
                            </p>
                          </div>
                          {i < arr.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-0.5 mt-[-16px] ${
                              isCompleted ? "bg-emerald-400" : "bg-border"
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {(request.status === "cancelled" || request.status === "client_refused") && (
                    <p className="text-xs text-destructive font-medium text-center mt-1">
                      {statusLabels[request.status as RequestStatus]}
                    </p>
                  )}
                </div>
              )}

              {/* Editable client data — only with pencil for admin/manager, always for partner */}
              {((canEdit && isEditing) || canPartnerEdit) ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground mb-1 block uppercase tracking-wider">Клиент</label>
                      <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground mb-1 block uppercase tracking-wider">Телефон</label>
                      <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(formatPhone(e.target.value))} className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-medium text-muted-foreground mb-1 block uppercase tracking-wider">Адрес</label>
                      <input type="text" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground mb-1 block uppercase tracking-wider">Город</label>
                      <select value={city} onChange={(e) => setCity(e.target.value)} className={inputClass}>
                        <option value="">Не указан</option>
                        <option value="Москва">Москва</option>
                        <option value="Санкт-Петербург">Санкт-Петербург</option>
                      </select>
                    </div>
                    {canEdit && (
                      <>
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-medium text-muted-foreground mb-1 block uppercase tracking-wider">Партнёр</label>
                          <SearchableUserSelect
                            value={partnerId}
                            onChange={(val) => {
                              setPartnerId(val);
                              setSource(val ? "partner" : "site");
                            }}
                            users={partners}
                            placeholder="Без партнёра (заявка с сайта)"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-muted-foreground mb-1 block uppercase tracking-wider">Тип заявки</label>
                          <select value={requestType} onChange={(e) => setRequestType(e.target.value)} className={inputClass}>
                            <option value="measurement">Замер</option>
                            <option value="installation">Монтаж</option>
                            <option value="reclamation">Рекламация</option>
                          </select>
                        </div>
                      </>
                    )}
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground mb-1 block uppercase tracking-wider">Доп. контакт</label>
                      <input type="text" value={extraName} onChange={(e) => setExtraName(e.target.value)} className={inputClass} placeholder="ФИО" />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground mb-1 block uppercase tracking-wider">Доп. телефон</label>
                      <input type="tel" value={extraPhone} onChange={(e) => setExtraPhone(formatPhone(e.target.value))} className={inputClass} placeholder="+7 ..." />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block uppercase tracking-wider">Описание работ</label>
                    <textarea value={workDescription} onChange={(e) => setWorkDescription(e.target.value)} rows={2} className={inputClass + " resize-none"} placeholder="Описание работ..." />
                  </div>

                  {/* Agreed date — visible in edit mode for partner (read-only display) */}
                  {canPartnerEdit && showDateField && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/50">
                      <Calendar size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                          {request.type === "measurement" ? "Дата замера" : request.type === "installation" ? "Дата монтажа" : "Дата визита"}
                        </p>
                        <p className="text-sm font-medium text-emerald-600">{agreedDate || "Не назначена"}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Read-only Info grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/50">
                    <Phone size={16} className="text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Телефон</p>
                      <a href={`tel:${request.client_phone?.replace(/\s/g, "")}`} className="text-sm font-medium text-primary hover:underline">{request.client_phone}</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/50">
                    <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Адрес</p>
                      <a 
                        href={`https://yandex.ru/maps/?text=${encodeURIComponent((request.client_address || "") + (request.city ? ", " + request.city : ""))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {request.client_address}
                      </a>
                      {request.city && <p className="text-xs text-muted-foreground">{request.city}</p>}
                    </div>
                  </div>

                  {request.extra_name && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/50">
                      <User size={16} className="text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Доп. контакт</p>
                        <p className="text-sm font-medium">{request.extra_name}</p>
                        {request.extra_phone && (
                          <a href={`tel:${request.extra_phone?.replace(/\s/g, "")}`} className="text-xs text-primary hover:underline">{request.extra_phone}</a>
                        )}
                      </div>
                    </div>
                  )}

                  {partnerName && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <Briefcase size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-emerald-600 uppercase tracking-wider">Партнёр</p>
                        <p className="text-sm font-medium text-emerald-700">{partnerName}</p>
                        {partnerPhone && viewerRole !== "measurer" && (
                          <a href={`tel:${partnerPhone.replace(/\s/g, "")}`} className="text-xs text-emerald-600 hover:underline">{partnerPhone}</a>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/50">
                    <Calendar size={16} className="text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Создана</p>
                      <p className="text-sm font-medium">{formatDate(request.created_at)}</p>
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
                        {canChangeDateMeasurer && !canEdit && (
                          <p className="text-[10px] text-muted-foreground mt-1">Можно перенести дату замера</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Work description (read-only when not editing) */}
              {(!(canEdit && isEditing) && !canPartnerEdit) && request.work_description && (
                <div className="p-4 rounded-xl bg-accent/30 border border-border">
                  <label className="text-[10px] font-medium text-muted-foreground mb-2 block uppercase tracking-wider flex items-center gap-1">
                    <MessageSquare size={12} /> Описание работ
                  </label>
                  <p className="text-sm leading-relaxed">{request.work_description}</p>
                </div>
              )}

              {/* Date field — for admin/manager when in edit mode (date is already in the read-only grid above) */}
              {canEdit && isEditing && showDateField && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/50">
                  <Calendar size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                      {request.type === "measurement" ? "Дата замера" : request.type === "installation" ? "Дата монтажа" : "Дата визита"}
                    </p>
                    <input
                      type="date"
                      value={agreedDate}
                      onChange={(e) => setAgreedDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              )}

              {/* Status comment */}
              {request.status_comment && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <label className="text-[10px] font-medium text-amber-700 mb-2 block uppercase tracking-wider flex items-center gap-1">
                    <MessageSquare size={12} /> Комментарий к статусу
                  </label>
                  <p className="text-sm leading-relaxed text-amber-900">{request.status_comment}</p>
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
                      <SearchableUserSelect value={measurerId} onChange={setMeasurerId} users={measurers} placeholder="Не назначен" />
                    </div>
                  )}
                  {showInstallerField && (
                    <>
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground mb-2 block uppercase tracking-wider">Монтажник 1</label>
                        <SearchableUserSelect value={installerId} onChange={setInstallerId} users={installers} placeholder="Не назначен" />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground mb-2 block uppercase tracking-wider">Монтажник 2</label>
                        <SearchableUserSelect value={installer2Id} onChange={setInstaller2Id} users={installers} placeholder="Не назначен" />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground mb-2 block uppercase tracking-wider">Монтажник 3</label>
                        <SearchableUserSelect value={installer3Id} onChange={setInstaller3Id} users={installers} placeholder="Не назначен" />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground mb-2 block uppercase tracking-wider">Монтажник 4</label>
                        <SearchableUserSelect value={installer4Id} onChange={setInstaller4Id} users={installers} placeholder="Не назначен" />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Amount & quantities — for admin/manager */}
              {canEdit && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-2 block uppercase tracking-wider">Сумма (₽)</label>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Укажите сумму..."
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-2 block uppercase tracking-wider">Количество изделий</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block text-center">Межкомнатные</label>
                        <input type="number" min="0" value={interiorDoors} onChange={(e) => setInteriorDoors(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="0" />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block text-center">Входные</label>
                        <input type="number" min="0" value={entranceDoors} onChange={(e) => setEntranceDoors(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="0" />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block text-center">Перегородка (кол-во створок)</label>
                        <input type="number" min="0" value={partitions} onChange={(e) => setPartitions(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="0" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Partner editable quantities */}
              {canPartnerEdit && request.type === "installation" && (
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground mb-2 block uppercase tracking-wider">Количество изделий</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-muted-foreground mb-1 block text-center">Межкомнатные</label>
                      <input type="number" min="0" value={interiorDoors} onChange={(e) => setInteriorDoors(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="0" />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground mb-1 block text-center">Входные</label>
                      <input type="number" min="0" value={entranceDoors} onChange={(e) => setEntranceDoors(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="0" />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground mb-1 block text-center">Перегородка</label>
                      <input type="number" min="0" value={partitions} onChange={(e) => setPartitions(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="0" />
                    </div>
                  </div>
                </div>
              )}

              {/* Door counts read-only for executors */}
              {!canEdit && !canPartnerEdit && (request.interior_doors || request.entrance_doors || request.partitions) && (
                <div className="p-4 rounded-xl bg-accent/30 border border-border">
                  <label className="text-[10px] font-medium text-muted-foreground mb-2 block uppercase tracking-wider">Количество изделий</label>
                  <div className="grid grid-cols-3 gap-2 text-sm text-center">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Межкомнатные</p>
                      <p className="font-semibold">{request.interior_doors || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Входные</p>
                      <p className="font-semibold">{request.entrance_doors || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Перегородка (кол-во створок)</p>
                      <p className="font-semibold">{request.partitions || 0}</p>
                    </div>
                  </div>
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
                  readOnly={!canEdit && !canPartnerEdit}
                />
              </div>
            </div>
          )}

          {activeTab === "files" && (
            <div className="p-5 space-y-4">
              {/* Upload button */}
              {(canEdit || viewerRole === "partner") && onSave && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt"
                    onChange={async (e) => {
                      const selectedFiles = Array.from(e.target.files || []);
                      if (!selectedFiles.length) return;
                      setUploadingFile(true);
                      toast.info(`Загрузка ${selectedFiles.length} файл(ов)...`);
                      try {
                        let successCount = 0;
                        const uploaded: typeof photos = [];
                        for (const f of selectedFiles) {
                          try {
                            const result = await uploadFile(f, "requests");
                            uploaded.push({
                              url: result.url,
                              type: f.type.startsWith("image/") ? "image" : "document",
                              stage: "general",
                              uploaded_at: new Date().toISOString(),
                            });
                            successCount++;
                          } catch {
                            toast.error(`Не удалось загрузить: ${f.name}`);
                          }
                        }
                        if (uploaded.length > 0) {
                          const updatedPhotos = [...photos, ...uploaded];
                          await onSave(request.id, { photos: updatedPhotos as any });
                          // Re-read updated photos into local state to prevent modal from closing
                          request.photos = updatedPhotos;
                          toast.success(`Загружено: ${successCount} из ${selectedFiles.length}`);
                        }
                      } catch (err: any) {
                        toast.error(err.message || "Ошибка загрузки");
                      } finally {
                        setUploadingFile(false);
                        e.target.value = "";
                      }
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile}
                    className="w-full py-3 border-2 border-dashed border-border rounded-xl text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {uploadingFile ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {uploadingFile ? "Загрузка..." : "Загрузить файлы"}
                  </button>
                </div>
              )}

              {photos.length === 0 && !uploadingFile ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Image size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Нет файлов по этой заявке</p>
                </div>
              ) : photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {photos.map((file, i) => (
                    <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full h-full"
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
                          {formatDate(file.uploaded_at)}
                        </p>
                      </a>
                      {viewerRole === "admin" && onSave && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            const updatedPhotos = photos.filter((_, idx) => idx !== i);
                            try {
                              await onSave(request.id, { photos: updatedPhotos as any });
                              request.photos = updatedPhotos;
                              toast.success("Файл удалён");
                            } catch {
                              toast.error("Ошибка удаления файла");
                            }
                          }}
                          className="absolute top-1 right-1 p-1.5 rounded-lg bg-black/60 text-white hover:bg-destructive transition-all z-10"
                          title="Удалить файл"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
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
            <div className="flex gap-3 flex-wrap">
              {/* Doorium: send */}
              {canEdit && onSendToDoorium && !request.external_id && (
                <button
                  onClick={async () => {
                    setSendingToDoorium(true);
                    try { await onSendToDoorium(request); toast.success("Заявка отправлена в Doorium"); } catch (e: any) { toast.error(e.message || "Ошибка отправки"); } finally { setSendingToDoorium(false); }
                  }}
                  disabled={sendingToDoorium}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium bg-violet-500 text-white hover:bg-violet-600 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {sendingToDoorium ? <Loader2 size={16} className="animate-spin" /> : <><Link2 size={16} /> В Doorium</>}
                </button>
              )}
              {/* Doorium: sync */}
              {canEdit && onSyncDoorium && request.external_id && request.external_system === "doorium" && (
                <button
                  onClick={async () => {
                    setSyncingDoorium(true);
                    try { await onSyncDoorium(request); toast.success("Статус синхронизирован"); } catch (e: any) { toast.error(e.message || "Ошибка синхронизации"); } finally { setSyncingDoorium(false); }
                  }}
                  disabled={syncingDoorium}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium bg-violet-100 text-violet-700 hover:bg-violet-200 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {syncingDoorium ? <Loader2 size={16} className="animate-spin" /> : <><RefreshCw size={16} /> Синхр.</>}
                </button>
              )}
              {/* Send to installation button */}
              {request.type === "measurement" && (canEdit || viewerRole === "partner") && onSendToInstallation && (
                <button
                  onClick={async () => {
                    setSendingToInstall(true);
                    try {
                      await onSendToInstallation(request);
                      toast.success("Заявка на монтаж создана");
                    } catch {} finally { setSendingToInstall(false); }
                  }}
                  disabled={sendingToInstall}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {sendingToInstall ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} /> На монтаж</>}
                </button>
              )}
              {request.type === "installation" && canEdit && onSendToReclamation && (
                <button
                  onClick={async () => {
                    setSendingToReclamation(true);
                    try {
                      await onSendToReclamation(request);
                      toast.success("Рекламация создана");
                    } catch {} finally { setSendingToReclamation(false); }
                  }}
                  disabled={sendingToReclamation}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {sendingToReclamation ? <Loader2 size={16} className="animate-spin" /> : <><AlertTriangle size={16} /> На рекламацию</>}
                </button>
              )}
              {viewerRole !== "partner" && (
                <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-accent text-foreground hover:bg-accent/80 transition-colors">
                  Отмена
                </button>
              )}
              {(canEdit || canChangeDateInstaller || canChangeDateMeasurer || canPartnerEdit) && (
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
          
          {/* Confirmation modal */}
          {showConfirm && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
              <div className="bg-card rounded-xl p-6 max-w-sm mx-4 shadow-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={24} className="text-amber-500" />
                  <h3 className="font-heading font-bold">Подтверждение</h3>
                </div>
                <p className="text-sm text-muted-foreground">Вы уверены, что хотите сохранить изменения в этой заявке?</p>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowConfirm(false)} className="px-4 py-2 rounded-lg text-sm bg-accent text-foreground hover:bg-accent/80 transition-colors">
                    Отмена
                  </button>
                  <button 
                    onClick={() => executeSave(pendingUpdates)} 
                    disabled={saving}
                    className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : "Подтвердить"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RequestDetailModal;
