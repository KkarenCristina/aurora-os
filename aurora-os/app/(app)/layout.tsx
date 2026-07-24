"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { supabase } from "@/lib/supabase/client";
import { AppShell } from "@/components/AppShell";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [userName, setUserName] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login");
    }
  }, [loading, session, router]);

  useEffect(() => {
    if (!session) return;
    supabase
      .from("profiles")
      .select("name")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => setUserName(data?.name || session.user.email || undefined));
  }, [session]);

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dawn-bg">
        <div className="flex items-center gap-3 text-dawn-muted">
          <span className="h-2 w-2 rounded-full bg-dawn-rose animate-pulse" />
          Carregando…
        </div>
      </div>
    );
  }

  return <AppShell userName={userName}>{children}</AppShell>;
}
