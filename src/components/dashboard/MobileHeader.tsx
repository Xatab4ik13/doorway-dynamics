import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, Bell } from "lucide-react";
import type { UserRole } from "@/data/mockDashboard";
import { roleLabels } from "@/data/mockDashboard";
import { useAuth } from "@/contexts/AuthContext";
import logoImg from "@/assets/logo.png";

const pageTitles: Record<string, string> = {
  // Admin
  "/admin": "Дашборд",
  "/admin/requests": "Заявки",
  "/admin/calendar": "Календарь",
  "/admin/estimates": "Сметы",
  "/admin/accounts": "Аккаунты",
  "/admin/partners": "Партнёры",
  "/admin/news": "Новости",
  // Manager
  "/manager": "Заявки",
  "/manager/calendar": "Календарь",
  "/manager/assign": "Распределение",
  "/manager/files": "Файлы",
  "/manager/estimates": "Сметы",
  // Measurer
  "/measurer": "Мои заявки",
  "/measurer/calendar": "Календарь",
  "/measurer/history": "История",
  "/measurer/estimates": "Сметы",
  // Installer
  "/installer": "Мои заявки",
  "/installer/calendar": "Календарь",
  "/installer/estimates": "Сметы",
  "/installer/history": "История",
  // Partner
  "/partner": "Мои заявки",
  "/partner/new": "Новая заявка",
  "/partner/history": "История",
};

interface MobileHeaderProps {
  role: UserRole;
}

const MobileHeader = ({ role }: MobileHeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const title = pageTitles[location.pathname] || roleLabels[role];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 md:hidden bg-card/95 backdrop-blur-lg border-b border-border/50">
      <div className="flex items-center justify-between h-12 px-4" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <img src={logoImg} alt="PrimeDoor" className="h-6 brightness-0 object-contain" />
          <div className="h-4 w-px bg-border/60" />
          <h1 className="text-sm font-heading font-bold truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-xl hover:bg-accent transition-colors">
            <Bell size={18} className="text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={18} className="text-muted-foreground hover:text-destructive transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
