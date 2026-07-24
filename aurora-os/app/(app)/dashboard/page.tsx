"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { SunriseArc } from "@/components/SunriseArc";
import { Checklist } from "@/components/ui/Checklist";
import type { Goal, Habit, HabitLog, Project } from "@/lib/types";

const QUOTES = [
  "Você conseguiu. Agora continue.",
  "Pequenas ações repetidas todos os dias constroem a vida que quero viver.",
  "Construa hoje a vida que você quer lembrar amanhã.",
  "Progresso, não perfeição.",
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [name, setName] = useState<string>("");
  const [dailyTasks, setDailyTasks] = useState<{ id: string; title: string; done: boolean }[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [focusGoals, setFocusGoals] = useState<Goal[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const quote = useMemo(() => QUOTES[new Date().getDate() % QUOTES.length], []);

  useEffect(() => {
    if (!user) return;
    const today = todayISO();

    async function load() {
      const [profileRes, tasksRes, habitsRes, logsRes, goalsRes, projectsRes] = await Promise.all([
        supabase.from("profiles").select("name").eq("id", user.id).maybeSingle(),
        supabase
          .from("daily_tasks")
          .select("*")
          .eq("user_id", user.id)
          .eq("task_date", today)
          .order("position"),
        supabase.from("habits").select("*").eq("user_id", user.id).eq("active", true).order("position"),
        supabase.from("habit_logs").select("*").eq("user_id", user.id).eq("log_date", today),
        supabase.from("goals").select("*").eq("user_id", user.id).eq("category", "foco").order("position"),
        supabase.from("projects").select("*").eq("user_id", user.id).eq("active", true).order("position"),
      ]);

      setName(profileRes.data?.name || "");
      setDailyTasks(tasksRes.data || []);
      setHabits(habitsRes.data || []);
      setLogs(logsRes.data || []);
      setFocusGoals(goalsRes.data || []);
      setActiveProjects(projectsRes.data || []);
      setLoading(false);
    }
    load();
  }, [user]);

  const doneHabitIds = new Set(logs.filter((l) => l.done).map((l) => l.habit_id));

  const totalItems = dailyTasks.length + habits.length;
  const doneItems = dailyTasks.filter((t) => t.done).length + doneHabitIds.size;
  const progress = totalItems > 0 ? doneItems / totalItems : 0;

  async function toggleDailyTask(id: string) {
    const task = dailyTasks.find((t) => t.id === id);
    if (!task) return;
    setDailyTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    await supabase.from("daily_tasks").update({ done: !task.done }).eq("id", id);
  }

  async function addDailyTask(title: string) {
    if (!user) return;
    const { data } = await supabase
      .from("daily_tasks")
      .insert({ user_id: user.id, title, task_date: todayISO(), position: dailyTasks.length })
      .select()
      .single();
    if (data) setDailyTasks((prev) => [...prev, data]);
  }

  async function removeDailyTask(id: string) {
    setDailyTasks((prev) => prev.filter((t) => t.id !== id));
    await supabase.from("daily_tasks").delete().eq("id", id);
  }

  async function toggleHabitToday(habitId: string) {
    if (!user) return;
    const today = todayISO();
    const existing = logs.find((l) => l.habit_id === habitId);
    if (existing) {
      const newDone = !existing.done;
      setLogs((prev) => prev.map((l) => (l.habit_id === habitId ? { ...l, done: newDone } : l)));
      await supabase.from("habit_logs").update({ done: newDone }).eq("id", existing.id);
    } else {
      const { data } = await supabase
        .from("habit_logs")
        .insert({ user_id: user.id, habit_id: habitId, log_date: today, done: true })
        .select()
        .single();
      if (data) setLogs((prev) => [...prev, data]);
    }
  }

  if (loading) {
    return <p className="text-dawn-muted">Carregando seu dia…</p>;
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="section-eyebrow mb-1">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
        </p>
        <h1 className="page-title">Bom dia{name ? `, ${name}` : ""}! ☀️</h1>
        <p className="text-dawn-muted mt-1">Construa hoje a vida que você quer lembrar amanhã.</p>
      </div>

      <div className="card p-6">
        <SunriseArc progress={progress} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-display text-lg mb-3">✅ Hoje eu vou</h2>
          <Checklist
            items={dailyTasks.map((t) => ({ id: t.id, title: t.title, done: t.done }))}
            onToggle={toggleDailyTask}
            onAdd={addDailyTask}
            onRemove={removeDailyTask}
            placeholder="O que você vai fazer hoje?"
          />
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg mb-3">❤️ Hábitos de hoje</h2>
          {habits.length === 0 ? (
            <p className="text-sm text-dawn-muted">
              Nenhum hábito cadastrado ainda.{" "}
              <Link href="/tarefas" className="text-dawn-indigo font-semibold hover:underline">
                Criar hábitos
              </Link>
            </p>
          ) : (
            <ul className="space-y-1.5">
              {habits.map((h) => (
                <li key={h.id} className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={doneHabitIds.has(h.id)}
                    onChange={() => toggleHabitToday(h.id)}
                  />
                  <span className="text-sm">
                    {h.icon} {h.name}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg mb-3">🎯 Objetivos em foco</h2>
          {focusGoals.length === 0 ? (
            <p className="text-sm text-dawn-muted">
              <Link href="/objetivos" className="text-dawn-indigo font-semibold hover:underline">
                Defina seus objetivos em foco
              </Link>
            </p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {focusGoals.map((g) => (
                <li key={g.id}>• {g.title}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg mb-3">🚀 Projetos ativos</h2>
          {activeProjects.length === 0 ? (
            <p className="text-sm text-dawn-muted">
              <Link href="/projetos" className="text-dawn-indigo font-semibold hover:underline">
                Comece um projeto
              </Link>
            </p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {activeProjects.map((p) => (
                <li key={p.id}>
                  {p.icon} {p.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card p-6 text-center">
        <p className="section-eyebrow mb-2">Frase da semana</p>
        <p className="font-display italic text-xl text-dawn-ink">&ldquo;{quote}&rdquo;</p>
      </div>
    </div>
  );
}
