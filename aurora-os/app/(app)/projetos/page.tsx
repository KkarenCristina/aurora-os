"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { Modal } from "@/components/ui/Modal";
import type { Project } from "@/lib/types";

const ICONS = ["🚀", "🏃", "💼", "💰", "🇬🇧", "🎓", "🏠", "🎨", "📚", "🌍"];

export default function ProjetosPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("position")
      .then(({ data }) => {
        setProjects(data || []);
        setLoading(false);
      });
  }, [user]);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !title.trim()) return;
    const { data } = await supabase
      .from("projects")
      .insert({ user_id: user.id, title, description, icon, position: projects.length })
      .select()
      .single();
    if (data) setProjects((prev) => [...prev, data]);
    setTitle("");
    setDescription("");
    setModalOpen(false);
  }

  async function toggleActive(p: Project) {
    setProjects((prev) => prev.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x)));
    await supabase.from("projects").update({ active: !p.active }).eq("id", p.id);
  }

  if (loading) return <p className="text-dawn-muted">Carregando…</p>;

  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-eyebrow mb-1">Projetos</p>
          <h1 className="page-title">Tudo o que quero conquistar vira um plano de ação</h1>
        </div>
        <button className="btn-primary shrink-0" onClick={() => setModalOpen(true)}>
          + Novo projeto
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/projetos/${p.id}`}
            className="card p-6 hover:border-dawn-indigo transition-colors block"
          >
            <div className="flex items-start justify-between">
              <span className="text-3xl">{p.icon}</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleActive(p);
                }}
                className={`text-xs rounded-full px-2.5 py-1 font-medium ${
                  p.active ? "bg-dawn-teal/15 text-dawn-teal" : "bg-dawn-border text-dawn-muted"
                }`}
              >
                {p.active ? "Ativo" : "Pausado"}
              </button>
            </div>
            <h3 className="font-display text-lg mt-3">{p.title}</h3>
            <p className="text-sm text-dawn-muted mt-1">{p.description}</p>
          </Link>
        ))}

        {projects.length === 0 && (
          <p className="text-sm text-dawn-muted">Nenhum projeto ainda. Que tal criar o primeiro?</p>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo projeto">
        <form onSubmit={createProject} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Ícone</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`h-10 w-10 rounded-lg border text-xl flex items-center justify-center ${
                    icon === i ? "border-dawn-indigo bg-dawn-bg" : "border-dawn-border"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Título</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Descrição</label>
            <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary w-full">
            Criar projeto
          </button>
        </form>
      </Modal>
    </div>
  );
}
