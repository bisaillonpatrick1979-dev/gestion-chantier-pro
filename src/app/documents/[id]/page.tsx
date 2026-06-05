'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useClientStore } from '@/store/useClientStore'
import { useCompanyStore } from '@/store/useCompanyStore'
import { useProjectStore } from '@/store/useProjectStore'
import { useLangStore } from '@/store/useLangStore'
import { useThemeStore } from '@/store/useThemeStore'
import {
  GCPDocument, LineItem, MaterialLine, LabourLine,
  OtherLine, SubcontractLine, PermitBy, PaymentMode,
} from '@/types/documents'
import {
  DecoCorners, DecoTitle, DecoBackground, DecoDiamondRow,
} from '@/components/DecoElements'

// ── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9)
const fmt = (n: number) =>
  new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n)

// ── Defaults ──────────────────────────────────────────────────────────────────
const defaultMaterial  = (): MaterialLine  => ({ id: uid(), claddingType: '', brand: '', thickness: '', qtysqft: 0, supplier: '', unitPrice: 0 })
const defaultLabour    = (): LabourLine    => ({ id: uid(), task: '', estimatedHours: 0, rate: 0, isFlatRate: false })
const defaultOther     = (): OtherLine     => ({ id: uid(), description: '', amount: 0 })
const defaultSubco     = (): SubcontractLine => ({ id: uid(), companyName: '', phone: '', workType: '', amount: 0 })

// ── Types ────────────────────────────────────────────────────────────────────
type TabId = 'info' | 'lines' | 'total' | 'clauses' | 'sign'
type LinesSubTab = 'materials' | 'labour' | 'other' | 'subcontract'

