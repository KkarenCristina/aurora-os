"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { TextList } from "@/components/ui/TextList";
import { Checklist } from "@/components/ui/Checklist";
import { formatDateBR } from "@/lib/months";
import type { LifeNotes } from "@/lib/types";

export default function VidaPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<LifeNotes | null>(null);
  const [gratitude, setGratitude] = useState<{ id: string; content: string; entry_date: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [notesRes, gratitudeRes] = await Promise.all([
        supabase.from("life_notes").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("gratitude_entries").select("*").eq("user_id", user.id).order("entry_date", { ascending: false }).limit(20),
      ]);
      setNotes(
        notesRes.data || {
          user_id: user.id,
          o_que_faz_bem: [],
          experiencias_quero_viver: [],
          hobbies: [],
          pequenas_alegrias: [],
          momentos_especiais: [],
        }
      );
      setGratitude(gratitudeRes.data || []);
      setLoading(false);
    }
    load();
  }, [user]);

  async function persist(updated: LifeNotes) {
    if (!user) return;
    setNotes(updated);
    await supabase.from("life_notes").upsert({ ...updated, updated_at: new Date().toISOString() });
  }

  async function addGratitude(content: string) {
    if (!user) return;
    const { data } = await supabase.from("gratitude_entries").insert({ user_id: user.id, content }).select().single();
    if (data) setGratitude((prev) => [data, ...prev]);
  }

  async function removeGratitude(id: string) {
    setGratitude((prev) => prev.filter((g) => g.id !== id));
    await supabase.from("gratitude_entries").delete().eq("id", id);
  }

  if (loading || !notes) return <p className="text-dawn-muted">Carregando…</p>;

  const experienceItems = notes.experiencias_quero_viver.map((e, idx) => ({
    id: String(idx),
    title: e.title,
    done: e.done,
  }));

  function toggleExperience(id: string) {
    const idx = Number(id);
    const updated = notes.experiencias_quero_viver.map((e, i) => (i === idx ? { ...e, done: !e.done } : e));
    persist({ ...notes, experiencias_quero_viver: updated });
  }

  function addExperience(title: string) {
    persist({ ...notes, experiencias_quero_viver: [...notes.experiencias_quero_viver, { title, done: false }] });
  }

  function removeExperience(id: string) {
    const idx = Number(id);
    persist({ ...notes, experiencias_quero_viver: notes.experiencias_quero_viver.filter((_, i) => i !== idx) });
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="section-eyebrow mb-1">Vida</p>
        <h1 className="page-title">
          Uma vida feliz não é construída apenas por grandes conquistas, mas pelos pequenos momentos vividos todos os dias
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-display text-lg mb-3">🌱 O que faz bem para mim</h2>
          <TextList items={notes.o_que_faz_bem} onChange={(v) => persist({ ...notes, o_que_faz_bem: v })} placeholder="Adicionar…" />
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg mb-3">🌍 Experiências que quero viver</h2>
          <Checklist
            items={experienceItems}
            onToggle={toggleExperience}
            onAdd={addExperience}
            onRemove={removeExperience}
            placeholder="Adicionar experiência desejada…"
          />
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg mb-3">🎨 Hobbies que quero fazer</h2>
          <TextList items={notes.hobbies} onChange={(v) => persist({ ...notes, hobbies: v })} placeholder="Adicionar hobby…" />
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg mb-3">🌈 Pequenas alegrias</h2>
          <TextList
            items={notes.pequenas_alegrias}
            onChange={(v) => persist({ ...notes, pequenas_alegrias: v })}
            placeholder="Coisas simples que te fazem feliz…"
          />
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg mb-3">🌟 Momentos especiais</h2>
          <TextList
            items={notes.momentos_especiais}
            onChange={(v) => persist({ ...notes, momentos_especiais: v })}
            placeholder="Registre um acontecimento marcante…"
          />
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg mb-3">🙏 Gratidão</h2>
          <ul className="space-y-1.5 mb-3 max-h-56 overflow-y-auto">
            {gratitude.map((g) => (
              <li key={g.id} className="group flex items-start gap-2.5 text-sm">
                <span className="text-dawn-muted font-mono text-xs shrink-0 mt-0.5">{formatDateBR(g.entry_date)}</span>
                <span className="flex-1">{g.content}</span>
                <button
                  onClick={() => removeGratitude(g.id)}
                  className="opacity-0 group-hover:opacity-100 text-dawn-muted hover:text-dawn-rose text-xs"
                >
                  remover
                </button>
              </li>
            ))}
            {gratitude.length === 0 && <li className="text-sm text-dawn-muted italic">Hoje sou grata por…</li>}
          </ul>
          <GratitudeForm onAdd={addGratitude} />
        </div>
      </div>
    </div>
  );
}

function GratitudeForm({ onAdd }: { onAdd: (v: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return;
        onAdd(value.trim());
        setValue("");
      }}
      className="flex gap-2"
    >
      <input className="input" placeholder="Hoje sou grata por…" value={value} onChange={(e) => setValue(e.target.value)} />
      <button type="submit" className="btn-secondary shrink-0">
        Adicionar
      </button>
    </form>
  );
}
