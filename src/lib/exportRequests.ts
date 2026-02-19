import { statusLabels, requestTypeLabels, type RequestStatus } from "@/data/mockDashboard";
import type { ApiRequest } from "@/hooks/useRequests";

type GetUserNameFn = (id?: string) => string | undefined;

const formatRow = (r: ApiRequest, getUserName: GetUserNameFn) => ({
  "Номер": r.number,
  "Клиент": r.client_name,
  "Телефон": r.client_phone,
  "Адрес": r.client_address,
  "Город": r.city || "",
  "Тип": requestTypeLabels[r.type] || r.type,
  "Статус": statusLabels[r.status as RequestStatus] || r.status,
  "Замерщик": getUserName(r.measurer_id) || "",
  "Монтажник": getUserName(r.installer_id) || "",
  "Партнёр": getUserName(r.partner_id) || "",
  "Сумма": r.amount != null ? r.amount : "",
  "Межкомнатные": r.interior_doors != null ? r.interior_doors : "",
  "Входные": r.entrance_doors != null ? r.entrance_doors : "",
  "Перегородка (кол-во створок)": r.partitions != null ? r.partitions : "",
  "Дата создания": r.created_at?.split("T")[0] || "",
  "Согласованная дата": r.agreed_date?.split("T")[0] || "",
});

export async function exportToCSV(requests: ApiRequest[], getUserName: GetUserNameFn) {
  const rows = requests.map(r => formatRow(r, getUserName));
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(";"),
    ...rows.map(row => headers.map(h => `"${(row as any)[h]}"`).join(";")),
  ].join("\n");
  
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, "requests.csv");
}

export async function exportToExcel(requests: ApiRequest[], getUserName: GetUserNameFn) {
  const XLSX = await import("xlsx");
  const rows = requests.map(r => formatRow(r, getUserName));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Заявки");
  XLSX.writeFile(wb, "requests.xlsx");
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
