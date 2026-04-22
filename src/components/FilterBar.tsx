"use client";
 
interface FilterBarProps {
  filter: "all" | "food" | "stuff";
  onFilterChange: (filter: "all" | "food" | "stuff") => void;
  counts?: { all: number; food: number; stuff: number };
}
 
export default function FilterBar({ filter, onFilterChange, counts }: FilterBarProps) {
  const buttons = [
    { key: "all" as const, label: "All Events" },
    { key: "food" as const, label: "Free Food" },
    { key: "stuff" as const, label: "Free Stuff" },
  ];
 
  return (
    <div className="flex gap-3">
      {buttons.map((btn) => (
        <button
          key={btn.key}
          onClick={() => onFilterChange(btn.key)}
          className={`text-base font-semibold px-6 py-3 rounded-xl transition-all duration-200 ${
            filter === btn.key
              ? "bg-[var(--dark)] text-white shadow-md"
              : "bg-white text-[var(--text-secondary)] border border-[var(--card-border)] hover:border-[var(--dark)] hover:text-[var(--text-primary)]"
          }`}
        >
          {btn.label}
          {counts && (
            <span className={`ml-2 text-xs font-mono ${
              filter === btn.key ? "text-white/70" : "text-[var(--text-secondary)]"
            }`}>
              {counts[btn.key]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
 