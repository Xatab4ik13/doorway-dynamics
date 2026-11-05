// Фирменный набор иконок PrimeDoor CRM.
// Единый стиль: viewBox 24, stroke 1.5, круглые окончания, фирменные детали (дверь, рулетка).
// Не генерировать ИИ — каждая иконка нарисована вручную под смысл раздела.

interface IconProps {
  size?: number;
  className?: string;
}

const Base = ({ size = 20, className, children }: IconProps & { children: React.ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

/** Дашборд — четыре панели, одна акцентная */
export const IconDashboard = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="3" width="8" height="10" rx="2" />
    <rect x="13" y="3" width="8" height="6" rx="2" />
    <rect x="13" y="11" width="8" height="10" rx="2" />
    <rect x="3" y="15" width="8" height="6" rx="2" />
  </Base>
);

/** Заявки — дверь с ручкой и стрелкой входа */
export const IconRequests = (p: IconProps) => (
  <Base {...p}>
    <path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
    <path d="M13 3l6 2v14l-6 2V3z" />
    <circle cx="15.5" cy="12" r="0.6" fill="currentColor" stroke="none" />
  </Base>
);

/** Календарь — с акцентной точкой события */
export const IconCalendar = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M3 10h18" />
    <path d="M8 3v4M16 3v4" />
    <circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
  </Base>
);

/** Занятость — человек с галочкой */
export const IconAvailability = (p: IconProps) => (
  <Base {...p}>
    <circle cx="10" cy="7.5" r="3.5" />
    <path d="M3.5 20c.8-3.4 3.4-5 6.5-5s5.7 1.6 6.5 5" />
    <path d="M15.5 9.5l1.8 1.8 3.2-3.5" />
  </Base>
);

/** Сметы — документ со строками и суммой */
export const IconEstimate = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 3h8l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
    <path d="M14 3v4h4" />
    <path d="M8 12h8M8 15.5h5" />
    <path d="M14.5 18.5h2" />
  </Base>
);

/** Папка — сохранённые сметы */
export const IconFolder = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    <path d="M3 10.5h18" />
  </Base>
);

/** Аккаунты — две фигуры */
export const IconUsers = (p: IconProps) => (
  <Base {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19.5c.7-3 2.9-4.5 5.5-4.5s4.8 1.5 5.5 4.5" />
    <path d="M15.5 5.2a3.2 3.2 0 0 1 0 5.8" />
    <path d="M17.5 15.3c1.6.7 2.7 2 3 4.2" />
  </Base>
);

/** Партнёры — рукопожатие (упрощённое, два звена) */
export const IconPartners = (p: IconProps) => (
  <Base {...p}>
    <path d="M8 12l-2.5-2.5a2.1 2.1 0 0 1 3-3L11 9" />
    <path d="M16 12l2.5-2.5a2.1 2.1 0 0 0-3-3L13 9" />
    <path d="M8 12l3.5 3.5a2.1 2.1 0 0 0 3 0L16 12" />
    <path d="M11 9l2 2" />
  </Base>
);

/** Новости — газета */
export const IconNews = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 5h13a1 1 0 0 1 1 1v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5z" />
    <path d="M18 9h2a1 1 0 0 1 1 1v8a2 2 0 0 1-2 2" />
    <path d="M7 9h7M7 12.5h7M7 16h4" />
  </Base>
);

/** Замер — рулетка с делениями */
export const IconMeasure = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 17L17 3l4 4L7 21l-4-4z" />
    <path d="M8 12l1.5 1.5M11 9l1.5 1.5M14 6l1.5 1.5" />
  </Base>
);

/** Монтаж — дверь с ключом-шуруповёртом */
export const IconInstall = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 21V5a2 2 0 0 1 2-2h7l5 3v15" />
    <path d="M5 21h14" />
    <circle cx="15.5" cy="12" r="0.6" fill="currentColor" stroke="none" />
    <path d="M9 9.5l3 3M9 12.5l3-3" />
  </Base>
);

/** История — стрелка назад по кругу */
export const IconHistory = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 12a8 8 0 1 1 2.3 5.7" />
    <path d="M4 17v-5h5" transform="translate(0 -0.5)" />
    <path d="M12 8v4l3 2" />
  </Base>
);

/** Просмотр — глаз */
export const IconEye = (p: IconProps) => (
  <Base {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </Base>
);

/** Новая заявка — плюс в круге с обрывом */
export const IconPlus = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" strokeDasharray="40 13.4" />
    <path d="M12 8.5v7M8.5 12h7" />
  </Base>
);

/** Файлы — загрузка в облако-лоток */
export const IconUpload = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 15V4" />
    <path d="M7.5 8.5L12 4l4.5 4.5" />
    <path d="M4 15v3.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V15" />
  </Base>
);

/** Распределение — человек со стрелкой к человеку */
export const IconAssign = (p: IconProps) => (
  <Base {...p}>
    <circle cx="7" cy="8" r="3" />
    <path d="M2.5 19c.6-2.7 2.4-4 4.5-4 1 0 1.9.3 2.6.8" />
    <circle cx="17" cy="15.5" r="2.5" />
    <path d="M13.5 21c.5-2 1.8-3 3.5-3s3 1 3.5 3" />
    <path d="M13 8h6M17 6l2 2-2 2" />
  </Base>
);
