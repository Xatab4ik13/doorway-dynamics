/**
 * Format ISO date string or date-like string to DD.MM.YYYY (Russian standard)
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  // Handle ISO string or YYYY-MM-DD
  const d = dateStr.split("T")[0];
  const parts = d.split("-");
  if (parts.length !== 3) return d;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

/**
 * Format ISO datetime to DD.MM.YYYY HH:MM
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}
