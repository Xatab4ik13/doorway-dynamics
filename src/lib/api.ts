const API_URL = import.meta.env.VITE_API_URL || "https://api.primedoor.ru";

interface ApiOptions {
  method?: string;
  body?: any;
  auth?: boolean;
}

export async function api<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, auth = false } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Ошибка сервера");
  }

  return data;
}

export async function uploadFile(file: File, folder: string = "uploads"): Promise<{ url: string; key: string }> {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка загрузки");
  return data;
}

export default api;
