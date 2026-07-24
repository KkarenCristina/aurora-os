"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { formatDateBR } from "@/lib/months";
import type { WeeklyPlan } from "@/lib/types";

const WEEKDAYS = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];
const WEEKDAY_LABELS: Record<string, string> = {
  segunda: "Segunda",
  terca: "Terça",
  quarta: "Quarta",
  quinta: "Quinta",
  sexta: "Sexta",
  sabado: "Sábado",
  domingo: "Domingo",
};

const DEFAULT_CHECKLIST = [
  "Treinar 5 vezes",
  "Correr 3 vezes",
  "Estudar pelo menos 7 horas",
  "Ler 5 vezes",
  "Dormir bem",
  "Economizar dinheiro",
  "Passar tempo com quem amo",
  "Dar mais um passo em direção aos meus sonhos",
];

function weekEndLabel(weekStart: string): string {
  const d = new Date(weekStart + "T00:00:00");
  d.setDate(d.getDate() + 6);
  return d.toISOString().slice(0, 10);
}

export function WeeklyPlanCard({ userId, weekStart }: { userId: string; weekStart: string }) {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase
      .from("weekly_plan")
      .select("*")
      .eq("user_id", userId)
      .eq("week_start", weekStart)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setPlan(data);
        } else {
          setPlan({
            id: "",
            user_id: userId,
            week_start: weekStart,
            projeto_principal: "",
            objetivo_semana: "",
            nao_pode_esperar: "",
            routine: {},
            o_que_fiz_bem: "",
            o_que_posso_melhorar: "",
            foco_proxima_semana: "",
            checklist: DEFAULT_CHECKLIST.map((label) => ({ label, done: false })),
          });
        }
        setLoading(false);
      });
  }, [userId, weekStart]);

  async function persist(updated: WeeklyPlan) {
    setPlan(updated);
    const { id, ...rest } = updated;
    const { data } = await supabase
      .from("weekly_plan")
      .upsert({ ...rest, user_id: userId, week_start: weekStart }, { onConflict: "user_id,week_start" })
      .select()
      .single();
    if (data) setPlan(data);
  }

  if (loading || !plan) return null;

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <span className="font-display text-lg">
          Semana de {formatDateBR(weekStart)} a {formatDateBR(weekEndLabel(weekStart))}
        </span>
        <span className="text-dawn-muted text-sm">{open ? "recolher ▲" : "expandir ▼"}</span>
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-5 border-t border-dawn-border pt-5">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-dawn-muted uppercase">Projeto principal</label>
              <input
                className="input mt-1"
                value={plan.projeto_principal}
                onChange={(e) => setPlan({ ...plan, projeto_principal: e.target.value })}
                onBlur={() => persist(plan)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-dawn-muted uppercase">Objetivo da semana</label>
              <input
                className="input mt-1"
                value={plan.objetivo_semana}
                onChange={(e) => setPlan({ ...plan, objetivo_semana: e.target.value })}
                onBlur={() => persist(plan)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-dawn-muted uppercase">O que não pode esperar?</label>
              <input
                className="input mt-1"
                value={plan.nao_pode_esperar}
                onChange={(e) => setPlan({ ...plan, nao_pode_esperar: e.target.value })}
                onBlur={() => persist(plan)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-dawn-muted uppercase mb-2 block">Rotina semanal</label>
            <div className="grid grid-cols-7 gap-2">
              {WEEKDAYS.map((day) => (
                <div key={day}>
                  <p className="text-xs text-dawn-muted mb-1 text-center">{WEEKDAY_LABELS[day]}</p>
                  <textarea
                    className="textarea min-h-[80px] text-xs p-2"
                    value={plan.routine[day] || ""}
                    onChange={(e) => setPlan({ ...plan, routine: { ...plan.routine, [day]: e.target.value } })}
                    onBlur={() => persist(plan)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-dawn-muted uppercase mb-2 block">
              ❤️ Uma semana bem vivida para mim é...
            </label>
            <ul className="space-y-1.5">
              {plan.checklist.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={item.done}
                    onChange={() => {
                      const checklist = plan.checklist.map((c, i) => (i === idx ? { ...c, done: !c.done } : c));
                      persist({ ...plan, checklist });
                    }}
                  />
                  <span className={`text-sm ${item.done ? "line-through text-dawn-muted" : ""}`}>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-dawn-muted uppercase">O que fiz bem?</label>
              <textarea
                className="textarea mt-1"
                value={plan.o_que_fiz_bem}
                onChange={(e) => setPlan({ ...plan, o_que_fiz_bem: e.target.value })}
                onBlur={() => persist(plan)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-dawn-muted uppercase">O que posso melhorar?</label>
              <textarea
                className="textarea mt-1"
                value={plan.o_que_posso_melhorar}
                onChange={(e) => setPlan({ ...plan, o_que_posso_melhorar: e.target.value })}
                onBlur={() => persist(plan)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-dawn-muted uppercase">Foco da próxima semana</label>
              <textarea
                className="textarea mt-1"
                value={plan.foco_proxima_semana}
                onChange={(e) => setPlan({ ...plan, foco_proxima_semana: e.target.value })}
                onBlur={() => persist(plan)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
