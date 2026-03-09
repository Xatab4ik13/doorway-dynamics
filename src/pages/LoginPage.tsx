import { useState, useEffect, useCallback } from "react";
import { Share, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { Shield, Lock, Loader2, Phone, ArrowLeft, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { formatPhone } from "@/lib/formatPhone";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { isCrmDomain } from "@/hooks/useCrmDomain";

type LoginMode = "pin" | "admin";
type PinStep = "phone" | "code";

const roleRoutes: Record<string, string> = {
  admin: "/admin",
  manager: "/manager",
  measurer: "/measurer",
  installer: "/installer",
  partner: "/partner",
};

const LoginPage = () => {
  const [mode, setMode] = useState<LoginMode>("pin");
  const [step, setStep] = useState<PinStep>("phone");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoLogging, setAutoLogging] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const { canInstall, isInstalled, install, showIosInstructions } = usePwaInstall();
  const [showIosGuide, setShowIosGuide] = useState(false);
  const isCrm = isCrmDomain();

  useEffect(() => {
    document.title = "Вход в кабинет — PrimeDoor Service";
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(roleRoutes[user.role] || "/");
    }
  }, [isAuthenticated, user, navigate]);

  // Try auto-login with device token on mount
  useEffect(() => {
    const deviceToken = localStorage.getItem("device_token");
    const savedPhone = localStorage.getItem("device_phone");
    if (deviceToken && savedPhone) {
      setAutoLogging(true);
      api("/api/auth/pin", {
        method: "POST",
        body: { phone: savedPhone, device_token: deviceToken },
      })
        .then((data: any) => {
          if (data.device_token) localStorage.setItem("device_token", data.device_token);
          login(data.token, data.user);
          toast.success(`С возвращением, ${data.user.name}!`);
          navigate(roleRoutes[data.user.role] || "/", { replace: true });
        })
        .catch(() => {
          localStorage.removeItem("device_token");
          localStorage.removeItem("device_phone");
          setAutoLogging(false);
        });
    }
  }, []);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setStep("code");
    setPin("");
  };

  const handlePinComplete = useCallback(async (value: string) => {
    if (value.length !== 4) return;
    setLoading(true);
    try {
      const data = await api("/api/auth/pin", {
        method: "POST",
        body: { phone, pin: value },
      });
      // Save device token for "remember device"
      if (data.device_token) {
        localStorage.setItem("device_token", data.device_token);
        localStorage.setItem("device_phone", phone);
      }
      login(data.token, data.user);
      toast.success(`Добро пожаловать, ${data.user.name}!`);
      navigate(roleRoutes[data.user.role] || "/", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Ошибка авторизации");
      setPin("");
    } finally {
      setLoading(false);
    }
  }, [phone, login, navigate]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api("/api/auth/admin", {
        method: "POST",
        body: { email, password },
      });
      login(data.token, data.user);
      toast.success(`Добро пожаловать, ${data.user.name}!`);
      navigate("/admin");
    } catch (err: any) {
      toast.error(err.message || "Ошибка авторизации");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border-b border-border py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors duration-500";

  if (autoLogging) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-background">
        <div className="text-center space-y-4">
          <Loader2 size={32} className="animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Выполняется вход...</p>
        </div>
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
          <h1 className="heading-md">Вход в кабинет</h1>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => { setMode("pin"); setStep("phone"); setPin(""); }}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              mode === "pin"
                ? "bg-foreground text-background"
                : "bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Phone size={16} /> По телефону
          </button>
          <button
            onClick={() => { setMode("admin"); setStep("phone"); }}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              mode === "admin"
                ? "bg-foreground text-background"
                : "bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shield size={16} /> Администратор
          </button>
        </div>

        {mode === "pin" ? (
          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <motion.form
                key="phone-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handlePhoneSubmit}
                className="space-y-0"
              >
                <div className="flex items-center gap-2 mb-4 px-1">
                  <Phone size={14} className="text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Введите номер телефона, указанный при регистрации
                  </p>
                </div>
                <input
                  type="tel"
                  placeholder="+7 ___ ___ __ __"
                  required
                  value={phone}
                  onFocus={(e) => { if (!e.target.value) setPhone("+7"); }}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className={inputClass}
                  autoFocus
                />
                <div className="pt-10">
                  <button type="submit" className="btn-primary w-full">
                    Продолжить
                  </button>
                </div>
                <div className="pt-6">
                  <Link
                    to="/register"
                    className="block w-full text-center py-3 rounded-lg text-sm font-medium bg-accent text-foreground hover:bg-accent/80 transition-colors"
                  >
                    Нет аккаунта? Зарегистрироваться
                  </Link>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="code-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <button
                  onClick={() => { setStep("phone"); setPin(""); }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft size={14} /> Изменить номер
                </button>

                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center mx-auto">
                    <Lock size={24} className="text-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Введите ПИН-код для <span className="text-foreground font-medium">{phone}</span>
                  </p>
                </div>

                <div className="flex justify-center">
                  <InputOTP
                    maxLength={4}
                    value={pin}
                    onChange={(value) => {
                      setPin(value);
                      if (value.length === 4) handlePinComplete(value);
                    }}
                    autoFocus
                    disabled={loading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-14 h-14 text-xl font-bold rounded-xl border" />
                      <InputOTPSlot index={1} className="w-14 h-14 text-xl font-bold rounded-xl border" />
                      <InputOTPSlot index={2} className="w-14 h-14 text-xl font-bold rounded-xl border" />
                      <InputOTPSlot index={3} className="w-14 h-14 text-xl font-bold rounded-xl border" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {loading && (
                  <div className="flex justify-center">
                    <Loader2 size={20} className="animate-spin text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-0">
            <div className="flex items-center gap-2 mb-4 px-1">
              <Lock size={14} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Вход по email и паролю — только для администраторов
              </p>
            </div>
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
            <input
              type="password"
              placeholder="Пароль"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            <div className="pt-10">
              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Вход...</> : "Войти"}
              </button>
            </div>
          </form>
        )}

        {/* PWA Install button */}
        {canInstall && !isInstalled && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => {
              if (showIosInstructions) {
                setShowIosGuide(true);
              } else {
                install();
              }
            }}
            className="w-full mt-8 py-3.5 rounded-xl text-sm font-medium bg-foreground text-background flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Download size={16} /> Скачать приложение
          </motion.button>
        )}

        {isInstalled && (
          <p className="text-center text-xs text-muted-foreground mt-6 flex items-center justify-center gap-1.5">
            ✓ Приложение установлено
          </p>
        )}

        {/* iOS install guide modal */}
        <AnimatePresence>
          {showIosGuide && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4"
              onClick={() => setShowIosGuide(false)}
            >
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                transition={{ type: "spring", damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl bg-card text-card-foreground p-6 pb-8 space-y-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Установка на iPhone</h3>
                  <button onClick={() => setShowIosGuide(false)} className="p-1 rounded-full hover:bg-accent">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">1</div>
                    <div>
                      <p className="text-sm font-medium">Нажмите кнопку «Поделиться»</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        Иконка <Share size={14} /> внизу экрана Safari
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">2</div>
                    <div>
                      <p className="text-sm font-medium">Выберите «На экран Домой»</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Прокрутите вниз, если не видите</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">3</div>
                    <div>
                      <p className="text-sm font-medium">Нажмите «Добавить»</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Приложение появится на домашнем экране</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowIosGuide(false)}
                  className="w-full py-3 rounded-xl text-sm font-medium bg-foreground text-background"
                >
                  Понятно
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isCrm && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            <Link to="/" className="hover:text-foreground transition-colors">
              ← На главную
            </Link>
          </p>
        )}
      </motion.div>
    </main>
  );
};

export default LoginPage;
