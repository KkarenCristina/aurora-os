"use client";

export function Stars({
  value,
  onChange,
  size = "text-base",
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: string;
}) {
  return (
    <div className={`flex gap-0.5 ${size}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n === value ? 0 : n)}
          className={`${onChange ? "cursor-pointer" : "cursor-default"} ${
            n <= value ? "text-dawn-gold" : "text-dawn-border"
          }`}
          aria-label={`${n} estrelas`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
