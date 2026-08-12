/**
 * Формирование корректного запроса для навигатора/карт.
 * Город подставляется только если адрес не содержит собственных
 * региональных/городских маркеров (например «Московская обл», «г Химки»).
 */

const REGION_MARKERS = [
  "обл",
  "область",
  "респ",
  "край",
  "р-н",
  "район",
  "г ",
  "г.",
  "город",
  "москва",
  "санкт-петербург",
  "мо,",
  "лен обл",
];

export const addressHasLocality = (address: string): boolean => {
  const a = (address || "").toLowerCase();
  return REGION_MARKERS.some((m) => a.includes(m));
};

export const buildMapQuery = (address?: string | null, city?: string | null): string => {
  const addr = (address || "").trim();
  if (!addr) return (city || "").trim();
  if (!city || addressHasLocality(addr)) return addr;
  return `${addr}, ${city}`;
};

export const buildMapUrl = (address?: string | null, city?: string | null): string =>
  `https://yandex.ru/maps/?text=${encodeURIComponent(buildMapQuery(address, city))}`;
