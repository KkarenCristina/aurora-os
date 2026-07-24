"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <h2 className="font-display text-xl text-dawn-ink mb-2">Quase lá!</h2>
        <p className="text-sm text-dawn-muted">
          Enviamos um e-mail de confirmação para <strong>{email}</strong>. Confirme para poder entrar no seu Aurora OS.
        </p>
        <Link href="/login" className="btn-secondary mt-6 inline-flex">
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-xl text-dawn-ink mb-1">Criar conta</h2>
      <p className="text-sm text-dawn-muted mb-6">Comece a organizar sua vida hoje.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-dawn-ink block mb-1">Nome</label>
          <input
            type="text"
            required
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Como podemos te chamar?"
          />
        </div>
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
            minLength={6}
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        {error && <p className="text-sm text-dawn-rose">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Criando conta…" : "Criar conta"}
        </button>
      </form>

      <p className="text-sm text-dawn-muted text-center mt-6">
        Já tem conta?{" "}
        <Link href="/login" className="text-dawn-indigo font-semibold hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
