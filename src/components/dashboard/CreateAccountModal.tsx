import { useState } from "react";
import { X, Send } from "lucide-react";
import { type UserRole, roleLabels } from "@/data/mockDashboard";

interface CreateAccountModalProps {
  onClose: () => void;
  onSave: (data: { name: string; role: UserRole; telegramId: string }) => void;
}

const roles: UserRole[] = ["manager", "measurer", "installer", "partner"];

const CreateAccountModal = ({ onClose, onSave }: CreateAccountModalProps) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("measurer");
  const [telegramId, setTelegramId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, role, telegramId });
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-heading font-bold">Новый аккаунт</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">ФИО / Название</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Иванов И.И. или Бригада №4" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1">
              <Send size={14} /> Telegram ID <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              className={inputClass}
              placeholder="123456789"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Числовой ID пользователя в Telegram. Используется для авторизации через бот.
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Роль</label>
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    role === r ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {roleLabels[r]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium bg-accent text-foreground hover:bg-accent/80 transition-colors">
              Отмена
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountModal;
