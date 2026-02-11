import { Phone } from "lucide-react";
import { Link } from "react-router-dom";

const FloatingPhone = () => {
  return (
    <Link
      to="/contacts"
      className="fixed bottom-8 right-8 z-50 w-14 h-14 border border-border bg-background/80 backdrop-blur-md flex items-center justify-center hover:bg-foreground hover:text-background transition-all duration-500 group"
      aria-label="Контакты"
    >
      <Phone className="w-5 h-5 text-foreground group-hover:text-background transition-colors duration-500" strokeWidth={1.5} />
    </Link>
  );
};

export default FloatingPhone;
