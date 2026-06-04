import { hailiteTheme } from '@/theme/hailiteTheme'

type PerformanceCardProps = {
  title: string
  level: number
  xpCurrent: number
  xpMax: number
  subtitle: string
}

const themeColors = hailiteTheme.colors

export default function PerformanceCard({ title, level, xpCurrent, xpMax, subtitle }: PerformanceCardProps) {
  const safeXpMax = Math.max(1, xpMax)
  const safeXpCurrent = Math.min(Math.max(0, xpCurrent), safeXpMax)
  const xpRemaining = Math.max(0, safeXpMax - safeXpCurrent)
  const progress = Math.round((safeXpCurrent / safeXpMax) * 100)

  return (
    <article
      className="rounded-2xl border border-white/10 bg-[#1A1A1A] p-5 text-white shadow-lg"
      data-theme-primary={themeColors.primary}
      data-theme-cyan={themeColors.cyan}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#00D9FF]">Progression XP</p>
          <h3 className="mt-2 text-xl font-black text-white">{title}</h3>
          <p className="mt-1 text-sm font-semibold text-[#A0AEC0]">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-[#FF5722]/30 bg-[#FF5722]/10 px-4 py-3 text-right">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#A0AEC0]">Niveau</p>
          <p className="text-3xl font-black text-[#FF5722]">{level}</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm font-bold">
          <span className="text-[#A0AEC0]">
            {safeXpCurrent} / {xpRemaining} XP avant {safeXpMax} XP prochain niveau
          </span>
          <span className="text-[#00D084]">{progress}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[#0F1117]">
          <div className="h-full rounded-full bg-[#FF5722] transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </article>
  )
}

export type { PerformanceCardProps }
