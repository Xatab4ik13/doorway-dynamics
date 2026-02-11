import { Phone } from "lucide-react";
import { Link } from "react-router-dom";

const FloatingPhone = () => {
  return (
    <Link
      to="/contacts"
      className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full border border-border bg-background/80 backdrop-blur-md flex items-center justify-center hover:bg-foreground hover:text-background transition-all duration-500 group shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
      aria-label="Контакты"
    >
      <Phone className="w-6 h-6 text-foreground group-hover:text-background transition-colors duration-500" strokeWidth={1.5} />
    </Link>
  );
};

export default FloatingPhone;
