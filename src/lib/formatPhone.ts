/**
 * Format phone input to +7 XXX XXX XX XX format.
 * Converts 8-prefix to +7 automatically.
 */
export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  // Paste over an existing "+7": "+7" + "+79161234567" -> drop duplicated prefix
  if (digits.length > 11 && /^7[78]/.test(digits)) return formatPhone(digits.slice(1));
  const d = digits.startsWith("7")
    ? digits
    : digits.startsWith("8")
    ? "7" + digits.slice(1)
    : "7" + digits;
  const limited = d.slice(0, 11);
  let result = "+7";
  if (limited.length > 1) result += " " + limited.slice(1, 4);
  if (limited.length > 4) result += " " + limited.slice(4, 7);
  if (limited.length > 7) result += " " + limited.slice(7, 9);
  if (limited.length > 9) result += " " + limited.slice(9, 11);
  return result;
};
