"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { MonthTabs } from "@/components/ui/MonthTabs";
import { HabitTracker } from "@/components/HabitTracker";
import { currentMonthKey, monthRange } from "@/lib/months";

export default function TarefasPage() {
  const { user } = useAuth();
  const now = new Date();
  const months = useMemo(() => monthRange(now.getFullYear(), now.getMonth() - 2 + 1, 8), []);
  const [active, setActive] = useState(currentMonthKey());

  if (!user) return null;

  return (
    <div className="space-y-6 pb-16">
      <div>
        <p className="section-eyebrow mb-1">Tarefas</p>
        <h1 className="page-title">Pequenas ações repetidas todos os dias constroem a vida que quero viver</h1>
      </div>

      <MonthTabs months={months} active={active} onChange={setActive} />

      <HabitTracker userId={user.id} month={active} />
    </div>
  );
}
