import { hailiteTheme } from '@/theme/hailiteTheme'

type InvoiceStatus = 'PENDING' | 'PAID'

type InvoiceCardProps = {
  id: string
  name: string
  status: InvoiceStatus
  date: string
  hours: number
  amount: number
  currency: string
}

const themeColors = hailiteTheme.colors

const statusClasses: Record<InvoiceStatus, string> = {
  PENDING: 'bg-[#8B5A3C] text-white',
  PAID: 'bg-[#10B981] text-white',
}

export default function InvoiceCard({ id, name, status, date, hours, amount, currency }: InvoiceCardProps) {
  return (
    <article
      className="rounded-2xl border border-white/10 bg-[#1A1A1A] p-5 text-white shadow-lg"
      data-theme-success={themeColors.status.success}
      data-theme-cyan={themeColors.cyan}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#00D9FF]">Invoice</p>
          <h3 className="mt-2 text-lg font-black text-white">
            {id} — {name}
          </h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${statusClasses[status]}`}>
          {status}
        </span>
      </div>

      <p className="mt-4 text-sm font-semibold text-[#A0AEC0]">
        {date} | {hours} Heures
      </p>
      <p className="mt-4 text-3xl font-black text-[#00D084]">
        {amount}
        {currency} <span className="text-base text-[#A0AEC0]">TTC</span>
      </p>
    </article>
  )
}

export type { InvoiceCardProps, InvoiceStatus }
