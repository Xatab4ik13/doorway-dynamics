import { MapPin, Calendar, Phone, Briefcase, ChevronRight, Link2 } from "lucide-react";
import { statusColors, requestTypeLabels, getStatusLabel, type RequestStatus, type RequestType } from "@/data/mockDashboard";
import type { ApiRequest } from "@/hooks/useRequests";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/formatDate";

interface MobileRequestCardProps {
  request: ApiRequest;
  index: number;
  onClick: () => void;
  getUserName?: (id?: string) => string;
}

const MobileRequestCard = ({ request: r, index, onClick, getUserName }: MobileRequestCardProps) => {
  const executor = getUserName?.(r.measurer_id) || getUserName?.(r.installer_id);
  const partnerLabel = getUserName?.(r.partner_id) || r.partner_name || "Партнёр";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      onClick={onClick}
      className="bg-card rounded-xl border border-border/50 p-3.5 active:scale-[0.98] transition-transform cursor-pointer"
    >
      {/* Top row: number + type + status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-xs text-primary font-semibold">{r.number}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent text-muted-foreground">
            {requestTypeLabels[r.type] || r.type}
          </span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-semibold shrink-0 ${statusColors[r.status as RequestStatus] || "bg-muted text-muted-foreground"}`}>
          {getStatusLabel(r.status as RequestStatus, r.type as RequestType)}
        </span>
      </div>

      {/* Client name */}
      <p className="font-semibold text-sm truncate">{r.client_name}</p>

      {/* Address */}
      {r.client_address && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <MapPin size={11} className="shrink-0" />
          <span className="truncate">{r.client_address}</span>
        </div>
      )}

      {/* Bottom row: executor + date + source */}
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border/30">
        <div className="flex items-center gap-2 min-w-0">
          {r.partner_id ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-medium">
              <Briefcase size={10} /> {partnerLabel}
            </span>
          ) : null}
          {r.external_system === "doorium" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-100 text-violet-700 text-[10px] font-medium">
              <Link2 size={10} /> DR
            </span>
          )}
          {executor && (
            <span className="text-[11px] text-muted-foreground truncate">{executor}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
          <span className="text-[11px]">{formatDate(r.created_at)}</span>
          <ChevronRight size={14} />
        </div>
      </div>

      {/* Door counts for installation */}
      {r.type === "installation" && (r.interior_doors != null || r.entrance_doors != null || r.partitions != null) && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {r.interior_doors != null && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-accent text-muted-foreground">МК: {r.interior_doors}</span>
          )}
          {r.entrance_doors != null && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-accent text-muted-foreground">Вх: {r.entrance_doors}</span>
          )}
          {r.partitions != null && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-accent text-muted-foreground">Пер: {r.partitions}</span>
          )}
          {r.amount != null && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium">{r.amount.toLocaleString("ru-RU")} ₽</span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default MobileRequestCard;
