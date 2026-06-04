import { hailiteTheme } from '@/theme/hailiteTheme'

type ObjectiveCardProps = {
  current: number
  max: number
  currency: string
  completion: number
}

const themeColors = hailiteTheme.colors

export default function ObjectiveCard({ current, max, currency, completion }: ObjectiveCardProps) {
  const safeCompletion = Math.min(100, Math.max(0, completion))

  return (
    <article
      className="rounded-2xl border border-white/10 bg-[#1A1A1A] p-5 text-white shadow-lg"
      data-theme-secondary={themeColors.secondary}
      data-theme-primary={themeColors.primary}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FF5722]">OBJECTIF HEBDO</p>
        <span className="rounded-full bg-[#00D084]/10 px-3 py-1 text-xs font-black text-[#00D084]">
          {Math.round(safeCompletion)}% complété
        </span>
      </div>

      <p className="mt-5 text-3xl font-black text-white">
        {current}
        {currency} <span className="text-[#A0AEC0]">/ {max}{currency}</span>
      </p>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#0F1117]">
        <div className="h-full rounded-full bg-[#00D084] transition-all duration-700" style={{ width: `${safeCompletion}%` }} />
      </div>
    </article>
  )
}

export type { ObjectiveCardProps }
