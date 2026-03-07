import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ClipboardList, Users, Newspaper, FileSpreadsheet,
  Wrench, Ruler, History, PlusCircle, Eye, Calculator, CalendarDays,
  Handshake, Upload, MoreHorizontal,
} from "lucide-react";
import type { UserRole } from "@/data/mockDashboard";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface TabItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface MoreItem extends TabItem {}

interface RoleTabConfig {
  tabs: TabItem[];
  more: MoreItem[];
}

const tabsByRole: Record<UserRole, RoleTabConfig> = {
  admin: {
    tabs: [
      { label: "Заявки", href: "/admin/requests", icon: ClipboardList },
      { label: "Календарь", href: "/admin/calendar", icon: CalendarDays },
      { label: "Дашборд", href: "/admin", icon: LayoutDashboard },
      { label: "Аккаунты", href: "/admin/accounts", icon: Users },
    ],
    more: [
      { label: "Сметы", href: "/admin/estimates", icon: FileSpreadsheet },
      { label: "Партнёры", href: "/admin/partners", icon: Handshake },
      { label: "Новости", href: "/admin/news", icon: Newspaper },
    ],
  },
  manager: {
    tabs: [
      { label: "Заявки", href: "/manager", icon: ClipboardList },
      { label: "Календарь", href: "/manager/calendar", icon: CalendarDays },
      { label: "Задачи", href: "/manager/assign", icon: Users },
      { label: "Сметы", href: "/manager/estimates", icon: Calculator },
    ],
    more: [
      { label: "Файлы", href: "/manager/files", icon: Upload },
    ],
  },
  measurer: {
    tabs: [
      { label: "Заявки", href: "/measurer", icon: Ruler },
      { label: "Календарь", href: "/measurer/calendar", icon: CalendarDays },
      { label: "История", href: "/measurer/history", icon: History },
    ],
    more: [],
  },
  installer: {
    tabs: [
      { label: "Заявки", href: "/installer", icon: Wrench },
      { label: "Календарь", href: "/installer/calendar", icon: CalendarDays },
      { label: "Сметы", href: "/installer/estimates", icon: Calculator },
      { label: "История", href: "/installer/history", icon: History },
    ],
    more: [],
  },
  partner: {
    tabs: [
      { label: "Заявки", href: "/partner", icon: Eye },
      { label: "Новая", href: "/partner/new", icon: PlusCircle },
      { label: "История", href: "/partner/history", icon: History },
    ],
    more: [],
  },
};

interface MobileTabBarProps {
  role: UserRole;
}

const MobileTabBar = ({ role }: MobileTabBarProps) => {
  const location = useLocation();
  const { tabs, more } = tabsByRole[role];
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) => {
    // Exact match for root role pages
    if (href === `/${role}` || href === "/admin") {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const isMoreActive = more.some((item) => isActive(item.href));

  const allTabs = more.length > 0
    ? [...tabs, { label: "Ещё", href: "__more__", icon: MoreHorizontal }]
    : tabs;

  return (
    <>
      {/* More menu overlay */}
      <AnimatePresence>
        {moreOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0" onClick={() => setMoreOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] left-3 right-3 bg-card rounded-2xl shadow-2xl border border-border/50 p-2 space-y-0.5"
            >
              {more.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-card/95 backdrop-blur-lg border-t border-border/50">
        <div className="flex items-stretch justify-around px-1" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          {allTabs.map((item) => {
            const isMore = item.href === "__more__";
            const active = isMore ? isMoreActive || moreOpen : isActive(item.href);
            const Icon = item.icon;

            if (isMore) {
              return (
                <button
                  key="more"
                  onClick={() => setMoreOpen(!moreOpen)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 py-2 px-1 min-w-0 flex-1 transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                  <span className={cn("text-[10px] leading-tight", active ? "font-semibold" : "font-medium")}>
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 px-1 min-w-0 flex-1 transition-colors relative",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span className={cn("text-[10px] leading-tight", active ? "font-semibold" : "font-medium")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default MobileTabBar;
