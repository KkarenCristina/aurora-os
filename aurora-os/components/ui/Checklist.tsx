"use client";

import { useState } from "react";

export type ChecklistEntry = { id: string; title: string; done: boolean };

export function Checklist({
  items,
  onToggle,
  onAdd,
  onRemove,
  placeholder = "Adicionar item…",
}: {
  items: ChecklistEntry[];
  onToggle: (id: string) => void;
  onAdd: (title: string) => void;
  onRemove?: (id: string) => void;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue("");
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id} className="group flex items-center gap-2.5">
            <input
              type="checkbox"
              className="checkbox"
              checked={item.done}
              onChange={() => onToggle(item.id)}
            />
            <span className={`flex-1 text-sm ${item.done ? "line-through text-dawn-muted" : "text-dawn-ink"}`}>
              {item.title}
            </span>
            {onRemove && (
              <button
                onClick={() => onRemove(item.id)}
                className="opacity-0 group-hover:opacity-100 text-dawn-muted hover:text-dawn-rose text-xs transition-opacity"
              >
                remover
              </button>
            )}
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
