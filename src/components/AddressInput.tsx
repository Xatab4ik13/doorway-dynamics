import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";

const DADATA_TOKEN = "31256c5e3b7279666a4831f6d7e07c297e2e5ae5";
const DADATA_URL = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";

interface Suggestion {
  value: string;
  unrestricted_value: string;
}

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  city?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  dropdownClassName?: string;
  error?: string;
}

const AddressInput = ({
  value,
  onChange,
  city,
  placeholder = "Адрес",
  disabled = false,
  className = "",
  dropdownClassName,
  error,
}: AddressInputProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [show, setShow] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (query.length < 3) {
        setSuggestions([]);
        setShow(false);
        return;
      }

      try {
        const body: any = { query, count: 5 };
        if (city) {
          body.from_bound = { value: "street" };
          body.to_bound = { value: "house" };
          const regionMap: Record<string, string> = {
            "Москва": "Московская",
            "Санкт-Петербург": "Ленинградская",
          };
          body.locations = [
            { city },
            ...(regionMap[city] ? [{ region: regionMap[city] }] : []),
          ];
        }

        const res = await fetch(DADATA_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Token ${DADATA_TOKEN}`,
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) return;
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setShow((data.suggestions || []).length > 0);
      } catch {
        // silently fail
      }
    },
    [city]
  );

  const handleChange = (val: string) => {
    onChange(val);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSelect = (s: Suggestion) => {
    onChange(s.value);
    setSuggestions([]);
    setShow(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => value.length >= 3 && suggestions.length > 0 && setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      <AnimatePresence>
        {show && suggestions.length > 0 && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className={
              dropdownClassName ||
              "absolute top-full left-0 right-0 z-50 bg-background border border-border shadow-lg rounded-lg overflow-hidden"
            }
          >
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                className="w-full text-left px-4 py-3 text-sm text-foreground/80 hover:bg-accent transition-colors duration-200 flex items-center gap-2"
                onMouseDown={() => handleSelect(s)}
              >
                <MapPin size={12} className="text-muted-foreground flex-shrink-0" />
                {s.value}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddressInput;
