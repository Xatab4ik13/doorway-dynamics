// Mock data for dashboard frontend (will be replaced by real API later)

export type RequestStatus =
  | "new"
  | "assigned"
  | "measurement_done"
  | "installation_scheduled"
  | "installation_done"
  | "closed";

export const statusLabels: Record<RequestStatus, string> = {
  new: "Новая",
  assigned: "Назначена",
  measurement_done: "Замер выполнен",
  installation_scheduled: "Монтаж назначен",
  installation_done: "Монтаж выполнен",
  closed: "Закрыта",
};

export const statusColors: Record<RequestStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  assigned: "bg-amber-100 text-amber-700",
  measurement_done: "bg-purple-100 text-purple-700",
  installation_scheduled: "bg-orange-100 text-orange-700",
  installation_done: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-500",
};

export type RequestType = "measurement" | "installation" | "reclamation";

export const requestTypeLabels: Record<RequestType, string> = {
  measurement: "Замер",
  installation: "Монтаж",
  reclamation: "Рекламация",
};

export interface ServiceRequest {
  id: string;
  type: RequestType;
  status: RequestStatus;
  clientName: string;
  clientPhone: string;
  address: string;
  date: string;
  assignedTo?: string;
  assignedRole?: "measurer" | "installer";
  comment?: string;
  files?: string[];
}

export const mockRequests: ServiceRequest[] = [
  { id: "REQ-001", type: "measurement", status: "new", clientName: "Иванов И.И.", clientPhone: "+7 900 111-22-33", address: "ул. Ленина, 15, кв. 42", date: "2026-02-10" },
  { id: "REQ-002", type: "measurement", status: "assigned", clientName: "Петрова А.С.", clientPhone: "+7 900 222-33-44", address: "пр. Мира, 88, кв. 7", date: "2026-02-09", assignedTo: "Сидоров К.В.", assignedRole: "measurer" },
  { id: "REQ-003", type: "installation", status: "measurement_done", clientName: "Козлов Д.М.", clientPhone: "+7 900 333-44-55", address: "ул. Гагарина, 3, кв. 101", date: "2026-02-08", assignedTo: "Сидоров К.В.", assignedRole: "measurer" },
  { id: "REQ-004", type: "installation", status: "installation_scheduled", clientName: "Михайлова Е.В.", clientPhone: "+7 900 444-55-66", address: "ул. Пушкина, 22, кв. 5", date: "2026-02-07", assignedTo: "Бригада №3", assignedRole: "installer" },
  { id: "REQ-005", type: "installation", status: "installation_done", clientName: "Новиков А.А.", clientPhone: "+7 900 555-66-77", address: "пр. Победы, 10, кв. 33", date: "2026-02-05", assignedTo: "Бригада №1", assignedRole: "installer" },
  { id: "REQ-006", type: "reclamation", status: "new", clientName: "Волкова М.И.", clientPhone: "+7 900 666-77-88", address: "ул. Советская, 44, кв. 12", date: "2026-02-11" },
  { id: "REQ-007", type: "measurement", status: "closed", clientName: "Кузнецов П.П.", clientPhone: "+7 900 777-88-99", address: "ул. Лесная, 7, кв. 2", date: "2026-01-28", assignedTo: "Сидоров К.В.", assignedRole: "measurer" },
  { id: "REQ-008", type: "installation", status: "closed", clientName: "Соколова Н.Р.", clientPhone: "+7 900 888-99-00", address: "ул. Парковая, 19, кв. 8", date: "2026-01-25", assignedTo: "Бригада №2", assignedRole: "installer" },
  { id: "REQ-009", type: "measurement", status: "assigned", clientName: "Лебедев В.Г.", clientPhone: "+7 900 999-00-11", address: "пр. Космонавтов, 55, кв. 17", date: "2026-02-12", assignedTo: "Морозов А.И.", assignedRole: "measurer" },
  { id: "REQ-010", type: "installation", status: "new", clientName: "Егорова Т.Л.", clientPhone: "+7 900 000-11-22", address: "ул. Центральная, 1, кв. 99", date: "2026-02-12" },
];

export interface DashboardStats {
  totalRequests: number;
  newRequests: number;
  inProgress: number;
  completed: number;
  reclamations: number;
}

export const mockStats: DashboardStats = {
  totalRequests: 156,
  newRequests: 12,
  inProgress: 34,
  completed: 98,
  reclamations: 12,
};

export const mockChartData = [
  { name: "Пн", заявки: 8, выполнено: 5 },
  { name: "Вт", заявки: 12, выполнено: 9 },
  { name: "Ср", заявки: 6, выполнено: 7 },
  { name: "Чт", заявки: 15, выполнено: 11 },
  { name: "Пт", заявки: 10, выполнено: 8 },
  { name: "Сб", заявки: 4, выполнено: 6 },
  { name: "Вс", заявки: 2, выполнено: 3 },
];

export const mockFunnelData = [
  { stage: "Новые заявки", value: 156, fill: "hsl(217, 91%, 50%)" },
  { stage: "Назначены", value: 120, fill: "hsl(38, 92%, 50%)" },
  { stage: "Замер выполнен", value: 98, fill: "hsl(280, 65%, 50%)" },
  { stage: "Монтаж назначен", value: 78, fill: "hsl(25, 95%, 53%)" },
  { stage: "Монтаж выполнен", value: 65, fill: "hsl(142, 71%, 45%)" },
  { stage: "Закрыты", value: 58, fill: "hsl(220, 10%, 50%)" },
];

export const mockTopEmployees = [
  { name: "Сидоров К.В.", role: "Замерщик", completed: 24 },
  { name: "Морозов А.И.", role: "Замерщик", completed: 19 },
  { name: "Бригада №1", role: "Монтажники", completed: 18 },
  { name: "Бригада №3", role: "Монтажники", completed: 15 },
  { name: "Бригада №2", role: "Монтажники", completed: 12 },
];

export type UserRole = "admin" | "manager" | "measurer" | "installer" | "partner";

export const roleLabels: Record<UserRole, string> = {
  admin: "Администратор",
  manager: "Менеджер",
  measurer: "Замерщик",
  installer: "Монтажник",
  partner: "Партнёр",
};

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export const mockUsers: UserAccount[] = [
  { id: "U-001", name: "Корженевский М.А.", email: "admin@primedoor.ru", role: "admin", active: true, createdAt: "2024-01-15" },
  { id: "U-002", name: "Смирнова Е.П.", email: "manager@primedoor.ru", role: "manager", active: true, createdAt: "2024-03-10" },
  { id: "U-003", name: "Сидоров К.В.", email: "sidorov@primedoor.ru", role: "measurer", active: true, createdAt: "2024-05-20" },
  { id: "U-004", name: "Морозов А.И.", email: "morozov@primedoor.ru", role: "measurer", active: true, createdAt: "2024-06-01" },
  { id: "U-005", name: "Бригада №1", email: "brigade1@primedoor.ru", role: "installer", active: true, createdAt: "2024-02-01" },
  { id: "U-006", name: "Бригада №2", email: "brigade2@primedoor.ru", role: "installer", active: true, createdAt: "2024-02-15" },
  { id: "U-007", name: "Бригада №3", email: "brigade3@primedoor.ru", role: "installer", active: true, createdAt: "2024-04-10" },
  { id: "U-008", name: "ООО РемонтПро", email: "partner@remontpro.ru", role: "partner", active: true, createdAt: "2025-01-10" },
  { id: "U-009", name: "ИП Строев", email: "stroev@mail.ru", role: "partner", active: false, createdAt: "2025-06-15" },
];
