import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { Shield, Lock, Loader2, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

type LoginMode = "pin" | "admin";

const roleRoutes: Record<string, string> = {
  admin: "/admin",
  manager: "/manager",
  measurer: "/measurer",
  installer: "/installer",
  partner: "/partner",
};

const LoginPage = () => {
  const [mode, setMode] = useState<LoginMode>("pin");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  useEffect(() => {
    document.title = "Вход в кабинет — PrimeDoor Service";
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(roleRoutes[user.role] || "/");
    }
  }, [isAuthenticated, user, navigate]);

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api("/api/auth/pin", {
        method: "POST",
        body: { phone, pin },
      });
      login(data.token, data.user);
      toast.success(`Добро пожаловать, ${data.user.name}!`);
      navigate(roleRoutes[data.user.role] || "/", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Ошибка авторизации");
    } finally {
      setLoading(false);
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
            onClick={() => setMode("pin")}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              mode === "pin"
                ? "bg-foreground text-background"
                : "bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Phone size={16} /> По телефону
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

        {mode === "pin" ? (
          <form onSubmit={handlePinLogin} className="space-y-0">
            <div className="flex items-center gap-2 mb-4 px-1">
              <Phone size={14} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Введите номер телефона и ПИН-код
              </p>
            </div>
            <input
              type="tel"
              placeholder="Номер телефона"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="ПИН-код (4 цифры)"
              required
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                setPin(val);
              }}
              className={inputClass + " tracking-[0.5em]"}
            />
            <div className="pt-10">
              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Вход...</> : "Войти"}
              </button>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-6">
              <Link to="/register" className="hover:text-foreground transition-colors">
                Нет аккаунта? Зарегистрироваться
              </Link>
            </p>
          </form>
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
