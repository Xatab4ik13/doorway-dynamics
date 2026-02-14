import { useState } from "react";
import { X, Save, Loader2, Phone, Mail, StickyNote, Send } from "lucide-react";
import { roleLabels, type UserRole } from "@/data/mockDashboard";
import { motion, AnimatePresence } from "framer-motion";

interface UserAccount {
  id: string;
  name: string;
  role: UserRole;
  telegram_id?: string;
  phone?: string;
  email?: string;
  notes?: string;
  active: boolean;
  created_at: string;
}

interface AccountDetailModalProps {
  user: UserAccount;
  onClose: () => void;
  onSave: (id: string, updates: Partial<UserAccount>) => Promise<void>;
}

const roleColorMap: Record<UserRole, string> = {
  admin: "bg-red-50 text-red-700",
  manager: "bg-blue-50 text-blue-700",
  measurer: "bg-purple-50 text-purple-700",
  installer: "bg-orange-50 text-orange-700",
  partner: "bg-green-50 text-green-700",
};

const AccountDetailModal = ({ user, onClose, onSave }: AccountDetailModalProps) => {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [email, setEmail] = useState(user.email || "");
  const [notes, setNotes] = useState(user.notes || "");
  const [saving, setSaving] = useState(false);

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 hover:border-primary/40 transition-all";

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(user.id, { name, phone: phone || undefined, email: email || undefined, notes: notes || undefined });
      onClose();
    } catch {} finally {
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
          className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md"
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h2 className="text-lg font-heading font-bold">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${roleColorMap[user.role]}`}>
                  {roleLabels[user.role]}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">ID: {user.id}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground">
              <X size={20} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">ФИО / Название</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/50">
              <Send size={14} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Telegram ID</p>
                <p className="text-sm font-medium font-mono">{user.telegram_id || "—"}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Phone size={12} /> Телефон
              </label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+7 999 999 99 99" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Mail size={12} /> Почта
              </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="email@example.com" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <StickyNote size={12} /> Заметка
              </label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputClass + " resize-none"} placeholder="Любая информация..." />
            </div>

            <div className="text-[10px] text-muted-foreground">
              Создан: {user.created_at?.split("T")[0]} · Статус: {user.active ? "Активен" : "Неактивен"}
            </div>
          </div>

          <div className="flex justify-end gap-3 p-5 border-t border-border">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-accent text-foreground hover:bg-accent/80 transition-colors">
              Отмена
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/25 disabled:opacity-50 flex items-center gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Сохранить</>}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AccountDetailModal;
