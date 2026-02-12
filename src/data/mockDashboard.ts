// Mock data for dashboard frontend (will be replaced by real API later)

export type RequestStatus =
  | "new"
  | "assigned"
  | "date_agreed"
  | "measurement_done"
  | "installation_scheduled"
  | "installation_done"
  | "closed";

export const statusLabels: Record<RequestStatus, string> = {
  new: "Новая",
  assigned: "Назначена",
  date_agreed: "Дата согласована",
  measurement_done: "Замер выполнен",
  installation_scheduled: "Монтаж назначен",
  installation_done: "Монтаж выполнен",
  closed: "Закрыта",
};

export const statusColors: Record<RequestStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  assigned: "bg-amber-100 text-amber-700",
  date_agreed: "bg-cyan-100 text-cyan-700",
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

export type RequestSource = "site" | "partner";

export const sourceLabels: Record<RequestSource, string> = {
  site: "Сайт",
  partner: "Партнёр",
};

export interface ServiceRequest {
  id: string;
  type: RequestType;
  status: RequestStatus;
  clientName: string;
  clientPhone: string;
  extraName?: string;
  extraPhone?: string;
  address: string;
  city: string;
  workDescription?: string;
  date: string;
  agreedDate?: string;
  assignedTo?: string;
  assignedRole?: "measurer" | "installer";
  comment?: string;
  files?: string[];
  executorFiles?: string[];
  source: RequestSource;
  partnerName?: string;
}

