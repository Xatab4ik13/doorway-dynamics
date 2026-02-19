import { type FC } from "react";

type Messenger = { type: "telegram" | "max"; url: string };

const messengerMap: Record<string, Messenger[]> = {
  "+79261663062": [
    { type: "telegram", url: "https://t.me/PD_Service" },
    { type: "max", url: "https://max.ru/u/f9LHodD0cOLIvry1-66f_3D9SseEB1XsH1CUVHXqu0eYaqP8JyVfgotT5TQ" },
  ],
  "+79255700609": [
    { type: "telegram", url: "https://t.me/Montage001_Msk" },
  ],
  "+79932663504": [
    { type: "telegram", url: "https://t.me/montage001_spb" },
  ],
};

const TelegramIcon: FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M21.198 2.434a1.542 1.542 0 0 0-1.58-.236L2.408 9.644a1.545 1.545 0 0 0 .144 2.907l4.296 1.1 1.632 5.234a1.544 1.544 0 0 0 2.529.6l2.326-2.175 4.278 3.235a1.544 1.544 0 0 0 2.438-.937L21.83 3.94a1.544 1.544 0 0 0-.632-1.506ZM9.872 14.158l-.468 3.12-1.337-4.292 9.313-5.508-7.508 6.68Z"
      fill="currentColor"
    />
  </svg>
);

const MaxIcon: FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Zm3.8 14h-1.96l-1.84-3.2L10.16 16H8.2l2.88-4.6L8.4 7h1.96l1.64 2.86L13.64 7h1.96l-2.68 4.4L15.8 16Z"
      fill="currentColor"
    />
  </svg>
);

/** Normalize phone string to +7XXXXXXXXXX for lookup */
const normalize = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("8")) return "+7" + digits.slice(1);
  if (digits.startsWith("7")) return "+7" + digits.slice(1);
  return "+" + digits;
};

interface Props {
  phone: string;
  /** "light" for dark backgrounds (white icons), "dark" for light backgrounds */
  variant?: "light" | "dark";
  size?: "sm" | "md";
}

const PhoneMessengers: FC<Props> = ({ phone, variant = "dark", size = "sm" }) => {
  const key = normalize(phone);
  const links = messengerMap[key];
  if (!links?.length) return null;

  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const btnBase =
    "inline-flex items-center justify-center rounded-full transition-all duration-300";
  const btnSize = size === "sm" ? "w-6 h-6" : "w-7 h-7";

  const btnColor =
    variant === "light"
      ? "text-white/50 hover:text-white hover:bg-white/10"
      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5";

  return (
    <span className="inline-flex items-center gap-1 ml-1.5">
      {links.map((m) => (
        <a
          key={m.type}
          href={m.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnBase} ${btnSize} ${btnColor}`}
          aria-label={m.type === "telegram" ? "Telegram" : "Max"}
        >
          {m.type === "telegram" ? (
            <TelegramIcon className={iconSize} />
          ) : (
            <MaxIcon className={iconSize} />
          )}
        </a>
      ))}
    </span>
  );
};

export default PhoneMessengers;
