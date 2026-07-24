"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

const NAV_GROUPS: { items: { href: string; label: string; icon: string }[] }[] = [
  {
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "🏠" },
      { href: "/plano-de-vida", label: "Meu Plano de Vida", icon: "🌅" },
    ],
  },
  {
    items: [
      { href: "/objetivos", label: "Objetivos", icon: "🎯" },
      { href: "/projetos", label: "Projetos", icon: "🚀" },
      { href: "/tarefas", label: "Tarefas", icon: "✅" },
      { href: "/planejamento", label: "Planejamento", icon: "🗓️" },
    ],
  },
  {
    items: [
      { href: "/saude", label: "Saúde", icon: "❤️" },
      { href: "/financas", label: "Finanças", icon: "💰" },
      { href: "/vida", label: "Vida", icon: "🌈" },
    ],
  },
  {
    items: [
      { href: "/cultura", label: "Cultura", icon: "🎬" },
      { href: "/experiencias", label: "Experiências", icon: "🌍" },
      { href: "/caixa-de-entrada", label: "Caixa de Entrada", icon: "📥" },
    ],
  },
];

export function AppShell({ children, userName }: { children: React.ReactNode; userName?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-dawn-bg flex">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-white border-b border-dawn-border flex items-center justify-between px-4 h-14">
        <span className="font-display italic text-lg">Aurora OS</span>
        <button className="btn-ghost" onClick={() => setMobileOpen((v) => !v)}>
          {mobileOpen ? "Fechar" : "Menu"}
        </button>
      </div>

      <aside
        className={`
          fixed md:static z-20 top-14 md:top-0 bottom-0 left-0 w-64 bg-white border-r border-dawn-border
          flex flex-col transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="hidden md:flex items-center gap-2 px-6 h-20">
          <span className="h-2.5 w-2.5 rounded-full bg-aurora-gradient" />
          <span className="font-display italic text-lg text-dawn-ink">Aurora OS</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "pt-3 border-t border-dawn-border" : ""}>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          active
                            ? "bg-dawn-indigo text-white"
                            : "text-dawn-ink hover:bg-dawn-bg"
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-dawn-border">
          {userName && (
            <p className="px-3 text-xs text-dawn-muted mb-2 truncate">Olá, {userName}</p>
          )}
          <button onClick={handleSignOut} className="btn-ghost w-full justify-start">
            🚪 Sair
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 top-14 bg-black/20 z-10"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main className="flex-1 px-4 md:px-10 py-8 md:py-10 mt-14 md:mt-0 max-w-5xl">
        {children}
      </main>
    </div>
  );
}
