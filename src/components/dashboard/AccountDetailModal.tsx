import { useState } from "react";
import { X, Save, Loader2, Phone, Mail, StickyNote, Send, Lock, Eye, EyeOff, Power, IdCard } from "lucide-react";
import EmployeeProfileModal from "./EmployeeProfileModal";
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
  pin?: string;
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

const roles: UserRole[] = ["manager", "measurer", "installer", "partner"];

const AccountDetailModal = ({ user, onClose, onSave }: AccountDetailModalProps) => {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [email, setEmail] = useState(user.email || "");
  const [notes, setNotes] = useState(user.notes || "");
  const [telegramId, setTelegramId] = useState(user.telegram_id || "");
  const [pin, setPin] = useState(user.pin || "");
  const [role, setRole] = useState<UserRole>(user.role);
  const [active, setActive] = useState(user.active);
  const [showPin, setShowPin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEmployeeProfile, setShowEmployeeProfile] = useState(false);
  const isFieldEmployee = user.role === "measurer" || user.role === "installer";
  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 hover:border-primary/40 transition-all";

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(user.id, {
        name,
        phone: phone || undefined,
        email: email || undefined,
        notes: notes || undefined,
        telegram_id: telegramId || undefined,
        pin: pin || undefined,
        role,
        active,
      });
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
          className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h2 className="text-lg font-heading font-bold">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${roleColorMap[user.role]}`}>
                  {roleLabels[user.role]}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${active ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-green-500" : "bg-amber-500"}`} />
                  {active ? "Активен" : "Ожидает"}
                </span>
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

            {user.role !== "admin" && (
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
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Phone size={12} /> Телефон
              </label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+7 999 999 99 99" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Lock size={12} /> ПИН-код
              </label>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className={inputClass + " pr-10 tracking-[0.5em]"}
                  placeholder="••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Send size={12} /> Telegram ID <span className="text-[10px] text-muted-foreground">(для уведомлений)</span>
              </label>
              <input
                type="text"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                className={inputClass}
                placeholder="123456789"
              />
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

            {/* Active toggle */}
            {user.role !== "admin" && (
              <div
                onClick={() => setActive(!active)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                  active ? "bg-green-50 hover:bg-green-100" : "bg-amber-50 hover:bg-amber-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Power size={14} className={active ? "text-green-600" : "text-amber-600"} />
                  <span className={`text-sm font-medium ${active ? "text-green-700" : "text-amber-700"}`}>
                    {active ? "Аккаунт активен" : "Аккаунт неактивен (ожидает активации)"}
                  </span>
                </div>
                <div className={`w-10 h-6 rounded-full relative transition-colors ${active ? "bg-green-500" : "bg-gray-300"}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${active ? "left-5" : "left-1"}`} />
                </div>
              </div>
            )}

            {isFieldEmployee && (
              <button
                type="button"
                onClick={() => setShowEmployeeProfile(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-primary/30 text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
              >
                <IdCard size={16} /> Карточка сотрудника
              </button>
            )}

            <div className="text-[10px] text-muted-foreground">
              Создан: {user.created_at?.split("T")[0]} · ID: {user.id}
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
