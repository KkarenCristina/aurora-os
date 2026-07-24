"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { MonthTabs } from "@/components/ui/MonthTabs";
import { TextList } from "@/components/ui/TextList";
import { currentMonthKey, monthRange } from "@/lib/months";
import type { FinanceMonth } from "@/lib/types";

function empty(userId: string, month: string): FinanceMonth {
  return {
    id: "",
    user_id: userId,
    month,
    renda: 0,
    saldo_disponivel: 0,
    reserva_meta: 0,
    reserva_atual: 0,
    gastos_fixos: [],
    gastos_variaveis: [],
    dividas: [],
    patrimonio: [],
    objetivos: [],
    conquistas: [],
  };
}

export default function FinancasPage() {
  const { user } = useAuth();
  const now = new Date();
  const months = useMemo(() => monthRange(now.getFullYear(), now.getMonth() - 2 + 1, 8), []);
  const [active, setActive] = useState(currentMonthKey());
  const [data, setData] = useState<FinanceMonth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("finance_month")
      .select("*")
      .eq("user_id", user.id)
      .eq("month", active)
      .maybeSingle()
      .then(({ data: d }) => {
        setData(d || empty(user.id, active));
        setLoading(false);
      });
  }, [user, active]);

  async function persist(updated: FinanceMonth) {
    if (!user) return;
    setData(updated);
    const { id, ...rest } = updated;
    const { data: saved } = await supabase
      .from("finance_month")
      .upsert({ ...rest, user_id: user.id, month: active }, { onConflict: "user_id,month" })
      .select()
      .single();
    if (saved) setData(saved);
  }

  if (!user) return null;
  if (loading || !data) return <p className="text-dawn-muted">Carregando…</p>;

  const totalFixos = data.gastos_fixos.reduce((s, g) => s + Number(g.valor || 0), 0);
  const totalVariaveis = data.gastos_variaveis.reduce((s, g) => s + Number(g.valor || 0), 0);
  const totalDividas = data.dividas.reduce((s, g) => s + Number(g.valor_total || 0), 0);
  const totalPatrimonio = data.patrimonio.reduce((s, g) => s + Number(g.valor || 0), 0);
  const saldoMes = data.renda - totalFixos - totalVariaveis;

  return (
    <div className="space-y-6 pb-16">
      <div>
        <p className="section-eyebrow mb-1">Finanças</p>
        <h1 className="page-title">A liberdade financeira é construída pelas decisões que tomo todos os dias</h1>
      </div>

      <MonthTabs months={months} active={active} onChange={setActive} />

      <div className="card p-6">
        <h2 className="font-display text-lg mb-4">💵 Visão geral</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NumberField label="Renda mensal (R$)" value={data.renda} onSave={(v) => persist({ ...data, renda: v })} />
          <NumberField
            label="Saldo disponível (R$)"
            value={data.saldo_disponivel}
            onSave={(v) => persist({ ...data, saldo_disponivel: v })}
          />
          <NumberField
            label="Reserva atual (R$)"
            value={data.reserva_atual}
            onSave={(v) => persist({ ...data, reserva_atual: v })}
          />
          <NumberField
            label="Reserva meta (R$)"
            value={data.reserva_meta}
            onSave={(v) => persist({ ...data, reserva_meta: v })}
          />
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg mb-4">📊 Resumo financeiro</h2>
        <table className="w-full text-sm">
          <tbody>
            <Row label="💰 Renda" value={data.renda} />
            <Row label="🏠 Gastos fixos" value={totalFixos} />
            <Row label="🛒 Gastos variáveis" value={totalVariaveis} />
            <Row label="💳 Dívidas (total)" value={totalDividas} />
            <Row label="📈 Patrimônio" value={totalPatrimonio} />
            <Row label="💚 Saldo do mês" value={saldoMes} highlight />
          </tbody>
        </table>
      </div>

      <EditableTable
        title="🏠 Gastos fixos"
        rows={data.gastos_fixos}
        columns={[
          { key: "nome", label: "Despesa", type: "text" },
          { key: "valor", label: "Valor", type: "number" },
          { key: "vencimento", label: "Vencimento", type: "text" },
        ]}
        onChange={(rows) => persist({ ...data, gastos_fixos: rows as any })}
        newRow={{ nome: "", valor: 0, vencimento: "", pago: false }}
      />

      <EditableTable
        title="🛒 Gastos variáveis"
        rows={data.gastos_variaveis}
        columns={[
          { key: "categoria", label: "Categoria", type: "text" },
          { key: "valor", label: "Valor", type: "number" },
        ]}
        onChange={(rows) => persist({ ...data, gastos_variaveis: rows as any })}
        newRow={{ categoria: "", valor: 0 }}
      />

      <EditableTable
        title="💳 Dívidas"
        rows={data.dividas}
        columns={[
          { key: "nome", label: "Dívida", type: "text" },
          { key: "valor_total", label: "Valor total", type: "number" },
          { key: "parcela", label: "Parcela", type: "number" },
          { key: "status", label: "Status", type: "text" },
        ]}
        onChange={(rows) => persist({ ...data, dividas: rows as any })}
        newRow={{ nome: "", valor_total: 0, parcela: 0, status: "" }}
      />

      <EditableTable
        title="📈 Patrimônio"
        rows={data.patrimonio}
        columns={[
          { key: "bem", label: "Bem", type: "text" },
          { key: "valor", label: "Valor", type: "number" },
        ]}
        onChange={(rows) => persist({ ...data, patrimonio: rows as any })}
        newRow={{ bem: "", valor: 0 }}
      />

      <div className="card p-6">
        <h2 className="font-display text-lg mb-3">🎯 Grandes objetivos financeiros</h2>
        <TextList items={data.objetivos} onChange={(objetivos) => persist({ ...data, objetivos })} placeholder="Adicionar objetivo…" />
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg mb-3">🌱 Conquistas</h2>
        <TextList items={data.conquistas} onChange={(conquistas) => persist({ ...data, conquistas })} placeholder="Adicionar conquista…" />
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <tr className="border-t border-dawn-border">
      <td className={`py-2 ${highlight ? "font-semibold" : ""}`}>{label}</td>
      <td className={`py-2 font-mono text-right ${highlight ? "font-semibold text-dawn-teal" : ""}`}>
        R$ {value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      </td>
    </tr>
  );
}

