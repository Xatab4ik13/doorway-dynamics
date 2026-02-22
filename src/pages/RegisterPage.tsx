import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { UserPlus, Loader2, Phone, Lock, User, ShieldCheck, Send, ExternalLink } from "lucide-react";
import { roleLabels } from "@/data/mockDashboard";
import api from "@/lib/api";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { formatPhone } from "@/lib/formatPhone";

const roles = [
  { value: "measurer", label: roleLabels.measurer },
  { value: "installer", label: roleLabels.installer },
  { value: "partner", label: roleLabels.partner },
] as const;

function generateCaptcha() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return { question: `${a} + ${b} = ?`, answer: String(a + b) };
}

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [role, setRole] = useState("measurer");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [captchaInput, setCaptchaInput] = useState("");
  const [captcha, setCaptcha] = useState(generateCaptcha);

  const inputClass =
    "w-full bg-transparent border-b border-border py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors duration-500";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      toast.error("ПИН-код должен содержать ровно 4 цифры");
      return;
    }
    if (!telegramId.trim() || !/^\d+$/.test(telegramId.trim())) {
      toast.error("Введите корректный Telegram ID (только цифры)");
      return;
    }
    if (captchaInput !== captcha.answer) {
      toast.error("Неверный ответ на проверку");
      setCaptcha(generateCaptcha());
      setCaptchaInput("");
      return;
    }
    setLoading(true);
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: { name, phone, pin, role, telegram_id: telegramId.trim() },
      });
      setSuccess(true);
      toast.success("Заявка на регистрацию отправлена!");
    } catch (err: any) {
      toast.error(err.message || "Ошибка регистрации");
      setCaptcha(generateCaptcha());
      setCaptchaInput("");
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
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <ShieldCheck size={32} className="text-primary" />
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
              placeholder="+7 ___ ___ __ __"
              required
              value={phone}
              onFocus={(e) => { if (!e.target.value) setPhone("+7"); }}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              className={inputClass + " pl-7"}
            />
          </div>

          <div className="pt-6 pb-2">
            <label className="text-xs font-medium text-muted-foreground mb-3 block flex items-center gap-1.5">
              <Lock size={12} /> Придумайте 4-значный ПИН-код
            </label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={4}
                value={pin}
                onChange={setPin}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-14 h-14 text-xl font-bold rounded-xl border" />
                  <InputOTPSlot index={1} className="w-14 h-14 text-xl font-bold rounded-xl border" />
                  <InputOTPSlot index={2} className="w-14 h-14 text-xl font-bold rounded-xl border" />
                  <InputOTPSlot index={3} className="w-14 h-14 text-xl font-bold rounded-xl border" />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <div className="pt-4 pb-2">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Send size={12} /> Telegram ID <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="123456789"
              required
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value.replace(/\D/g, ""))}
              className={inputClass}
            />
            <a
              href="https://t.me/PrimeDoorServiceBot?start=myid"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors mt-1.5"
            >
              <ExternalLink size={10} /> Не знаете свой ID? Узнайте через нашего бота
            </a>
          </div>

          <div className="pt-4 pb-2">
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

          {/* Math captcha */}
          <div className="pt-4">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <ShieldCheck size={12} /> Проверка: {captcha.question}
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ответ"
              required
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              className={inputClass}
            />
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
