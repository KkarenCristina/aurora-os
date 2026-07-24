"use client";

import { useState } from "react";

export function TextList({
  items,
  onChange,
  placeholder = "Adicionar…",
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onChange([...items, value.trim()]);
    setValue("");
  }

  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-1.5">
        {items.map((item, idx) => (
          <li key={idx} className="group flex items-start gap-2.5">
            <span className="text-dawn-rose mt-1">•</span>
            <span className="flex-1 text-sm text-dawn-ink">{item}</span>
            <button
              onClick={() => remove(idx)}
              className="opacity-0 group-hover:opacity-100 text-dawn-muted hover:text-dawn-rose text-xs transition-opacity"
            >
              remover
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="text-sm text-dawn-muted italic">Nada por aqui ainda.</li>}
      </ul>
      <form onSubmit={submit} className="flex gap-2 pt-1">
        <input
          className="input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit" className="btn-secondary shrink-0">
          Adicionar
        </button>
      </form>
    </div>
  );
}
