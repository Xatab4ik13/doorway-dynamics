import { useState } from "react";
import { X, Phone, Lock, StickyNote, Mail } from "lucide-react";
import { type UserRole, roleLabels } from "@/data/mockDashboard";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface CreateAccountModalProps {
  onClose: () => void;
  onSave: (data: { name: string; role: UserRole; phone: string; pin: string; email?: string; notes?: string }) => void;
}

const roles: UserRole[] = ["manager", "measurer", "installer", "partner"];

const CreateAccountModal = ({ onClose, onSave }: CreateAccountModalProps) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("measurer");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) return;
    onSave({ name, role, phone, pin, email: email || undefined, notes: notes || undefined });
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
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
            <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
              <Phone size={14} /> Телефон <span className="text-destructive">*</span>
            </label>
            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+7 999 999 99 99" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
              <Lock size={14} /> ПИН-код (4 цифры) <span className="text-destructive">*</span>
            </label>
            <div className="flex justify-center pt-1">
              <InputOTP maxLength={4} value={pin} onChange={setPin}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-12 h-12 text-lg font-bold rounded-xl border" />
                  <InputOTPSlot index={1} className="w-12 h-12 text-lg font-bold rounded-xl border" />
                  <InputOTPSlot index={2} className="w-12 h-12 text-lg font-bold rounded-xl border" />
                  <InputOTPSlot index={3} className="w-12 h-12 text-lg font-bold rounded-xl border" />
                </InputOTPGroup>
              </InputOTP>
            </div>
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

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
              <Mail size={14} /> Почта
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="email@example.com" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
              <StickyNote size={14} /> Заметка
            </label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass + " resize-none"} placeholder="Любая информация..." />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium bg-accent text-foreground hover:bg-accent/80 transition-colors">
              Отмена
            </button>
            <button type="submit" disabled={pin.length !== 4} className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountModal;
