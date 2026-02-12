import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ClipboardList, Users, Newspaper, FileSpreadsheet,
  Ruler, Wrench, Briefcase, LogOut, Menu, X, ChevronLeft,
  History, Upload, PlusCircle, Eye, Calculator,
} from "lucide-react";
import logo from "@/assets/logo.png";
import type { UserRole } from "@/data/mockDashboard";
import { roleLabels } from "@/data/mockDashboard";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navByRole: Record<UserRole, NavItem[]> = {
  admin: [
    { label: "Дашборд", href: "/admin", icon: <LayoutDashboard size={20} /> },
    { label: "Заявки", href: "/admin/requests", icon: <ClipboardList size={20} /> },
    { label: "Аккаунты", href: "/admin/accounts", icon: <Users size={20} /> },
    { label: "Новости", href: "/admin/news", icon: <Newspaper size={20} /> },
    { label: "Сметы", href: "/admin/estimates", icon: <FileSpreadsheet size={20} /> },
  ],
  manager: [
    { label: "Заявки", href: "/manager", icon: <ClipboardList size={20} /> },
    { label: "Распределение", href: "/manager/assign", icon: <Users size={20} /> },
    { label: "Файлы", href: "/manager/files", icon: <Upload size={20} /> },
    { label: "Сметы", href: "/manager/estimates", icon: <Calculator size={20} /> },
  ],
  measurer: [
    { label: "Мои заявки", href: "/measurer", icon: <Ruler size={20} /> },
    { label: "Сметы", href: "/measurer/estimates", icon: <Calculator size={20} /> },
    { label: "История", href: "/measurer/history", icon: <History size={20} /> },
  ],
  installer: [
    { label: "Мои заявки", href: "/installer", icon: <Wrench size={20} /> },
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
}

const DashboardLayout = ({ role, userName = "Пользователь", children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const items = navByRole[role];

  const isActive = (href: string) => {
    if (href === `/${role}` || href === "/admin") {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Link to="/">
          <img src={logo} alt="PrimeDoor" className="h-12 w-auto" />
        </Link>
        {sidebarOpen && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground truncate">PrimeDoor</p>
            <p className="text-[10px] text-muted-foreground truncate">{roleLabels[role]}</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {item.icon}
            {sidebarOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="p-4 border-t border-border">
        {sidebarOpen && (
          <p className="text-xs text-muted-foreground mb-2 truncate">{userName}</p>
        )}
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <LogOut size={18} />
          {sidebarOpen && <span>Выйти</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="dashboard-theme min-h-screen bg-background text-foreground flex">
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-border bg-card transition-all duration-300 ${
          sidebarOpen ? "w-60" : "w-16"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border shadow-xl">
            <div className="flex justify-end p-3">
              <button onClick={() => setMobileOpen(false)}>
                <X size={24} className="text-muted-foreground" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3">
          <button
            className="md:hidden text-muted-foreground"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} />
          </button>
          <button
            className="hidden md:flex text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <ChevronLeft size={20} className={`transition-transform ${!sidebarOpen ? "rotate-180" : ""}`} />
          </button>
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground">{userName}</span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
