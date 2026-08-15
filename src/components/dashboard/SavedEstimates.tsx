import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2, Trash2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import type { UserRole } from "@/data/mockDashboard";
import { formatPhone } from "@/lib/formatPhone";

interface SavedEstimate {
  id: string;
  number: string;
  client_name: string | null;
  client_phone: string | null;
  client_address: string | null;
  city: string | null;
  total: number | string | null;
  created_at: string | null;
}

interface SavedEstimatesProps {
  role: UserRole;
  userName: string;
}

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Moscow" });
};

const SavedEstimates = ({ role, userName }: SavedEstimatesProps) => {
  const navigate = useNavigate();
  const [estimates, setEstimates] = useState<SavedEstimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [cityFilter, setCityFilter] = useState<"all" | "moscow" | "spb">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { document.title = "Сохранённые сметы"; }, []);

  useEffect(() => {
    api<SavedEstimate[]>("/api/estimates", { auth: true })
      .then((data) => setEstimates(data || []))
      .catch((err: any) => toast.error(err.message || "Ошибка загрузки смет"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/\s/g, "");
    return estimates.filter((e) => {
      if (cityFilter !== "all" && (e.city || "moscow") !== cityFilter) return false;
      if (!q) return true;
      const haystack = [e.number, e.client_name, e.client_phone, e.client_address]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .replace(/\s/g, "");
      return haystack.includes(q);
    });
  }, [estimates, query, cityFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить смету?")) return;
    setDeletingId(id);
    try {
      await api(`/api/estimates/${id}`, { method: "DELETE", auth: true });
      setEstimates((prev) => prev.filter((e) => e.id !== id));
      toast.success("Смета удалена");
    } catch (err: any) {
      toast.error(err.message || "Ошибка удаления");
    } finally {
      setDeletingId(null);
    }
  };

  const canDelete = role === "admin" || role === "manager";

  return (
    <DashboardLayout role={role} userName={userName}>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-2xl font-heading font-bold">Сохранённые сметы</h1>
          <button
            onClick={() => navigate(`/${role}/estimates`)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            <Plus size={14} /> Новая смета
          </button>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по ФИО, телефону, адресу или номеру сметы"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex gap-2">
              {([
                { value: "all", label: "Все города" },
                { value: "moscow", label: "Москва" },
                { value: "spb", label: "СПб" },
              ] as const).map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCityFilter(c.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    cityFilter === c.value ? "bg-primary text-primary-foreground shadow-sm" : "bg-accent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-16">Смет не найдено</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((e) => (
              <Card key={e.id} className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <button
                    onClick={() => navigate(`/${role}/estimates?id=${e.id}`)}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-primary">{e.number}</span>
                      <span className="text-[10px] text-muted-foreground">{formatDate(e.created_at)}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {(e.city || "moscow") === "spb" ? "СПб" : "Москва"}
                      </span>
                    </div>
                    <p className="text-sm font-semibold mt-1 truncate">{e.client_name || "Без имени"}</p>
                    {e.client_phone && (
                      <p className="text-xs text-muted-foreground">{formatPhone(e.client_phone)}</p>
                    )}
                    {e.client_address && (
                      <p className="text-xs text-muted-foreground truncate">{e.client_address}</p>
                    )}
                  </button>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-sm font-bold">{Number(e.total || 0).toLocaleString("ru")} ₽</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/${role}/estimates?id=${e.id}`)}
                        className="p-2 rounded-lg hover:bg-accent transition-all text-muted-foreground hover:text-foreground"
                        aria-label="Редактировать смету"
                      >
                        <Pencil size={16} />
                      </button>
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(e.id)}
                          disabled={deletingId === e.id}
                          className="p-2 rounded-lg hover:bg-destructive/10 transition-all text-muted-foreground hover:text-destructive disabled:opacity-50"
                          aria-label="Удалить смету"
                        >
                          {deletingId === e.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SavedEstimates;
