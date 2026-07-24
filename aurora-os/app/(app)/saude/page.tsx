"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { TextList } from "@/components/ui/TextList";
import { formatDateBR } from "@/lib/months";
import type { HealthProfile, HealthMeasurement } from "@/lib/types";

const WEEKDAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

export default function SaudePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [measurements, setMeasurements] = useState<HealthMeasurement[]>([]);
  const [wins, setWins] = useState<{ id: string; content: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMeasurement, setNewMeasurement] = useState({ weight: "", waist: "", hip: "", arm: "", thigh: "", calf: "", notes: "" });

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [profileRes, measurementsRes, winsRes] = await Promise.all([
        supabase.from("health_profile").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("health_measurements").select("*").eq("user_id", user.id).order("measured_at", { ascending: false }),
        supabase.from("health_wins").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setProfile(
        profileRes.data || {
          user_id: user.id,
          weight_current: null,
          weight_goal: null,
          height: null,
          goals: [],
          gym_split: {},
          gym_records: [],
          running: {},
        }
      );
      setMeasurements(measurementsRes.data || []);
      setWins(winsRes.data || []);
      setLoading(false);
    }
    load();
  }, [user]);

  async function persistProfile(updated: HealthProfile) {
    if (!user) return;
    setProfile(updated);
    await supabase.from("health_profile").upsert({ ...updated, updated_at: new Date().toISOString() });
  }

  async function addMeasurement(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const payload = {
      user_id: user.id,
      weight: newMeasurement.weight ? Number(newMeasurement.weight) : null,
      waist: newMeasurement.waist ? Number(newMeasurement.waist) : null,
      hip: newMeasurement.hip ? Number(newMeasurement.hip) : null,
      arm: newMeasurement.arm ? Number(newMeasurement.arm) : null,
      thigh: newMeasurement.thigh ? Number(newMeasurement.thigh) : null,
      calf: newMeasurement.calf ? Number(newMeasurement.calf) : null,
      notes: newMeasurement.notes,
    };
    const { data } = await supabase.from("health_measurements").insert(payload).select().single();
    if (data) setMeasurements((prev) => [data, ...prev]);
    setNewMeasurement({ weight: "", waist: "", hip: "", arm: "", thigh: "", calf: "", notes: "" });
  }

  async function addWin(content: string) {
    if (!user) return;
    const { data } = await supabase.from("health_wins").insert({ user_id: user.id, content }).select().single();
    if (data) setWins((prev) => [data, ...prev]);
  }

  async function removeWin(id: string) {
    setWins((prev) => prev.filter((w) => w.id !== id));
    await supabase.from("health_wins").delete().eq("id", id);
  }

  function updateGymRecord(idx: number, field: "exercicio" | "peso_atual" | "melhor_marca", value: string) {
    if (!profile) return;
    const records = [...profile.gym_records];
    records[idx] = { ...records[idx], [field]: value };
    persistProfile({ ...profile, gym_records: records });
  }

  if (loading || !profile) return <p className="text-dawn-muted">Carregando…</p>;

  const bmi =
    profile.weight_current && profile.height
      ? (profile.weight_current / (profile.height * profile.height)).toFixed(1)
      : null;

  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="section-eyebrow mb-1">Saúde</p>
        <h1 className="page-title">Cuidar da minha saúde é investir na vida que quero viver</h1>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg mb-4">❤️ Minha saúde hoje</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-dawn-muted uppercase">Peso atual (kg)</label>
            <input
              type="number"
              className="input mt-1"
              value={profile.weight_current ?? ""}
              onChange={(e) => setProfile({ ...profile, weight_current: e.target.value ? Number(e.target.value) : null })}
              onBlur={() => persistProfile(profile)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-dawn-muted uppercase">Meta (kg)</label>
            <input
              type="number"
              className="input mt-1"
              value={profile.weight_goal ?? ""}
              onChange={(e) => setProfile({ ...profile, weight_goal: e.target.value ? Number(e.target.value) : null })}
              onBlur={() => persistProfile(profile)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-dawn-muted uppercase">Altura (m)</label>
            <input
              type="number"
              step="0.01"
              className="input mt-1"
              value={profile.height ?? ""}
              onChange={(e) => setProfile({ ...profile, height: e.target.value ? Number(e.target.value) : null })}
              onBlur={() => persistProfile(profile)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-dawn-muted uppercase">IMC</label>
            <p className="input mt-1 bg-dawn-bg font-mono">{bmi ?? "—"}</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg mb-3">🎯 Objetivos atuais</h2>
        <TextList
          items={profile.goals}
          onChange={(goals) => persistProfile({ ...profile, goals })}
          placeholder="Adicionar objetivo de saúde…"
        />
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg mb-4">📈 Evolução corporal</h2>
        <form onSubmit={addMeasurement} className="grid grid-cols-2 md:grid-cols-7 gap-2 mb-4">
          {(["weight", "waist", "hip", "arm", "thigh", "calf"] as const).map((field) => (
            <input
              key={field}
              type="number"
              className="input text-xs"
              placeholder={{ weight: "Peso", waist: "Cintura", hip: "Quadril", arm: "Braço", thigh: "Coxa", calf: "Panturrilha" }[field]}
              value={newMeasurement[field]}
              onChange={(e) => setNewMeasurement({ ...newMeasurement, [field]: e.target.value })}
            />
          ))}
          <button type="submit" className="btn-secondary text-xs">
            Registrar
          </button>
        </form>
        {measurements.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-dawn-muted">
                  <th className="pb-2">Data</th>
                  <th className="pb-2">Peso</th>
                  <th className="pb-2">Cintura</th>
                  <th className="pb-2">Quadril</th>
                  <th className="pb-2">Braço</th>
                  <th className="pb-2">Coxa</th>
                  <th className="pb-2">Panturrilha</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m) => (
                  <tr key={m.id} className="border-t border-dawn-border font-mono">
                    <td className="py-1.5">{formatDateBR(m.measured_at)}</td>
                    <td className="py-1.5">{m.weight ?? "—"}</td>
                    <td className="py-1.5">{m.waist ?? "—"}</td>
                    <td className="py-1.5">{m.hip ?? "—"}</td>
                    <td className="py-1.5">{m.arm ?? "—"}</td>
                    <td className="py-1.5">{m.thigh ?? "—"}</td>
                    <td className="py-1.5">{m.calf ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg mb-4">🏋️ Academia — registro de cargas</h2>
        <div className="space-y-2">
          {profile.gym_records.map((r, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-2">
              <input
                className="input"
                placeholder="Exercício"
                value={r.exercicio}
                onChange={(e) => updateGymRecord(idx, "exercicio", e.target.value)}
              />
              <input
                className="input"
                placeholder="Peso atual"
                value={r.peso_atual}
                onChange={(e) => updateGymRecord(idx, "peso_atual", e.target.value)}
              />
              <input
                className="input"
                placeholder="Melhor marca"
                value={r.melhor_marca}
                onChange={(e) => updateGymRecord(idx, "melhor_marca", e.target.value)}
              />
            </div>
          ))}
          <button
            className="btn-ghost"
            onClick={() =>
              persistProfile({
                ...profile,
                gym_records: [...profile.gym_records, { exercicio: "", peso_atual: "", melhor_marca: "" }],
              })
            }
          >
            + Adicionar exercício
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg mb-4">🏃 Corrida</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-dawn-muted uppercase">Última distância</label>
            <input
              className="input mt-1"
              value={profile.running.ultima_distancia || ""}
              onChange={(e) => setProfile({ ...profile, running: { ...profile.running, ultima_distancia: e.target.value } })}
              onBlur={() => persistProfile(profile)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-dawn-muted uppercase">Maior distância</label>
            <input
              className="input mt-1"
              value={profile.running.maior_distancia || ""}
              onChange={(e) => setProfile({ ...profile, running: { ...profile.running, maior_distancia: e.target.value } })}
              onBlur={() => persistProfile(profile)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-dawn-muted uppercase">Último tempo</label>
            <input
              className="input mt-1"
              value={profile.running.ultimo_tempo || ""}
              onChange={(e) => setProfile({ ...profile, running: { ...profile.running, ultimo_tempo: e.target.value } })}
              onBlur={() => persistProfile(profile)}
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg mb-3">🌱 Minha evolução — pequenas conquistas</h2>
        <ul className="space-y-1.5 mb-3">
          {wins.map((w) => (
            <li key={w.id} className="group flex items-start gap-2.5">
              <span className="text-dawn-teal mt-1">✓</span>
              <span className="flex-1 text-sm">{w.content}</span>
              <button
                onClick={() => removeWin(w.id)}
                className="opacity-0 group-hover:opacity-100 text-dawn-muted hover:text-dawn-rose text-xs"
              >
                remover
              </button>
            </li>
          ))}
        </ul>
        <MiniAddForm onAdd={addWin} placeholder="Ex: Consegui correr 3 km." />
      </div>
    </div>
  );
}

function MiniAddForm({ onAdd, placeholder }: { onAdd: (v: string) => void; placeholder: string }) {
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
      <input className="input" placeholder={placeholder} value={value} onChange={(e) => setValue(e.target.value)} />
      <button type="submit" className="btn-secondary shrink-0">
        Adicionar
      </button>
    </form>
  );
}
