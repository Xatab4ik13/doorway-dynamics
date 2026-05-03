/**
 * Rewrite any direct S3 (s3.twcstorage.ru / *.twcstorage.ru) URL to our backend proxy
 * (/api/files/<key>). This avoids Safari/iOS showing fake "malware site" warnings
 * on the third-party storage hostname and keeps all files served from our domain.
 *
 * New uploads already return proxy URLs — this function handles legacy DB rows.
 */
const API_URL = import.meta.env.VITE_API_URL || "https://api.primedoor.ru";

export function proxyFileUrl(url?: string | null): string {
  if (!url) return "";
  // Already proxied or relative
  if (url.startsWith("/api/files/") || url.includes("/api/files/")) return url;

  try {
    const u = new URL(url);
    if (!/twcstorage\.ru$/i.test(u.hostname)) return url;
    // Path: /<bucket>/<key...> — strip bucket segment
    const parts = u.pathname.replace(/^\/+/, "").split("/");
    if (parts.length < 2) return url;
    const key = parts.slice(1).join("/");
    return `${API_URL}/api/files/${key}`;
  } catch {
    return url;
  }
}
