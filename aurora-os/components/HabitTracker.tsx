"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { daysInMonth } from "@/lib/months";
import type { Habit, HabitLog, HabitMonthlyTarget } from "@/lib/types";

export function HabitTracker({ userId, month }: { userId: string; month: string }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [targets, setTargets] = useState<HabitMonthlyTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [newHabitName, setNewHabitName] = useState("");

  const days = daysInMonth(month);
  const [year, monthNum] = month.split("-").map(Number);

  useEffect(() => {
    if (!userId) return;
    async function load() {
      const [habitsRes, targetsRes] = await Promise.all([
        supabase.from("habits").select("*").eq("user_id", userId).eq("active", true).order("position"),
        supabase.from("habit_monthly_targets").select("*").eq("user_id", userId).eq("month", month),
      ]);
      const habitList = habitsRes.data || [];
      setHabits(habitList);
      setTargets(targetsRes.data || []);

      const start = `${month}-01`;
      const end = `${month}-${String(days).padStart(2, "0")}`;
      if (habitList.length > 0) {
        const { data: logsData } = await supabase
          .from("habit_logs")
          .select("*")
          .eq("user_id", userId)
          .gte("log_date", start)
          .lte("log_date", end);
        setLogs(logsData || []);
      } else {
        setLogs([]);
      }
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, month]);

  async function addHabit(e: React.FormEvent) {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    const { data } = await supabase
      .from("habits")
      .insert({ user_id: userId, name: newHabitName.trim(), icon: "✅", position: habits.length })
      .select()
      .single();
    if (data) setHabits((prev) => [...prev, data]);
    setNewHabitName("");
  }

  async function removeHabit(id: string) {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    await supabase.from("habits").update({ active: false }).eq("id", id);
  }

  function isDone(habitId: string, day: number) {
    const dateStr = `${month}-${String(day).padStart(2, "0")}`;
    return logs.find((l) => l.habit_id === habitId && l.log_date === dateStr)?.done || false;
  }

  async function toggleDay(habitId: string, day: number) {
    const dateStr = `${month}-${String(day).padStart(2, "0")}`;
    const existing = logs.find((l) => l.habit_id === habitId && l.log_date === dateStr);
    if (existing) {
      const newDone = !existing.done;
      setLogs((prev) => prev.map((l) => (l.id === existing.id ? { ...l, done: newDone } : l)));
      await supabase.from("habit_logs").update({ done: newDone }).eq("id", existing.id);
    } else {
      const { data } = await supabase
        .from("habit_logs")
        .insert({ user_id: userId, habit_id: habitId, log_date: dateStr, done: true })
        .select()
        .single();
      if (data) setLogs((prev) => [...prev, data]);
    }
  }

  function targetFor(habitId: string): number {
    return targets.find((t) => t.habit_id === habitId)?.target || 0;
  }

  async function setTarget(habitId: string, value: number) {
    const existing = targets.find((t) => t.habit_id === habitId);
    if (existing) {
      setTargets((prev) => prev.map((t) => (t.habit_id === habitId ? { ...t, target: value } : t)));
      await supabase.from("habit_monthly_targets").update({ target: value }).eq("id", existing.id);
    } else {
      const { data } = await supabase
        .from("habit_monthly_targets")
        .insert({ user_id: userId, habit_id: habitId, month, target: value })
        .select()
        .single();
      if (data) setTargets((prev) => [...prev, data]);
    }
  }

  function doneCount(habitId: string) {
    return logs.filter((l) => l.habit_id === habitId && l.done).length;
  }

  if (loading) return <p className="text-dawn-muted">Carregando rastreador…</p>;

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <form onSubmit={addHabit} className="flex gap-2">
          <input
            className="input"
            placeholder="Novo hábito (ex: Água, Academia, Leitura…)"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
          />
          <button type="submit" className="btn-secondary shrink-0">
            + Hábito
          </button>
        </form>
      </div>

      {habits.length === 0 ? (
        <p className="text-sm text-dawn-muted">Cadastre seus hábitos acima para começar a rastrear sua rotina.</p>
      ) : (
        <>
          <div className="card p-4 overflow-x-auto">
            <table className="text-sm w-full border-collapse font-mono">
              <thead>
                <tr>
                  <th className="text-left font-body font-semibold text-dawn-ink sticky left-0 bg-white pr-3 py-2">
                    Hábito
                  </th>
                  {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
                    <th key={d} className="px-1.5 py-2 text-dawn-muted font-normal text-xs">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {habits.map((h) => (
                  <tr key={h.id} className="border-t border-dawn-border">
                    <td className="sticky left-0 bg-white pr-3 py-1.5 font-body whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{h.icon}</span>
                        <span>{h.name}</span>
                        <button
                          onClick={() => removeHabit(h.id)}
                          className="text-dawn-muted hover:text-dawn-rose text-xs"
                          title="Remover hábito"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                    {Array.from({ length: days }, (_, i) => i + 1).map((d) => {
                      const done = isDone(h.id, d);
                      return (
                        <td key={d} className="text-center px-1">
                          <button
                            onClick={() => toggleDay(h.id, d)}
                            className={`h-6 w-6 rounded ${
                              done ? "bg-dawn-teal text-white" : "bg-dawn-bg border border-dawn-border"
                            }`}
                          >
                            {done ? "✓" : ""}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card p-6">
            <h3 className="font-display text-lg mb-3">📊 Progresso Mensal</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-dawn-muted">
                  <th className="pb-2 font-medium">Hábito</th>
                  <th className="pb-2 font-medium">Meta do mês</th>
                  <th className="pb-2 font-medium">Realizado</th>
                  <th className="pb-2 font-medium">Progresso</th>
                </tr>
              </thead>
              <tbody>
                {habits.map((h) => {
                  const target = targetFor(h.id);
                  const done = doneCount(h.id);
                  const pct = target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 0;
                  return (
                    <tr key={h.id} className="border-t border-dawn-border">
                      <td className="py-2">
                        {h.icon} {h.name}
                      </td>
                      <td className="py-2">
                        <input
                          type="number"
                          min={0}
                          className="input w-20 py-1"
                          value={target}
                          onChange={(e) => setTarget(h.id, Number(e.target.value))}
                        />
                      </td>
                      <td className="py-2 font-mono">{done}</td>
                      <td className="py-2 w-40">
                        <div className="h-2 rounded-full bg-dawn-bg overflow-hidden">
                          <div className="h-full bg-aurora-gradient" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-dawn-muted">{pct}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
