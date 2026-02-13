import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

const COOKIE_KEY = "primedoor_cookie_consent";

export function getCookieConsent(): boolean {
  return localStorage.getItem(COOKIE_KEY) === "accepted";
}

export function getSavedCity(): string | null {
  if (!getCookieConsent()) return null;
  return localStorage.getItem("primedoor_city");
}

export function saveCity(city: string) {
  if (getCookieConsent()) {
    localStorage.setItem("primedoor_city", city);
  }
}

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl px-6 py-4 flex items-center justify-between gap-4 shadow-lg backdrop-blur-sm">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Мы используем cookie для улучшения работы сайта и запоминания ваших предпочтений.
              Продолжая использовать сайт, вы соглашаетесь с{" "}
              <Link to="/privacy" className="underline hover:text-foreground transition-colors">
                политикой конфиденциальности
              </Link>.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={accept}
                className="px-5 py-2 bg-foreground text-background rounded-xl text-xs font-medium hover:opacity-90 transition-opacity"
              >
                Принять
              </button>
              <button
                onClick={accept}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
                aria-label="Закрыть"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
