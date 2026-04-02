import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { type ApiRequest } from "@/hooks/useRequests";
import { type FilterState } from "@/components/dashboard/RequestFilters";

const POLL_INTERVAL = 10000;
const DEFAULT_LIMIT = 30;

export interface PaginatedResponse {
  data: ApiRequest[];
  total: number;
  page: number;
  limit: number;
  counts?: Record<string, number>;
}

interface UsePaginatedRequestsOptions {
  limit?: number;
  quickFilter?: string;
}

export function usePaginatedRequests(filters: FilterState, options: UsePaginatedRequestsOptions = {}) {
  const { limit = DEFAULT_LIMIT, quickFilter } = options;
  const [result, setResult] = useState<PaginatedResponse>({ data: [], total: 0, page: 1, limit });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  const prevTotalRef = useRef<number | null>(null);

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (filters.search) params.set("search", filters.search);
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.type !== "all") params.set("type", filters.type);
    if (filters.city && filters.city !== "all") params.set("city", filters.city);
    if (filters.measurerId !== "all") params.set("measurer_id", filters.measurerId);
    if (filters.installerId !== "all") params.set("installer_id", filters.installerId);
    if (filters.partnerId !== "all") params.set("partner_id", filters.partnerId);
    if (filters.sourceFilter && filters.sourceFilter !== "all") params.set("source_filter", filters.sourceFilter);
    if (filters.dateFrom) params.set("date_from", filters.dateFrom);
    if (filters.dateTo) params.set("date_to", filters.dateTo);
    if (filters.dateField && filters.dateField !== "created_at") params.set("date_field", filters.dateField);
    if (quickFilter && quickFilter !== "all") params.set("quick", quickFilter);
    return params.toString();
  }, [page, limit, filters, quickFilter]);

  const fetchRequests = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const query = buildQuery();
      const raw = await api<PaginatedResponse | ApiRequest[]>(`/api/requests?${query}`, { auth: true });

      // Backwards compatibility: if API returns flat array, wrap it
      let response: PaginatedResponse;
      if (Array.isArray(raw)) {
        // Client-side pagination fallback for old API
        const allData = raw as ApiRequest[];
        let filtered = allData;

        // Apply client-side filters if API doesn't support them
        if (filters.search) {
          const s = filters.search.toLowerCase();
          // Smart phone search: normalize 8xxx to +7xxx
          const searchNorm = filters.search.replace(/\s/g, '');
          let phoneAlt = '';
          if (/^8\d{10}$/.test(searchNorm)) phoneAlt = '+7' + searchNorm.slice(1);
          else if (/^\+?7\d{10}$/.test(searchNorm)) phoneAlt = '8' + searchNorm.replace(/^\+?7/, '');

          filtered = filtered.filter(r =>
            r.client_name.toLowerCase().includes(s) ||
            r.number.toLowerCase().includes(s) ||
            (r.client_address || "").toLowerCase().includes(s) ||
            (r.client_phone || "").toLowerCase().includes(s) ||
            (r.city || "").toLowerCase().includes(s) ||
            (phoneAlt && (r.client_phone || "").includes(phoneAlt))
          );
        }
        if (filters.status !== "all") filtered = filtered.filter(r => r.status === filters.status);
        if (filters.type !== "all") filtered = filtered.filter(r => r.type === filters.type);
        if (filters.city && filters.city !== "all") filtered = filtered.filter(r => (r.city || "") === filters.city);
        if (filters.measurerId !== "all") filtered = filtered.filter(r => r.measurer_id === filters.measurerId);
        if (filters.installerId !== "all") filtered = filtered.filter(r => r.installer_id === filters.installerId);
        if (filters.partnerId !== "all") filtered = filtered.filter(r => r.partner_id === filters.partnerId);
        if (filters.sourceFilter && filters.sourceFilter !== "all") {
          if (filters.sourceFilter === "doorium") filtered = filtered.filter(r => r.external_system === "doorium");
          else if (filters.sourceFilter === "partner") filtered = filtered.filter(r => !!r.partner_id && r.external_system !== "doorium");
          else if (filters.sourceFilter === "site") filtered = filtered.filter(r => !r.partner_id && r.external_system !== "doorium");
        }
        const dateField = filters.dateField || "created_at";
        if (dateField === "closed_at") {
          filtered = filtered.filter(r => r.status === "closed");
        }
        const getDateValue = (r: ApiRequest) => {
          const val = dateField === "closed_at"
            ? ((r as any).closed_at || r.updated_at)
            : r.created_at;
          return val?.split("T")[0] || "";
        };
        if (filters.dateFrom) filtered = filtered.filter(r => getDateValue(r) >= filters.dateFrom);
        if (filters.dateTo) filtered = filtered.filter(r => getDateValue(r) <= filters.dateTo);

        if (quickFilter === "new") filtered = filtered.filter(r => r.status === "new");
        else if (quickFilter === "pending") filtered = filtered.filter(r => r.status === "pending");
        else if (quickFilter === "closed") filtered = filtered.filter(r => r.status === "closed");
        else if (quickFilter === "in_progress") filtered = filtered.filter(r => !["new", "closed", "cancelled"].includes(r.status));
        else if (quickFilter === "reclamation") filtered = filtered.filter(r => r.type === "reclamation");

        const total = filtered.length;
        const start = (page - 1) * limit;
        const paged = filtered.slice(start, start + limit);

        // Calculate counts from full dataset for quick filters
        const counts: Record<string, number> = {
          all: allData.length,
          new: allData.filter(r => r.status === "new").length,
          in_progress: allData.filter(r => !["new", "closed", "cancelled"].includes(r.status)).length,
          reclamation: allData.filter(r => r.type === "reclamation").length,
        };

        response = { data: paged, total, page, limit, counts };
      } else {
        response = raw;
      }

      // Notify about new requests
      if (prevTotalRef.current !== null && response.total > prevTotalRef.current) {
        const newCount = response.total - prevTotalRef.current;
        toast.info(`🔔 ${newCount === 1 ? "Новая заявка!" : `Новых заявок: ${newCount}`}`, {
          duration: 5000,
          position: "top-right",
        });
      }
      prevTotalRef.current = response.total;

      setResult(response);
    } catch (err: any) {
      if (!silent) toast.error(err.message || "Ошибка загрузки заявок");
    } finally {
      setLoading(false);
    }
  }, [buildQuery, page, limit, filters, quickFilter]);

  // Reset to page 1 and suppress notification when filters change
  useEffect(() => {
    setPage(1);
    prevTotalRef.current = null;
  }, [filters.search, filters.status, filters.type, filters.measurerId, filters.installerId, filters.partnerId, filters.sourceFilter, filters.dateFrom, filters.dateTo, filters.dateField, quickFilter]);

  useEffect(() => {
    fetchRequests();
    pollRef.current = setInterval(() => fetchRequests(true), POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchRequests]);

  const totalPages = Math.max(1, Math.ceil(result.total / limit));

  return {
    requests: result.data,
    total: result.total,
    page,
    totalPages,
    limit,
    counts: result.counts,
    loading,
    setPage,
    refetch: fetchRequests,
  };
}
