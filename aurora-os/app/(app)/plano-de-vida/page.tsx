"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/useAuth";

export default function PlanoDeVidaPage() {
  const { user } = useAuth();
  const [quemEuSou, setQuemEuSou] = useState("");
  const [visaoFuturo, setVisaoFuturo] = useState("");
  const [cartaParaMim, setCartaParaMim] = useState("");
  const [loading, setLoading] = useState(true);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("life_plan")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setQuemEuSou(data.quem_eu_sou || "");
          setVisaoFuturo(data.visao_futuro || "");
          setCartaParaMim(data.carta_para_mim || "");
        }
        setLoading(false);
      });
  }, [user]);

  async function save() {
    if (!user) return;
    await supabase
      .from("life_plan")
      .upsert({
        user_id: user.id,
        quem_eu_sou: quemEuSou,
        visao_futuro: visaoFuturo,
        carta_para_mim: cartaParaMim,
        updated_at: new Date().toISOString(),
      });
    setSavedAt(new Date());
  }

  if (loading) return <p className="text-dawn-muted">Carregando…</p>;

  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="section-eyebrow mb-1">Meu Plano de Vida</p>
        <h1 className="page-title">Quem eu sou e quem estou me tornando</h1>
      </div>

      <div className="card p-6 space-y-2">
        <h2 className="font-display text-lg">🌱 Quem eu sou</h2>
        <p className="text-sm text-dawn-muted">Como você se descreve quando ninguém está olhando?</p>
        <textarea
          className="textarea min-h-[160px]"
          value={quemEuSou}
          onChange={(e) => setQuemEuSou(e.target.value)}
          placeholder="Escreva livremente sobre quem você é hoje…"
        />
      </div>

      <div className="card p-6 space-y-2">
        <h2 className="font-display text-lg">🌅 Minha visão de futuro</h2>
        <p className="text-sm text-dawn-muted">Como você quer que seja sua vida?</p>
        <textarea
          className="textarea min-h-[160px]"
          value={visaoFuturo}
          onChange={(e) => setVisaoFuturo(e.target.value)}
          placeholder="Descreva a vida que você está construindo…"
        />
      </div>

      <div className="card p-6 space-y-2">
        <h2 className="font-display text-lg">💌 Carta para mim</h2>
        <p className="text-sm text-dawn-muted">Uma carta da sua versão futura para você, hoje.</p>
        <textarea
          className="textarea min-h-[200px]"
          value={cartaParaMim}
          onChange={(e) => setCartaParaMim(e.target.value)}
          placeholder="Você conseguiu. Agora continue…"
        />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} className="btn-primary">
          Salvar
        </button>
        {savedAt && <span className="text-sm text-dawn-muted">Salvo às {savedAt.toLocaleTimeString("pt-BR")}</span>}
      </div>
    </div>
  );
}
