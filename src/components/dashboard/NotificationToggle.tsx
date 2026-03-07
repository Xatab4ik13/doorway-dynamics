import { Bell, BellOff, BellRing } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { toast } from "sonner";

const NotificationToggle = () => {
  const { permission, isSubscribed, isSupported, loading, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) return null;

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
      toast.success("Уведомления отключены");
    } else {
      const ok = await subscribe();
      if (ok) {
        toast.success("Уведомления включены!");
      } else if (permission === "denied") {
        toast.error("Уведомления заблокированы в настройках браузера");
      }
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-muted-foreground active:opacity-60 transition-opacity disabled:opacity-40"
      aria-label={isSubscribed ? "Отключить уведомления" : "Включить уведомления"}
    >
      {isSubscribed ? (
        <BellRing size={18} className="text-primary" />
      ) : (
        <BellOff size={18} />
      )}
    </button>
  );
};

export default NotificationToggle;
