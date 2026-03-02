import { MapPin } from "lucide-react";

export type CityFilter = "all" | "Москва" | "Санкт-Петербург";

interface CityToggleProps {
  value: CityFilter;
  onChange: (city: CityFilter) => void;
}

const cities: { label: string; value: CityFilter }[] = [
  { label: "Все города", value: "all" },
  { label: "Москва", value: "Москва" },
  { label: "Санкт-Петербург", value: "Санкт-Петербург" },
];

const CityToggle = ({ value, onChange }: CityToggleProps) => (
  <div className="flex items-center gap-1.5 bg-card rounded-xl border border-border/50 p-1">
    {cities.map((c) => (
      <button
        key={c.value}
        onClick={() => onChange(c.value)}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          value === c.value
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        }`}
      >
        <MapPin size={14} />
        {c.label}
      </button>
    ))}
  </div>
);

export default CityToggle;
