import { useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ClipboardList, Users, Newspaper, FileSpreadsheet,
  Ruler, Wrench, Briefcase, LogOut, Menu, X, ChevronLeft,
  History, Upload, PlusCircle, Eye, Calculator, Bell, CalendarDays, Handshake,
} from "lucide-react";

import type { UserRole } from "@/data/mockDashboard";
import { roleLabels } from "@/data/mockDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import logoImg from "@/assets/logo.png";
import MobileTabBar from "./MobileTabBar";
import MobileHeader from "./MobileHeader";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "./PullToRefreshIndicator";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navByRole: Record<UserRole, NavItem[]> = {
  admin: [
    { label: "Дашборд", href: "/admin", icon: <LayoutDashboard size={20} /> },
    { label: "Заявки", href: "/admin/requests", icon: <ClipboardList size={20} /> },
    { label: "Календарь", href: "/admin/calendar", icon: <CalendarDays size={20} /> },
    { label: "Сметы", href: "/admin/estimates", icon: <FileSpreadsheet size={20} /> },
    { label: "Аккаунты", href: "/admin/accounts", icon: <Users size={20} /> },
    { label: "Партнёры", href: "/admin/partners", icon: <Handshake size={20} /> },
    { label: "Новости", href: "/admin/news", icon: <Newspaper size={20} /> },
  ],
  manager: [
    { label: "Заявки", href: "/manager", icon: <ClipboardList size={20} /> },
    { label: "Календарь", href: "/manager/calendar", icon: <CalendarDays size={20} /> },
    { label: "Распределение", href: "/manager/assign", icon: <Users size={20} /> },
    { label: "Файлы", href: "/manager/files", icon: <Upload size={20} /> },
    { label: "Сметы", href: "/manager/estimates", icon: <Calculator size={20} /> },
  ],
  measurer: [
    { label: "Мои заявки", href: "/measurer", icon: <Ruler size={20} /> },
    { label: "Календарь", href: "/measurer/calendar", icon: <CalendarDays size={20} /> },
    { label: "История", href: "/measurer/history", icon: <History size={20} /> },
  ],
  installer: [
    { label: "Мои заявки", href: "/installer", icon: <Wrench size={20} /> },
    { label: "Календарь", href: "/installer/calendar", icon: <CalendarDays size={20} /> },
    { label: "Сметы", href: "/installer/estimates", icon: <Calculator size={20} /> },
    { label: "История", href: "/installer/history", icon: <History size={20} /> },
  ],
  partner: [
    { label: "Мои заявки", href: "/partner", icon: <Eye size={20} /> },
    { label: "Новая заявка", href: "/partner/new", icon: <PlusCircle size={20} /> },
    { label: "История", href: "/partner/history", icon: <History size={20} /> },
  ],
};

interface DashboardLayoutProps {
  role: UserRole;
  userName?: string;
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
}

const DashboardLayout = ({ role, userName = "Пользователь", children, onRefresh }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const isMobile = useIsMobile();
  const items = navByRole[role];
  const displayName = user?.name || userName;

  const defaultRefresh = useCallback(async () => {
    // Trigger a page reload as fallback
    window.location.reload();
  }, []);

  const { containerRef, pullDistance, refreshing } = usePullToRefresh({
    onRefresh: onRefresh || defaultRefresh,
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (href: string) => {
    if (href === `/${role}` || href === "/admin") {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  // ─── Mobile layout (iOS PWA style) ───
  if (isMobile) {
    return (
      <div className="dashboard-theme h-[100dvh] bg-background text-foreground flex flex-col overflow-hidden">
        <MobileHeader role={role} />
        <main
          ref={containerRef}
          className="flex-1 px-4 pt-0 overflow-y-auto overflow-x-hidden overscroll-contain -webkit-overflow-scrolling-touch"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 5.5rem)" }}
        >
          <PullToRefreshIndicator pullDistance={pullDistance} refreshing={refreshing} />
          <div className="pt-3">
            {children}
          </div>
        </main>
        <MobileTabBar role={role} />
      </div>
    );
  }

  // ─── Desktop layout (unchanged) ───
  const DesktopSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-border/50 flex flex-col items-center">
        <Link to="/" className="block text-center">
          <img src={logoImg} alt="PrimeDoor" className="h-40 brightness-0 object-contain mx-auto" />
          <p className="text-sm text-muted-foreground mt-2 font-medium">{roleLabels[role]}</p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User / Logout */}
      <div className="p-4 border-t border-border/50">
        {sidebarOpen && (
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{displayName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{roleLabels[role]}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-base text-muted-foreground hover:text-destructive transition-colors w-full px-4 py-3 rounded-xl hover:bg-destructive/5"
        >
          <LogOut size={22} />
          {sidebarOpen && <span className="font-medium">Выйти</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="dashboard-theme min-h-screen bg-background text-foreground flex">
      {/* Desktop sidebar */}
      <aside
        className={`flex flex-col border-r border-border/50 bg-card transition-all duration-300 ${
          sidebarOpen ? "w-60" : "w-16"
        }`}
      >
        <DesktopSidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-border/50 bg-card/80 backdrop-blur-sm flex items-center px-4 gap-3 sticky top-0 z-30">
          <button
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-accent"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <ChevronLeft size={20} className={`transition-transform duration-300 ${!sidebarOpen ? "rotate-180" : ""}`} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell size={18} className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
            </div>
            <div className="h-6 w-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">{displayName}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
