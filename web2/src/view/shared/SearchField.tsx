import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
  label?: string;
  placeholder?: string;
}

export default function SearchField({ value, onChange, compact = false, label = "Search instruments", placeholder }: Props) {
  return (
    <label className={"search " + (compact ? "compact" : "")}>
      <Search size={19} />
      <input
        aria-label={label}
        placeholder={placeholder ?? (compact ? "Search..." : "Search symbol or name... e.g. EUR, BTC, Gold")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
