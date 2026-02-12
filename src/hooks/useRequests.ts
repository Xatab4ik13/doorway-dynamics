import { useState, useEffect, useCallback } from "react";
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
  work_description?: string;
  notes?: string;
  source: "site" | "partner";
  partner_id?: string;
  measurer_id?: string;
  installer_id?: string;
  manager_id?: string;
  agreed_date?: string;
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

export function useRequests() {
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api<ApiRequest[]>("/api/requests", { auth: true });
      setRequests(data);
    } catch (err: any) {
      toast.error(err.message || "Ошибка загрузки заявок");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

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

  return { requests, loading, fetchRequests, updateRequest, setRequests };
}

export function useUsers() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<ApiUser[]>("/api/users", { auth: true })
      .then(setUsers)
      .catch((err) => toast.error(err.message || "Ошибка загрузки пользователей"))
      .finally(() => setLoading(false));
  }, []);

  const getUserName = useCallback((id?: string) => {
    if (!id) return undefined;
    return users.find(u => u.id === id)?.name;
  }, [users]);

  const getByRole = useCallback((role: string) => {
    return users.filter(u => u.role === role && u.active);
  }, [users]);

  return { users, loading, getUserName, getByRole };
}