// ─────────────────────────────────────────────────────────────────────────────
export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const docId  = params?.id as string

  const { lang }    = useLangStore()
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  const { themeId }  = useThemeStore()
  const isDeco       = themeId === 'deco'
  const isQuantum    = themeId === 'quantum'
  const isXP         = themeId === 'xp'
  const isAventure   = themeId === 'aventure'
  const cardClass    = isDeco ? 'deco-card-sweep' : isQuantum ? 'quantum-card-glow' : isAventure ? 'aventure-card-glow' : ''

  const { documents, updateDocument, addDocument } = useDocumentStore()
  const { clients }                                 = useClientStore()
  const { company }                                 = useCompanyStore()
  const { projects }                                = useProjectStore()
  const existing = documents.find(d => d.id === docId)

  // Will be refined after clientId state is declared — placeholder at declaration site
  const _initClientId = existing?.clientId ?? ''

  // ── Type / Statut ──────────────────────────────────────────────────────────
  const [docType, setDocType]   = useState<'invoice' | 'quote' | 'contract'>((existing?.type as any) ?? 'invoice')
  const [docNumber, setDocNumber] = useState(existing?.number ?? '')
  const [docDate, setDocDate]     = useState(existing?.date ?? new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate]     = useState(existing?.dueDate ?? '')
  const [status, setStatus]       = useState(existing?.status ?? 'draft')

  // ── Compagnie ──────────────────────────────────────────────────────────────
  const [compName, setCompName]         = useState(existing?.companyName   ?? company.name)
  const [compAddress, setCompAddress]   = useState(company.address)
  const [compCity, setCompCity]         = useState(company.city)
  const [compProvince, setCompProvince] = useState(company.province)
  const [compPostal, setCompPostal]     = useState(company.postalCode)
  const [compPhone, setCompPhone]       = useState(existing?.companyPhone   ?? company.phone)
  const [compEmail, setCompEmail]       = useState(existing?.companyEmail   ?? company.email)
  const [compGST, setCompGST]           = useState(existing?.companyGST     ?? company.gstNumber)
  const [compWCB, setCompWCB]           = useState(existing?.companyWCB     ?? company.wcbNumber)
  const [compBN, setCompBN]             = useState(existing?.companyBN      ?? company.bnNumber ?? '')

  // ── Client ─────────────────────────────────────────────────────────────────
  const [clientId, setClientId]           = useState(existing?.clientId ?? '')
  const [clientName, setClientName]       = useState(existing?.clientName ?? '')

  // Projets bloquants : ouverts, avec tâches non vérifiées par admin
  const blockedProjects = projects.filter(p =>
    p.clientId === (clientId || _initClientId) &&
    p.status === 'open' &&
    (p.tasks ?? []).length > 0 &&
    !p.adminVerifiedAt
  )
  const [clientAddress, setClientAddress] = useState(existing?.clientAddress ?? '')
  const [clientEmail, setClientEmail]     = useState(existing?.clientEmail ?? '')
  const [clientPhone, setClientPhone]     = useState(existing?.clientPhone ?? '')
  const [siteAddress, setSiteAddress]     = useState(existing?.siteAddress ?? '')
  const [refQuote, setRefQuote]           = useState(existing?.refQuote ?? '')
  const [refContract, setRefContract]     = useState(existing?.refContract ?? '')

  // ── Lignes standard (Facture) ──────────────────────────────────────────────
  const [lines, setLines] = useState<LineItem[]>(
    existing?.lines ?? [{ id: uid(), description: '', qty: 1, unit: t('unité', 'unit'), unitPrice: 0 }]
  )

  // ── Lignes structurées (Devis / Contrat) ───────────────────────────────────
  const [materialLines, setMaterialLines] = useState<MaterialLine[]>(existing?.materialLines ?? [defaultMaterial()])
  const [labourLines, setLabourLines]     = useState<LabourLine[]>(existing?.labourLines ?? [defaultLabour()])
  const [otherLines, setOtherLines]       = useState<OtherLine[]>(existing?.otherLines ?? [defaultOther()])
  const [subcoLines, setSubcoLines]       = useState<SubcontractLine[]>(existing?.subcontractLines ?? [])

  // ── Total / Conditions ─────────────────────────────────────────────────────
  const [taxRate, setTaxRate]               = useState(existing?.taxRate ?? 5)
  const [discountPct, setDiscountPct]       = useState(existing?.discountPct ?? 0)
  const [depositAmount, setDepositAmount]   = useState(existing?.depositAmount ?? 0)
  const [depositPct, setDepositPct]         = useState(existing?.depositPct ?? 25)
  const [paymentMidPct, setPaymentMidPct]   = useState(existing?.paymentMidPct ?? 25)
  const [paymentFinalPct, setPaymentFinalPct] = useState(existing?.paymentFinalPct ?? 50)
  const [lateInterestPct, setLateInterestPct] = useState(existing?.lateInterestPct ?? 2)
  const [holdbackPct, setHoldbackPct]       = useState(existing?.holdbackPct ?? 0)
  const [quoteValidDays, setQuoteValidDays] = useState(existing?.quoteValidDays ?? 30)
  const [workStartDate, setWorkStartDate]   = useState(existing?.workStartDate ?? '')
  const [workEndDate, setWorkEndDate]       = useState(existing?.workEndDate ?? '')
  const [warrantyYears, setWarrantyYears]   = useState(existing?.warrantyYears ?? 2)
  const [permitBy, setPermitBy]             = useState<PermitBy>(existing?.permitBy ?? 'client')
  const [acceptedPayments, setAcceptedPayments] = useState<PaymentMode[]>(existing?.acceptedPayments ?? ['etransfer', 'cheque'])
  const [notes, setNotes]                   = useState(existing?.notes ?? '')

  // ── Clauses contrat ────────────────────────────────────────────────────────
  const [contractObject, setContractObject]           = useState(existing?.contractObject ?? '')
  const [clauseChangeOrder, setClauseChangeOrder]     = useState(existing?.clauseChangeOrder ?? t('Toute modification doit être approuvée par écrit (change order signé) avant exécution.', 'All modifications must be approved in writing (signed change order) before execution.'))
  const [clauseResiliation, setClauseResiliation]     = useState(existing?.clauseResiliation ?? t('Résiliation avec préavis de 7 jours. Le dépôt est non remboursable si les travaux ont débuté.', 'Termination with 7-day notice. Deposit is non-refundable once work has begun.'))
  const [clauseWarrantyDetails, setClauseWarrantyDetails] = useState(existing?.clauseWarrantyDetails ?? t('Couvre la pose et l\'étanchéité. Exclut les dommages causés par des événements extérieurs (grêle, vent > 90 km/h, vandalisme).', 'Covers installation and waterproofing. Excludes damage from external events (hail, wind > 90 km/h, vandalism).'))
  const [hasInsurance, setHasInsurance]               = useState(existing?.hasInsurance ?? true)
  const [subcontractAuthorized, setSubcontractAuthorized] = useState(existing?.subcontractAuthorized ?? false)
  const [subcontractorName, setSubcontractorName]     = useState(existing?.subcontractorName ?? '')
  const [subcontractorPhone, setSubcontractorPhone]   = useState(existing?.subcontractorPhone ?? '')
  const [subcontractorLicense, setSubcontractorLicense] = useState(existing?.subcontractorLicense ?? '')

  // ── Navigation ─────────────────────────────────────────────────────────────
  const [tab, setTab]                   = useState<TabId>('info')
  const [linesSubTab, setLinesSubTab]   = useState<LinesSubTab>('materials')
  const [showPdfPreview, setShowPdfPreview] = useState(false)

  // ── Signature ──────────────────────────────────────────────────────────────
  const [clientSignature, setClientSignature] = useState(existing?.signature ?? '')
  const sigRef    = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)

  useEffect(() => {
    if (!clientSignature || !sigRef.current) return
    const canvas = sigRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = new Image()
    img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0, canvas.width, canvas.height) }
    img.src = clientSignature
  }, [clientSignature, tab])

  // Sync compagnie si nouveau doc
  useEffect(() => {
  setCompName(company.name)
  setCompAddress(company.address)
  setCompCity(company.city)
  setCompProvince(company.province)
  setCompPostal(company.postalCode)
  setCompPhone(company.phone)
  setCompEmail(company.email)
  setCompGST(company.gstNumber)
  setCompWCB(company.wcbNumber)
  setCompBN((company as any).bnNumber ?? '')
  }, [company])

  // ── Calculs ────────────────────────────────────────────────────────────────
  const isStructured = docType !== 'invoice'

  const subtotalMaterials = materialLines.reduce((s, l) => s + l.qtysqft * l.unitPrice, 0)
  const subtotalLabour    = labourLines.reduce((s, l) => s + (l.isFlatRate ? l.rate : l.estimatedHours * l.rate), 0)
  const subtotalOther     = otherLines.reduce((s, l) => s + l.amount, 0)
  const subtotalSubco     = subcoLines.reduce((s, l) => s + l.amount, 0)
  const structuredSubtotal = subtotalMaterials + subtotalLabour + subtotalOther + subtotalSubco

  const subtotal    = isStructured ? structuredSubtotal : lines.reduce((s, l) => s + l.qty * l.unitPrice, 0)
  const discountAmt = subtotal * (discountPct / 100)
  const taxable     = subtotal - discountAmt
  const taxAmt      = taxable * (taxRate / 100)
  const total       = taxable + taxAmt
  const holdbackAmt = total * (holdbackPct / 100)
  const balanceDue  = total - depositAmount

  const quoteExpiryDate = docType === 'quote' && docDate
    ? new Date(new Date(docDate).getTime() + quoteValidDays * 86400000).toISOString().split('T')[0]
    : ''

  const todayFormatted = new Date().toLocaleDateString(
    lang === 'fr' ? 'fr-CA' : 'en-CA',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )
  const ownerName = company.ownerName || company.name || 'Hailite Xteriors'

  // ── Client select ──────────────────────────────────────────────────────────
  const handleSelectClient = (id: string) => {
    setClientId(id)
    const cl = clients.find(c => c.id === id)
    if (cl) { setClientName(cl.name); setClientAddress(cl.address ?? ''); setClientEmail(cl.email ?? ''); setClientPhone(cl.phone ?? '') }
  }

  // ── Lignes standard ────────────────────────────────────────────────────────
  const addLine    = () => setLines(l => [...l, { id: uid(), description: '', qty: 1, unit: t('unité', 'unit'), unitPrice: 0 }])
  const updateLine = (id: string, field: keyof LineItem, value: string | number) =>
    setLines(l => l.map(li => li.id === id ? { ...li, [field]: value } : li))
  const removeLine = (id: string) => setLines(l => l.filter(li => li.id !== id))

  // ── Paiements acceptés toggle ──────────────────────────────────────────────
  const togglePayment = (m: PaymentMode) =>
    setAcceptedPayments(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])

  // ── Canvas signature ───────────────────────────────────────────────────────
  const getXY = (clientX: number, clientY: number) => {
    const canvas = sigRef.current!
    const r = canvas.getBoundingClientRect()
    return { x: (clientX - r.left) * (canvas.width / r.width), y: (clientY - r.top) * (canvas.height / r.height) }
  }
  const startDraw    = (cx: number, cy: number) => { setDrawing(true); const ctx = sigRef.current?.getContext('2d'); if (!ctx) return; const { x, y } = getXY(cx, cy); ctx.beginPath(); ctx.moveTo(x, y) }
  const continueDraw = (cx: number, cy: number) => { if (!drawing) return; const ctx = sigRef.current?.getContext('2d'); if (!ctx) return; const { x, y } = getXY(cx, cy); ctx.strokeStyle = isDeco ? '#D6B25E' : '#a855f7'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineTo(x, y); ctx.stroke() }
  const endDraw      = () => { setDrawing(false); setClientSignature(sigRef.current?.toDataURL() ?? '') }
  const clearSig     = () => { const ctx = sigRef.current?.getContext('2d'); if (ctx) ctx.clearRect(0, 0, sigRef.current!.width, sigRef.current!.height); setClientSignature('') }

  // ── Sauvegarde ─────────────────────────────────────────────────────────────
  const save = () => {
    const payload: GCPDocument = {
      id: docId, type: docType, number: docNumber, date: docDate, dueDate, status,
      clientId, clientName, clientAddress, clientEmail, clientPhone, siteAddress,
      refQuote, refContract,
      companyName: compName,
      companyAddress: `${compAddress}, ${compCity} ${compProvince} ${compPostal}`,
      companyPhone: compPhone, companyEmail: compEmail,
      companyGST: compGST, companyWCB: compWCB, companyBN: compBN,
      companyLogo: company.logoUrl,
      lines,
      materialLines, labourLines, otherLines, subcontractLines: subcoLines,
      subtotal, subtotalMaterials, subtotalLabour, subtotalOther, subtotalSubcontract: subtotalSubco,
      discountPct, discountAmount: discountAmt,
      taxRate, taxAmount: taxAmt, total,
      depositAmount, depositPct, paymentMidPct, paymentFinalPct, balanceDue,
      lateInterestPct, holdbackPct, warrantyYears,
      quoteValidDays, workStartDate, workEndDate, permitBy, acceptedPayments,
      contractObject, clauseChangeOrder, clauseResiliation, clauseWarrantyDetails,
      hasInsurance, subcontractAuthorized, subcontractorName, subcontractorPhone, subcontractorLicense,
      notes, signature: clientSignature,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    if (existing) { updateDocument(docId, payload) }
    else { addDocument(docType); updateDocument(docId, payload) }
    router.push('/documents')
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  const docTypeLabel = docType === 'invoice' ? t('Facture', 'Invoice') : docType === 'quote' ? t('Devis', 'Quote') : t('Contrat', 'Contract')

  const handleSendEmail = () => {
    if (invoiceBlocked) { alert(invoiceBlockMsg); return }
    const subject = encodeURIComponent(`${docTypeLabel} ${docNumber} — ${compName}`)
    const body = encodeURIComponent([
      t(`Bonjour ${clientName},`, `Hello ${clientName},`), '',
      t(`Veuillez trouver ci-joint votre ${docTypeLabel.toLowerCase()} #${docNumber}.`, `Please find attached your ${docTypeLabel} #${docNumber}.`), '',
      `${t('Total', 'Total')}: ${fmt(total)}`,
      ...(depositAmount > 0 ? [`${t('Solde dû', 'Balance Due')}: ${fmt(balanceDue)}`] : []),
      ...(dueDate ? [`${t('Échéance', 'Due Date')}: ${dueDate}`] : []), '',
      notes || '', '',
      t('Merci pour votre confiance!', 'Thank you for your business!'),
      compName, compPhone,
    ].join('\n'))
    window.open(`mailto:${clientEmail || ''}?subject=${subject}&body=${body}`)
  }

  const handleSendSMS = () => {
    if (invoiceBlocked) { alert(invoiceBlockMsg); return }
    const body = encodeURIComponent([
      `${compName}`, `${docTypeLabel} #${docNumber}`,
      `${t('Client', 'Client')}: ${clientName}`, `${t('Total', 'Total')}: ${fmt(total)}`,
      ...(depositAmount > 0 ? [`${t('Solde dû', 'Balance Due')}: ${fmt(balanceDue)}`] : []),
      ...(dueDate ? [`${t('Échéance', 'Due')}: ${dueDate}`] : []),
    ].join('\n'))
    const phone = clientPhone.replace(/\D/g, '')
    window.open(`sms:${phone ? `+1${phone}` : ''}?body=${body}`)
  }

  const handlePrintPdf = () => { setShowPdfPreview(true); setTimeout(() => window.print(), 400) }

  // ── UI helpers ─────────────────────────────────────────────────────────────
  const accentColor  = isDeco ? '#D6B25E' : isQuantum ? '#a855f7' : '#3b82f6'
  const accentBg     = isDeco ? 'rgba(214,178,94,0.12)'  : isQuantum ? 'rgba(168,85,247,0.12)'  : 'rgba(59,130,246,0.12)'
  const accentBorder = isDeco ? 'rgba(214,178,94,0.3)'   : isQuantum ? 'rgba(168,85,247,0.3)'   : 'rgba(59,130,246,0.3)'
  const totalBgColor = docType === 'invoice' ? '#2563eb' : docType === 'quote' ? '#059669' : '#7c3aed'
  const watermarkText = docType === 'invoice' ? t('FACTURE', 'INVOICE') : docType === 'quote' ? t('DEVIS', 'QUOTE') : t('CONTRAT', 'CONTRACT')

  const inputClass = `w-full rounded-xl px-4 py-3 text-sm font-medium outline-none border transition-all
    ${isDeco ? 'bg-[#1a1500]/80 border-[#D6B25E]/30 text-[#D6B25E] placeholder-[#D6B25E]/40 focus:border-[#D6B25E]'
      : isQuantum ? 'bg-[#0a0015]/80 border-violet-500/30 text-violet-100 placeholder-violet-400/40 focus:border-violet-400'
      : 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-white/60'}`

  const labelClass = `text-xs font-semibold uppercase tracking-widest mb-1 block
    ${isDeco ? 'text-[#D6B25E]/70' : isQuantum ? 'text-violet-400/70' : 'text-white/60'}`

  const cardStyle = `rounded-2xl p-5 space-y-3 ${cardClass}
    ${isDeco ? 'bg-[#0d0a00]/80 border border-[#D6B25E]/20'
      : isQuantum ? 'bg-[#0a0015]/80 border border-violet-500/20'
      : 'bg-white/5 border border-white/10'}`

  const cardTitle = `text-sm font-bold mb-2 ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`

  // ── Onglets selon type ─────────────────────────────────────────────────────
  const TABS: { id: TabId; icon: string; label: string }[] = [
    { id: 'info',  icon: '📋', label: t('Info', 'Info') },
    { id: 'lines', icon: '📝', label: t('Lignes', 'Lines') },
    { id: 'total', icon: '💰', label: t('Total', 'Total') },
    ...(docType === 'contract' ? [{ id: 'clauses' as TabId, icon: '⚖️', label: t('Clauses', 'Clauses') }] : []),
    { id: 'sign',  icon: '✍️', label: t('Signature', 'Sign') },
  ]

  const DOC_TYPES = [
    { id: 'invoice',  emoji: '🧾', label: t('Facture', 'Invoice') },
    { id: 'quote',    emoji: '📄', label: t('Devis', 'Quote') },
    { id: 'contract', emoji: '📜', label: t('Contrat', 'Contract') },
  ] as const

  const STATUSES = [
    { id: 'draft',   label: t('Brouillon', 'Draft') },
    { id: 'sent',    label: t('Envoyé', 'Sent') },
    { id: 'paid',    label: t('Payé', 'Paid') },
    { id: 'overdue', label: t('En retard', 'Overdue') },
  ] as const

  const invoiceBlocked = docType === 'invoice' && blockedProjects.length > 0
  const invoiceBlockMsg = t(
    `🔒 Projet "${blockedProjects[0]?.name}" non vérifié par l'admin. L'employé doit confirmer les travaux et l'admin doit vérifier avant d'envoyer la facture.`,
    `🔒 Project "${blockedProjects[0]?.name}" not verified by admin. The employee must confirm work and admin must verify before sending the invoice.`
  )

  const LINES_SUBTABS: { id: LinesSubTab; icon: string; label: string }[] = [
    { id: 'materials',   icon: '🧱', label: t('Matériaux', 'Materials') },
    { id: 'labour',      icon: '👷', label: t('Main-d\'œuvre', 'Labour') },
    { id: 'other',       icon: '🚚', label: t('Autres frais', 'Other') },
    { id: 'subcontract', icon: '🤝', label: t('Sous-traitance', 'Subcontract') },
  ]

  const PAYMENT_MODES: { id: PaymentMode; label: string }[] = [
    { id: 'etransfer', label: 'e-Transfer' },
    { id: 'cheque',    label: t('Chèque', 'Cheque') },
    { id: 'virement',  label: t('Virement', 'Wire') },
    { id: 'cash',      label: t('Comptant', 'Cash') },
  ]

  const PERMIT_OPTIONS: { id: PermitBy; label: string }[] = [
    { id: 'client',      label: t('Client', 'Client') },
    { id: 'contractor',  label: t('Contracteur', 'Contractor') },
    { id: 'na',          label: t('Sans objet', 'N/A') },
  ]

  // ── Sous-composants ────────────────────────────────────────────────────────
  const SignatureCanvas = () => (
    <div>
      <p className={`text-xs font-bold mb-2 ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>👤 {t('Signature client', 'Client Signature')}</p>
      <div className={`rounded-xl overflow-hidden border ${isDeco ? 'border-[#D6B25E]/30 bg-[#0a0700]' : 'border-white/20 bg-black/30'}`}>
        <canvas ref={sigRef} width={300} height={120} className="w-full cursor-crosshair" style={{ display: 'block', touchAction: 'none' }}
          onPointerDown={e => startDraw(e.clientX, e.clientY)}
          onPointerMove={e => continueDraw(e.clientX, e.clientY)}
          onPointerUp={endDraw} onPointerLeave={endDraw} />
      </div>
      <button onClick={clearSig} className="w-full mt-2 py-2 rounded-xl text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">🗑️ {t('Effacer', 'Clear')}</button>
      {clientSignature && <p className="text-center text-xs mt-1 text-emerald-400 font-bold">✅ {t('Signée', 'Signed')}</p>}
    </div>
  )

  const ContractorSig = () => (
    <div>
      <p className={`text-xs font-bold mb-2 ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>🏢 {t('Contracteur', 'Contractor')}</p>
      <div style={{ height: '120px', border: `1px solid ${accentBorder}`, borderRadius: '12px', background: accentBg, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '10px' }}>
        <div style={{ borderTop: `1px solid ${accentColor}`, paddingTop: '8px' }}>
          <p style={{ color: accentColor, fontSize: '13px', fontWeight: 800, fontFamily: 'Georgia, serif' }}>{ownerName}</p>
          <p style={{ color: isDeco ? '#D6B25E' : 'rgba(255,255,255,0.5)', fontSize: '10px', marginTop: '2px' }}>{compName}</p>
          <p style={{ color: isDeco ? '#D6B25E' : 'rgba(255,255,255,0.4)', fontSize: '9px', marginTop: '1px' }}>{todayFormatted}</p>
        </div>
      </div>
    </div>
  )

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-28 pt-4 px-4 relative" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {isDeco && <DecoBackground />}

      <div className="max-w-lg mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => router.back()}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all
              ${isDeco ? 'bg-[#D6B25E]/20 text-[#D6B25E]' : 'bg-white/10 text-white hover:bg-white/20'}`}>←</button>
          {isDeco ? (
            <DecoTitle>{existing ? t('Modifier', 'Edit') : t('Nouveau', 'New')} {docTypeLabel}</DecoTitle>
          ) : (
            <h1 className={`text-xl font-black tracking-tight
              ${isXP ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400'
                : isQuantum ? 'text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400'
                : 'text-white'}`}>
              {existing ? t('Modifier', 'Edit') : t('Nouveau', 'New')} {docType === 'invoice' ? '🧾' : docType === 'quote' ? '📄' : '📜'}
            </h1>
          )}
        </div>

        {/* ── Type + Statut ── */}
        <div className={cardStyle} style={{ marginBottom: '16px' }}>
          {isDeco && <DecoCorners />}
          <div className="flex gap-2 mb-4">
            {DOC_TYPES.map(dt => (
              <button key={dt.id} onClick={() => { setDocType(dt.id as any); setTab('info') }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all
                  ${docType === dt.id
                    ? isDeco ? 'bg-[#D6B25E] text-[#0d0a00]' : isQuantum ? 'bg-violet-600 text-white' : 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/50'}`}>
                {dt.emoji} {dt.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>{t('N° Document', 'Doc #')}</label><input className={inputClass} value={docNumber} onChange={e => setDocNumber(e.target.value)} placeholder="FAC-2026-001" /></div>
            <div><label className={labelClass}>{t('Date', 'Date')}</label><input className={inputClass} type="date" value={docDate} onChange={e => setDocDate(e.target.value)} /></div>
            <div><label className={labelClass}>{t('Échéance', 'Due Date')}</label><input className={inputClass} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
            <div><label className={labelClass}>{t('Statut', 'Status')}</label>
              <select
                className={inputClass}
                value={status}
                onChange={e => {
                  const next = e.target.value as typeof status
                  if (next === 'sent' && invoiceBlocked) {
                    alert(invoiceBlockMsg)
                    return
                  }
                  setStatus(next)
                }}
              >
                {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              {invoiceBlocked && status !== 'sent' && (
                <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', fontWeight: 600 }}>
                  ⚠️ {t('Projet non clôturé — envoi bloqué', 'Project not closed — sending blocked')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Onglets ── */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {TABS.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all
                ${tab === tb.id
                  ? isDeco ? 'bg-[#D6B25E] text-[#0d0a00]' : isQuantum ? 'bg-violet-600 text-white' : 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
              {tb.icon} {tb.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
             TAB INFO
            ══════════════════════════════════════════════════════════════════ */}
        {tab === 'info' && (
          <div className="space-y-4">

            {/* Compagnie */}
            <div className={cardStyle}>
              {isDeco && <DecoCorners />}
              <div className="flex items-center gap-2 mb-3">
                {company.logoUrl && <img src={company.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-lg" />}
                <div className={cardTitle}>🏢 {t('Votre compagnie', 'Your Company')} <span className="text-xs font-normal opacity-40">{t('(depuis Réglages)', '(from Settings)')}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className={labelClass}>{t('Nom compagnie', 'Company Name')}</label><input className={inputClass} value={compName} onChange={e => setCompName(e.target.value)} placeholder="Hailite Xteriors" /></div>
                <div className="col-span-2"><label className={labelClass}>{t('Adresse', 'Address')}</label><input className={inputClass} value={compAddress} onChange={e => setCompAddress(e.target.value)} /></div>
                <div><label className={labelClass}>{t('Ville', 'City')}</label><input className={inputClass} value={compCity} onChange={e => setCompCity(e.target.value)} /></div>
                <div><label className={labelClass}>{t('Province', 'Prov')}</label><input className={inputClass} value={compProvince} onChange={e => setCompProvince(e.target.value)} /></div>
                <div><label className={labelClass}>{t('Code postal', 'Postal')}</label><input className={inputClass} value={compPostal} onChange={e => setCompPostal(e.target.value)} /></div>
                <div><label className={labelClass}>{t('Téléphone', 'Phone')}</label><input className={inputClass} value={compPhone} onChange={e => setCompPhone(e.target.value)} /></div>
                <div className="col-span-2"><label className={labelClass}>{t('Courriel', 'Email')}</label><input className={inputClass} value={compEmail} onChange={e => setCompEmail(e.target.value)} /></div>
                <div><label className={labelClass}>{t('N° GST', 'GST #')}</label><input className={inputClass} value={compGST} onChange={e => setCompGST(e.target.value)} /></div>
                <div><label className={labelClass}>{t('N° WCB', 'WCB #')}</label><input className={inputClass} value={compWCB} onChange={e => setCompWCB(e.target.value)} /></div>
                <div className="col-span-2"><label className={labelClass}>{t('N° Entreprise (BN)', 'Business # (BN)')}</label><input className={inputClass} value={compBN} onChange={e => setCompBN(e.target.value)} /></div>
              </div>
            </div>

            {/* Client */}
            <div className={cardStyle}>
              {isDeco && <DecoCorners />}
              <div className={cardTitle}>👥 {t('Client', 'Client')}</div>
              {clients.length > 0 && (
                <div className="mb-2">
                  <label className={labelClass}>👥 {t('Choisir un client existant', 'Select Client')}</label>
                  <select className={inputClass} value={clientId} onChange={e => handleSelectClient(e.target.value)}>
                    <option value="">{t('— Nouveau client —', '— New Client —')}</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className={labelClass}>{t('Nom', 'Name')}</label><input className={inputClass} value={clientName} onChange={e => setClientName(e.target.value)} /></div>
                <div className="col-span-2"><label className={labelClass}>{t('Adresse de facturation', 'Billing Address')}</label><input className={inputClass} value={clientAddress} onChange={e => setClientAddress(e.target.value)} /></div>
                <div className="col-span-2"><label className={labelClass}>{t('Adresse du chantier', 'Site Address')}</label><input className={inputClass} value={siteAddress} onChange={e => setSiteAddress(e.target.value)} placeholder={t('Si différente', 'If different')} /></div>
                <div><label className={labelClass}>{t('Courriel', 'Email')}</label><input className={inputClass} value={clientEmail} onChange={e => setClientEmail(e.target.value)} /></div>
                <div><label className={labelClass}>{t('Téléphone', 'Phone')}</label><input className={inputClass} value={clientPhone} onChange={e => setClientPhone(e.target.value)} /></div>
              </div>
            </div>

            {/* Références */}
            <div className={cardStyle}>
              {isDeco && <DecoCorners />}
              <div className={cardTitle}>🔗 {t('Références', 'References')}</div>
              <div className="grid grid-cols-2 gap-3">
                {docType !== 'quote' && (
                  <div><label className={labelClass}>{t('Réf. Devis', 'Quote Ref.')}</label><input className={inputClass} value={refQuote} onChange={e => setRefQuote(e.target.value)} placeholder="DEV-2026-001" /></div>
                )}
                {docType === 'invoice' && (
                  <div><label className={labelClass}>{t('Réf. Contrat', 'Contract Ref.')}</label><input className={inputClass} value={refContract} onChange={e => setRefContract(e.target.value)} placeholder="CON-2026-001" /></div>
                )}
                {docType === 'contract' && (
                  <div className="col-span-2"><label className={labelClass}>{t('Réf. Devis annexé', 'Attached Quote Ref.')}</label><input className={inputClass} value={refQuote} onChange={e => setRefQuote(e.target.value)} placeholder="DEV-2026-001" /></div>
                )}
              </div>
              {/* Objet du contrat */}
              {docType === 'contract' && (
                <div className="mt-3">
                  <label className={labelClass}>{t('Objet du contrat', 'Contract Object')}</label>
                  <textarea className={`${inputClass} min-h-[80px] resize-none`} value={contractObject} onChange={e => setContractObject(e.target.value)}
                    placeholder={t('Description générale des travaux à réaliser…', 'General description of work to be performed…')} />
                </div>
              )}
              {/* Validité devis */}
              {docType === 'quote' && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>{t('Validité (jours)', 'Valid (days)')}</label>
                    <input className={inputClass} type="number" value={quoteValidDays} onChange={e => setQuoteValidDays(parseInt(e.target.value) || 30)} min="1" />
                  </div>
                  {quoteExpiryDate && (
                    <div className="flex flex-col justify-end">
                      <span className={`text-xs font-bold ${isDeco ? 'text-[#D6B25E]' : 'text-emerald-400'}`}>
                        {t(`Expire le ${quoteExpiryDate}`, `Expires ${quoteExpiryDate}`)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Permis (Devis / Contrat) */}
            {docType !== 'invoice' && (
              <div className={cardStyle}>
                {isDeco && <DecoCorners />}
                <div className={cardTitle}>🏛️ {t('Permis de construction', 'Building Permits')}</div>
                <p className={`text-xs mb-3 ${isDeco ? 'text-[#D6B25E]/60' : 'text-white/50'}`}>{t('Qui est responsable d\'obtenir les permis ?', 'Who is responsible for obtaining permits?')}</p>
                <div className="flex gap-2">
                  {PERMIT_OPTIONS.map(p => (
                    <button key={p.id} onClick={() => setPermitBy(p.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all
                        ${permitBy === p.id
                          ? isDeco ? 'bg-[#D6B25E] text-[#0d0a00]' : isQuantum ? 'bg-violet-600 text-white' : 'bg-white/20 text-white'
                          : 'bg-white/5 text-white/50'}`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
             TAB LIGNES
            ══════════════════════════════════════════════════════════════════ */}
        {tab === 'lines' && (
          <div className="space-y-3">

            {/* FACTURE — lignes standard */}
            {docType === 'invoice' && (
              <>
                {lines.map((line, idx) => (
                  <div key={line.id} className={cardStyle}>
                    {isDeco && <DecoCorners />}
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold uppercase tracking-widest opacity-40`}>{t('Ligne', 'Line')} {idx + 1}</span>
                      {lines.length > 1 && <button onClick={() => removeLine(line.id)} className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 text-xs flex items-center justify-center">✕</button>}
                    </div>
                    <div><label className={labelClass}>{t('Description', 'Description')}</label><input className={inputClass} value={line.description} onChange={e => updateLine(line.id, 'description', e.target.value)} /></div>
                    <div className="grid grid-cols-3 gap-2">
                      <div><label className={labelClass}>{t('Qté', 'Qty')}</label><input className={inputClass} type="number" value={line.qty} onChange={e => updateLine(line.id, 'qty', parseFloat(e.target.value) || 0)} /></div>
                      <div><label className={labelClass}>{t('Unité', 'Unit')}</label><input className={inputClass} value={line.unit} onChange={e => updateLine(line.id, 'unit', e.target.value)} /></div>
                      <div><label className={labelClass}>{t('Prix', 'Price')}</label><input className={inputClass} type="number" value={line.unitPrice} onChange={e => updateLine(line.id, 'unitPrice', parseFloat(e.target.value) || 0)} /></div>
                    </div>
                    <div className={`text-right text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : isQuantum ? 'text-violet-300' : 'text-white'}`}>= {fmt(line.qty * line.unitPrice)}</div>
                  </div>
                ))}
                <button onClick={addLine} className={`w-full py-4 rounded-2xl font-bold text-sm border-2 border-dashed transition-all
                  ${isDeco ? 'border-[#D6B25E]/30 text-[#D6B25E]/60' : isQuantum ? 'border-violet-500/30 text-violet-400/60' : 'border-white/20 text-white/40'}`}>
                  ➕ {t('Ajouter une ligne', 'Add Line')}
                </button>
              </>
            )}

            {/* DEVIS / CONTRAT — lignes structurées */}
            {docType !== 'invoice' && (
              <>
                {/* Sous-onglets */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {LINES_SUBTABS.map(st => (
                    <button key={st.id} onClick={() => setLinesSubTab(st.id)}
                      className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all
                        ${linesSubTab === st.id
                          ? isDeco ? 'bg-[#D6B25E]/20 text-[#D6B25E] border border-[#D6B25E]/40' : isQuantum ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40' : 'bg-white/15 text-white border border-white/30'
                          : 'bg-white/5 text-white/40'}`}>
                      {st.icon} {st.label}
                    </button>
                  ))}
                </div>

                {/* Sous-total preview */}
                <div className={`rounded-xl px-4 py-2 flex justify-between items-center ${isDeco ? 'bg-[#D6B25E]/5 border border-[#D6B25E]/10' : 'bg-white/5 border border-white/10'}`}>
                  <span className={`text-xs ${isDeco ? 'text-[#D6B25E]/50' : 'text-white/40'}`}>{t('Sous-total section', 'Section subtotal')}</span>
                  <span className={`text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : isQuantum ? 'text-violet-300' : 'text-white'}`}>
                    {linesSubTab === 'materials' ? fmt(subtotalMaterials)
                      : linesSubTab === 'labour' ? fmt(subtotalLabour)
                      : linesSubTab === 'other' ? fmt(subtotalOther)
                      : fmt(subtotalSubco)}
                  </span>
                </div>

                {/* ── MATÉRIAUX ── */}
                {linesSubTab === 'materials' && (
                  <div className="space-y-3">
                    {materialLines.map((ml, idx) => (
                      <div key={ml.id} className={cardStyle}>
                        {isDeco && <DecoCorners />}
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-bold opacity-40`}>{t('Matériau', 'Material')} {idx + 1}</span>
                          {materialLines.length > 1 && <button onClick={() => setMaterialLines(l => l.filter(x => x.id !== ml.id))} className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 text-xs flex items-center justify-center">✕</button>}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div><label className={labelClass}>{t('Type cladding', 'Cladding Type')}</label><input className={inputClass} value={ml.claddingType} onChange={e => setMaterialLines(l => l.map(x => x.id === ml.id ? { ...x, claddingType: e.target.value } : x))} placeholder="Fiber cement" /></div>
                          <div><label className={labelClass}>{t('Marque', 'Brand')}</label><input className={inputClass} value={ml.brand} onChange={e => setMaterialLines(l => l.map(x => x.id === ml.id ? { ...x, brand: e.target.value } : x))} placeholder="James Hardie" /></div>
                          <div><label className={labelClass}>{t('Épaisseur', 'Thickness')}</label><input className={inputClass} value={ml.thickness} onChange={e => setMaterialLines(l => l.map(x => x.id === ml.id ? { ...x, thickness: e.target.value } : x))} placeholder='7/16"' /></div>
                          <div><label className={labelClass}>{t('Fournisseur', 'Supplier')}</label><input className={inputClass} value={ml.supplier} onChange={e => setMaterialLines(l => l.map(x => x.id === ml.id ? { ...x, supplier: e.target.value } : x))} /></div>
                          <div><label className={labelClass}>{t('Qté (pi²)', 'Qty (sq ft)')}</label><input className={inputClass} type="number" value={ml.qtysqft} onChange={e => setMaterialLines(l => l.map(x => x.id === ml.id ? { ...x, qtysqft: parseFloat(e.target.value) || 0 } : x))} /></div>
                          <div><label className={labelClass}>{t('Prix/pi²', '$/sq ft')}</label><input className={inputClass} type="number" value={ml.unitPrice} onChange={e => setMaterialLines(l => l.map(x => x.id === ml.id ? { ...x, unitPrice: parseFloat(e.target.value) || 0 } : x))} /></div>
                        </div>
                        <div className={`text-right text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : isQuantum ? 'text-violet-300' : 'text-white'}`}>= {fmt(ml.qtysqft * ml.unitPrice)}</div>
                      </div>
                    ))}
                    <button onClick={() => setMaterialLines(l => [...l, defaultMaterial()])} className={`w-full py-4 rounded-2xl font-bold text-sm border-2 border-dashed transition-all ${isDeco ? 'border-[#D6B25E]/30 text-[#D6B25E]/60' : 'border-white/20 text-white/40'}`}>➕ {t('Ajouter matériau', 'Add Material')}</button>
                  </div>
                )}

                {/* ── MAIN-D'ŒUVRE ── */}
                {linesSubTab === 'labour' && (
                  <div className="space-y-3">
                    {labourLines.map((ll, idx) => (
                      <div key={ll.id} className={cardStyle}>
                        {isDeco && <DecoCorners />}
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-bold opacity-40`}>{t('Tâche', 'Task')} {idx + 1}</span>
                          {labourLines.length > 1 && <button onClick={() => setLabourLines(l => l.filter(x => x.id !== ll.id))} className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 text-xs flex items-center justify-center">✕</button>}
                        </div>
                        <div><label className={labelClass}>{t('Tâche', 'Task')}</label>
                          <select className={inputClass} value={ll.task} onChange={e => setLabourLines(l => l.map(x => x.id === ll.id ? { ...x, task: e.target.value } : x))}>
                            <option value="">{t('— Choisir —', '— Select —')}</option>
                            {[t('Dépose', 'Removal'), t('Préparation', 'Preparation'), t('Installation', 'Installation'), t('Finitions', 'Finishing'), t('Nettoyage', 'Cleanup'), t('Autre', 'Other')].map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <label className={labelClass}>{t('Type', 'Type')}</label>
                            <div className="flex gap-2 mt-1">
                              {[{ v: false, label: t('$/h', '$/h') }, { v: true, label: t('Forfait', 'Flat') }].map(opt => (
                                <button key={String(opt.v)} onClick={() => setLabourLines(l => l.map(x => x.id === ll.id ? { ...x, isFlatRate: opt.v } : x))}
                                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${ll.isFlatRate === opt.v ? isDeco ? 'bg-[#D6B25E] text-[#0d0a00]' : 'bg-white/20 text-white' : 'bg-white/5 text-white/40'}`}>
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div><label className={labelClass}>{ll.isFlatRate ? t('Montant $', 'Amount $') : t('Taux $/h', 'Rate $/h')}</label><input className={inputClass} type="number" value={ll.rate} onChange={e => setLabourLines(l => l.map(x => x.id === ll.id ? { ...x, rate: parseFloat(e.target.value) || 0 } : x))} /></div>
                          {!ll.isFlatRate && <div className="col-span-2"><label className={labelClass}>{t('Heures estimées', 'Est. Hours')}</label><input className={inputClass} type="number" value={ll.estimatedHours} onChange={e => setLabourLines(l => l.map(x => x.id === ll.id ? { ...x, estimatedHours: parseFloat(e.target.value) || 0 } : x))} /></div>}
                        </div>
                        <div className={`text-right text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : isQuantum ? 'text-violet-300' : 'text-white'}`}>= {fmt(ll.isFlatRate ? ll.rate : ll.estimatedHours * ll.rate)}</div>
                      </div>
                    ))}
                    <button onClick={() => setLabourLines(l => [...l, defaultLabour()])} className={`w-full py-4 rounded-2xl font-bold text-sm border-2 border-dashed transition-all ${isDeco ? 'border-[#D6B25E]/30 text-[#D6B25E]/60' : 'border-white/20 text-white/40'}`}>➕ {t('Ajouter tâche', 'Add Task')}</button>
                  </div>
                )}

                {/* ── AUTRES FRAIS ── */}
                {linesSubTab === 'other' && (
                  <div className="space-y-3">
                    {otherLines.map((ol, idx) => (
                      <div key={ol.id} className={cardStyle}>
                        {isDeco && <DecoCorners />}
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-bold opacity-40`}>{t('Frais', 'Fee')} {idx + 1}</span>
                          {otherLines.length > 1 && <button onClick={() => setOtherLines(l => l.filter(x => x.id !== ol.id))} className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 text-xs flex items-center justify-center">✕</button>}
                        </div>
                        <div><label className={labelClass}>{t('Description', 'Description')}</label>
                          <select className={inputClass} value={ol.description} onChange={e => setOtherLines(l => l.map(x => x.id === ol.id ? { ...x, description: e.target.value } : x))}>
                            <option value="">{t('— Type de frais —', '— Fee Type —')}</option>
                            {[t('Déplacement', 'Travel'), t('Élimination débris', 'Debris Disposal'), t('Location échelle', 'Ladder Rental'), t('Location nacelle', 'Lift Rental'), t('Permis', 'Permit'), t('Autre', 'Other')].map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                        <div className="mt-2"><label className={labelClass}>{t('Montant $', 'Amount $')}</label><input className={inputClass} type="number" value={ol.amount} onChange={e => setOtherLines(l => l.map(x => x.id === ol.id ? { ...x, amount: parseFloat(e.target.value) || 0 } : x))} /></div>
                        <div className={`text-right text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : isQuantum ? 'text-violet-300' : 'text-white'}`}>= {fmt(ol.amount)}</div>
                      </div>
                    ))}
                    <button onClick={() => setOtherLines(l => [...l, defaultOther()])} className={`w-full py-4 rounded-2xl font-bold text-sm border-2 border-dashed transition-all ${isDeco ? 'border-[#D6B25E]/30 text-[#D6B25E]/60' : 'border-white/20 text-white/40'}`}>➕ {t('Ajouter frais', 'Add Fee')}</button>
                  </div>
                )}

                {/* ── SOUS-TRAITANCE ── */}
                {linesSubTab === 'subcontract' && (
                  <div className="space-y-3">
                    {/* Toggle autorisation */}
                    <div className={cardStyle}>
                      {isDeco && <DecoCorners />}
                      <div className={cardTitle}>🤝 {t('Sous-traitance autorisée ?', 'Subcontracting authorized?')}</div>
                      <div className="flex gap-2">
                        {[{ v: true, label: t('Oui', 'Yes') }, { v: false, label: t('Non', 'No') }].map(opt => (
                          <button key={String(opt.v)} onClick={() => setSubcontractAuthorized(opt.v)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${subcontractAuthorized === opt.v ? isDeco ? 'bg-[#D6B25E] text-[#0d0a00]' : 'bg-white/20 text-white' : 'bg-white/5 text-white/40'}`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {subcontractAuthorized && (
                      <>
                        {subcoLines.map((sc, idx) => (
                          <div key={sc.id} className={cardStyle}>
                            {isDeco && <DecoCorners />}
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-xs font-bold opacity-40`}>{t('Sous-traitant', 'Subcontractor')} {idx + 1}</span>
                              <button onClick={() => setSubcoLines(l => l.filter(x => x.id !== sc.id))} className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 text-xs flex items-center justify-center">✕</button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="col-span-2"><label className={labelClass}>{t('Entreprise', 'Company')}</label><input className={inputClass} value={sc.companyName} onChange={e => setSubcoLines(l => l.map(x => x.id === sc.id ? { ...x, companyName: e.target.value } : x))} /></div>
                              <div><label className={labelClass}>{t('Téléphone', 'Phone')}</label><input className={inputClass} value={sc.phone} onChange={e => setSubcoLines(l => l.map(x => x.id === sc.id ? { ...x, phone: e.target.value } : x))} /></div>
                              <div><label className={labelClass}>{t('Licence', 'License')}</label><input className={inputClass} value={subcontractorLicense} onChange={e => setSubcontractorLicense(e.target.value)} /></div>
                              <div className="col-span-2"><label className={labelClass}>{t('Type de travaux', 'Work Type')}</label><input className={inputClass} value={sc.workType} onChange={e => setSubcoLines(l => l.map(x => x.id === sc.id ? { ...x, workType: e.target.value } : x))} /></div>
                              <div className="col-span-2"><label className={labelClass}>{t('Montant $', 'Amount $')}</label><input className={inputClass} type="number" value={sc.amount} onChange={e => setSubcoLines(l => l.map(x => x.id === sc.id ? { ...x, amount: parseFloat(e.target.value) || 0 } : x))} /></div>
                            </div>
                            <div className={`text-right text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : isQuantum ? 'text-violet-300' : 'text-white'}`}>= {fmt(sc.amount)}</div>
                          </div>
                        ))}
                        <button onClick={() => setSubcoLines(l => [...l, defaultSubco()])} className={`w-full py-4 rounded-2xl font-bold text-sm border-2 border-dashed transition-all ${isDeco ? 'border-[#D6B25E]/30 text-[#D6B25E]/60' : 'border-white/20 text-white/40'}`}>➕ {t('Ajouter sous-traitant', 'Add Subcontractor')}</button>
                      </>
                    )}
                  </div>
                )}

                {/* ── Récap global ── */}
                <div className={`${cardStyle} mt-2`}>
                  {isDeco && <DecoCorners />}
                  <div className={cardTitle}>📊 {t('Récapitulatif', 'Summary')}</div>
                  <div className="space-y-1.5">
                    {[
                      { label: `🧱 ${t('Matériaux', 'Materials')}`, val: subtotalMaterials },
                      { label: `👷 ${t('Main-d\'œuvre', 'Labour')}`, val: subtotalLabour },
                      { label: `🚚 ${t('Autres frais', 'Other')}`, val: subtotalOther },
                      ...(subtotalSubco > 0 ? [{ label: `🤝 ${t('Sous-traitance', 'Subcontract')}`, val: subtotalSubco }] : []),
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between">
                        <span className={`text-xs ${isDeco ? 'text-[#D6B25E]/60' : 'text-white/50'}`}>{row.label}</span>
                        <span className={`text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>{fmt(row.val)}</span>
                      </div>
                    ))}
                    <div className={`flex justify-between pt-2 border-t ${isDeco ? 'border-[#D6B25E]/20' : 'border-white/10'}`}>
                      <span className={`text-sm font-black ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>{t('SOUS-TOTAL', 'SUBTOTAL')}</span>
                      <span className={`text-base font-black ${isDeco ? 'text-[#D6B25E]' : isQuantum ? 'text-violet-300' : 'text-white'}`}>{fmt(structuredSubtotal)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
             TAB TOTAL
            ══════════════════════════════════════════════════════════════════ */}
        {tab === 'total' && (
          <div className="space-y-4">
            <div className={cardStyle}>
              {isDeco && <DecoCorners />}

              {/* Remise + Taxes */}
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>{t('Remise %', 'Discount %')}</label><input className={inputClass} type="number" value={discountPct} onChange={e => setDiscountPct(parseFloat(e.target.value) || 0)} min="0" max="100" /></div>
                <div><label className={labelClass}>{t('TPS/GST %', 'GST %')}</label><input className={inputClass} type="number" value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value) || 0)} min="0" max="100" /></div>
                <div><label className={labelClass}>{t('Intérêts retard %/mois', 'Late Int. %/mo')}</label><input className={inputClass} type="number" value={lateInterestPct} onChange={e => setLateInterestPct(parseFloat(e.target.value) || 0)} min="0" max="5" step="0.5" /></div>
                <div><label className={labelClass}>{t("Holdback Builders' Lien %", 'Holdback %')}</label><input className={inputClass} type="number" value={holdbackPct} onChange={e => setHoldbackPct(parseFloat(e.target.value) || 0)} min="0" max="20" /></div>
              </div>

              {/* Calendrier travaux */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div><label className={labelClass}>{t('Début travaux', 'Work Start')}</label><input className={inputClass} type="date" value={workStartDate} onChange={e => setWorkStartDate(e.target.value)} /></div>
                <div><label className={labelClass}>{t('Fin travaux', 'Work End')}</label><input className={inputClass} type="date" value={workEndDate} onChange={e => setWorkEndDate(e.target.value)} /></div>
                <div className="col-span-2"><label className={labelClass}>{t('Garantie pose (années)', 'Warranty (years)')}</label><input className={inputClass} type="number" value={warrantyYears} onChange={e => setWarrantyYears(parseInt(e.target.value) || 2)} min="0" max="25" /></div>
              </div>

              {/* Conditions de paiement (Devis / Contrat) */}
              {docType !== 'invoice' && (
                <div className="mt-3">
                  <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${isDeco ? 'text-[#D6B25E]/70' : 'text-white/50'}`}>
                    💳 {t('Échéancier de paiement', 'Payment Schedule')}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div><label className={labelClass}>{t('Dépôt %', 'Deposit %')}</label><input className={inputClass} type="number" value={depositPct} onChange={e => setDepositPct(parseFloat(e.target.value) || 0)} min="0" max="100" /></div>
                    <div><label className={labelClass}>{t('Interméd. %', 'Mid %')}</label><input className={inputClass} type="number" value={paymentMidPct} onChange={e => setPaymentMidPct(parseFloat(e.target.value) || 0)} min="0" max="100" /></div>
                    <div><label className={labelClass}>{t('Final %', 'Final %')}</label><input className={inputClass} type="number" value={paymentFinalPct} onChange={e => setPaymentFinalPct(parseFloat(e.target.value) || 0)} min="0" max="100" /></div>
                  </div>
                  <p className={`text-xs mt-1 text-center ${depositPct + paymentMidPct + paymentFinalPct === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {t(`Total: ${depositPct + paymentMidPct + paymentFinalPct}%`, `Total: ${depositPct + paymentMidPct + paymentFinalPct}%`)} {depositPct + paymentMidPct + paymentFinalPct !== 100 ? '⚠️' : '✅'}
                  </p>
                </div>
              )}

              {/* Dépôt reçu (Facture) */}
              {docType === 'invoice' && (
                <div className="mt-3"><label className={labelClass}>{t('Dépôt reçu $', 'Deposit $')}</label><input className={inputClass} type="number" value={depositAmount} onChange={e => setDepositAmount(parseFloat(e.target.value) || 0)} min="0" /></div>
              )}

              {/* Modes de paiement acceptés */}
              <div className="mt-3">
                <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${isDeco ? 'text-[#D6B25E]/70' : 'text-white/50'}`}>
                  💳 {t('Modes de paiement acceptés', 'Accepted Payment Methods')}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {PAYMENT_MODES.map(pm => (
                    <button key={pm.id} onClick={() => togglePayment(pm.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                        ${acceptedPayments.includes(pm.id)
                          ? isDeco ? 'bg-[#D6B25E] text-[#0d0a00]' : isQuantum ? 'bg-violet-600 text-white' : 'bg-emerald-600 text-white'
                          : 'bg-white/5 text-white/40'}`}>
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Récap totaux */}
              <div className={`rounded-xl p-4 space-y-2 mt-3 ${isDeco ? 'bg-[#D6B25E]/5 border border-[#D6B25E]/20' : 'bg-white/5 border border-white/10'}`}>
                {[
                  ...(isStructured ? [
                    { label: `🧱 ${t('Matériaux', 'Materials')}`, val: subtotalMaterials },
                    { label: `👷 ${t('Main-d\'œuvre', 'Labour')}`, val: subtotalLabour },
                    { label: `🚚 ${t('Autres', 'Other')}`, val: subtotalOther },
                    ...(subtotalSubco > 0 ? [{ label: `🤝 ${t('Sous-traitance', 'Subcontract')}`, val: subtotalSubco }] : []),
                    { label: t('Sous-total', 'Subtotal'), val: subtotal, sep: true },
                  ] : [
                    { label: t('Sous-total', 'Subtotal'), val: subtotal },
                  ]),
                  ...(discountPct > 0 ? [{ label: `🏷️ ${t('Remise', 'Discount')} (${discountPct}%)`, val: -discountAmt }] : []),
                  { label: `🇨🇦 GST (${taxRate}%)`, val: taxAmt },
                  { label: t('💰 TOTAL', '💰 TOTAL'), val: total, big: true },
                  ...(holdbackPct > 0 ? [{ label: `🔒 ${t('Retenue Builders Lien', 'Holdback')} (${holdbackPct}%)`, val: -holdbackAmt }] : []),
                  ...(depositAmount > 0 ? [
                    { label: t('✅ Dépôt reçu', '✅ Deposit'), val: -depositAmount },
                    { label: t('🔴 Solde dû', '🔴 Balance Due'), val: balanceDue, big: true, red: true },
                  ] : []),
                ].map((row: any, i) => (
                  <div key={i} className={`flex justify-between items-center ${row.big || row.sep ? 'pt-2 border-t border-white/10' : ''}`}>
                    <span className={`text-sm ${row.big ? 'font-black' : 'text-white/60'}`}>{row.label}</span>
                    <span className={`font-bold ${row.red ? 'text-red-400 text-lg' : row.big ? isDeco ? 'text-[#D6B25E] text-xl' : isQuantum ? 'text-violet-300 text-xl' : 'text-white text-xl' : 'text-white/80 text-sm'}`}>{fmt(row.val)}</span>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div className="mt-3">
                <label className={labelClass}>{t('Notes / Conditions', 'Notes / Terms')}</label>
                <textarea className={`${inputClass} min-h-[80px] resize-none`} value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('Merci pour votre confiance!', 'Thank you for your business!')} />
              </div>
              {isDeco && <DecoDiamondRow />}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
             TAB CLAUSES (Contrat seulement)
            ══════════════════════════════════════════════════════════════════ */}
        {tab === 'clauses' && docType === 'contract' && (
          <div className="space-y-4">

            {/* Garantie */}
            <div className={cardStyle}>
              {isDeco && <DecoCorners />}
              <div className={cardTitle}>🛡️ {t('Garantie de pose', 'Workmanship Warranty')}</div>
              <label className={labelClass}>{t('Durée (années)', 'Duration (years)')}</label>
              <input className={inputClass} type="number" value={warrantyYears} onChange={e => setWarrantyYears(parseInt(e.target.value) || 2)} min="0" max="25" />
              <label className={`${labelClass} mt-3`}>{t('Détails (couvert / exclus)', 'Details (covered / excluded)')}</label>
              <textarea className={`${inputClass} min-h-[90px] resize-none`} value={clauseWarrantyDetails} onChange={e => setClauseWarrantyDetails(e.target.value)} />
            </div>

            {/* Change Orders */}
            <div className={cardStyle}>
              {isDeco && <DecoCorners />}
              <div className={cardTitle}>📝 {t('Procédure de modifications (Change Orders)', 'Change Order Process')}</div>
              <textarea className={`${inputClass} min-h-[80px] resize-none`} value={clauseChangeOrder} onChange={e => setClauseChangeOrder(e.target.value)} />
            </div>

            {/* Résiliation */}
            <div className={cardStyle}>
              {isDeco && <DecoCorners />}
              <div className={cardTitle}>🚫 {t('Conditions de résiliation', 'Termination Conditions')}</div>
              <textarea className={`${inputClass} min-h-[80px] resize-none`} value={clauseResiliation} onChange={e => setClauseResiliation(e.target.value)} />
            </div>

            {/* Assurance + WCB */}
            <div className={cardStyle}>
              {isDeco && <DecoCorners />}
              <div className={cardTitle}>🏥 {t('Assurance et WCB', 'Insurance & WCB')}</div>
              <div className="mb-3">
                <label className={`${labelClass} mb-2`}>{t('Assurance responsabilité civile', 'Liability Insurance')}</label>
                <div className="flex gap-2">
                  {[{ v: true, label: t('Oui ✅', 'Yes ✅') }, { v: false, label: t('Non ❌', 'No ❌') }].map(opt => (
                    <button key={String(opt.v)} onClick={() => setHasInsurance(opt.v)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${hasInsurance === opt.v ? isDeco ? 'bg-[#D6B25E] text-[#0d0a00]' : 'bg-white/20 text-white' : 'bg-white/5 text-white/40'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className={labelClass}>{t('N° WCB Fournisseur', 'WCB # Contractor')}</label>
              <input className={inputClass} value={compWCB} onChange={e => setCompWCB(e.target.value)} placeholder="WCB-XXXXXX" />
            </div>

            {/* Droits */}
            <div className={`${cardStyle} opacity-80`}>
              {isDeco && <DecoCorners />}
              <div className={cardTitle}>⚖️ {t('Droit applicable', 'Governing Law')}</div>
              <div className={`text-xs space-y-1.5 ${isDeco ? 'text-[#D6B25E]/60' : 'text-white/50'}`}>
                <p>• {t('Lois de la province d\'Alberta, Canada', 'Laws of the Province of Alberta, Canada')}</p>
                <p>• {t('Builders\' Lien Act (Alberta) si applicable', 'Builders\' Lien Act (Alberta) if applicable')}</p>
                <p>• {t('Résolution des litiges : amiable d\'abord, arbitrage si nécessaire', 'Dispute resolution: amicable first, arbitration if needed')}</p>
                <p>• {t('Conservation des dossiers : 6 ans minimum', 'Record retention: minimum 6 years')}</p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
             TAB SIGNATURE
            ══════════════════════════════════════════════════════════════════ */}
        {tab === 'sign' && (
          <div className={cardStyle}>
            {isDeco && <DecoCorners />}
            <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDeco ? 'text-[#D6B25E]/70' : isQuantum ? 'text-violet-400/70' : 'text-white/50'}`}>✍️ {t('Signatures', 'Signatures')}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <SignatureCanvas />
              <ContractorSig />
            </div>
            <p className={`text-xs mt-3 ${isDeco ? 'text-[#D6B25E]/40' : 'text-white/30'}`}>
              💡 {t('Signature contracteur : Réglages → Compagnie → Nom du propriétaire', 'Contractor: Settings → Company → Owner Name')}
            </p>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
             ACTIONS — Envoyer & Exporter
            ══════════════════════════════════════════════════════════════════ */}
        <div className={`${cardStyle} mt-4`}>
          {isDeco && <DecoCorners />}
          <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDeco ? 'text-[#D6B25E]/70' : isQuantum ? 'text-violet-400/70' : 'text-white/50'}`}>📤 {t('Envoyer & Exporter', 'Send & Export')}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '📧', label: t('Envoyer Email', 'Send Email'),       action: handleSendEmail },
              { icon: '📱', label: t('Envoyer SMS', 'Send SMS'),           action: handleSendSMS },
              { icon: '👁️', label: t('Preview PDF', 'Preview PDF'),       action: () => setShowPdfPreview(true) },
              { icon: '⬇️', label: t('Télécharger PDF', 'Download PDF'),  action: handlePrintPdf },
            ].map(btn => (
              <button key={btn.label} onClick={btn.action}
                style={{ background: accentBg, border: `1px solid ${accentBorder}`, color: accentColor }}
                className="rounded-xl py-3 px-2 text-xs font-bold flex flex-col items-center gap-1.5 transition-all active:scale-95">
                <span className="text-2xl">{btn.icon}</span>{btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
             BOUTON SAUVEGARDER (fixe)
            ══════════════════════════════════════════════════════════════════ */}
        <div className="fixed bottom-20 left-0 right-0 px-4 z-40">
          <button onClick={save}
            className={`w-full max-w-lg mx-auto block py-4 rounded-2xl font-black text-base shadow-2xl transition-all active:scale-95
              ${isDeco ? 'bg-gradient-to-r from-[#D6B25E] to-[#c9a84c] text-[#0d0a00] shadow-[#D6B25E]/30'
                : isQuantum ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-violet-500/30'
                : isAventure ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                : isXP ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white'
                : 'bg-gradient-to-r from-blue-600 to-violet-600 text-white'}`}>
            💾 {t('Sauvegarder', 'Save')}{' '}
            {docType === 'invoice' ? t('la facture', 'Invoice') : docType === 'quote' ? t('le devis', 'Quote') : t('le contrat', 'Contract')}
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
           MODAL PDF PREVIEW — Compact, légal Alberta
          ════════════════════════════════════════════════════════════════════════ */}
      {showPdfPreview && (() => {
        const depositCalc = docType !== 'invoice' ? total * (depositPct / 100) : depositAmount
        const midCalc     = total * (paymentMidPct / 100)
        const finalCalc   = total * (paymentFinalPct / 100)

        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 300, display: 'flex', alignItems: 'flex-end', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ background: '#f3f4f6', borderRadius: '20px 20px 0 0', width: '100%', height: '96vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

              {/* Header modal */}
              <div style={{ position: 'sticky', top: 0, background: '#1f2937', borderRadius: '20px 20px 0 0', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                <div>
                  <p style={{ color: 'white', fontSize: '15px', fontWeight: 800 }}>👁️ {t('Preview', 'Preview')} — {docTypeLabel} {docNumber}</p>
                  <p style={{ color: '#9ca3af', fontSize: '11px', marginTop: '2px' }}>{clientName || t('Sans client', 'No client')} · {fmt(total)}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => window.print()} style={{ background: accentColor, border: 'none', borderRadius: '10px', padding: '8px 14px', color: 'white', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>🖨️ PDF</button>
                  <button onClick={() => setShowPdfPreview(false)} style={{ background: '#374151', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#9ca3af', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              </div>

              {/* ── Document ── */}
              <div id="document-to-print" style={{ background: 'white', margin: '10px', borderRadius: '10px', padding: '18px 16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', position: 'relative', overflow: 'hidden' }}>

                {/* Filigrane */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) rotate(-35deg)', fontSize: '80px', fontWeight: 900, color: accentColor, opacity: 0.10, pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap', zIndex: 2, letterSpacing: '4px', mixBlendMode: 'multiply' }}>
                  {watermarkText}
                </div>

                <div style={{ position: 'relative', zIndex: 1, fontSize: '11px' }}>

                  {/* ── LIGNE 1 : Titre + Numéro/Date ── */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {company.logoUrl && <img src={company.logoUrl} alt="Logo" style={{ height: '32px', objectFit: 'contain' }} />}
                      <p style={{ fontSize: '20px', fontWeight: 900, color: accentColor, letterSpacing: '1px' }}>
                        {docType === 'invoice' ? t('FACTURE', 'INVOICE') : docType === 'quote' ? t('DEVIS', 'QUOTE') : t('CONTRAT', 'CONTRACT')}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {docNumber && <p style={{ fontSize: '12px', fontWeight: 800, color: '#374151' }}>#{docNumber}</p>}
                      {refQuote && <p style={{ fontSize: '10px', color: '#6b7280' }}>{t('Réf. Devis:', 'Quote Ref:')} {refQuote}</p>}
                      {refContract && <p style={{ fontSize: '10px', color: '#6b7280' }}>{t('Réf. Contrat:', 'Contract Ref:')} {refContract}</p>}
                      <p style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>{t('Date:', 'Date:')} {docDate}</p>
                      {dueDate && <p style={{ fontSize: '10px', color: '#6b7280' }}>{t('Échéance:', 'Due:')} {dueDate}</p>}
                      {docType === 'quote' && quoteExpiryDate && <p style={{ fontSize: '10px', color: '#059669', fontWeight: 700 }}>{t('Valide jusqu\'au:', 'Valid until:')} {quoteExpiryDate}</p>}
                      <span style={{ display: 'inline-block', marginTop: '3px', padding: '2px 7px', borderRadius: '20px', fontSize: '9px', fontWeight: 700, background: status === 'paid' ? '#d1fae5' : status === 'overdue' ? '#fee2e2' : status === 'sent' ? '#dbeafe' : '#f3f4f6', color: status === 'paid' ? '#065f46' : status === 'overdue' ? '#991b1b' : status === 'sent' ? '#1e40af' : '#6b7280' }}>
                        {status === 'paid' ? t('PAYÉ', 'PAID') : status === 'overdue' ? t('EN RETARD', 'OVERDUE') : status === 'sent' ? t('ENVOYÉ', 'SENT') : t('BROUILLON', 'DRAFT')}
                      </span>
                    </div>
                  </div>

                  {/* ── BLOC TOTAL DÛ ── */}
                  <div style={{ background: totalBgColor, borderRadius: '8px', padding: '10px 16px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                        {depositAmount > 0 ? t('SOLDE DÛ', 'BALANCE DUE') : t('TOTAL DÛ', 'TOTAL DUE')}
                      </p>
                      <p style={{ color: 'white', fontSize: '22px', fontWeight: 900, marginTop: '1px' }}>
                        {fmt(depositAmount > 0 ? balanceDue : total)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {dueDate && <>
                        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{t('ÉCHÉANCE', 'DUE DATE')}</p>
                        <p style={{ color: 'white', fontSize: '13px', fontWeight: 800, marginTop: '1px' }}>{dueDate}</p>
                      </>}
                      {(workStartDate || workEndDate) && <p style={{ color: 'rgba(255,255,255,0.70)', fontSize: '9px', marginTop: '3px' }}>🗓️ {workStartDate} {workEndDate ? `→ ${workEndDate}` : ''}</p>}
                    </div>
                  </div>

                  {/* ── FROM | BILL TO ── */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ background: '#f9fafb', borderRadius: '6px', padding: '9px' }}>
                      <p style={{ fontSize: '8px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>{t('DE / FROM', 'FROM')}</p>
                      <p style={{ fontSize: '12px', fontWeight: 800, color: '#111827', marginBottom: '2px' }}>{compName || 'Hailite Xteriors'}</p>
                      {compAddress && <p style={{ fontSize: '10px', color: '#6b7280' }}>{compAddress}</p>}
                      {(compCity || compProvince) && <p style={{ fontSize: '10px', color: '#6b7280' }}>{[compCity, compProvince, compPostal].filter(Boolean).join(' ')}</p>}
                      {compPhone && <p style={{ fontSize: '10px', color: '#6b7280' }}>📞 {compPhone}</p>}
                      {compEmail && <p style={{ fontSize: '10px', color: '#6b7280' }}>✉️ {compEmail}</p>}
                      <div style={{ marginTop: '3px', display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                        {compGST && <span style={{ fontSize: '8px', color: '#9ca3af', background: '#f3f4f6', padding: '1px 5px', borderRadius: '4px' }}>GST: {compGST}</span>}
                        {compWCB && <span style={{ fontSize: '8px', color: '#9ca3af', background: '#f3f4f6', padding: '1px 5px', borderRadius: '4px' }}>WCB: {compWCB}</span>}
                        {compBN && <span style={{ fontSize: '8px', color: '#9ca3af', background: '#f3f4f6', padding: '1px 5px', borderRadius: '4px' }}>BN: {compBN}</span>}
                      </div>
                    </div>
                    <div style={{ background: '#f9fafb', borderRadius: '6px', padding: '9px', borderLeft: `3px solid ${accentColor}` }}>
                      <p style={{ fontSize: '8px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>{t('FACTURÉ À / BILL TO', 'BILL TO')}</p>
                      {clientName ? <>
                        <p style={{ fontSize: '12px', fontWeight: 800, color: '#111827', marginBottom: '2px' }}>{clientName}</p>
                        {clientAddress && <p style={{ fontSize: '10px', color: '#6b7280' }}>{clientAddress}</p>}
                        {siteAddress && siteAddress !== clientAddress && <p style={{ fontSize: '10px', color: '#6b7280' }}>🏗️ {siteAddress}</p>}
                        {clientPhone && <p style={{ fontSize: '10px', color: '#6b7280' }}>📞 {clientPhone}</p>}
                        {clientEmail && <p style={{ fontSize: '10px', color: '#6b7280' }}>✉️ {clientEmail}</p>}
                      </> : <p style={{ fontSize: '10px', color: '#d1d5db', fontStyle: 'italic' }}>{t('Aucun client', 'No client')}</p>}
                    </div>
                  </div>

                  {/* ── OBJET DU CONTRAT ── */}
                  {docType === 'contract' && contractObject && (
                    <div style={{ background: '#f9fafb', borderRadius: '6px', padding: '9px', marginBottom: '10px', borderLeft: `3px solid ${accentColor}` }}>
                      <p style={{ fontSize: '8px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>{t('OBJET DU CONTRAT', 'CONTRACT OBJECT')}</p>
                      <p style={{ fontSize: '10px', color: '#374151', lineHeight: 1.5 }}>{contractObject}</p>
                      {permitBy !== 'na' && <p style={{ fontSize: '9px', color: '#6b7280', marginTop: '4px' }}>🏛️ {t(`Permis à la charge du : ${permitBy === 'client' ? 'Client' : 'Contracteur'}`, `Permits to be obtained by: ${permitBy === 'client' ? 'Client' : 'Contractor'}`)}</p>}
                    </div>
                  )}

                  {/* ── TABLEAU LIGNES ── */}
                  {docType === 'invoice' && lines.some(l => l.description || l.unitPrice > 0) && (
                    <div style={{ marginBottom: '12px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                        <thead>
                          <tr style={{ background: '#f3f4f6', borderBottom: `2px solid ${accentColor}` }}>
                            {[
                              { label: t('Description', 'Description'), align: 'left',   w: '45%' },
                              { label: t('Qté', 'Qty'),                  align: 'center', w: '7%' },
                              { label: t('Unité', 'Unit'),               align: 'center', w: '11%' },
                              { label: t('Prix unit.', 'Unit Price'),    align: 'right',  w: '18%' },
                              { label: t('Total', 'Total'),              align: 'right',  w: '19%' },
                            ].map(h => (
                              <th key={h.label} style={{ padding: '5px', textAlign: h.align as any, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', width: h.w }}>{h.label}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {lines.filter(l => l.description || l.unitPrice > 0).map((line, i) => (
                            <tr key={line.id} style={{ background: i % 2 === 0 ? 'white' : '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '7px 5px', color: '#374151', fontWeight: 500 }}>{line.description}</td>
                              <td style={{ padding: '7px 5px', textAlign: 'center', color: '#374151' }}>{line.qty}</td>
                              <td style={{ padding: '7px 5px', textAlign: 'center', color: '#6b7280' }}>{line.unit}</td>
                              <td style={{ padding: '7px 5px', textAlign: 'right', color: '#374151' }}>{fmt(line.unitPrice)}</td>
                              <td style={{ padding: '7px 5px', textAlign: 'right', color: '#111827', fontWeight: 700 }}>{fmt(line.qty * line.unitPrice)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* ── LIGNES STRUCTURÉES (Devis / Contrat) ── */}
                  {docType !== 'invoice' && (
                    <div style={{ marginBottom: '12px' }}>
                      {/* Matériaux */}
                      {materialLines.some(m => m.claddingType || m.unitPrice > 0) && (
                        <div style={{ marginBottom: '8px' }}>
                          <p style={{ fontSize: '9px', fontWeight: 800, color: accentColor, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>🧱 {t('MATÉRIAUX', 'MATERIALS')}</p>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5px' }}>
                            <thead>
                              <tr style={{ background: '#f3f4f6', borderBottom: `1px solid ${accentColor}` }}>
                                {[t('Type/Marque', 'Type/Brand'), t('Épais.', 'Thick.'), t('Fournisseur', 'Supplier'), t('Pi²', 'Sq ft'), t('$/pi²', '$/sf'), t('Total', 'Total')].map(h => (
                                  <th key={h} style={{ padding: '4px 4px', textAlign: 'left', color: '#9ca3af', fontWeight: 700, fontSize: '8.5px' }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {materialLines.filter(m => m.claddingType || m.unitPrice > 0).map((m, i) => (
                                <tr key={m.id} style={{ background: i % 2 === 0 ? 'white' : '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                                  <td style={{ padding: '5px 4px', color: '#374151', fontWeight: 500 }}>{[m.claddingType, m.brand].filter(Boolean).join(' — ')}</td>
                                  <td style={{ padding: '5px 4px', color: '#6b7280' }}>{m.thickness}</td>
                                  <td style={{ padding: '5px 4px', color: '#6b7280' }}>{m.supplier}</td>
                                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#374151' }}>{m.qtysqft}</td>
                                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#374151' }}>{fmt(m.unitPrice)}</td>
                                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#111827', fontWeight: 700 }}>{fmt(m.qtysqft * m.unitPrice)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div style={{ textAlign: 'right', paddingRight: '4px', marginTop: '3px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: accentColor }}>{t('Sous-total matériaux:', 'Materials subtotal:')} {fmt(subtotalMaterials)}</span>
                          </div>
                        </div>
                      )}

                      {/* Main-d'œuvre */}
                      {labourLines.some(l => l.task || l.rate > 0) && (
                        <div style={{ marginBottom: '8px' }}>
                          <p style={{ fontSize: '9px', fontWeight: 800, color: accentColor, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>👷 {t('MAIN-D\'ŒUVRE', 'LABOUR')}</p>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5px' }}>
                            <thead>
                              <tr style={{ background: '#f3f4f6', borderBottom: `1px solid ${accentColor}` }}>
                                {[t('Tâche', 'Task'), t('Type', 'Type'), t('Heures', 'Hours'), t('Taux', 'Rate'), t('Total', 'Total')].map(h => (
                                  <th key={h} style={{ padding: '4px', textAlign: 'left', color: '#9ca3af', fontWeight: 700, fontSize: '8.5px' }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {labourLines.filter(l => l.task || l.rate > 0).map((l, i) => (
                                <tr key={l.id} style={{ background: i % 2 === 0 ? 'white' : '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                                  <td style={{ padding: '5px 4px', color: '#374151', fontWeight: 500 }}>{l.task}</td>
                                  <td style={{ padding: '5px 4px', color: '#6b7280' }}>{l.isFlatRate ? t('Forfait', 'Flat') : t('$/h', '$/h')}</td>
                                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#374151' }}>{l.isFlatRate ? '—' : l.estimatedHours}</td>
                                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#374151' }}>{fmt(l.rate)}</td>
                                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#111827', fontWeight: 700 }}>{fmt(l.isFlatRate ? l.rate : l.estimatedHours * l.rate)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div style={{ textAlign: 'right', paddingRight: '4px', marginTop: '3px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: accentColor }}>{t('Sous-total main-d\'œuvre:', 'Labour subtotal:')} {fmt(subtotalLabour)}</span>
                          </div>
                        </div>
                      )}

                      {/* Autres frais */}
                      {otherLines.some(o => o.description || o.amount > 0) && (
                        <div style={{ marginBottom: '8px' }}>
                          <p style={{ fontSize: '9px', fontWeight: 800, color: accentColor, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>🚚 {t('AUTRES FRAIS', 'OTHER FEES')}</p>
                          {otherLines.filter(o => o.description || o.amount > 0).map((o, i) => (
                            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 4px', background: i % 2 === 0 ? 'white' : '#f9fafb', borderBottom: '1px solid #f3f4f6', fontSize: '9.5px' }}>
                              <span style={{ color: '#374151' }}>{o.description}</span>
                              <span style={{ fontWeight: 700, color: '#111827' }}>{fmt(o.amount)}</span>
                            </div>
                          ))}
                          <div style={{ textAlign: 'right', paddingRight: '4px', marginTop: '3px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: accentColor }}>{t('Sous-total autres:', 'Other subtotal:')} {fmt(subtotalOther)}</span>
                          </div>
                        </div>
                      )}

                      {/* Sous-traitance */}
                      {subcoLines.length > 0 && (
                        <div style={{ marginBottom: '8px' }}>
                          <p style={{ fontSize: '9px', fontWeight: 800, color: accentColor, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>🤝 {t('SOUS-TRAITANCE', 'SUBCONTRACTING')}</p>
                          {subcoLines.map((sc, i) => (
                            <div key={sc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 4px', background: i % 2 === 0 ? 'white' : '#f9fafb', borderBottom: '1px solid #f3f4f6', fontSize: '9.5px' }}>
                              <span style={{ color: '#374151' }}>{sc.companyName} — {sc.workType}</span>
                              <span style={{ fontWeight: 700, color: '#111827' }}>{fmt(sc.amount)}</span>
                            </div>
                          ))}
                          <div style={{ textAlign: 'right', paddingRight: '4px', marginTop: '3px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: accentColor }}>{t('Sous-total sous-traitance:', 'Subcontract subtotal:')} {fmt(subtotalSubco)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── TOTAUX ── */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                    <div style={{ minWidth: '220px', background: '#f9fafb', borderRadius: '8px', padding: '10px', border: '1px solid #e5e7eb' }}>
                      {isStructured && [
                        { label: `🧱 ${t('Matériaux', 'Materials')}`, value: fmt(subtotalMaterials) },
                        { label: `👷 ${t('Main-d\'œuvre', 'Labour')}`, value: fmt(subtotalLabour) },
                        { label: `🚚 ${t('Autres', 'Other')}`, value: fmt(subtotalOther) },
                        ...(subtotalSubco > 0 ? [{ label: `🤝 ${t('Sous-traitance', 'Subcontract')}`, value: fmt(subtotalSubco) }] : []),
                      ].map((row, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #e5e7eb' }}>
                          <p style={{ fontSize: '9.5px', color: '#6b7280' }}>{row.label}</p>
                          <p style={{ fontSize: '9.5px', color: '#374151', fontWeight: 600 }}>{row.value}</p>
                        </div>
                      ))}
                      {[
                        { label: t('Sous-total', 'Subtotal'), value: fmt(subtotal) },
                        ...(discountPct > 0 ? [{ label: `${t('Remise', 'Discount')} (${discountPct}%)`, value: `-${fmt(discountAmt)}`, red: true }] : []),
                        { label: `GST (${taxRate}%)`, value: fmt(taxAmt) },
                      ].map((row: any, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #e5e7eb' }}>
                          <p style={{ fontSize: '10px', color: '#6b7280' }}>{row.label}</p>
                          <p style={{ fontSize: '10px', color: row.red ? '#ef4444' : '#374151', fontWeight: 600 }}>{row.value}</p>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0 3px', borderTop: '2px solid #e5e7eb', marginTop: '3px' }}>
                        <p style={{ fontSize: '12px', fontWeight: 900, color: '#111827' }}>TOTAL</p>
                        <p style={{ fontSize: '14px', fontWeight: 900, color: accentColor }}>{fmt(total)}</p>
                      </div>
                      {holdbackPct > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #e5e7eb' }}>
                          <p style={{ fontSize: '10px', color: '#6b7280' }}>🔒 {t("Retenue Builders' Lien", 'Holdback')} ({holdbackPct}%)</p>
                          <p style={{ fontSize: '10px', color: '#9a3412', fontWeight: 600 }}>{fmt(holdbackAmt)}</p>
                        </div>
                      )}
                      {depositAmount > 0 && <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                          <p style={{ fontSize: '10px', color: '#6b7280' }}>{t('Dépôt reçu', 'Deposit')}</p>
                          <p style={{ fontSize: '10px', color: '#22c55e', fontWeight: 600 }}>-{fmt(depositAmount)}</p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#fef2f2', borderRadius: '6px', marginTop: '4px' }}>
                          <p style={{ fontSize: '11px', fontWeight: 800, color: '#991b1b' }}>{t('SOLDE DÛ', 'BALANCE DUE')}</p>
                          <p style={{ fontSize: '13px', fontWeight: 900, color: '#ef4444' }}>{fmt(balanceDue)}</p>
                        </div>
                      </>}
                    </div>
                  </div>

                  {/* ── ÉCHÉANCIER PAIEMENT (Devis / Contrat) ── */}
                  {docType !== 'invoice' && (depositPct + paymentMidPct + paymentFinalPct > 0) && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '9px', marginBottom: '10px' }}>
                      <p style={{ fontSize: '9px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>💳 {t('ÉCHÉANCIER DE PAIEMENT', 'PAYMENT SCHEDULE')}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', textAlign: 'center' }}>
                        {[
                          { label: t('Dépôt à la signature', 'Deposit at signing'), pct: depositPct, amt: depositCalc },
                          { label: t('Paiement intermédiaire', 'Mid payment'), pct: paymentMidPct, amt: midCalc },
                          { label: t('Paiement final', 'Final payment'), pct: paymentFinalPct, amt: finalCalc },
                        ].map((p, i) => (
                          <div key={i} style={{ background: 'white', borderRadius: '6px', padding: '6px 4px', border: '1px solid #dcfce7' }}>
                            <p style={{ fontSize: '8px', color: '#16a34a', fontWeight: 700, marginBottom: '2px' }}>{p.pct}%</p>
                            <p style={{ fontSize: '11px', fontWeight: 900, color: '#166534' }}>{fmt(p.amt)}</p>
                            <p style={{ fontSize: '7.5px', color: '#6b7280', marginTop: '2px' }}>{p.label}</p>
                          </div>
                        ))}
                      </div>
                      {acceptedPayments.length > 0 && (
                        <p style={{ fontSize: '8.5px', color: '#6b7280', marginTop: '6px' }}>
                          {t('Modes acceptés:', 'Accepted:')} {acceptedPayments.map(m => PAYMENT_MODES.find(pm => pm.id === m)?.label).join(', ')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* ── NOTES ── */}
                  {notes && (
                    <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '9px', marginBottom: '10px', borderLeft: `3px solid ${accentColor}` }}>
                      <p style={{ fontSize: '8px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{t('Notes / Conditions', 'Notes / Terms')}</p>
                      <p style={{ fontSize: '10px', color: '#374151', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{notes}</p>
                    </div>
                  )}

                  {/* ── CLAUSES CONTRAT (dans PDF) ── */}
                  {docType === 'contract' && (
                    <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '9px', marginBottom: '10px', fontSize: '9px', color: '#374151', lineHeight: 1.6 }}>
                      <p style={{ fontWeight: 800, color: '#111827', marginBottom: '6px', fontSize: '10px' }}>⚖️ {t('CLAUSES CONTRACTUELLES', 'CONTRACT CLAUSES')}</p>
                      {clauseWarrantyDetails && (
                        <div style={{ marginBottom: '5px' }}>
                          <p style={{ fontWeight: 700, color: '#374151', marginBottom: '2px' }}>🛡️ {t('Garantie de pose', 'Workmanship Warranty')} — {warrantyYears} {t('an(s)', 'year(s)')}</p>
                          <p style={{ color: '#6b7280' }}>{clauseWarrantyDetails}</p>
                        </div>
                      )}
                      {clauseChangeOrder && (
                        <div style={{ marginBottom: '5px' }}>
                          <p style={{ fontWeight: 700, color: '#374151', marginBottom: '2px' }}>📝 {t('Modifications', 'Change Orders')}</p>
                          <p style={{ color: '#6b7280' }}>{clauseChangeOrder}</p>
                        </div>
                      )}
                      {clauseResiliation && (
                        <div style={{ marginBottom: '5px' }}>
                          <p style={{ fontWeight: 700, color: '#374151', marginBottom: '2px' }}>🚫 {t('Résiliation', 'Termination')}</p>
                          <p style={{ color: '#6b7280' }}>{clauseResiliation}</p>
                        </div>
                      )}
                      {subcontractAuthorized && subcoLines.length > 0 && (
                        <div style={{ marginBottom: '5px' }}>
                          <p style={{ fontWeight: 700, color: '#374151', marginBottom: '2px' }}>🤝 {t('Sous-traitance autorisée', 'Subcontracting Authorized')}</p>
                          <p style={{ color: '#6b7280' }}>{subcoLines.map(sc => `${sc.companyName} (${sc.workType})`).join(', ')}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── CONDITIONS LÉGALES COMPACTES ── */}
                  <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '9px', marginBottom: '10px', fontSize: '9px', color: '#6b7280', lineHeight: 1.5 }}>
                    <p style={{ fontWeight: 700, color: '#374151', marginBottom: '4px', fontSize: '10px' }}>⚖️ {t('Conditions légales — Alberta', 'Legal Terms — Alberta')}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 12px' }}>
                      {lateInterestPct > 0 && <p>• {t(`Intérêts de retard : ${lateInterestPct}%/mois`, `Late interest: ${lateInterestPct}%/month`)}</p>}
                      {holdbackPct > 0 && <p>• {t(`Retenue Builders' Lien Act : ${holdbackPct}%`, `Builders' Lien Act holdback: ${holdbackPct}%`)}</p>}
                      {warrantyYears > 0 && <p>• {t(`Garantie pose : ${warrantyYears} an(s)`, `Warranty: ${warrantyYears} year(s)`)}</p>}
                      {docType === 'quote' && quoteExpiryDate && <p>• {t(`Devis valide jusqu'au ${quoteExpiryDate}`, `Quote valid until ${quoteExpiryDate}`)}</p>}
                                            <p>• {t('Province : Alberta — GST 5% seulement', 'Province: Alberta — GST 5% only')}</p>
                      {compWCB && <p>• WCB: {compWCB}</p>}
                      {compGST && <p>• {t('N° GST:', 'GST#:')} {compGST}</p>}
                      {compBN && <p>• {t('N° Entreprise:', 'BN:')} {compBN}</p>}
                      {hasInsurance && docType === 'contract' && <p>• {t('Assurance responsabilité civile : Oui', 'Liability Insurance: Yes')}</p>}
                      <p>• {t('Droit applicable : Alberta, Canada', 'Governing law: Alberta, Canada')}</p>
                      <p>• {t('Conservation dossiers : 6 ans min.', 'Records retention: 6 yrs min.')}</p>
                    </div>
                  </div>

                  {/* ── EXCLUSIONS (Devis) ── */}
                  {docType === 'quote' && (
                    <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '8px', marginBottom: '10px', fontSize: '9px', color: '#9a3412' }}>
                      <p style={{ fontWeight: 700, marginBottom: '3px' }}>⚠️ {t('Exclusions', 'Exclusions')}</p>
                      <p>• {t('Dommages cachés, structure non visible avant démontage', 'Hidden damage, structure not visible before dismantling')}</p>
                      <p>• {t('Infiltration non reliée aux travaux décrits', 'Water infiltration unrelated to described work')}</p>
                      <p>• {t('Dommages causés par événements extérieurs après la pose', 'Damage from external events after installation')}</p>
                    </div>
                  )}

                  {/* ── BUILDERS' LIEN (Contrat) ── */}
                  {docType === 'contract' && holdbackPct > 0 && (
                    <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: '8px', padding: '8px', marginBottom: '10px', fontSize: '9px', color: '#92400e' }}>
                      <p style={{ fontWeight: 700, marginBottom: '3px' }}>🔒 {t("Builders' Lien Act — Retenue", "Builders' Lien Act — Holdback")}</p>
                      <p>• {t(`Retenue de ${holdbackPct}% (${fmt(holdbackAmt)}) jusqu'à l'expiration du délai légal`, `${holdbackPct}% holdback (${fmt(holdbackAmt)}) until statutory lien period expires`)}</p>
                      <p>• {t('Attestation de libération de privilège requise avant paiement final', 'Lien release certificate required before final payment')}</p>
                    </div>
                  )}

                  {/* ── SIGNATURES ── */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                    {/* Client */}
                    <div>
                      {clientSignature ? (
                        <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden', marginBottom: '5px', height: '50px' }}>
                          <img src={clientSignature} alt={t('Signature client', 'Client signature')} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                        </div>
                      ) : (
                        <div style={{ borderBottom: '1px solid #d1d5db', height: '45px', marginBottom: '5px' }} />
                      )}
                      <p style={{ fontSize: '11px', fontWeight: 700, color: '#374151' }}>{clientName || '_______________'}</p>
                      <p style={{ fontSize: '8px', color: '#9ca3af', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('Signature du client · Date: ___________', 'Client Signature · Date: ___________')}</p>
                    </div>
                    {/* Contracteur */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ borderBottom: '1px solid #d1d5db', height: '45px', marginBottom: '5px' }} />
                      <p style={{ fontSize: '12px', fontWeight: 900, color: '#111827', fontFamily: 'Georgia, serif' }}>{ownerName}</p>
                      <p style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>{compName}</p>
                      <p style={{ fontSize: '9px', color: '#9ca3af', marginTop: '1px' }}>{todayFormatted}</p>
                      <p style={{ fontSize: '8px', color: '#9ca3af', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('Signature autorisée', 'Authorized Signature')}</p>
                    </div>
                  </div>

                  {/* Pied de page */}
                  <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '12px', paddingTop: '8px', textAlign: 'center' }}>
                    <p style={{ fontSize: '9px', color: '#9ca3af' }}>
                      {compName} · {compPhone} · {compEmail}
                      {compGST ? ` · GST: ${compGST}` : ''}{compWCB ? ` · WCB: ${compWCB}` : ''}
                    </p>
                    <p style={{ fontSize: '8px', color: '#d1d5db', marginTop: '3px' }}>
                      {t('Généré par Gestion Chantier Pro — Hailite Xteriors', 'Generated by Gestion Chantier Pro — Hailite Xteriors')}
                    </p>
                  </div>

                </div>
              </div>

              {/* Boutons bas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '10px 16px 20px' }}>
                <button onClick={() => window.print()} style={{ padding: '14px', borderRadius: '12px', background: accentColor, border: 'none', color: 'white', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}>🖨️ {t('Imprimer / PDF', 'Print / PDF')}</button>
                <button onClick={() => setShowPdfPreview(false)} style={{ padding: '14px', borderRadius: '12px', background: '#374151', border: 'none', color: '#d1d5db', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>✕ {t('Fermer', 'Close')}</button>
              </div>

            </div>
          </div>
        )
      })()}
    </div>
  )
}
