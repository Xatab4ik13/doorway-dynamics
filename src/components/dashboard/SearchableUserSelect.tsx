import { useState, useRef, useEffect } from "react";
import { Search, X, ChevronDown } from "lucide-react";

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
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

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

      {open && (
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
              onClick={() => { onChange(""); setOpen(false); }}
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
                  onClick={() => { onChange(u.id); setOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors ${value === u.id ? "text-primary font-medium bg-primary/5" : "text-foreground"}`}
                >
                  {u.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableUserSelect;
