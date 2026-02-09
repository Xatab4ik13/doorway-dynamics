import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Авторизация будет доступна после подключения бэкенда");
  };

  const inputClass =
    "w-full bg-secondary border border-border rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link to="/">
            <img src={logo} alt="PrimeDoor Service" className="h-10 w-auto mx-auto mb-6" />
          </Link>
          <h1 className="text-2xl font-heading font-bold">Вход в личный кабинет</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Для партнёров, замерщиков и бригад
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gradient-card border border-border/50 rounded-sm p-8 space-y-4"
        >
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
          <button
            type="submit"
            className="w-full py-3 bg-primary text-primary-foreground text-sm font-semibold tracking-widest uppercase rounded-sm hover:bg-gold-light transition-all duration-300"
          >
            Войти
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link to="/" className="hover:text-foreground transition-colors">
            ← Вернуться на главную
          </Link>
        </p>
      </motion.div>
    </main>
  );
};

export default LoginPage;
