"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { Checklist } from "@/components/ui/Checklist";
import type { Project, ProjectPhase, ProjectItem } from "@/lib/types";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPhaseTitle, setNewPhaseTitle] = useState("");
  const [newPhaseGoal, setNewPhaseGoal] = useState("");

  useEffect(() => {
    if (!user || !id) return;
    async function load() {
      const [projectRes, phasesRes] = await Promise.all([
        supabase.from("projects").select("*").eq("id", id).single(),
        supabase.from("project_phases").select("*").eq("project_id", id).order("position"),
      ]);
      setProject(projectRes.data);
      const phaseList = phasesRes.data || [];
      setPhases(phaseList);
      if (phaseList.length > 0) {
        const { data: itemsData } = await supabase
          .from("project_items")
          .select("*")
          .in("phase_id", phaseList.map((p) => p.id))
          .order("position");
        setItems(itemsData || []);
      }
      setLoading(false);
    }
    load();
  }, [user, id]);

  async function addPhase(e: React.FormEvent) {
    e.preventDefault();
    if (!newPhaseTitle.trim()) return;
    const { data } = await supabase
      .from("project_phases")
      .insert({ project_id: id, title: newPhaseTitle, goal: newPhaseGoal, position: phases.length })
      .select()
      .single();
    if (data) setPhases((prev) => [...prev, data]);
    setNewPhaseTitle("");
    setNewPhaseGoal("");
  }

  async function toggleItem(itemId: string) {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)));
    await supabase.from("project_items").update({ done: !item.done }).eq("id", itemId);
  }

  async function addItem(phaseId: string, title: string) {
    const count = items.filter((i) => i.phase_id === phaseId).length;
    const { data } = await supabase
      .from("project_items")
      .insert({ phase_id: phaseId, title, position: count })
      .select()
      .single();
    if (data) setItems((prev) => [...prev, data]);
  }

  async function removeItem(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    await supabase.from("project_items").delete().eq("id", itemId);
  }

  async function removePhase(phaseId: string) {
    setPhases((prev) => prev.filter((p) => p.id !== phaseId));
    setItems((prev) => prev.filter((i) => i.phase_id !== phaseId));
    await supabase.from("project_phases").delete().eq("id", phaseId);
  }

  if (loading) return <p className="text-dawn-muted">Carregando…</p>;
  if (!project) return <p className="text-dawn-muted">Projeto não encontrado.</p>;

  return (
    <div className="space-y-8 pb-16">
      <button onClick={() => router.push("/projetos")} className="btn-ghost -ml-3">
        ← Voltar para projetos
      </button>

      <div>
        <span className="text-4xl">{project.icon}</span>
        <h1 className="page-title mt-2">{project.title}</h1>
        <p className="text-dawn-muted mt-1">{project.description}</p>
      </div>

      <div className="space-y-5">
        {phases.map((phase) => (
          <div key={phase.id} className="card p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg">{phase.title}</h2>
                {phase.goal && <p className="text-sm text-dawn-muted mt-0.5">🎯 {phase.goal}</p>}
              </div>
              <button onClick={() => removePhase(phase.id)} className="btn-ghost text-xs shrink-0">
                remover fase
              </button>
            </div>
            <div className="mt-4">
              <Checklist
                items={items.filter((i) => i.phase_id === phase.id).map((i) => ({ id: i.id, title: i.title, done: i.done }))}
                onToggle={toggleItem}
                onAdd={(title) => addItem(phase.id, title)}
                onRemove={removeItem}
                placeholder="Adicionar passo/tarefa desta fase…"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg mb-3">+ Nova fase do projeto</h2>
        <form onSubmit={addPhase} className="space-y-3">
          <input
            className="input"
            placeholder="Nome da fase (ex: Fase 1 — Criar o hábito)"
            value={newPhaseTitle}
            onChange={(e) => setNewPhaseTitle(e.target.value)}
          />
          <input
            className="input"
            placeholder="Meta da fase (opcional)"
            value={newPhaseGoal}
            onChange={(e) => setNewPhaseGoal(e.target.value)}
          />
          <button type="submit" className="btn-secondary">
            Adicionar fase
          </button>
        </form>
      </div>
    </div>
  );
}
