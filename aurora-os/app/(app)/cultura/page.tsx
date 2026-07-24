"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { Modal } from "@/components/ui/Modal";
import { Stars } from "@/components/ui/Stars";
import { formatDateBR } from "@/lib/months";

type Tab = "books" | "movies" | "music";

const TABS: { key: Tab; label: string; icon: string; table: string }[] = [
  { key: "books", label: "Livros", icon: "📖", table: "culture_books" },
  { key: "movies", label: "Filmes & Séries", icon: "🎬", table: "culture_movies" },
  { key: "music", label: "Música", icon: "🎵", table: "culture_music" },
];

export default function CulturaPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("books");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<any>({});

  const tabInfo = TABS.find((t) => t.key === tab)!;

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from(tabInfo.table)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setItems(data || []);
        setLoading(false);
      });
  }, [user, tab]);

  function openNew() {
    setForm(
      tab === "books"
        ? { title: "", author: "", opinion: "", rating: 0, status: "Quero ler", start_date: "", end_date: "" }
        : tab === "movies"
        ? { name: "", type: "Filme", opinion: "", rating: 0, start_date: "", end_date: "" }
        : { name: "", artist: "", opinion: "", rating: 0, discovered_date: "" }
    );
    setModalOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const payload = { ...form, user_id: user.id };
    Object.keys(payload).forEach((k) => {
      if (payload[k] === "") payload[k] = null;
    });
    const { data } = await supabase.from(tabInfo.table).insert(payload).select().single();
    if (data) setItems((prev) => [data, ...prev]);
    setModalOpen(false);
  }

  async function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await supabase.from(tabInfo.table).delete().eq("id", id);
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-eyebrow mb-1">Cultura</p>
          <h1 className="page-title">Livros, filmes e música que marcaram a jornada</h1>
        </div>
        <button className="btn-primary shrink-0" onClick={openNew}>
          + Adicionar
        </button>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              tab === t.key ? "bg-dawn-indigo text-white" : "bg-white border border-dawn-border"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-dawn-muted">Carregando…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-dawn-muted">Nada por aqui ainda.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className="card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg">{item.title || item.name}</h3>
                  <p className="text-sm text-dawn-muted">
                    {tab === "books" && item.author}
                    {tab === "movies" && item.type}
                    {tab === "music" && item.artist}
                  </p>
                </div>
                <button onClick={() => remove(item.id)} className="text-dawn-muted hover:text-dawn-rose text-xs shrink-0">
                  remover
                </button>
              </div>
              <div className="mt-2">
                <Stars value={item.rating || 0} />
              </div>
              {item.opinion && <p className="text-sm mt-2 text-dawn-ink">{item.opinion}</p>}
              {tab === "books" && (
                <p className="text-xs text-dawn-muted mt-2 font-mono">
                  {item.status} {item.start_date && `· início ${formatDateBR(item.start_date)}`}{" "}
                  {item.end_date && `· fim ${formatDateBR(item.end_date)}`}
                </p>
              )}
              {tab !== "books" && (item.start_date || item.discovered_date) && (
                <p className="text-xs text-dawn-muted mt-2 font-mono">
                  {formatDateBR(item.start_date || item.discovered_date)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Adicionar em ${tabInfo.label}`}>
        <form onSubmit={save} className="space-y-3">
          {tab === "books" && (
            <>
              <input className="input" placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <input className="input" placeholder="Autor" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option>Quero ler</option>
                <option>Lendo</option>
                <option>Lido</option>
                <option>Abandonei</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" className="input" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                <input type="date" className="input" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
            </>
          )}
          {tab === "movies" && (
            <>
              <input className="input" placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option>Filme</option>
                <option>Série</option>
                <option>Documentário</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" className="input" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                <input type="date" className="input" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
            </>
          )}
          {tab === "music" && (
            <>
              <input className="input" placeholder="Nome da música" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className="input" placeholder="Artista" value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} />
              <input type="date" className="input" value={form.discovered_date} onChange={(e) => setForm({ ...form, discovered_date: e.target.value })} />
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-dawn-muted uppercase block mb-1">Sua opinião</label>
            <textarea className="textarea" value={form.opinion} onChange={(e) => setForm({ ...form, opinion: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-dawn-muted uppercase block mb-1">Nota</label>
            <Stars value={form.rating || 0} onChange={(v) => setForm({ ...form, rating: v })} size="text-2xl" />
          </div>

          <button type="submit" className="btn-primary w-full">
            Salvar
          </button>
        </form>
      </Modal>
    </div>
  );
}
