import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    document.title = "Вход в кабинет — PrimeDoor Service";
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Авторизация будет доступна после подключения бэкенда");
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
        <div className="text-center mb-16">
          <Link to="/">
            <img src={logo} alt="PrimeDoor Service" className="h-24 w-auto mx-auto mb-8 brightness-0 invert" />
          </Link>
          <h1 className="heading-md">Вход в кабинет</h1>
          <p className="text-xs text-muted-foreground mt-3 tracking-wide">
            Для партнёров, замерщиков и бригад
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-0">
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
            <button type="submit" className="btn-primary w-full">
              Войти
            </button>
          </div>
        </form>

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