export const mockRequests: ServiceRequest[] = [
  { id: "REQ-001", type: "measurement", status: "new", clientName: "Иванов Иван Иванович", clientPhone: "+7 900 111 22 33", extraName: "Иванова Мария Петровна", extraPhone: "+7 900 111 22 34", address: "ул. Ленина, 15, кв. 42", city: "Москва", workDescription: "Замер межкомнатных дверей, 3 проёма", date: "2026-02-10", source: "site" },
  { id: "REQ-002", type: "measurement", status: "assigned", clientName: "Петрова Анна Сергеевна", clientPhone: "+7 900 222 33 44", extraName: "Петров Дмитрий Олегович", extraPhone: "+7 900 222 33 45", address: "пр. Мира, 88, кв. 7", city: "Москва", workDescription: "Замер входной двери, нестандартный проём", date: "2026-02-09", assignedTo: "Сидоров К.В.", assignedRole: "measurer", agreedDate: "2026-02-14", source: "partner", partnerName: "ООО РемонтПро" },
  { id: "REQ-003", type: "installation", status: "measurement_done", clientName: "Козлов Дмитрий Михайлович", clientPhone: "+7 900 333 44 55", address: "ул. Гагарина, 3, кв. 101", city: "Санкт-Петербург", workDescription: "Монтаж 2 межкомнатных дверей, демонтаж старых", date: "2026-02-08", assignedTo: "Сидоров К.В.", assignedRole: "measurer", executorFiles: ["замер_схема.pdf", "photo_проём_1.jpg"], source: "site" },
  { id: "REQ-004", type: "installation", status: "installation_scheduled", clientName: "Михайлова Елена Владимировна", clientPhone: "+7 900 444 55 66", extraName: "Михайлов Сергей Анатольевич", extraPhone: "+7 900 444 55 67", address: "ул. Пушкина, 22, кв. 5", city: "Москва", workDescription: "Монтаж входной двери с электрозамком", date: "2026-02-07", assignedTo: "Бригада №3", assignedRole: "installer", agreedDate: "2026-02-15", source: "partner", partnerName: "ИП Строев" },
  { id: "REQ-005", type: "installation", status: "installation_done", clientName: "Новиков Алексей Александрович", clientPhone: "+7 900 555 66 77", address: "пр. Победы, 10, кв. 33", city: "Москва", workDescription: "Монтаж 4 межкомнатных дверей", date: "2026-02-05", assignedTo: "Бригада №1", assignedRole: "installer", executorFiles: ["до_монтажа_1.jpg", "после_монтажа_1.jpg", "после_монтажа_2.jpg"], source: "site" },
  { id: "REQ-006", type: "reclamation", status: "new", clientName: "Волкова Марина Игоревна", clientPhone: "+7 900 666 77 88", address: "ул. Советская, 44, кв. 12", city: "Санкт-Петербург", workDescription: "Скрипит дверь после монтажа, не закрывается плотно", date: "2026-02-11", source: "site" },
  { id: "REQ-007", type: "measurement", status: "closed", clientName: "Кузнецов Павел Петрович", clientPhone: "+7 900 777 88 99", extraName: "Кузнецова Ольга Николаевна", extraPhone: "+7 900 777 89 00", address: "ул. Лесная, 7, кв. 2", city: "Москва", workDescription: "Замер для 5 межкомнатных дверей в новостройке", date: "2026-01-28", assignedTo: "Сидоров К.В.", assignedRole: "measurer", source: "site" },
  { id: "REQ-008", type: "installation", status: "closed", clientName: "Соколова Наталья Романовна", clientPhone: "+7 900 888 99 00", address: "ул. Парковая, 19, кв. 8", city: "Москва", workDescription: "Монтаж 2 дверей с фрамугой", date: "2026-01-25", assignedTo: "Бригада №2", assignedRole: "installer", executorFiles: ["результат_1.jpg", "результат_2.jpg"], source: "partner", partnerName: "ООО РемонтПро" },
  { id: "REQ-009", type: "measurement", status: "assigned", clientName: "Лебедев Виктор Геннадьевич", clientPhone: "+7 900 999 00 11", address: "пр. Космонавтов, 55, кв. 17", city: "Санкт-Петербург", workDescription: "Замер входной и 2 межкомнатных дверей", date: "2026-02-12", assignedTo: "Морозов А.И.", assignedRole: "measurer", source: "site" },
  { id: "REQ-010", type: "installation", status: "new", clientName: "Егорова Татьяна Леонидовна", clientPhone: "+7 900 000 11 22", extraName: "Егоров Андрей Викторович", extraPhone: "+7 900 000 11 23", address: "ул. Центральная, 1, кв. 99", city: "Москва", workDescription: "Монтаж 3 межкомнатных дверей, подготовка проёмов", date: "2026-02-12", source: "partner", partnerName: "ООО РемонтПро" },
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
  { stage: "Дата согласована", value: 105, fill: "hsl(190, 80%, 45%)" },
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
  role: UserRole;
  telegramId?: string;
  active: boolean;
  createdAt: string;
}

export const mockUsers: UserAccount[] = [
  { id: "U-001", name: "Корженевский М.А.", role: "admin", active: true, createdAt: "2024-01-15" },
  { id: "U-002", name: "Смирнова Е.П.", role: "manager", telegramId: "123456789", active: true, createdAt: "2024-03-10" },
  { id: "U-003", name: "Сидоров К.В.", role: "measurer", telegramId: "234567890", active: true, createdAt: "2024-05-20" },
  { id: "U-004", name: "Морозов А.И.", role: "measurer", telegramId: "345678901", active: true, createdAt: "2024-06-01" },
  { id: "U-005", name: "Бригада №1", role: "installer", telegramId: "456789012", active: true, createdAt: "2024-02-01" },
  { id: "U-006", name: "Бригада №2", role: "installer", telegramId: "567890123", active: true, createdAt: "2024-02-15" },
  { id: "U-007", name: "Бригада №3", role: "installer", telegramId: "678901234", active: true, createdAt: "2024-04-10" },
  { id: "U-008", name: "ООО РемонтПро", role: "partner", telegramId: "789012345", active: true, createdAt: "2025-01-10" },
  { id: "U-009", name: "ИП Строев", role: "partner", telegramId: "890123456", active: false, createdAt: "2025-06-15" },
];
