import { X, AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal = ({ title, description, onClose, onConfirm }: DeleteConfirmModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-sm">
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} className="text-destructive" />
          </div>
          <h3 className="text-lg font-heading font-bold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-accent text-foreground hover:bg-accent/80 transition-colors">
            Отмена
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
