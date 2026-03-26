const API_URL = import.meta.env.VITE_API_URL || "https://api.primedoor.ru";
const MAX_UPLOAD_SIZE = 80 * 1024 * 1024;

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

  const raw = await res.text();
  const data = raw ? (() => {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  })() : null;

  if (!res.ok) {
    throw new Error(typeof data === "object" && data && "error" in data ? String(data.error) : typeof data === "string" && data ? data : "Ошибка сервера");
  }

  return data as T;
}

export async function uploadFile(file: File, folder: string = "uploads"): Promise<{ url: string; key: string }> {
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error(`Файл \"${file.name}\" больше ${Math.round(MAX_UPLOAD_SIZE / (1024 * 1024))} МБ`);
  }

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

  const raw = await res.text();
  const data = raw ? (() => {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  })() : null;

  if (!res.ok) throw new Error(typeof data === "object" && data && "error" in data ? String(data.error) : typeof data === "string" && data ? data : "Ошибка загрузки");
  return data as { url: string; key: string };
}

export default api;
