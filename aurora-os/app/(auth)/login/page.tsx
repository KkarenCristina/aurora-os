"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : error.message
      );
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div>
      <h2 className="font-display text-xl text-dawn-ink mb-1">Entrar</h2>
      <p className="text-sm text-dawn-muted mb-6">Bem-vindo(a) de volta ao seu Aurora OS.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-dawn-ink block mb-1">E-mail</label>
          <input
            type="email"
            required
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-dawn-ink block mb-1">Senha</label>
          <input
            type="password"
            required
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-dawn-rose">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <p className="text-sm text-dawn-muted text-center mt-6">
        Ainda não tem conta?{" "}
        <Link href="/signup" className="text-dawn-indigo font-semibold hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
