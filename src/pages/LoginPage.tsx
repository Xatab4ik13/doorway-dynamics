import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { Send, Shield, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

type LoginMode = "telegram" | "admin";

const telegramBotUrl = "https://t.me/primedoor_bot";

const LoginPage = () => {
  const [mode, setMode] = useState<LoginMode>("telegram");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, user } = useAuth();

  useEffect(() => {
    document.title = "Вход в кабинет — PrimeDoor Service";

    // Handle token from Telegram bot URL
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      try {
        const payload = JSON.parse(atob(tokenFromUrl.split(".")[1]));
        const userData = { id: payload.id, name: payload.name, role: payload.role };
        login(tokenFromUrl, userData);
        const roleRoutes: Record<string, string> = {
          admin: "/admin",
          manager: "/manager",
          measurer: "/measurer",
          installer: "/installer",
          partner: "/partner",
        };
        toast.success(`Добро пожаловать, ${payload.name}!`);
        navigate(roleRoutes[payload.role] || "/", { replace: true });
      } catch {
        toast.error("Невалидный токен. Попробуйте снова через бота.");
      }
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const roleRoutes: Record<string, string> = {
        admin: "/admin",
        manager: "/manager",
        measurer: "/measurer",
        installer: "/installer",
        partner: "/partner",
      };
      navigate(roleRoutes[user.role] || "/");
    }
  }, [isAuthenticated, user, navigate]);

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

  const handleTelegramLogin = () => {
    window.open(telegramBotUrl, "_blank");
    toast.info("Откройте бота в Telegram и нажмите /start. После проверки вашего ID вы получите доступ.");
  };

  // Demo quick-access buttons
  const demoRoles = [
    { label: "Менеджер", path: "/manager", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
    { label: "Замерщик", path: "/measurer", color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
    { label: "Монтажник", path: "/installer", color: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
    { label: "Партнёр", path: "/partner", color: "bg-green-50 text-green-700 hover:bg-green-100" },
    { label: "Админ", path: "/admin", color: "bg-red-50 text-red-700 hover:bg-red-100" },
  ];

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
            onClick={() => setMode("telegram")}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              mode === "telegram"
                ? "bg-[#229ED9] text-white"
                : "bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Send size={16} /> Через Telegram
          </button>
          <button
            onClick={() => setMode("admin")}
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
                <Send size={28} className="text-[#229ED9]" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Нажмите кнопку ниже — вас перенаправит в Telegram-бот.
                Бот считает ваш ID и, если администратор добавил вас в систему,
                вы получите доступ к своему кабинету.
              </p>
            </div>

            <button
              onClick={handleTelegramLogin}
              className="w-full py-4 rounded-lg text-sm font-medium bg-[#229ED9] text-white hover:bg-[#1a8abf] transition-colors flex items-center justify-center gap-2"
            >
              <Send size={18} /> Войти через Telegram
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

        {/* Demo access removed — routes are now protected */}

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
