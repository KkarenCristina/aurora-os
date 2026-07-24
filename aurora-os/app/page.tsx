"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export default function HomePage() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(session ? "/dashboard" : "/login");
  }, [loading, session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dawn-bg">
      <div className="flex items-center gap-3 text-dawn-muted">
        <span className="h-2 w-2 rounded-full bg-dawn-rose animate-pulse" />
        Carregando o Aurora OS…
      </div>
    </div>
  );
}
