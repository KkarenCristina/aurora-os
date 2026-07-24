"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { Checklist } from "@/components/ui/Checklist";
import type { Goal } from "@/lib/types";

const CATEGORIES: { key: Goal["category"]; label: string; icon: string; hint: string }[] = [
  { key: "foco", label: "Objetivos em foco", icon: "🔥", hint: "Os que recebem sua atenção agora." },
  { key: "2026", label: "Metas de 2026", icon: "📅", hint: "" },
  { key: "2027", label: "Metas de 2027", icon: "📅", hint: "" },
  { key: "antes_30", label: "Objetivos antes dos 30 anos", icon: "🌟", hint: "" },
  { key: "sonhos", label: "Sonhos de vida", icon: "💭", hint: "" },
];

export default function ObjetivosPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("position")
      .then(({ data }) => {
        setGoals(data || []);
        setLoading(false);
      });
  }, [user]);

  async function toggle(id: string) {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g)));
    await supabase.from("goals").update({ done: !goal.done }).eq("id", id);
  }

  async function add(category: Goal["category"], title: string) {
    if (!user) return;
    const position = goals.filter((g) => g.category === category).length;
    const { data } = await supabase
      .from("goals")
      .insert({ user_id: user.id, category, title, position })
      .select()
      .single();
    if (data) setGoals((prev) => [...prev, data]);
  }

  async function remove(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    await supabase.from("goals").delete().eq("id", id);
  }

  if (loading) return <p className="text-dawn-muted">Carregando…</p>;

  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="section-eyebrow mb-1">Objetivos</p>
        <h1 className="page-title">Todo grande resultado começa com uma direção clara</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className="card p-6">
            <h2 className="font-display text-lg mb-1">
              {cat.icon} {cat.label}
            </h2>
            {cat.hint && <p className="text-sm text-dawn-muted mb-3">{cat.hint}</p>}
            <Checklist
              items={goals
                .filter((g) => g.category === cat.key)
                .map((g) => ({ id: g.id, title: g.title, done: g.done }))}
              onToggle={toggle}
              onAdd={(title) => add(cat.key, title)}
              onRemove={remove}
              placeholder="Adicionar objetivo…"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
