/**
 * Trigger haptic feedback via the Vibration API (supported on Android Chrome and some iOS browsers).
 * Falls back silently on unsupported devices.
 */
export function triggerHaptic(intensity: "light" | "medium" | "heavy" = "light") {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;

  const patterns: Record<string, number> = {
    light: 10,
    medium: 20,
    heavy: 40,
  };

  try {
    navigator.vibrate(patterns[intensity]);
  } catch {
    // Silently fail
  }
}
