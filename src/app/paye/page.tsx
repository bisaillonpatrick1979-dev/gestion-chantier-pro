'use client'
// src/app/paye/page.tsx

import { useState, useMemo } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'
import { useCompanyStore } from '@/store/useCompanyStore'
import { useEmployeeInvoiceStore } from '@/store/useEmployeeInvoiceStore'
import type { EmployeeInvoice, EmployeeInvoiceStatus } from '@/store/useEmployeeInvoiceStore'
import { formatCurrency, formatTimer } from '@/lib/formatters'
import { calculatePayroll, formatPayrollResult } from '@/lib/payrollCalculator'

function EmployeeWatermark({ initials, color }: { initials: string; color: string }) {
  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: '120px', fontWeight: 900,
      color, opacity: 0.06,
      pointerEvents: 'none', userSelect: 'none',
      letterSpacing: '-4px', zIndex: 0,
      fontFamily: 'Georgia, serif',
    }}>{initials}</div>
  )
}

const STATUS_CONFIG: Record<EmployeeInvoiceStatus, { label: string; color: string; emoji: string }> = {
  brouillon: { label: 'Brouillon', color: '#64748b', emoji: '📝' },
  envoyee:   { label: 'Envoyée',   color: '#3b82f6', emoji: '📤' },
  payee:     { label: 'Payée',     color: '#22c55e', emoji: '✅' },
}

const HOURS_PER_PERIOD: Record<string, number> = {
  weekly: 40, biweekly: 80, semimonthly: 86.67, monthly: 173.33,
}

