import { useState } from "react";
import { Search, Filter, X, Download, Calendar, Users, ChevronDown } from "lucide-react";
import { statusLabels, requestTypeLabels, type RequestStatus } from "@/data/mockDashboard";
import { type ApiUser } from "@/hooks/useRequests";
import { motion, AnimatePresence } from "framer-motion";

export interface FilterState {
  search: string;
  status: string;
  type: string;
  city: string;
  measurerId: string;
  installerId: string;
  partnerId: string;
  dateFrom: string;
  dateTo: string;
  dateField: "created_at" | "closed_at";
}

export const defaultFilters: FilterState = {
  search: "",
  status: "all",
  type: "all",
  city: "Москва",
  measurerId: "all",
  installerId: "all",
  partnerId: "all",
  dateFrom: "",
  dateTo: "",
  dateField: "created_at",
};

interface RequestFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  users: ApiUser[];
  onExport: (format: "csv" | "xlsx") => void;
  resultCount: number;
}

const RequestFilters = ({ filters, onChange, users, onExport, resultCount }: RequestFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const measurers = users.filter(u => u.role === "measurer" && u.active);
  const installers = users.filter(u => u.role === "installer" && u.active);
  const partners = users.filter(u => u.role === "partner");

  const set = (key: keyof FilterState, value: string) => onChange({ ...filters, [key]: value });

  const activeFilterCount = [
    filters.status !== "all",
    filters.type !== "all",
    filters.measurerId !== "all",
    filters.installerId !== "all",
    filters.partnerId !== "all",
    !!filters.dateFrom,
    !!filters.dateTo,
  ].filter(Boolean).length;

  const resetFilters = () => onChange(defaultFilters);

  const selectClass = "px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 hover:border-primary/40 transition-all appearance-none cursor-pointer";

  return (
    <div className="space-y-3">
      {/* Main search row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            autoComplete="off"
            placeholder="Поиск по имени, номеру, адресу, телефону..."
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 hover:border-primary/40 transition-all"
          />
          {filters.search && (
            <button onClick={() => set("search", "")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>

        <select value={filters.type} onChange={(e) => set("type", e.target.value)} className={selectClass}>
          <option value="all">Все типы</option>
          {Object.entries(requestTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        <select value={filters.status} onChange={(e) => set("status", e.target.value)} className={selectClass}>
          <option value="all">Все статусы</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
            showAdvanced || activeFilterCount > 0
              ? "bg-primary/10 border-primary/30 text-primary"
              : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
          }`}
        >
          <Filter size={14} />
          Фильтры
          {activeFilterCount > 0 && (
            <span className="bg-primary text-primary-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown size={14} className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Advanced filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 rounded-xl bg-accent/50 border border-border">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><Users size={11} /> Замерщик</label>
                <select value={filters.measurerId} onChange={(e) => set("measurerId", e.target.value)} className={selectClass + " w-full"}>
                  <option value="all">Все</option>
                  {measurers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><Users size={11} /> Монтажник</label>
                <select value={filters.installerId} onChange={(e) => set("installerId", e.target.value)} className={selectClass + " w-full"}>
                  <option value="all">Все</option>
                  {installers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><Users size={11} /> Партнёр</label>
                <select value={filters.partnerId} onChange={(e) => set("partnerId", e.target.value)} className={selectClass + " w-full"}>
                  <option value="all">Все</option>
                  {partners.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><Calendar size={11} /> Тип даты</label>
                <select value={filters.dateField} onChange={(e) => set("dateField", e.target.value)} className={selectClass + " w-full"}>
                  <option value="created_at">Дата создания</option>
                  <option value="closed_at">Дата закрытия (только закрытые)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><Calendar size={11} /> От</label>
                  <input type="date" value={filters.dateFrom} onChange={(e) => set("dateFrom", e.target.value)} className={selectClass + " w-full"} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><Calendar size={11} /> До</label>
                  <input type="date" value={filters.dateTo} onChange={(e) => set("dateTo", e.target.value)} className={selectClass + " w-full"} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Найдено: <span className="font-semibold text-foreground">{resultCount}</span>
          </span>
          {activeFilterCount > 0 && (
            <button onClick={resetFilters} className="text-xs text-primary hover:underline flex items-center gap-1">
              <X size={12} /> Сбросить
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onExport("csv")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-foreground hover:bg-accent/80 transition-colors">
            <Download size={12} /> CSV
          </button>
          <button onClick={() => onExport("xlsx")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            <Download size={12} /> Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestFilters;
