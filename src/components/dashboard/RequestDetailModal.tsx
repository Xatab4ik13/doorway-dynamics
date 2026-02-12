import { useState } from "react";
import { X, Phone, MapPin, Calendar, User, MessageSquare, Upload, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { type ServiceRequest, statusLabels, statusColors, requestTypeLabels, type RequestStatus } from "@/data/mockDashboard";

interface RequestDetailModalProps {
  request: ServiceRequest;
  onClose: () => void;
}

const mockAssignees = {
  measurer: ["Сидоров К.В.", "Морозов А.И."],
  installer: ["Бригада №1", "Бригада №2", "Бригада №3"],
};

const RequestDetailModal = ({ request, onClose }: RequestDetailModalProps) => {
  const [status, setStatus] = useState<RequestStatus>(request.status);
  const [assignedTo, setAssignedTo] = useState(request.assignedTo || "");
  const [comment, setComment] = useState(request.comment || "");

  const allStatuses = Object.entries(statusLabels);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <p className="font-mono text-xs text-muted-foreground">{request.id}</p>
            <h2 className="text-xl font-heading font-bold mt-1">{request.clientName}</h2>
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
                <p className="text-sm font-medium">{request.clientPhone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Адрес</p>
                <p className="text-sm font-medium">{request.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Дата создания</p>
                <p className="text-sm font-medium">{request.date}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Тип заявки</p>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-accent text-foreground">
                {requestTypeLabels[request.type]}
              </span>
            </div>
          </div>

          {/* Status change */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Статус</label>
            <div className="flex flex-wrap gap-2">
              {allStatuses.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setStatus(key as RequestStatus)}
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

          {/* Assignment */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
              <User size={14} /> Назначить исполнителя
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Не назначен</option>
              <optgroup label="Замерщики">
                {mockAssignees.measurer.map((n) => <option key={n} value={n}>{n}</option>)}
              </optgroup>
              <optgroup label="Монтажники">
                {mockAssignees.installer.map((n) => <option key={n} value={n}>{n}</option>)}
              </optgroup>
            </select>
          </div>

          {/* Comment */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
              <MessageSquare size={14} /> Комментарий
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Добавьте комментарий к заявке..."
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Files */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
              <Upload size={14} /> Файлы
            </label>
            {request.files && request.files.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {request.files.map((f, i) => (
                  <span key={i} className="px-3 py-1.5 bg-accent rounded-lg text-xs">{f}</span>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">Перетащите файлы или нажмите для загрузки</p>
              </div>
            )}
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
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailModal;
