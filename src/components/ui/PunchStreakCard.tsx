import { hailiteTheme } from '@/theme/hailiteTheme'

type PunchStreakCardProps = {
  days: number
  status: string
  description: string
}

const themeColors = hailiteTheme.colors

export default function PunchStreakCard({ days, status, description }: PunchStreakCardProps) {
  const dayLabel = days > 1 ? 'jours' : 'jour'

  return (
    <article
      className="rounded-2xl border border-white/10 bg-[#1A1A1A] p-5 text-white shadow-lg"
      data-theme-secondary={themeColors.secondary}
      data-theme-cyan={themeColors.cyan}
    >
      <p className="text-xs font-black uppercase tracking-[0.24em] text-[#00D9FF]">PUNCH STREAK</p>
      <div className="mt-4 flex items-end gap-2">
        <span className="text-5xl font-black leading-none text-white">{days}</span>
        <span className="pb-1 text-xl font-black text-[#A0AEC0]">{dayLabel}</span>
      </div>
      <p className="mt-4 text-sm font-black text-[#00D084]">Status: {status}</p>
      <p className="mt-2 text-sm leading-6 text-[#A0AEC0]">{description}</p>
    </article>
  )
}

export type { PunchStreakCardProps }
