"use client";

/**
 * Elemento-assinatura do Aurora OS: um horizonte onde o sol nasce
 * conforme a % de hábitos/tarefas do dia é concluída.
 */
export function SunriseArc({ progress }: { progress: number }) {
  const pct = Math.max(0, Math.min(1, progress));
  // Sol se move ao longo de um arco de 180 graus, da esquerda (0%) ao topo (100%)
  const angle = Math.PI * (1 - pct); // pct=0 -> PI (esquerda), pct=1 -> 0 (direita)... ajustamos abaixo
  const cx = 150;
  const cy = 150;
  const r = 110;
  const sunX = cx + r * Math.cos(Math.PI - angle);
  const sunY = cy - r * Math.sin(Math.PI - angle) * (pct === 0 ? 0 : 1) + (pct === 0 ? 0 : 0);
  // Simplificação: sol sobe de baixo do horizonte até o topo do arco
  const travel = pct; // 0 a 1
  const sx = cx - r + travel * (2 * r);
  const sy = cy - Math.sin(travel * Math.PI) * r * 0.95;

  return (
    <div className="relative w-full max-w-[320px] mx-auto">
      <svg viewBox="0 0 300 170" className="w-full h-auto">
        <defs>
          <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4A3F7A" />
            <stop offset="55%" stopColor="#E85D75" />
            <stop offset="100%" stopColor="#F2A65A" />
          </linearGradient>
          <linearGradient id="sunGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFE9B8" />
            <stop offset="100%" stopColor="#F2A65A" />
          </linearGradient>
          <clipPath id="skyClip">
            <rect x="0" y="0" width="300" height="150" />
          </clipPath>
        </defs>

        <g clipPath="url(#skyClip)">
          <path
            d={`M 20 150 A 110 110 0 0 1 280 150`}
            fill="none"
            stroke="url(#skyGradient)"
            strokeWidth="3"
            strokeDasharray="2 6"
            strokeLinecap="round"
            opacity={0.5}
          />
          <circle cx={sx} cy={sy} r="16" fill="url(#sunGradient)" />
        </g>

        <line x1="10" y1="150" x2="290" y2="150" stroke="#E4E1F0" strokeWidth="2" />
      </svg>
      <p className="text-center text-sm text-dawn-muted -mt-2">
        <span className="font-mono font-semibold text-dawn-ink">{Math.round(pct * 100)}%</span> do dia concluído
      </p>
    </div>
  );
}
