import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { UserPlus, Loader2, Phone, Lock, User } from "lucide-react";
import { roleLabels } from "@/data/mockDashboard";
import api from "@/lib/api";

const roles = [
  { value: "measurer", label: roleLabels.measurer },
  { value: "installer", label: roleLabels.installer },
  { value: "partner", label: roleLabels.partner },
  { value: "manager", label: roleLabels.manager },
] as const;

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState("measurer");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const inputClass =
    "w-full bg-transparent border-b border-border py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors duration-500";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(pin)) {
      toast.error("ПИН-код должен содержать ровно 4 цифры");
      return;
    }
    setLoading(true);
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: { name, phone, pin, role },
      });
      setSuccess(true);
      toast.success("Заявка на регистрацию отправлена!");
    } catch (err: any) {
      toast.error(err.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
            <UserPlus size={32} className="text-green-500" />
          </div>
          <h1 className="heading-md">Заявка отправлена!</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ваш аккаунт ожидает активации администратором. После активации вы сможете войти по номеру телефона и ПИН-коду.
          </p>
          <Link
            to="/login"
            className="btn-primary inline-flex items-center gap-2"
          >
            Перейти ко входу
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <Link to="/">
            <img src={logo} alt="PrimeDoor Service" className="h-52 w-auto mx-auto mb-8 brightness-0 invert" />
          </Link>
          <h1 className="heading-md">Регистрация</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Заполните данные — после одобрения администратором вы сможете войти
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-0">
          <div className="relative">
            <User size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="ФИО или название компании"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass + " pl-7"}
            />
          </div>
          <div className="relative">
            <Phone size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="tel"
              placeholder="Номер телефона"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass + " pl-7"}
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="4-значный ПИН-код"
              required
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                setPin(val);
              }}
              className={inputClass + " pl-7 tracking-[0.5em]"}
            />
          </div>

          <div className="pt-6 pb-2">
            <label className="text-xs font-medium text-muted-foreground mb-3 block">Выберите роль</label>
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    role === r.value
                      ? "bg-foreground text-background"
                      : "bg-accent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-8">
            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Отправка...</>
              ) : (
                <><UserPlus size={16} /> Зарегистрироваться</>
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-10 space-x-4">
          <Link to="/login" className="hover:text-foreground transition-colors">
            Уже есть аккаунт? Войти
          </Link>
          <span>·</span>
          <Link to="/" className="hover:text-foreground transition-colors">
            На главную
          </Link>
        </p>
      </motion.div>
    </main>
  );
};

export default RegisterPage;
