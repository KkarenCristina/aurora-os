"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { MonthTabs } from "@/components/ui/MonthTabs";
import { WeeklyPlanCard } from "@/components/WeeklyPlanCard";
import { currentMonthKey, monthRange, weekStartsOfMonth } from "@/lib/months";
import { TextList } from "@/components/ui/TextList";
import type { MonthlyPlan } from "@/lib/types";

export default function PlanejamentoPage() {
  const { user } = useAuth();
  const now = new Date();
  const months = useMemo(() => monthRange(now.getFullYear(), now.getMonth() - 2 + 1, 8), []);
  const [active, setActive] = useState(currentMonthKey());
  const [plan, setPlan] = useState<MonthlyPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("monthly_plan")
      .select("*")
      .eq("user_id", user.id)
      .eq("month", active)
      .maybeSingle()
      .then(({ data }) => {
        setPlan(
          data || {
            id: "",
            user_id: user.id,
            month: active,
            priorities: [],
            compromissos: "",
            eventos: "",
          }
        );
        setLoading(false);
      });
  }, [user, active]);

  async function persist(updated: MonthlyPlan) {
    if (!user) return;
    setPlan(updated);
    const { id, ...rest } = updated;
    const { data } = await supabase
      .from("monthly_plan")
      .upsert({ ...rest, user_id: user.id, month: active }, { onConflict: "user_id,month" })
      .select()
      .single();
    if (data) setPlan(data);
  }

  const weeks = useMemo(() => weekStartsOfMonth(active), [active]);

  if (!user) return null;

  return (
    <div className="space-y-6 pb-16">
      <div>
        <p className="section-eyebrow mb-1">Planejamento</p>
        <h1 className="page-title">Uma vida organizada é construída uma semana de cada vez</h1>
      </div>

      <MonthTabs months={months} active={active} onChange={setActive} />

      {loading || !plan ? (
        <p className="text-dawn-muted">Carregando…</p>
      ) : (
        <>
          <div className="card p-6 space-y-5">
            <h2 className="font-display text-lg">🎯 Prioridades do mês</h2>
            <p className="text-sm text-dawn-muted -mt-3">Escolha até 3 prioridades.</p>
            <TextList
              items={plan.priorities}
              onChange={(priorities) => persist({ ...plan, priorities })}
              placeholder="Adicionar prioridade do mês…"
            />

            <div className="grid md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-dawn-muted uppercase">📌 Compromissos importantes</label>
                <textarea
                  className="textarea mt-1"
                  value={plan.compromissos}
                  onChange={(e) => setPlan({ ...plan, compromissos: e.target.value })}
                  onBlur={() => persist(plan)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-dawn-muted uppercase">🎉 Eventos</label>
                <textarea
                  className="textarea mt-1"
                  value={plan.eventos}
                  onChange={(e) => setPlan({ ...plan, eventos: e.target.value })}
                  onBlur={() => persist(plan)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg px-1">🗓 Semanas do mês</h2>
            {weeks.map((w) => (
              <WeeklyPlanCard key={w} userId={user.id} weekStart={w} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
