import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requestTypeLabels } from "@/data/mockDashboard";
import { formatDate } from "@/lib/formatDate";
import type { ApiRequest } from "@/hooks/useRequests";

const OVERDUE_DAYS = 5;

/** Статусы, которые не считаются незакрытой работой: ожидание клиента, отказ, отмена, закрыта */
const NOT_OVERDUE_STATUSES = new Set(["closed", "cancelled", "pending", "client_refused"]);

/** Монтаж/рекламация не закрыты более 5 дней (от даты монтажа, иначе от создания) */
export function getOverdueRequests(requests: ApiRequest[], now = Date.now()) {
  const limit = OVERDUE_DAYS * 24 * 60 * 60 * 1000;
  return requests.filter((r) => {
    if (r.type !== "installation" && r.type !== "reclamation") return false;
    if (NOT_OVERDUE_STATUSES.has(r.status)) return false;
    const from = r.agreed_date || r.created_at;
    if (!from) return false;
    return now - new Date(from).getTime() > limit;
  });
}

export default function OverdueRequestsCard({ requests, onOpen }: { requests: ApiRequest[]; onOpen: (r: ApiRequest) => void }) {
  const overdue = useMemo(
    () => getOverdueRequests(requests).sort((a, b) => new Date(a.agreed_date || a.created_at).getTime() - new Date(b.agreed_date || b.created_at).getTime()),
    [requests]
  );
  if (overdue.length === 0) return null;

  return (
    <Card className="border-2 border-destructive animate-pulse-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-destructive">
          <AlertTriangle size={18} className="animate-pulse" />
          Незакрытые заказы
          <span className="ml-1 px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs animate-pulse">{overdue.length}</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">Монтаж и рекламации, не закрытые более {OVERDUE_DAYS} дней</p>
      </CardHeader>
      <CardContent>
        <div className="max-h-72 overflow-y-auto divide-y divide-border">
          {overdue.map((r) => (
            <button
              key={r.id}
              onClick={() => onOpen(r)}
              className="w-full flex items-center justify-between gap-3 py-2 text-left hover:bg-destructive/5 px-2 rounded"
            >
              <div className="min-w-0">
                <span className="font-mono text-xs text-destructive mr-2">{r.number}</span>
                <span className="text-sm font-medium">{r.client_name}</span>
                <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">{requestTypeLabels[r.type as keyof typeof requestTypeLabels] || r.type}</span>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{formatDate(r.agreed_date || r.created_at)}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
