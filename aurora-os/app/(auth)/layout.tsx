export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dawn-bg flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[480px] w-[900px] rounded-full opacity-20 blur-3xl bg-aurora-gradient"
      />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-aurora-gradient" />
            <span className="section-eyebrow">Aurora OS</span>
          </div>
          <h1 className="font-display italic text-2xl text-dawn-ink">
            Construa hoje a vida que você quer viver amanhã.
          </h1>
        </div>
        <div className="card p-8">{children}</div>
      </div>
    </div>
  );
}
