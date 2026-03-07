import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, ChevronLeft } from "lucide-react";
import type { UserRole } from "@/data/mockDashboard";
import { roleLabels } from "@/data/mockDashboard";
import { useAuth } from "@/contexts/AuthContext";

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
  const displayName = user?.name || "Пользователь";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 md:hidden">
      {/* Frosted glass background */}
      <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-b border-border/30" />
      
      <div
        className="relative flex items-center justify-between px-4"
        style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 8px)" }}
      >
        <div className="flex items-center gap-2 min-w-0 py-3">
          <div className="flex flex-col min-w-0">
            <h1 className="text-[17px] font-semibold tracking-tight truncate">{title}</h1>
            <p className="text-[11px] text-muted-foreground leading-none">{displayName} · {roleLabels[role]}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 py-2 px-3 -mr-2 rounded-xl text-muted-foreground active:opacity-60 transition-opacity"
          aria-label="Выйти"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default MobileHeader;