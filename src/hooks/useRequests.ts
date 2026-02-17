import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

export interface ApiRequest {
  id: string;
  number: string;
  type: "measurement" | "installation" | "reclamation";
  status: string;
  client_name: string;
  client_phone: string;
  client_address: string;
  city?: string;
  extra_name?: string;
  extra_phone?: string;
  status_comment?: string;
  work_description?: string;
  notes?: string;
  photos?: { url: string; type: string; stage: string; uploaded_at: string }[];
  source: "site" | "partner";
  partner_id?: string;
  measurer_id?: string;
  installer_id?: string;
  manager_id?: string;
  agreed_date?: string;
  amount?: number;
  created_at: string;
  updated_at?: string;
}

export interface ApiUser {
  id: string;
  name: string;
  role: string;
  telegram_id?: string;
  active: boolean;
}

const POLL_INTERVAL = 10000; // 10 seconds

export function useRequests() {
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const prevCountRef = useRef<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const fetchRequests = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await api<ApiRequest[] | { data: ApiRequest[] }>("/api/requests", { auth: true });
      const data = Array.isArray(response) ? response : response.data;
      
      // Notify about new requests
      if (prevCountRef.current !== null && data.length > prevCountRef.current) {
        const newCount = data.length - prevCountRef.current;
        toast.info(`🔔 ${newCount === 1 ? 'Новая заявка!' : `Новых заявок: ${newCount}`}`, {
          duration: 5000,
          position: "top-right",
        });
      }
      prevCountRef.current = data.length;
      
      setRequests(data);
    } catch (err: any) {
      if (!silent) toast.error(err.message || "Ошибка загрузки заявок");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    pollRef.current = setInterval(() => fetchRequests(true), POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchRequests]);

  const updateRequest = useCallback(async (id: string, updates: Partial<ApiRequest>) => {
    try {
      const updated = await api<ApiRequest>(`/api/requests/${id}`, {
        method: "PUT",
        body: updates,
        auth: true,
      });
      setRequests(prev => prev.map(r => r.id === id ? updated : r));
      return updated;
    } catch (err: any) {
      toast.error(err.message || "Ошибка обновления");
      throw err;
    }
  }, []);

  const createRequest = useCallback(async (data: Partial<ApiRequest>) => {
    try {
      const created = await api<ApiRequest>("/api/requests", {
        method: "POST",
        body: data,
        auth: true,
      });
      setRequests(prev => [created, ...prev]);
      prevCountRef.current = (prevCountRef.current || 0) + 1;
      return created;
    } catch (err: any) {
      toast.error(err.message || "Ошибка создания");
      throw err;
    }
  }, []);

  const deleteRequest = useCallback(async (id: string) => {
    try {
      await api(`/api/requests/${id}`, { method: "DELETE", auth: true });
      setRequests(prev => prev.filter(r => r.id !== id));
      prevCountRef.current = (prevCountRef.current || 0) - 1;
    } catch (err: any) {
      toast.error(err.message || "Ошибка удаления");
      throw err;
    }
  }, []);

  return { requests, loading, fetchRequests, updateRequest, createRequest, deleteRequest, setRequests };
}

export function useUsers(skip = false) {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(!skip);

  useEffect(() => {
    if (skip) return;
    api<ApiUser[]>("/api/users", { auth: true })
      .then(setUsers)
      .catch(() => {}) // silently fail for roles without access
      .finally(() => setLoading(false));
  }, [skip]);

  const getUserName = useCallback((id?: string) => {
    if (!id) return undefined;
    return users.find(u => u.id === id)?.name;
  }, [users]);

  const getByRole = useCallback((role: string) => {
    return users.filter(u => u.role === role && u.active);
  }, [users]);

  return { users, loading, getUserName, getByRole };
}
