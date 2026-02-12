import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { Send, Shield, Lock, Loader2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

type LoginMode = "telegram" | "admin";

const telegramBotUrl = "https://t.me/primedoor_bot";

const roleRoutes: Record<string, string> = {
  admin: "/admin",
  manager: "/manager",
  measurer: "/measurer",
  installer: "/installer",
  partner: "/partner",
};

const LoginPage = () => {
  const [mode, setMode] = useState<LoginMode>("telegram");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitingTelegram, setWaitingTelegram] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionCodeRef = useRef<string | null>(null);

  useEffect(() => {
    document.title = "Вход в кабинет — PrimeDoor Service";
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(roleRoutes[user.role] || "/");
    }
  }, [isAuthenticated, user, navigate]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    sessionCodeRef.current = null;
    setWaitingTelegram(false);
  }, []);

  const handleTelegramLogin = async () => {
    setWaitingTelegram(true);
    try {
      // Create session
      const { code } = await api<{ code: string }>("/api/auth/telegram/session", {
        method: "POST",
      });
      sessionCodeRef.current = code;

      // Open bot with code
      window.open(`${telegramBotUrl}?start=${code}`, "_blank");

      // Poll for confirmation every 2 seconds
      pollingRef.current = setInterval(async () => {
        try {
          const result = await api<{ status: string; token?: string; user?: any }>(
            `/api/auth/telegram/check/${code}`
          );

          if (result.status === "confirmed" && result.token && result.user) {
            stopPolling();
            login(result.token, result.user);
            toast.success(`Добро пожаловать, ${result.user.name}!`);
            navigate(roleRoutes[result.user.role] || "/", { replace: true });
          } else if (result.status === "expired") {
            stopPolling();
            toast.error("Сессия истекла. Попробуйте ещё раз.");
          }
        } catch {
          // Silent retry
        }
      }, 2000);

      // Auto-stop after 5 minutes
      setTimeout(() => {
        if (pollingRef.current) {
          stopPolling();
          toast.error("Время ожидания истекло. Попробуйте ещё раз.");
        }
      }, 5 * 60 * 1000);

    } catch (err: any) {
      setWaitingTelegram(false);
      toast.error(err.message || "Ошибка создания сессии");
    }
  };

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

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <Link to="/">
            <img src={logo} alt="PrimeDoor Service" className="h-24 w-auto mx-auto mb-8 brightness-0 invert" />
          </Link>
          <h1 className="heading-md">Вход в кабинет</h1>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => { setMode("telegram"); stopPolling(); }}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              mode === "telegram"
                ? "bg-[#229ED9] text-white"
                : "bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Send size={16} /> Через Telegram
          </button>
          <button
            onClick={() => { setMode("admin"); stopPolling(); }}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              mode === "admin"
                ? "bg-foreground text-background"
                : "bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shield size={16} /> Администратор
          </button>
        </div>

        {mode === "telegram" ? (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#229ED9]/10 flex items-center justify-center mx-auto">
                {waitingTelegram ? (
                  <Loader2 size={28} className="text-[#229ED9] animate-spin" />
                ) : (
                  <Send size={28} className="text-[#229ED9]" />
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {waitingTelegram
                  ? "Откройте бота в Telegram и нажмите Start. Ожидаем подтверждение..."
                  : "Нажмите кнопку ниже — вас перенаправит в Telegram-бот. После нажатия Start вход произойдёт автоматически."}
              </p>
            </div>

            <button
              onClick={waitingTelegram ? stopPolling : handleTelegramLogin}
              className={`w-full py-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                waitingTelegram
                  ? "bg-accent text-foreground hover:bg-accent/80"
                  : "bg-[#229ED9] text-white hover:bg-[#1a8abf]"
              }`}
            >
              {waitingTelegram ? (
                <><X size={18} /> Отменить</>
              ) : (
                <><Send size={18} /> Войти через Telegram</>
              )}
            </button>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Нет доступа? Обратитесь к администратору для добавления вашего Telegram ID.
              </p>
            </div>
          </div>
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

        <p className="text-center text-xs text-muted-foreground mt-10">
          <Link to="/" className="hover:text-foreground transition-colors">
            ← На главную
          </Link>
        </p>
      </motion.div>
    </main>
  );
};

export default LoginPage;
