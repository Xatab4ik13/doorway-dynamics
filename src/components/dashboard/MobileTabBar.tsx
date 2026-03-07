import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Newspaper,
  FileSpreadsheet,
  Wrench,
  Ruler,
  History,
  PlusCircle,
  Eye,
  Calculator,
  CalendarDays,
  Handshake,
  Upload,
  MoreHorizontal,
} from "lucide-react";
import type { UserRole } from "@/data/mockDashboard";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface TabItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface RoleTabConfig {
  tabs: TabItem[];
  more: TabItem[];
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
    more: [{ label: "Файлы", href: "/manager/files", icon: Upload }],
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
  const [moreBackdropClosable, setMoreBackdropClosable] = useState(false);

  useEffect(() => {
    if (!moreOpen) {
      setMoreBackdropClosable(false);
      return;
    }

    const timer = window.setTimeout(() => setMoreBackdropClosable(true), 180);
    return () => window.clearTimeout(timer);
  }, [moreOpen]);

  const isActive = (href: string) => {
    if (href === `/${role}` || href === "/admin") {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const isMoreActive = more.some((item) => isActive(item.href));

  const allTabs = more.length > 0 ? [...tabs, { label: "Ещё", href: "__more__", icon: MoreHorizontal }] : tabs;

  return (
    <>
      {/* More menu overlay */}
      <AnimatePresence>
        {moreOpen && (
          <div className="fixed inset-0 z-40 md:hidden dashboard-theme">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
              onClick={() => {
                if (moreBackdropClosable) setMoreOpen(false);
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute left-4 right-4 bg-card rounded-2xl shadow-2xl border border-border/30 overflow-hidden"
              style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 5.8rem)" }}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {more.map((item, i) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-3.5 px-5 py-3.5 text-[15px] font-medium transition-colors active:bg-accent/60",
                      i < more.length - 1 && "border-b border-border/30",
                      active ? "text-primary bg-primary/5" : "text-foreground",
                    )}
                  >
                    <item.icon
                      size={22}
                      strokeWidth={active ? 2.2 : 1.6}
                      className={active ? "text-primary" : "text-muted-foreground"}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* iOS-style Tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden">
        <div className="absolute inset-0 bg-card/85 backdrop-blur-xl border-t border-border/30" />

        <div
          className="relative flex items-end justify-around px-2"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)" }}
        >
          {allTabs.map((item) => {
            const isMore = item.href === "__more__";
            const active = isMore ? isMoreActive || moreOpen : isActive(item.href);
            const Icon = item.icon;

            if (isMore) {
              return (
                <button
                  key="more"
                  onClick={() => setMoreOpen((prev) => !prev)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 pt-2.5 pb-1 min-w-0 flex-1 transition-colors active:opacity-60",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon size={26} strokeWidth={active ? 2 : 1.5} />
                  <span className={cn("text-[11px] leading-none tracking-tight", active ? "font-semibold" : "font-normal")}>
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
                  "flex flex-col items-center justify-center gap-1 pt-2.5 pb-1 min-w-0 flex-1 transition-colors active:opacity-60",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon size={26} strokeWidth={active ? 2 : 1.5} />
                <span className={cn("text-[11px] leading-none tracking-tight", active ? "font-semibold" : "font-normal")}>
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
