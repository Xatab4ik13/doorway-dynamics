import { Phone } from "lucide-react";
import { Link } from "react-router-dom";

const FloatingPhone = () => {
  return (
    <Link
      to="/contacts"
      className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-foreground flex items-center justify-center hover:scale-110 transition-all duration-500 group shadow-[0_4px_24px_rgba(255,255,255,0.15)]"
      style={{
        animation: "gentle-pulse 6s ease-in-out infinite",
      }}
      aria-label="Контакты"
    >
      <Phone className="w-6 h-6 text-background" strokeWidth={1.5} />
      <style>{`
        @keyframes gentle-pulse {
          0%, 85%, 100% { transform: scale(1); opacity: 1; }
          90% { transform: scale(1.08); opacity: 0.9; }
          95% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </Link>
  );
};

export default FloatingPhone;
