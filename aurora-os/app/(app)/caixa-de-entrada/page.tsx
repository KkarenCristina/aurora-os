"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/useAuth";
import type { InboxItem } from "@/lib/types";

export default function CaixaDeEntradaPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("inbox_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setItems(data || []);
        setLoading(false);
      });
  }, [user]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !value.trim()) return;
    const { data } = await supabase
      .from("inbox_items")
      .insert({ user_id: user.id, content: value.trim() })
      .select()
      .single();
    if (data) setItems((prev) => [data, ...prev]);
    setValue("");
  }

  async function toggle(item: InboxItem) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i)));
    await supabase.from("inbox_items").update({ done: !item.done }).eq("id", item.id);
  }

  async function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await supabase.from("inbox_items").delete().eq("id", id);
  }

  return (
    <div className="space-y-6 pb-16">
      <div>
        <p className="section-eyebrow mb-1">Caixa de Entrada</p>
        <h1 className="page-title">Um lugar para soltar ideias antes de organizá-las</h1>
      </div>

      <form onSubmit={add} className="card p-4 flex gap-2">
        <input
          className="input"
          placeholder="Anote algo rápido, uma ideia, um lembrete…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit" className="btn-primary shrink-0">
          Adicionar
        </button>
      </form>

      {loading ? (
        <p className="text-dawn-muted">Carregando…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-dawn-muted">Sua caixa de entrada está vazia. 🌿</p>
      ) : (
        <div className="card divide-y divide-dawn-border">
          {items.map((item) => (
            <div key={item.id} className="group flex items-center gap-3 px-5 py-3">
              <input type="checkbox" className="checkbox" checked={item.done} onChange={() => toggle(item)} />
              <span className={`flex-1 text-sm ${item.done ? "line-through text-dawn-muted" : ""}`}>{item.content}</span>
              <button
                onClick={() => remove(item.id)}
                className="opacity-0 group-hover:opacity-100 text-dawn-muted hover:text-dawn-rose text-xs"
              >
                remover
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