export default function PayePage() {
  const { theme, themeId } = useThemeStore()
  const { lang } = useLangStore()
  const { company } = useCompanyStore()
  const { currentEmployeeId, employees, dayDetails } = useEmployeeStore()
  const { invoices, addInvoice, updateInvoice, updateStatus, deleteInvoice, getByWeek } =
    useEmployeeInvoiceStore()

  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  const currentEmployee = employees.find(e => e.id === currentEmployeeId)
  const isAdmin = currentEmployee?.role === 'admin'

  const isDeco     = themeId === 'deco'
  const isQuantum  = themeId === 'quantum'
  const isAventure = themeId === 'aventure'
  const cardClass  = isDeco ? 'deco-card-sweep' : isQuantum ? 'quantum-card-glow' : isAventure ? 'aventure-card-glow' : ''

  // ── Tab visibility ─────────────────────────────────────────────────────────
  const showContractorTab = isAdmin || currentEmployee?.workerType !== 'salaried'
  const showSalariedTab   = isAdmin || currentEmployee?.workerType === 'salaried'
  const bothTabsVisible   = showContractorTab && showSalariedTab

  const defaultTab: 'contractor' | 'salaried' =
    !isAdmin && currentEmployee?.workerType === 'salaried' ? 'salaried' : 'contractor'

  const [activeTab, setActiveTab] = useState<'contractor' | 'salaried'>(defaultTab)

  // ── État PIN ──────────────────────────────────────────────────────────────
  const [showPinChange, setShowPinChange]   = useState(false)
  const [oldPin, setOldPin]                 = useState('')
  const [newPin, setNewPin]                 = useState('')
  const [confirmPin, setConfirmPin]         = useState('')
  const [pinMsg, setPinMsg]                 = useState('')
  const [pinError, setPinError]             = useState(false)
  const [adminResetPins, setAdminResetPins] = useState<Record<string, string>>({})
  const [selectedEmpId, setSelectedEmpId]  = useState(currentEmployeeId || '')

  // ── État Invoice (contracteurs) ────────────────────────────────────────────
  const [invoiceModalWeek, setInvoiceModalWeek] = useState<string | null>(null)
  const [invoiceTab, setInvoiceTab]            = useState<'config' | 'apercu'>('config')
  const [gstEnabled, setGstEnabled]            = useState(false)
  const [gstNumber, setGstNumber]              = useState('')
  const [remisePercent, setRemisePercent]      = useState(0)
  const [empAddress, setEmpAddress]            = useState('')
  const [empCity, setEmpCity]                  = useState('')
  const [empPhone, setEmpPhone]                = useState('')
  const [empEmail, setEmpEmail]                = useState('')
  const [invoiceNotes, setInvoiceNotes]        = useState('')
  const [viewingInvoiceId, setViewingInvoiceId] = useState<string | null>(null)
  const [saved, setSaved]                      = useState(false)

  // ── État Talon de paie ─────────────────────────────────────────────────────
  const [payStubEmpId, setPayStubEmpId]         = useState<string | null>(null)
  const [payStubStartDate, setPayStubStartDate] = useState('')
  const [payStubEndDate, setPayStubEndDate]     = useState('')
  // Initialise le % vacances depuis les réglages compagnie
  const [payStubVacRate, setPayStubVacRate]     = useState(company.payrollVacationRate || 6)
  const [payStubNotes, setPayStubNotes]         = useState('')
  const [payStubPrinting, setPayStubPrinting]   = useState(false)

  // ── Employés filtrés ──────────────────────────────────────────────────────
  const contractorEmployees = employees.filter(e => e.workerType !== 'salaried')
  const salariedEmployees   = employees.filter(e => e.workerType === 'salaried')

  const viewEmployee = isAdmin
    ? employees.find(e => e.id === selectedEmpId)
    : currentEmployee

  // ── Styles ────────────────────────────────────────────────────────────────
  const card: React.CSSProperties = {
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    position: 'relative',
    overflow: 'hidden',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '8px',
    padding: '10px 12px',
    color: theme.colors.text,
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const pinInputStyle: React.CSSProperties = {
    ...inputStyle,
    textAlign: 'center',
    letterSpacing: '4px',
    fontSize: '15px',
    marginTop: '4px',
  }

  // ── Calculs semaines ──────────────────────────────────────────────────────
  const empDetails = viewEmployee
    ? Object.entries(dayDetails)
        .filter(([key]) => key.startsWith(viewEmployee.id + '-'))
        .map(([, detail]) => detail)
        .sort((a, b) => b.date.localeCompare(a.date))
    : []

  const getWeekKey = (date: string): string => {
    const d = new Date(date + 'T12:00:00')
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d)
    monday.setDate(diff)
    return monday.toISOString().split('T')[0]
  }

  const weekGroups: Record<string, typeof empDetails> = {}
  empDetails.forEach(detail => {
    const wk = getWeekKey(detail.date)
    if (!weekGroups[wk]) weekGroups[wk] = []
    weekGroups[wk].push(detail)
  })

  const totalRevenue = empDetails.reduce((s, d) => s + d.totalRevenue, 0)
  const totalHours   = empDetails.reduce((s, d) => s + d.totalHours, 0)

  // ── Calcul talon de paie salarié ──────────────────────────────────────────
  const payStubEmployee = employees.find(e => e.id === payStubEmpId)

  const payStubResult = useMemo(() => {
    if (!payStubEmployee || payStubEmployee.workerType !== 'salaried') return null
    if (!payStubEmployee.employeeProvince || !payStubEmployee.payFrequency) return null
    const grossPay = payStubEmployee.hourlyRate * (HOURS_PER_PERIOD[payStubEmployee.payFrequency] || 40)
    try {
      return calculatePayroll(
        grossPay,
        payStubEmployee.employeeCountry || 'CA',
        payStubEmployee.employeeProvince,
        payStubEmployee.payFrequency
      )
    } catch { return null }
  }, [payStubEmployee])

  const payStubRows = useMemo(() => {
    if (!payStubResult) return []
    return formatPayrollResult(payStubResult, lang as 'fr' | 'en')
  }, [payStubResult, lang])

  // ── Calcul avantages sociaux compagnie ────────────────────────────────────
  const companyBenefits = useMemo(() => {
    if (!payStubResult) return []
    const benefits: { label: string; amount: number; color: string }[] = []
    const vac = payStubResult.grossPay * (payStubVacRate / 100)
    benefits.push({ label: `🏖️ ${t('Paie vacances', 'Vacation Pay')} (${payStubVacRate}%)`, amount: vac, color: '#f59e0b' })
    if (company.payrollHealthInsurance > 0) benefits.push({ label: `🏥 ${t('Assurance santé', 'Health Ins.')}`, amount: -company.payrollHealthInsurance, color: '#ef4444' })
    if (company.payrollDentalInsurance > 0) benefits.push({ label: `🦷 ${t('Assurance dentaire', 'Dental Ins.')}`, amount: -company.payrollDentalInsurance, color: '#ef4444' })
    if (company.payrollLifeInsurance > 0) benefits.push({ label: `💛 ${t('Assurance vie', 'Life Ins.')}`, amount: -company.payrollLifeInsurance, color: '#ef4444' })
    if (company.payrollLTD > 0) benefits.push({ label: `♿ ${t('Invalidité LT', 'LTD')}`, amount: -company.payrollLTD, color: '#ef4444' })
    if (company.payrollRRSP > 0) benefits.push({ label: `💰 REER (${company.payrollRRSP}%)`, amount: -(payStubResult.grossPay * company.payrollRRSP / 100), color: '#ef4444' })
    if (company.payrollEAP > 0) benefits.push({ label: `🧠 PAE`, amount: -company.payrollEAP, color: '#ef4444' })
    if (company.payrollCustom1Name && company.payrollCustom1Amount > 0) benefits.push({ label: company.payrollCustom1Name, amount: -company.payrollCustom1Amount, color: '#ef4444' })
    if (company.payrollCustom2Name && company.payrollCustom2Amount > 0) benefits.push({ label: company.payrollCustom2Name, amount: -company.payrollCustom2Amount, color: '#ef4444' })
    return benefits
  }, [payStubResult, payStubVacRate, company, lang])

  const totalBenefitsDeductions = useMemo(() =>
    companyBenefits.filter(b => b.amount < 0).reduce((s, b) => s + Math.abs(b.amount), 0),
    [companyBenefits]
  )

  const vacationPay = useMemo(() =>
    payStubResult ? payStubResult.grossPay * (payStubVacRate / 100) : 0,
    [payStubResult, payStubVacRate]
  )

  const finalNetPay = useMemo(() =>
    payStubResult ? payStubResult.netPay + vacationPay - totalBenefitsDeductions : 0,
    [payStubResult, vacationPay, totalBenefitsDeductions]
  )

  // ── Calcul invoice contracteur ─────────────────────────────────────────────
  const calcInvoice = (days: typeof empDetails, hourlyRate: number) => {
    const subtotal     = days.reduce((s, d) => s + d.totalRevenue, 0)
    const remiseAmount = remisePercent > 0 ? subtotal * (remisePercent / 100) : 0
    const afterRemise  = subtotal - remiseAmount
    const gstAmount    = gstEnabled ? afterRemise * 0.05 : 0
    const total        = afterRemise + gstAmount
    return { subtotal, remiseAmount, afterRemise, gstAmount, total }
  }

  // ── Ouvrir modal invoice ───────────────────────────────────────────────────
  const openInvoiceModal = (weekStart: string) => {
    const existing = getByWeek(viewEmployee?.id || '', weekStart)
    if (existing) {
      setViewingInvoiceId(existing.id)
      setGstEnabled(existing.gstEnabled)
      setGstNumber(existing.employeeGSTNumber)
      setRemisePercent(existing.remisePercent)
      setEmpAddress(existing.employeeAddress)
      setEmpCity(existing.employeeCity)
      setEmpPhone(existing.employeePhone)
      setEmpEmail(existing.employeeEmail)
      setInvoiceNotes(existing.notes)
    } else {
      setViewingInvoiceId(null)
      setGstEnabled(false); setGstNumber(''); setRemisePercent(0)
      setEmpAddress(''); setEmpCity(''); setEmpPhone(''); setEmpEmail(''); setInvoiceNotes('')
    }
    setInvoiceTab('config'); setInvoiceModalWeek(weekStart); setSaved(false)
  }

  // ── Sauvegarder invoice ────────────────────────────────────────────────────
  const handleSaveInvoice = (weekStart: string, days: typeof empDetails) => {
    if (!viewEmployee) return
    const weekEnd = new Date(weekStart + 'T12:00:00')
    weekEnd.setDate(weekEnd.getDate() + 6)
    const periodEnd = weekEnd.toISOString().split('T')[0]
    const { subtotal, remiseAmount, gstAmount, total } = calcInvoice(days, viewEmployee.hourlyRate)
    const initials = viewEmployee.name.split(' ').map(n => n[0]).join('').toUpperCase()
    const invNum   = useEmployeeStore.getState().getNextInvoiceNumber(viewEmployee.id)
    const invDays  = days.map(d => ({ date: d.date, hours: d.totalHours, revenue: d.totalRevenue, sessions: d.sessions.length }))
    const data: Omit<EmployeeInvoice, 'id' | 'createdAt'> = {
      number: invNum, employeeId: viewEmployee.id, employeeName: viewEmployee.name,
      employeeInitials: initials, employeeColor: viewEmployee.color,
      employeeAddress: empAddress, employeeCity: empCity, employeePhone: empPhone,
      employeeEmail: empEmail, employeeGSTNumber: gstEnabled ? gstNumber : '',
      periodStart: weekStart, periodEnd, days: invDays,
      totalHours: days.reduce((s, d) => s + d.totalHours, 0), hourlyRate: viewEmployee.hourlyRate,
      subtotal, remisePercent, remiseAmount, gstEnabled, gstRate: 5, gstAmount, total,
      companyName: company.name || 'Hailite Xteriors',
      companyAddress: company.address || '',
      companyCity: `${company.city || ''} ${company.province || 'AB'}`.trim(),
      companyGST: company.gstNumber || '', status: 'brouillon', notes: invoiceNotes,
    }
    if (viewingInvoiceId) { updateInvoice(viewingInvoiceId, data) }
    else { addInvoice(data); useEmployeeStore.getState().incrementInvoiceSequence(viewEmployee.id) }
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  // ── Changer PIN ────────────────────────────────────────────────────────────
  const handlePinChange = () => {
    if (!currentEmployee || !currentEmployeeId) return
    if (!isAdmin && oldPin !== currentEmployee.pin) {
      setPinError(true); setPinMsg(t('Ancien PIN incorrect', 'Incorrect old PIN')); return
    }
    if (newPin.length !== 4) {
      setPinError(true); setPinMsg(t('Le nouveau PIN doit avoir 4 chiffres', 'New PIN must be 4 digits')); return
    }
    if (newPin !== confirmPin) {
      setPinError(true); setPinMsg(t('Les PINs ne correspondent pas', 'PINs do not match')); return
    }
    useEmployeeStore.getState().updateEmployee(currentEmployeeId, { pin: newPin })
    setPinError(false); setPinMsg(t('PIN changé avec succès !', 'PIN changed successfully!'))
    setOldPin(''); setNewPin(''); setConfirmPin('')
    setTimeout(() => { setShowPinChange(false); setPinMsg('') }, 2000)
  }

  const handleAdminResetPin = (empId: string) => {
    const val = adminResetPins[empId] || ''
    if (val.length !== 4) { alert(t('Le PIN doit avoir 4 chiffres', 'PIN must be 4 digits')); return }
    useEmployeeStore.getState().updateEmployee(empId, { pin: val })
    setAdminResetPins(prev => ({ ...prev, [empId]: '' }))
    alert(`✅ PIN de ${employees.find(e => e.id === empId)?.name} mis à jour !`)
  }

  const empInvoices = viewEmployee
    ? invoices.filter(inv => inv.employeeId === viewEmployee.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : []

  const handlePrintPayStub = () => {
    setPayStubPrinting(true)
    setTimeout(() => { window.print(); setPayStubPrinting(false) }, 300)
  }

  const openPayStubForEmployee = (emp: typeof currentEmployee) => {
    if (!emp) return
    setPayStubEmpId(emp.id)
    const today = new Date()
    const day = today.getDay()
    const diffMon = today.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(today); monday.setDate(diffMon)
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6)
    setPayStubStartDate(monday.toISOString().split('T')[0])
    setPayStubEndDate(sunday.toISOString().split('T')[0])
    setPayStubVacRate(company.payrollVacationRate || 6)
    setPayStubNotes('')
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <h1 style={{ color: theme.colors.primary, fontSize: '14px', letterSpacing: '3px', fontWeight: 700 }}>
        💵 {t('LIVRE DE PAYE', 'PAYROLL BOOK')}
      </h1>

      {/* ── BARRE D'ONGLETS ── */}
      {bothTabsVisible && (
        <div style={{ display: 'flex', gap: '6px', background: theme.colors.card, borderRadius: '14px', padding: '6px', border: `1px solid ${theme.colors.border}` }}>
          <button onClick={() => setActiveTab('contractor')} style={{
            flex: 1, padding: '11px 8px', borderRadius: '10px', cursor: 'pointer', border: 'none',
            background: activeTab === 'contractor' ? theme.colors.primary : 'transparent',
            color: activeTab === 'contractor' ? 'white' : theme.colors.textMuted,
            fontSize: '13px', fontWeight: 700, transition: 'all 0.2s',
          }}>📋 {t('Mes Invoices', 'My Invoices')}</button>
          <button onClick={() => setActiveTab('salaried')} style={{
            flex: 1, padding: '11px 8px', borderRadius: '10px', cursor: 'pointer', border: 'none',
            background: activeTab === 'salaried' ? theme.colors.primary : 'transparent',
            color: activeTab === 'salaried' ? 'white' : theme.colors.textMuted,
            fontSize: '13px', fontWeight: 700, transition: 'all 0.2s',
          }}>💼 {t('Paie Salariés', 'Salaried Pay')}</button>
        </div>
      )}

      {/* ══ ONGLET 1 — CONTRACTEURS ══ */}
      {showContractorTab && activeTab === 'contractor' && (
        <>
          {isAdmin && (
            <div className={cardClass} style={card}>
              <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: 700 }}>
                👥 {t('VOIR LES INVOICES DE', 'VIEW INVOICES FOR')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {contractorEmployees.length === 0 ? (
                  <p style={{ color: theme.colors.textMuted, fontSize: '13px', textAlign: 'center', padding: '12px' }}>
                    {t('Aucun contracteur configuré', 'No contractors configured')}
                  </p>
                ) : contractorEmployees.map(emp => (
                  <button key={emp.id} onClick={() => setSelectedEmpId(emp.id)} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                    borderRadius: '10px', cursor: 'pointer',
                    border: selectedEmpId === emp.id ? `2px solid ${emp.color}` : `1px solid ${theme.colors.border}`,
                    background: selectedEmpId === emp.id ? `${emp.color}22` : theme.colors.surface,
                    textAlign: 'left',
                  }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: emp.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '14px' }}>{emp.name[0]}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: theme.colors.text, fontSize: '13px', fontWeight: 700 }}>{emp.name} {emp.role === 'admin' ? '👑' : ''} 📋</p>
                      <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>{emp.businessName ? emp.businessName + ' · ' : ''}{t('Contracteur', 'Contractor')} · {emp.hourlyRate}$/{emp.workMode === 'surface' ? 'pi²' : emp.workMode === 'forfait' ? 'job' : 'h'}</p>
                    </div>
                    {selectedEmpId === emp.id && <span style={{ color: emp.color, fontSize: '16px' }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {viewEmployee && viewEmployee.workerType !== 'salaried' && (
            <div className={cardClass} style={{ ...card, borderLeft: `4px solid ${viewEmployee.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: viewEmployee.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '20px' }}>{viewEmployee.name[0]}</div>
                <div>
                  <p style={{ color: theme.colors.text, fontSize: '16px', fontWeight: 800 }}>{viewEmployee.name}</p>
                  {viewEmployee.businessName && <p style={{ color: theme.colors.primary, fontSize: '12px', fontWeight: 700 }}>🏢 {viewEmployee.businessName}</p>}
                  <p style={{ color: theme.colors.textMuted, fontSize: '12px' }}>{viewEmployee.workMode} · {viewEmployee.hourlyRate}$/{viewEmployee.workMode === 'surface' ? 'pi²' : viewEmployee.workMode === 'forfait' ? 'job' : 'h'} · {t('Autonome', 'Contractor')}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: theme.colors.surface, borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <p style={{ color: theme.colors.textMuted, fontSize: '11px', marginBottom: '4px' }}>{t('Total revenus', 'Total revenue')}</p>
                  <p style={{ color: theme.colors.secondary, fontSize: '20px', fontWeight: 800 }}>{formatCurrency(totalRevenue)}</p>
                </div>
                <div style={{ background: theme.colors.surface, borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <p style={{ color: theme.colors.textMuted, fontSize: '11px', marginBottom: '4px' }}>{t('Total heures', 'Total hours')}</p>
                  <p style={{ color: theme.colors.primary, fontSize: '20px', fontWeight: 800 }}>{totalHours.toFixed(1)}h</p>
                </div>
              </div>
            </div>
          )}

          {empInvoices.length > 0 && (
            <div className={cardClass} style={card}>
              <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: 700 }}>
                🧾 {t('MES INVOICES', 'MY INVOICES')} ({empInvoices.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {empInvoices.map(inv => {
                  const sc = STATUS_CONFIG[inv.status]
                  return (
                    <div key={inv.id} onClick={() => openInvoiceModal(inv.periodStart)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme.colors.surface, borderRadius: '10px', padding: '12px', borderLeft: `3px solid ${sc.color}`, cursor: 'pointer' }}>
                      <div>
                        <p style={{ color: theme.colors.text, fontSize: '13px', fontWeight: 700 }}>{inv.number}</p>
                        <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>{inv.periodStart} → {inv.periodEnd}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: theme.colors.primary, fontSize: '14px', fontWeight: 800 }}>{formatCurrency(inv.total)}</p>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: sc.color }}>{sc.emoji} {sc.label}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {viewEmployee && viewEmployee.workerType !== 'salaried' && Object.keys(weekGroups).length === 0 && (
            <div className={cardClass} style={{ ...card, textAlign: 'center', padding: '32px' }}>
              <p style={{ color: theme.colors.textMuted, fontSize: '14px' }}>{t('Aucune donnée disponible', 'No data available')}</p>
            </div>
          )}

          {viewEmployee && viewEmployee.workerType !== 'salaried' &&
            Object.entries(weekGroups).sort(([a], [b]) => b.localeCompare(a)).map(([weekStart, days]) => {
              const weekRevenue = days.reduce((s, d) => s + d.totalRevenue, 0)
              const weekHours   = days.reduce((s, d) => s + d.totalHours, 0)
              const weekBreak   = days.reduce((s, d) => s + d.totalBreak, 0)
              const weekEnd = new Date(weekStart + 'T12:00:00')
              weekEnd.setDate(weekEnd.getDate() + 6)
              const weekEndStr  = weekEnd.toISOString().split('T')[0]
              const existingInv = viewEmployee ? getByWeek(viewEmployee.id, weekStart) : undefined
              const sc          = existingInv ? STATUS_CONFIG[existingInv.status] : null
              return (
                <div key={weekStart} className={cardClass} style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ color: theme.colors.text, fontSize: '14px', fontWeight: 800 }}>📅 {t('Semaine du', 'Week of')} {weekStart}</p>
                      <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>{t('au', 'to')} {weekEndStr}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: theme.colors.secondary, fontSize: '16px', fontWeight: 800 }}>{formatCurrency(weekRevenue)}</p>
                      <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>{weekHours.toFixed(2)}h</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    {[
                      { label: t('Jours', 'Days'), value: `${days.length}`, color: theme.colors.primary },
                      { label: t('Heures', 'Hours'), value: `${weekHours.toFixed(1)}h`, color: theme.colors.primaryLight },
                      { label: t('Pauses', 'Breaks'), value: formatTimer(weekBreak), color: '#f97316' },
                    ].map(item => (
                      <div key={item.label} style={{ background: theme.colors.surface, borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                        <p style={{ color: item.color, fontSize: '15px', fontWeight: 800 }}>{item.value}</p>
                        <p style={{ color: theme.colors.textMuted, fontSize: '10px' }}>{item.label}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {days.map(detail => (
                      <div key={detail.date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '6px' }}>
                        <div>
                          <p style={{ color: theme.colors.text, fontSize: '13px' }}>
                            {new Date(detail.date + 'T12:00:00').toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </p>
                          <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>{detail.sessions.length} session(s) · {detail.totalHours.toFixed(2)}h</p>
                        </div>
                        <p style={{ color: theme.colors.secondary, fontSize: '13px', fontWeight: 700 }}>{formatCurrency(detail.totalRevenue)}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `2px solid ${theme.colors.primary}`, paddingTop: '10px' }}>
                    <p style={{ color: theme.colors.text, fontSize: '14px', fontWeight: 800 }}>TOTAL</p>
                    <p style={{ color: theme.colors.secondary, fontSize: '14px', fontWeight: 800 }}>{formatCurrency(weekRevenue)}</p>
                  </div>
                  <button onClick={() => openInvoiceModal(weekStart)} style={{
                    padding: '12px', borderRadius: '10px', cursor: 'pointer',
                    border: existingInv ? `1px solid ${sc!.color}` : `1px solid ${theme.colors.primary}`,
                    background: existingInv ? `${sc!.color}15` : `${theme.colors.primary}18`,
                    color: existingInv ? sc!.color : theme.colors.primary,
                    fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}>
                    {existingInv ? `${sc!.emoji} ${existingInv.number} — ${sc!.label}` : `📄 ${t('Générer Invoice', 'Generate Invoice')}`}
                  </button>
                </div>
              )
            })
          }
        </>
      )}

      {/* ══ ONGLET 2 — SALARIÉS ══ */}
      {showSalariedTab && activeTab === 'salaried' && (
        <>
          {salariedEmployees.length === 0 ? (
            <div className={cardClass} style={{ ...card, textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ fontSize: '40px', marginBottom: '10px' }}>💼</p>
              <p style={{ color: theme.colors.text, fontSize: '15px', fontWeight: 700 }}>{t('Aucun employé salarié', 'No salaried employees')}</p>
              <p style={{ color: theme.colors.textMuted, fontSize: '12px', marginTop: '6px' }}>{t('→ Réglages → Employés → Type : Salarié', '→ Settings → Employees → Type: Salaried')}</p>
            </div>
          ) : isAdmin ? (
            /* Admin — liste complète de tous les salariés */
            <div className={cardClass} style={card}>
              <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: 700 }}>
                💼 {t('TALONS DE PAIE — EMPLOYÉS SALARIÉS', 'PAY STUBS — SALARIED EMPLOYEES')}
              </p>
              <p style={{ color: theme.colors.textMuted, fontSize: '12px' }}>
                {t('Générez un talon de paie officiel avec toutes les déductions.', 'Generate an official pay stub with all deductions.')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {salariedEmployees.map(emp => (
                  <button key={emp.id} onClick={() => openPayStubForEmployee(emp)} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
                    borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                    border: payStubEmpId === emp.id ? `2px solid ${emp.color}` : `1px solid ${theme.colors.border}`,
                    background: payStubEmpId === emp.id ? `${emp.color}22` : theme.colors.surface,
                  }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: emp.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '16px' }}>{emp.name[0]}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: theme.colors.text, fontSize: '13px', fontWeight: 700 }}>{emp.name}</p>
                      <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>{emp.hourlyRate}$/h · {emp.employeeProvince || 'AB'} · {emp.payFrequency || 'weekly'}</p>
                    </div>
                    <span style={{ color: emp.color, fontSize: '20px' }}>🧾</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Non-admin salarié — SEULEMENT son propre talon */
            currentEmployee && (
              <div className={cardClass} style={card}>
                <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: 700 }}>
                  💼 {t('MON TALON DE PAIE', 'MY PAY STUB')}
                </p>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
                  borderRadius: '10px', background: theme.colors.surface,
                  border: `1px solid ${currentEmployee.color}40`,
                }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: currentEmployee.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '16px' }}>
                    {currentEmployee.name[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: theme.colors.text, fontSize: '14px', fontWeight: 800 }}>{currentEmployee.name}</p>
                    <p style={{ color: theme.colors.textMuted, fontSize: '12px' }}>
                      {currentEmployee.hourlyRate}$/h · {currentEmployee.employeeProvince || 'AB'} · {currentEmployee.payFrequency || 'weekly'}
                    </p>
                  </div>
                </div>
                <button onClick={() => openPayStubForEmployee(currentEmployee)} style={{
                  padding: '14px', borderRadius: '12px', cursor: 'pointer', border: 'none',
                  background: currentEmployee.color, color: 'white',
                  fontSize: '14px', fontWeight: 800, width: '100%',
                }}>
                  🧾 {t('Générer mon talon de paie', 'Generate My Pay Stub')}
                </button>
                <p style={{ color: theme.colors.textMuted, fontSize: '11px', textAlign: 'center' }}>
                  {t('Période courante : semaine en cours', 'Current period: current week')}
                </p>
              </div>
            )
          )}
        </>
      )}

      {/* ── PIN CHANGE ── */}
      <div className={cardClass} style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: 700 }}>🔐 {t('CHANGER MON PIN', 'CHANGE MY PIN')}</p>
          <button onClick={() => { setShowPinChange(!showPinChange); setOldPin(''); setNewPin(''); setConfirmPin(''); setPinMsg(''); setPinError(false) }}
            style={{ padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', border: `1px solid ${theme.colors.primary}`, background: 'transparent', color: theme.colors.primary, fontSize: '12px', fontWeight: 700 }}>
            {showPinChange ? t('Annuler', 'Cancel') : t('Modifier', 'Edit')}
          </button>
        </div>
        {showPinChange && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {!isAdmin && (
              <div>
                <label style={{ color: theme.colors.textMuted, fontSize: '11px', fontWeight: 600 }}>{t('Ancien PIN', 'Old PIN')}</label>
                <input type="password" maxLength={4} value={oldPin} onChange={e => setOldPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="****" style={pinInputStyle} />
              </div>
            )}
            <div>
              <label style={{ color: theme.colors.textMuted, fontSize: '11px', fontWeight: 600 }}>{t('Nouveau PIN', 'New PIN')}</label>
              <input type="password" maxLength={4} value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="****" style={pinInputStyle} />
            </div>
            <div>
              <label style={{ color: theme.colors.textMuted, fontSize: '11px', fontWeight: 600 }}>{t('Confirmer nouveau PIN', 'Confirm new PIN')}</label>
              <input type="password" maxLength={4} value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="****" style={pinInputStyle} />
            </div>
            {pinMsg && <p style={{ color: pinError ? '#ef4444' : '#22c55e', fontSize: '13px', textAlign: 'center', fontWeight: 700 }}>{pinMsg}</p>}
            <button onClick={handlePinChange} style={{ padding: '14px', borderRadius: '12px', cursor: 'pointer', background: theme.colors.primary, border: 'none', color: 'white', fontSize: '14px', fontWeight: 700 }}>
              ✅ {t('Changer le PIN', 'Change PIN')}
            </button>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className={cardClass} style={card}>
          <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: 700 }}>🔑 {t('RÉINITIALISER UN PIN EMPLOYÉ', 'RESET EMPLOYEE PIN')}</p>
          <p style={{ color: theme.colors.textMuted, fontSize: '12px' }}>{t('Si un employé a oublié son PIN, entrez un nouveau PIN pour lui.', 'If an employee forgot their PIN, enter a new PIN for them.')}</p>
          {employees.filter(e => e.id !== 'admin').map(emp => (
            <div key={emp.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: theme.colors.surface, borderRadius: '10px', padding: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: emp.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '12px' }}>{emp.name[0]}</div>
              <p style={{ color: theme.colors.text, fontSize: '13px', fontWeight: 700, flex: 1 }}>{emp.name}</p>
              <input type="password" maxLength={4} value={adminResetPins[emp.id] || ''} onChange={e => setAdminResetPins(prev => ({ ...prev, [emp.id]: e.target.value.replace(/\D/g, '').slice(0, 4) }))} placeholder="****"
                style={{ width: '80px', background: theme.colors.card, border: `1px solid ${theme.colors.border}`, borderRadius: '8px', padding: '8px', color: theme.colors.text, fontSize: '14px', textAlign: 'center', letterSpacing: '4px', outline: 'none' }} />
              <button onClick={() => handleAdminResetPin(emp.id)} style={{ padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', background: theme.colors.primary, border: 'none', color: 'white', fontSize: '12px', fontWeight: 700 }}>✓</button>
            </div>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
           MODAL TALON DE PAIE
          ════════════════════════════════════════════════════════════════════ */}
      {payStubEmpId && payStubEmployee && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: theme.colors.surface, borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '95vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.colors.border}`, position: 'sticky', top: 0, background: theme.colors.surface, zIndex: 10 }}>
              <div>
                <p style={{ color: theme.colors.primary, fontSize: '15px', fontWeight: 800 }}>💼 {t('Talon de paie', 'Pay Stub')} — {payStubEmployee.name}</p>
                <p style={{ color: theme.colors.textMuted, fontSize: '11px', marginTop: '2px' }}>{payStubEmployee.employeeProvince} · {payStubEmployee.payFrequency} · {payStubEmployee.hourlyRate}$/h</p>
              </div>
              <button onClick={() => setPayStubEmpId(null)} style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}`, borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', color: theme.colors.textMuted, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div style={{ padding: '16px 20px 80px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Période */}
              <div style={{ background: theme.colors.card, borderRadius: '12px', padding: '14px', border: `1px solid ${theme.colors.border}` }}>
                <p style={{ color: theme.colors.primary, fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '10px' }}>📅 {t('PÉRIODE DE PAIE', 'PAY PERIOD')}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ color: theme.colors.textMuted, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>{t('Début', 'Start')}</label>
                    <input type="date" value={payStubStartDate} onChange={e => setPayStubStartDate(e.target.value)} style={{ ...inputStyle, marginTop: '4px' }} />
                  </div>
                  <div>
                    <label style={{ color: theme.colors.textMuted, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>{t('Fin', 'End')}</label>
                    <input type="date" value={payStubEndDate} onChange={e => setPayStubEndDate(e.target.value)} style={{ ...inputStyle, marginTop: '4px' }} />
                  </div>
                </div>
              </div>

              {/* Vacances */}
              <div style={{ background: theme.colors.card, borderRadius: '12px', padding: '14px', border: `1px solid ${theme.colors.border}` }}>
                <p style={{ color: theme.colors.primary, fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '4px' }}>🏖️ {t('PAIE DE VACANCES', 'VACATION PAY')}</p>
                <p style={{ color: theme.colors.textMuted, fontSize: '11px', marginBottom: '10px' }}>
                  {t('6% minimum en construction Alberta (loi)', '6% minimum in Alberta construction (law)')}
                  {company.payrollVacationRate !== 6 ? ` · ${t('Configuré', 'Set')}: ${company.payrollVacationRate}%` : ''}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[4, 6, 8, 10].map(pct => (
                    <button key={pct} onClick={() => setPayStubVacRate(pct)} style={{
                      flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                      border: payStubVacRate === pct ? 'none' : `1px solid ${theme.colors.border}`,
                      background: payStubVacRate === pct ? theme.colors.primary : theme.colors.surface,
                      color: payStubVacRate === pct ? 'white' : theme.colors.textMuted,
                    }}>{pct}%{pct === 6 ? ' ⚖️' : ''}</button>
                  ))}
                </div>
              </div>

              {/* Déductions légales calculées */}
              {payStubResult ? (
                <div style={{ background: theme.colors.card, borderRadius: '12px', padding: '14px', border: `1px solid ${theme.colors.border}` }}>
                  <p style={{ color: theme.colors.primary, fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '12px' }}>📊 {t('DÉDUCTIONS LÉGALES', 'STATUTORY DEDUCTIONS')}</p>
                  {payStubRows.filter(r => r.label !== '─────').map((row, i) => {
                    const pct = payStubResult && row.type === 'deduction' && row.amount !== 0
                      ? (Math.abs(row.amount) / payStubResult.grossPay * 100).toFixed(1) + '%' : null
                    const employerPct = payStubResult && row.isEmployer && row.amount !== 0
                      ? (row.amount / payStubResult.grossPay * 100).toFixed(1) + '%' : null
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < payStubRows.filter(r => r.label !== '─────').length - 1 ? `1px solid ${theme.colors.border}` : 'none' }}>
                        <p style={{ color: row.type === 'net' ? '#22c55e' : row.type === 'total' ? theme.colors.primary : row.isEmployer ? '#f97316' : theme.colors.textMuted, fontSize: row.type === 'net' || row.type === 'total' ? '14px' : '13px', fontWeight: row.type === 'net' || row.type === 'total' ? 800 : 400 }}>{row.label}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {(pct || employerPct) && <span style={{ fontSize: '10px', color: theme.colors.textMuted, background: theme.colors.surface, padding: '2px 6px', borderRadius: '20px', fontWeight: 600 }}>{pct || employerPct}</span>}
                          <p style={{ color: row.type === 'net' ? '#22c55e' : row.amount < 0 ? '#ef4444' : row.isEmployer ? '#f97316' : theme.colors.text, fontSize: row.type === 'net' || row.type === 'total' ? '16px' : '13px', fontWeight: row.type === 'net' || row.type === 'total' ? 800 : 600 }}>{formatCurrency(Math.abs(row.amount))}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ background: theme.colors.card, borderRadius: '12px', padding: '20px', textAlign: 'center', border: `1px solid ${theme.colors.border}` }}>
                  <p style={{ color: theme.colors.textMuted, fontSize: '13px' }}>⚠️ {t('Province ou fréquence de paie non configurée.', 'Province or pay frequency not configured.')}</p>
                  <p style={{ color: theme.colors.textMuted, fontSize: '11px', marginTop: '8px' }}>{t('→ Réglages → Employés → Modifier', '→ Settings → Employees → Edit')}</p>
                </div>
              )}

              {/* Avantages sociaux compagnie */}
              {payStubResult && companyBenefits.length > 0 && (
                <div style={{ background: theme.colors.card, borderRadius: '12px', padding: '14px', border: `1px solid ${theme.colors.border}` }}>
                  <p style={{ color: theme.colors.primary, fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '10px' }}>
                    🏢 {t('AVANTAGES SOCIAUX COMPAGNIE', 'COMPANY BENEFITS')}
                  </p>
                  {companyBenefits.map((b, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < companyBenefits.length - 1 ? `1px solid ${theme.colors.border}` : 'none' }}>
                      <p style={{ color: theme.colors.textMuted, fontSize: '12px' }}>{b.label}</p>
                      <p style={{ color: b.amount >= 0 ? '#f59e0b' : '#ef4444', fontSize: '13px', fontWeight: 600 }}>
                        {b.amount >= 0 ? '+' : ''}{formatCurrency(b.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* NET FINAL */}
              {payStubResult && (
                <div style={{ background: payStubEmployee.color, borderRadius: '14px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{t('NET À PAYER', 'NET PAY')}</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                      {t('(après vacances et avantages)', '(after vacation & benefits)')}
                    </p>
                  </div>
                  <p style={{ fontSize: '26px', fontWeight: 900, color: 'white' }}>{formatCurrency(finalNetPay)}</p>
                </div>
              )}

              {/* Notes */}
              <div style={{ background: theme.colors.card, borderRadius: '12px', padding: '14px', border: `1px solid ${theme.colors.border}` }}>
                <label style={{ color: theme.colors.textMuted, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Notes</label>
                <textarea value={payStubNotes} onChange={e => setPayStubNotes(e.target.value)}
                  placeholder={t('Notes additionnelles...', 'Additional notes...')}
                  rows={2} style={{ ...inputStyle, marginTop: '4px', resize: 'vertical' as const }} />
              </div>

              {/* Boutons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button onClick={handlePrintPayStub} style={{ padding: '14px', borderRadius: '12px', cursor: 'pointer', border: 'none', background: payStubEmployee.color, color: 'white', fontSize: '14px', fontWeight: 800 }}>
                  🖨️ {t('Imprimer / PDF', 'Print / PDF')}
                </button>
                <button onClick={() => setPayStubEmpId(null)} style={{ padding: '14px', borderRadius: '12px', cursor: 'pointer', border: `1px solid ${theme.colors.border}`, background: 'transparent', color: theme.colors.text, fontSize: '14px', fontWeight: 700 }}>
                  ✕ {t('Fermer', 'Close')}
                </button>
              </div>

              {/* Notes légales */}
              <div style={{ background: theme.colors.card, borderRadius: '10px', padding: '12px', border: `1px solid ${theme.colors.border}` }}>
                <p style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>⚖️ {t('Obligations légales Alberta', 'Alberta Legal Requirements')}</p>
                {[
                  t('✅ Talon de paie obligatoire à chaque paie', '✅ Pay stub required every pay period'),
                  t('✅ Conserver les dossiers 3 ans minimum', '✅ Keep records minimum 3 years'),
                  t('✅ Construction : 6% vacances minimum', '✅ Construction: 6% vacation minimum'),
                  t('✅ 9 jours fériés payés en Alberta', '✅ 9 statutory holidays paid in Alberta'),
                  t('✅ Overtime après 8h/jour ou 44h/semaine', '✅ Overtime after 8h/day or 44h/week'),
                ].map((item, i) => (
                  <p key={i} style={{ color: theme.colors.textMuted, fontSize: '11px' }}>{item}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
           MODAL INVOICE CONTRACTEUR
          ════════════════════════════════════════════════════════════════════ */}
      {invoiceModalWeek && viewEmployee && (() => {
        const days    = weekGroups[invoiceModalWeek] || []
        const calc    = calcInvoice(days, viewEmployee.hourlyRate)
        const weekEnd = new Date(invoiceModalWeek + 'T12:00:00')
        weekEnd.setDate(weekEnd.getDate() + 6)
        const periodEnd   = weekEnd.toISOString().split('T')[0]
        const initials    = viewEmployee.name.split(' ').map(n => n[0]).join('').toUpperCase()
        const existingInv = getByWeek(viewEmployee.id, invoiceModalWeek)

        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ background: theme.colors.surface, borderRadius: '20px 20px 0 0', padding: '0 0 80px', width: '100%', maxHeight: '95vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '20px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.colors.border}`, position: 'sticky', top: 0, background: theme.colors.surface, zIndex: 10 }}>
                <div>
                  <p style={{ color: theme.colors.primary, fontSize: '15px', fontWeight: 800 }}>🧾 {existingInv ? existingInv.number : t('Nouvelle Invoice', 'New Invoice')}</p>
                  <p style={{ color: theme.colors.textMuted, fontSize: '11px', marginTop: '2px' }}>{invoiceModalWeek} → {periodEnd}</p>
                </div>
                <button onClick={() => setInvoiceModalWeek(null)} style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}`, borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', color: theme.colors.textMuted, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
              <div style={{ display: 'flex', padding: '12px 20px 0', gap: '8px' }}>
                {(['config', 'apercu'] as const).map(tab => (
                  <button key={tab} onClick={() => setInvoiceTab(tab)} style={{ padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', border: invoiceTab === tab ? 'none' : `1px solid ${theme.colors.border}`, background: invoiceTab === tab ? theme.colors.primary : 'transparent', color: invoiceTab === tab ? 'white' : theme.colors.textMuted, fontSize: '13px', fontWeight: 700 }}>
                    {tab === 'config' ? '⚙️ Config' : '👁️ Aperçu'}
                  </button>
                ))}
              </div>
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {invoiceTab === 'config' && (
                  <>
                    <div style={{ background: theme.colors.card, borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', border: `1px solid ${theme.colors.border}` }}>
                      <p style={{ color: theme.colors.primary, fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px' }}>👤 {t('VOS INFORMATIONS', 'YOUR INFORMATION')}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {[['Adresse', empAddress, setEmpAddress, '123 rue...'], ['Ville', empCity, setEmpCity, 'Calgary AB'], ['Téléphone', empPhone, setEmpPhone, '780-555-0000'], ['Courriel', empEmail, setEmpEmail, 'moi@email.com']].map(([label, val, setter, ph]) => (
                          <div key={label as string}>
                            <label style={{ color: theme.colors.textMuted, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>{label as string}</label>
                            <input value={val as string} onChange={e => (setter as any)(e.target.value)} placeholder={ph as string} style={inputStyle} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ background: theme.colors.card, borderRadius: '12px', padding: '14px', border: `1px solid ${theme.colors.border}` }}>
                      <p style={{ color: theme.colors.primary, fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '10px' }}>🏛️ TPS / GST</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: gstEnabled ? '10px' : '0' }}>
                        <button onClick={() => setGstEnabled(!gstEnabled)} style={{ padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', border: `2px solid ${gstEnabled ? '#22c55e' : theme.colors.border}`, background: gstEnabled ? '#22c55e20' : 'transparent', color: gstEnabled ? '#22c55e' : theme.colors.textMuted, fontSize: '13px', fontWeight: 700 }}>
                          {gstEnabled ? '✅ TPS Activée (5%)' : '○ Sans TPS'}
                        </button>
                        <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
                          {gstEnabled ? '(+' + formatCurrency(calc.gstAmount) + ')' : t('Si enregistré >30 000$/an', 'If registered >$30,000/yr')}
                        </p>
                      </div>
                      {gstEnabled && (
                        <div>
                          <label style={{ color: theme.colors.textMuted, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Numéro TPS</label>
                          <input value={gstNumber} onChange={e => setGstNumber(e.target.value)} placeholder="123456789 RT 0001" style={{ ...inputStyle, marginTop: '4px' }} />
                        </div>
                      )}
                    </div>
                    <div style={{ background: theme.colors.card, borderRadius: '12px', padding: '14px', border: `1px solid ${theme.colors.border}` }}>
                      <p style={{ color: theme.colors.primary, fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '10px' }}>🏷️ {t('REMISE %', 'DISCOUNT %')}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input type="number" value={remisePercent} onChange={e => setRemisePercent(Math.max(0, Math.min(100, Number(e.target.value))))} min={0} max={100} style={{ ...inputStyle, width: '100px' }} />
                        <span style={{ color: theme.colors.textMuted, fontSize: '13px' }}>%</span>
                        {remisePercent > 0 && <span style={{ color: '#ef4444', fontSize: '13px', fontWeight: 700 }}>-{formatCurrency(calc.remiseAmount)}</span>}
                      </div>
                    </div>
                    <div style={{ background: theme.colors.card, borderRadius: '12px', padding: '14px', border: `1px solid ${theme.colors.border}` }}>
                      <label style={{ color: theme.colors.textMuted, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Notes</label>
                      <textarea value={invoiceNotes} onChange={e => setInvoiceNotes(e.target.value)} placeholder={t('Notes additionnelles...', 'Additional notes...')} rows={3} style={{ ...inputStyle, marginTop: '4px', resize: 'vertical' as const }} />
                    </div>
                    <div style={{ background: `${theme.colors.primary}10`, borderRadius: '12px', padding: '14px', border: `1px solid ${theme.colors.primary}30` }}>
                      {[
                        { label: t('Sous-total', 'Subtotal'), value: formatCurrency(calc.subtotal), color: theme.colors.text },
                        ...(remisePercent > 0 ? [{ label: `Remise -${remisePercent}%`, value: `-${formatCurrency(calc.remiseAmount)}`, color: '#ef4444' }] : []),
                        ...(gstEnabled ? [{ label: 'TPS 5%', value: formatCurrency(calc.gstAmount), color: theme.colors.textMuted }] : []),
                        { label: 'TOTAL', value: formatCurrency(calc.total), color: theme.colors.primary },
                      ].map(row => (
                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: row.label === 'TOTAL' ? 'none' : `1px solid ${theme.colors.border}` }}>
                          <p style={{ color: row.color, fontSize: row.label === 'TOTAL' ? '16px' : '13px', fontWeight: row.label === 'TOTAL' ? 800 : 400 }}>{row.label}</p>
                          <p style={{ color: row.color, fontSize: row.label === 'TOTAL' ? '18px' : '13px', fontWeight: row.label === 'TOTAL' ? 900 : 600 }}>{row.value}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {invoiceTab === 'apercu' && (
                  <div style={{ background: 'white', borderRadius: '12px', padding: '24px', position: 'relative', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                    <EmployeeWatermark initials={initials} color={viewEmployee.color} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div>
                          <p style={{ fontSize: '22px', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.5px' }}>{viewEmployee.name}</p>
                          {viewEmployee.businessName && <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>🏢 {viewEmployee.businessName}</p>}
                          {empAddress && <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{empAddress}</p>}
                          {empCity && <p style={{ fontSize: '12px', color: '#6b7280' }}>{empCity}</p>}
                          {empPhone && <p style={{ fontSize: '12px', color: '#6b7280' }}>📞 {empPhone}</p>}
                          {empEmail && <p style={{ fontSize: '12px', color: '#6b7280' }}>✉️ {empEmail}</p>}
                          {gstEnabled && gstNumber && <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>TPS: {gstNumber}</p>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '24px', fontWeight: 900, color: viewEmployee.color }}>INVOICE</p>
                          <p style={{ fontSize: '14px', fontWeight: 800, color: '#374151', marginTop: '4px' }}>#{existingInv?.number || `${initials}-DRAFT`}</p>
                          <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>{new Date().toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA')}</p>
                        </div>
                      </div>
                      <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 800, color: '#9ca3af', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>{t('FACTURÉ À', 'BILL TO')}</p>
                        <p style={{ fontSize: '14px', fontWeight: 800, color: '#1a1a1a' }}>{company.name || 'Hailite Xteriors'}</p>
                        {company.address && <p style={{ fontSize: '12px', color: '#6b7280' }}>{company.address}</p>}
                        {company.city && <p style={{ fontSize: '12px', color: '#6b7280' }}>{company.city} {company.province}</p>}
                        {company.gstNumber && <p style={{ fontSize: '11px', color: '#9ca3af' }}>TPS: {company.gstNumber}</p>}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', background: `${viewEmployee.color}15`, borderRadius: '8px', padding: '10px 14px' }}>
                        <div>
                          <p style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('Période', 'Period')}</p>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginTop: '2px' }}>{invoiceModalWeek} → {periodEnd}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>Taux</p>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginTop: '2px' }}>{viewEmployee.hourlyRate}$/{viewEmployee.workMode === 'surface' ? 'pi²' : viewEmployee.workMode === 'forfait' ? 'job' : 'h'}</p>
                        </div>
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ borderBottom: `2px solid ${viewEmployee.color}40` }}>
                            {[t('Date', 'Date'), t('Heures', 'Hours'), t('Montant', 'Amount')].map((h, i) => (
                              <th key={h} style={{ textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right', padding: '6px 0', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {days.map((d, i) => (
                            <tr key={d.date} style={{ background: i % 2 === 0 ? '#f9fafb' : 'white' }}>
                              <td style={{ padding: '8px 4px', color: '#374151' }}>{new Date(d.date + 'T12:00:00').toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                              <td style={{ padding: '8px 4px', textAlign: 'center', color: '#374151', fontWeight: 600 }}>{d.totalHours.toFixed(2)}h</td>
                              <td style={{ padding: '8px 4px', textAlign: 'right', color: '#374151', fontWeight: 600 }}>{formatCurrency(d.totalRevenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
                        {[
                          { label: t('Sous-total', 'Subtotal'), value: formatCurrency(calc.subtotal) },
                          ...(remisePercent > 0 ? [{ label: `Remise -${remisePercent}%`, value: `-${formatCurrency(calc.remiseAmount)}` }] : []),
                          ...(gstEnabled ? [{ label: 'TPS 5%', value: formatCurrency(calc.gstAmount) }] : []),
                        ].map(row => (
                          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                            <p style={{ fontSize: '12px', color: '#6b7280' }}>{row.label}</p>
                            <p style={{ fontSize: '12px', color: '#374151' }}>{row.value}</p>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', padding: '10px 12px', background: viewEmployee.color, borderRadius: '8px' }}>
                          <p style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>TOTAL DÛ</p>
                          <p style={{ fontSize: '18px', fontWeight: 900, color: 'white' }}>{formatCurrency(calc.total)}</p>
                        </div>
                      </div>
                      {invoiceNotes && (
                        <div style={{ marginTop: '12px', padding: '10px', background: '#f9fafb', borderRadius: '8px', borderLeft: `3px solid ${viewEmployee.color}` }}>
                          <p style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase' }}>Notes</p>
                          <p style={{ fontSize: '12px', color: '#374151' }}>{invoiceNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {existingInv && (
                  <div style={{ background: theme.colors.card, borderRadius: '12px', padding: '14px', border: `1px solid ${theme.colors.border}` }}>
                    <p style={{ color: theme.colors.primary, fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '10px' }}>📊 {t('STATUT', 'STATUS')}</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {(['brouillon', 'envoyee', 'payee'] as EmployeeInvoiceStatus[]).map(s => {
                        const sc = STATUS_CONFIG[s]
                        return (
                          <button key={s} onClick={() => updateStatus(existingInv.id, s)} style={{ padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', border: `2px solid ${existingInv.status === s ? sc.color : theme.colors.border}`, background: existingInv.status === s ? `${sc.color}20` : 'transparent', color: existingInv.status === s ? sc.color : theme.colors.textMuted, fontSize: '12px', fontWeight: 700 }}>
                            {sc.emoji} {sc.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button onClick={() => handleSaveInvoice(invoiceModalWeek, days)} style={{ padding: '14px', borderRadius: '12px', cursor: 'pointer', border: 'none', background: saved ? '#22c55e' : theme.colors.primary, color: 'white', fontSize: '14px', fontWeight: 800 }}>
                    {saved ? '✅ Sauvegardée!' : `💾 ${existingInv ? t('Mettre à jour', 'Update') : t('Sauvegarder', 'Save')}`}
                  </button>
                  <button onClick={() => {
                    const subject = encodeURIComponent(`Invoice ${existingInv?.number || 'DRAFT'} — ${viewEmployee.name}`)
                    const body = encodeURIComponent(`Bonjour,\n\nVeuillez trouver ci-joint mon invoice pour la semaine du ${invoiceModalWeek} au ${periodEnd}.\n\nTotal: ${formatCurrency(calc.total)}\n\n${viewEmployee.name}`)
                    window.open(`mailto:${company.email || ''}?subject=${subject}&body=${body}`)
                  }} style={{ padding: '14px', borderRadius: '12px', cursor: 'pointer', border: `1px solid ${theme.colors.border}`, background: 'transparent', color: theme.colors.text, fontSize: '14px', fontWeight: 700 }}>
                    📧 {t('Envoyer', 'Send')}
                  </button>
                </div>
                {existingInv && (
                  <button onClick={() => { if (confirm(t('Supprimer cette invoice?', 'Delete this invoice?'))) { deleteInvoice(existingInv.id); setInvoiceModalWeek(null) } }} style={{ padding: '12px', borderRadius: '10px', cursor: 'pointer', border: '1px solid #ef444444', background: '#ef444411', color: '#ef4444', fontSize: '13px', fontWeight: 700 }}>
                    🗑️ {t('Supprimer', 'Delete')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
