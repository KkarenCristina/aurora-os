"use client";

import { MONTH_NAMES } from "@/lib/months";

export function MonthTabs({
  months,
  active,
  onChange,
}: {
  months: string[];
  active: string;
  onChange: (month: string) => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {months.map((m) => {
        const [, month] = m.split("-").map(Number);
        const label = MONTH_NAMES[month - 1];
        const isActive = m === active;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive ? "bg-dawn-indigo text-white" : "bg-white border border-dawn-border text-dawn-ink hover:border-dawn-indigo"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