function NumberField({ label, value, onSave }: { label: string; value: number; onSave: (v: number) => void }) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <div>
      <label className="text-xs font-semibold text-dawn-muted uppercase">{label}</label>
      <input
        type="number"
        className="input mt-1"
        value={local}
        onChange={(e) => setLocal(Number(e.target.value))}
        onBlur={() => onSave(local)}
      />
    </div>
  );
}

function EditableTable({
  title,
  rows,
  columns,
  onChange,
  newRow,
}: {
  title: string;
  rows: Record<string, any>[];
  columns: { key: string; label: string; type: "text" | "number" }[];
  onChange: (rows: Record<string, any>[]) => void;
  newRow: Record<string, any>;
}) {
  function updateCell(idx: number, key: string, value: string) {
    const updated = rows.map((r, i) => (i === idx ? { ...r, [key]: value } : r));
    onChange(updated);
  }
  function removeRow(idx: number) {
    onChange(rows.filter((_, i) => i !== idx));
  }
  return (
    <div className="card p-6">
      <h2 className="font-display text-lg mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-dawn-muted">
              {columns.map((c) => (
                <th key={c.key} className="pb-2 pr-2 font-medium">
                  {c.label}
                </th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-t border-dawn-border">
                {columns.map((c) => (
                  <td key={c.key} className="py-1.5 pr-2">
                    <input
                      type={c.type}
                      className="input py-1"
                      value={row[c.key] ?? ""}
                      onChange={(e) => updateCell(idx, c.key, e.target.value)}
                    />
                  </td>
                ))}
                <td>
                  <button onClick={() => removeRow(idx)} className="text-dawn-muted hover:text-dawn-rose text-xs">
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="btn-ghost mt-2" onClick={() => onChange([...rows, newRow])}>
        + Adicionar linha
      </button>
    </div>
  );
}
