"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { Modal } from "@/components/ui/Modal";
import { Stars } from "@/components/ui/Stars";
import { formatDateBR } from "@/lib/months";
import type { ExperienceEntry } from "@/lib/types";

export default function ExperienciasPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ExperienceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "", opinion: "", rating: 0, local: "", exp_date: "" });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("experiences")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setItems(data || []);
        setLoading(false);
      });
  }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const payload: any = { ...form, user_id: user.id };
    if (!payload.exp_date) payload.exp_date = null;
    const { data } = await supabase.from("experiences").insert(payload).select().single();
    if (data) setItems((prev) => [data, ...prev]);
    setModalOpen(false);
    setForm({ name: "", type: "", opinion: "", rating: 0, local: "", exp_date: "" });
  }

  async function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await supabase.from("experiences").delete().eq("id", id);
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-eyebrow mb-1">Experiências</p>
          <h1 className="page-title">Colecionando momentos que valem a pena lembrar</h1>
        </div>
        <button className="btn-primary shrink-0" onClick={() => setModalOpen(true)}>
          + Registrar experiência
        </button>
      </div>

      {loading ? (
        <p className="text-dawn-muted">Carregando…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-dawn-muted">Nenhuma experiência registrada ainda.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className="card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg">{item.name}</h3>
                  <p className="text-sm text-dawn-muted">
                    {item.type} {item.local && `· ${item.local}`}
                  </p>
                </div>
                <button onClick={() => remove(item.id)} className="text-dawn-muted hover:text-dawn-rose text-xs shrink-0">
                  remover
                </button>
              </div>
              <div className="mt-2">
                <Stars value={item.rating} />
              </div>
              {item.opinion && <p className="text-sm mt-2">{item.opinion}</p>}
              {item.exp_date && <p className="text-xs text-dawn-muted mt-2 font-mono">{formatDateBR(item.exp_date)}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova experiência">
        <form onSubmit={save} className="space-y-3">
          <input className="input" placeholder="Nome da experiência" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input" placeholder="Tipo (ex: Viagem, Show, Aventura)" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
          <input className="input" placeholder="Local" value={form.local} onChange={(e) => setForm({ ...form, local: e.target.value })} />
          <input type="date" className="input" value={form.exp_date} onChange={(e) => setForm({ ...form, exp_date: e.target.value })} />
          <textarea className="textarea" placeholder="O que achou?" value={form.opinion} onChange={(e) => setForm({ ...form, opinion: e.target.value })} />
          <div>
            <label className="text-xs font-semibold text-dawn-muted uppercase block mb-1">Nota</label>
            <Stars value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} size="text-2xl" />
          </div>
          <button type="submit" className="btn-primary w-full">
            Salvar
          </button>
        </form>
      </Modal>
    </div>
  );
}
