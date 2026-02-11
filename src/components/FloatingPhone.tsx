import { Phone } from "lucide-react";
import { Link } from "react-router-dom";

const FloatingPhone = () => {
  return (
    <Link
      to="/contacts"
      className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-foreground flex items-center justify-center hover:scale-110 transition-all duration-500 group shadow-[0_4px_24px_rgba(255,255,255,0.15)] animate-[pulse_2.5s_ease-in-out_infinite]"
      aria-label="Контакты"
    >
      <Phone className="w-6 h-6 text-background" strokeWidth={1.5} />
    </Link>
  );
};

export default FloatingPhone;
