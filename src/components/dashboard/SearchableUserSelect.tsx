import { useState, useRef, useEffect } from "react";
import { Search, X, ChevronDown, Check } from "lucide-react";
import { createPortal } from "react-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  id: string;
  name: string;
}

interface SearchableUserSelectProps {
  value: string;
  onChange: (value: string) => void;
  users: User[];
  placeholder?: string;
}

const SearchableUserSelect = ({ value, onChange, users, placeholder = "Не назначен" }: SearchableUserSelectProps) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedUser = users.find((u) => u.id === value);
  const filtered = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (!isMobile) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [isMobile]);

  useEffect(() => {
    if (open && inputRef.current) {
      const timer = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 100);
      return () => window.clearTimeout(timer);
    }
  }, [open]);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
    setSearch("");
  };

  // Mobile: iOS action sheet style
  const mobileSheet = isMobile && open ? createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[95] dashboard-theme" onClick={() => { setOpen(false); setSearch(""); }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-foreground/40"
        />
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl max-h-[90dvh] flex flex-col"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-9 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Search */}
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-accent/50">
              <Search size={16} className="text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                inputMode="search"
                enterKeyHint="done"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-muted-foreground">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4" style={{ WebkitOverflowScrolling: "touch" as any }}>
            <div className="rounded-2xl bg-accent/30 overflow-hidden divide-y divide-border/30">
              {/* Empty option */}
              <button
                type="button"
                onClick={() => handleSelect("")}
                className="w-full flex items-center justify-between px-4 py-3 text-sm active:bg-accent transition-colors text-left"
              >
                <span className={!value ? "text-primary font-medium" : "text-muted-foreground"}>{placeholder}</span>
                {!value && <Check size={16} className="text-primary shrink-0" />}
              </button>
              {filtered.length === 0 ? (
                <p className="px-4 py-4 text-sm text-muted-foreground text-center">Не найдено</p>
              ) : (
                filtered.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelect(u.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm active:bg-accent transition-colors text-left"
                  >
                    <span className={value === u.id ? "text-primary font-medium" : "text-foreground"}>{u.name}</span>
                    {value === u.id && <Check size={16} className="text-primary shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  ) : null;

  // Desktop dropdown (unchanged logic)
  const desktopDropdown = !isMobile && open ? (
    <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <Search size={14} className="text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div className="max-h-48 overflow-auto">
        <button
          type="button"
          onClick={() => handleSelect("")}
          className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors ${!value ? "text-primary font-medium" : "text-muted-foreground"}`}
        >
          {placeholder}
        </button>
        {filtered.length === 0 ? (
          <p className="px-4 py-3 text-sm text-muted-foreground text-center">Не найдено</p>
        ) : (
          filtered.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => handleSelect(u.id)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors ${value === u.id ? "text-primary font-medium bg-primary/5" : "text-foreground"}`}
            >
              {u.name}
            </button>
          ))
        )}
      </div>
    </div>
  ) : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(""); }}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-left"
      >
        <span className={selectedUser ? "text-foreground" : "text-muted-foreground"}>
          {selectedUser?.name || placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && (
            <span
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              className="p-0.5 rounded hover:bg-accent text-muted-foreground"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown size={14} className="text-muted-foreground" />
        </div>
      </button>

      {desktopDropdown}
      {mobileSheet}
    </div>
  );
};

export default SearchableUserSelect;
