// src/lib/payrollCalculator.ts
import {
  CANADA_FEDERAL,
  CANADA_PROVINCES,
  USA_FEDERAL,
  USA_STATES,
  PAYROLL_YEAR,
} from './payrollRates'

export type PayFrequency = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly'
export type WorkerType = 'contractor' | 'salaried'
export type Country = 'CA' | 'US'

// Nombre de périodes de paie par année
export const PAY_PERIODS: Record<PayFrequency, number> = {
  weekly:      52,
  biweekly:    26,
  semimonthly: 24,
  monthly:     12,
}

export const PAY_FREQUENCY_LABELS: Record<PayFrequency, { fr: string; en: string }> = {
  weekly:      { fr: 'Hebdomadaire',      en: 'Weekly' },
  biweekly:    { fr: 'Aux deux semaines', en: 'Bi-weekly' },
  semimonthly: { fr: 'Deux fois/mois',    en: 'Semi-monthly' },
  monthly:     { fr: 'Mensuel',           en: 'Monthly' },
}

// ─── Résultat du calcul ────────────────────────────────────────────────────
export interface PayrollResult {
  country: Country
  province: string
  payFrequency: PayFrequency
  grossPay: number           // Salaire brut cette période
  annualGross: number        // Salaire brut annuel estimé

  // Déductions employé
  deductions: {
    // Canada
    cpp?: number             // RPC employé
    cpp2?: number            // RPC2 employé (si applicable)
    ei?: number              // AE employé
    federalTax?: number      // Impôt fédéral
    provincialTax?: number   // Impôt provincial
    // USA
    socialSecurity?: number  // Sécurité sociale employé
    medicare?: number        // Medicare employé
    stateTax?: number        // Impôt état
    federalIncomeTax?: number
  }

  // Parts employeur (ton coût additionnel)
  employerCost: {
    cpp?: number             // RPC employeur
    cpp2?: number
    ei?: number              // AE employeur
    socialSecurity?: number
    medicare?: number
    futa?: number            // Chômage fédéral US
  }

  totalDeductions: number    // Total retiré du chèque employé
  netPay: number             // Net à payer à l'employé
  totalEmployerCost: number  // Ce que ça te coûte vraiment
  effectiveTaxRate: number   // Taux effectif global %

  notes: string[]            // Avertissements / infos importantes
  year: number
}

// ─── Calculer l'impôt par paliers ─────────────────────────────────────────
function calcBracketTax(
  annualIncome: number,
  brackets: { min: number; max: number; rate: number }[],
  personalAmount: number = 0
): number {
  const taxableIncome = Math.max(0, annualIncome - personalAmount)
  let tax = 0
  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) break
    const taxable = Math.min(taxableIncome, bracket.max) - bracket.min
    tax += taxable * bracket.rate
  }
  return tax
}

// ─── CALCULATEUR CANADA ────────────────────────────────────────────────────
export function calculateCanadaPayroll(
  grossPay: number,
  provinceCode: string,
  payFrequency: PayFrequency
): PayrollResult {
  const periods = PAY_PERIODS[payFrequency]
  const annualGross = grossPay * periods
  const province = CANADA_PROVINCES[provinceCode]
  const fed = CANADA_FEDERAL
  const notes: string[] = []
  const deductions: PayrollResult['deductions'] = {}
  const employerCost: PayrollResult['employerCost'] = {}

  if (!province) {
    notes.push(`Province ${provinceCode} non trouvée — utilisation Alberta par défaut`)
  }

  // ── RPC / CPP ────────────────────────────────────────────────────────────
  if (provinceCode !== 'QC') {
    const pensionableEarnings = Math.min(
      Math.max(0, annualGross - fed.cpp.basicExemption),
      fed.cpp.maxInsurableEarnings - fed.cpp.basicExemption
    )
    const annualCPP = Math.min(
      pensionableEarnings * fed.cpp.employeeRate,
      fed.cpp.maxEmployeeContribution
    )
    deductions.cpp = annualCPP / periods

    // CPP2 si salaire > YMPE
    if (annualGross > fed.cpp.maxInsurableEarnings) {
      const cpp2Earnings = Math.min(
        annualGross - fed.cpp.maxInsurableEarnings,
        fed.cpp.cpp2MaxEarnings - fed.cpp.maxInsurableEarnings
      )
      const annualCPP2 = Math.min(
        cpp2Earnings * fed.cpp.cpp2Rate,
        fed.cpp.cpp2MaxContribution
      )
      deductions.cpp2 = annualCPP2 / periods
      employerCost.cpp2 = deductions.cpp2 // Employeur = même chose
    }

    employerCost.cpp = deductions.cpp // Employeur = même chose
  } else {
    notes.push('Québec : QPP au lieu de CPP — taux similaire mais différent. Vérifiez avec Revenu Québec.')
    deductions.cpp = (annualGross * 0.0608) / periods // QPP 2026 approximatif
    employerCost.cpp = deductions.cpp
  }

  // ── AE / EI ───────────────────────────────────────────────────────────────
  if (provinceCode !== 'QC') {
    const insurable = Math.min(annualGross, fed.ei.maxInsurableEarnings)
    const annualEI = Math.min(
      insurable * fed.ei.employeeRate,
      fed.ei.maxEmployeePremium
    )
    deductions.ei = annualEI / periods
    employerCost.ei = deductions.ei * fed.ei.employerMultiplier
  } else {
    notes.push('Québec : RQAP au lieu de EI fédéral. Vérifiez avec Revenu Québec.')
    deductions.ei = (annualGross * 0.013) / periods // RQAP approximatif
    employerCost.ei = deductions.ei * 1.4
  }

  // ── Impôt fédéral ────────────────────────────────────────────────────────
  const annualFederalTax = calcBracketTax(
    annualGross,
    fed.incomeTax.brackets,
    fed.incomeTax.basicPersonalAmount
  )
  // Crédit pour CPP et EI déjà intégré dans les tables — approximation
  const federalTaxAdjusted = Math.max(0, annualFederalTax - (deductions.cpp! * periods * 0.15) - (deductions.ei! * periods * 0.15))
  deductions.federalTax = federalTaxAdjusted / periods

  // ── Impôt provincial ─────────────────────────────────────────────────────
  if (province) {
    const annualProvTax = calcBracketTax(
      annualGross,
      province.brackets,
      province.basicPersonalAmount
    )
    deductions.provincialTax = annualProvTax / periods
  }

  // ── Totaux ───────────────────────────────────────────────────────────────
  const totalDeductions =
    (deductions.cpp ?? 0) +
    (deductions.cpp2 ?? 0) +
    (deductions.ei ?? 0) +
    (deductions.federalTax ?? 0) +
    (deductions.provincialTax ?? 0)

  const netPay = grossPay - totalDeductions

  const totalEmployerExtra =
    (employerCost.cpp ?? 0) +
    (employerCost.cpp2 ?? 0) +
    (employerCost.ei ?? 0)

  const totalEmployerCost = grossPay + totalEmployerExtra

  if (annualGross > 100000) {
    notes.push('Revenu élevé : vérifiez avec un comptable pour optimisation fiscale.')
  }

  notes.push(`Calculs estimés pour ${provinceCode} — ${PAYROLL_YEAR}. Utilisez le calculateur PDOC de l'ARC pour confirmation officielle.`)

  return {
    country: 'CA',
    province: provinceCode,
    payFrequency,
    grossPay,
    annualGross,
    deductions,
    employerCost,
    totalDeductions,
    netPay,
    totalEmployerCost,
    effectiveTaxRate: (totalDeductions / grossPay) * 100,
    notes,
    year: PAYROLL_YEAR,
  }
}

// ─── CALCULATEUR USA ───────────────────────────────────────────────────────
export function calculateUSAPayroll(
  grossPay: number,
  stateCode: string,
  payFrequency: PayFrequency
): PayrollResult {
  const periods = PAY_PERIODS[payFrequency]
  const annualGross = grossPay * periods
  const state = USA_STATES[stateCode]
  const fed = USA_FEDERAL
  const notes: string[] = []
  const deductions: PayrollResult['deductions'] = {}
  const employerCost: PayrollResult['employerCost'] = {}

  if (!state) {
    notes.push(`État ${stateCode} non trouvé — vérifiez le code.`)
  }

  // ── Social Security ───────────────────────────────────────────────────────
  if (annualGross <= fed.socialSecurity.wageBase) {
    deductions.socialSecurity = grossPay * fed.socialSecurity.rate
    employerCost.socialSecurity = grossPay * fed.socialSecurity.employerRate
  } else {
    // Plafond atteint
    const annualSS = fed.socialSecurity.wageBase * fed.socialSecurity.rate
    deductions.socialSecurity = annualSS / periods
    employerCost.socialSecurity = annualSS / periods
    notes.push('Plafond Social Security atteint — pas de déduction supplémentaire.')
  }

  // ── Medicare ─────────────────────────────────────────────────────────────
  deductions.medicare = grossPay * fed.medicare.rate
  employerCost.medicare = grossPay * fed.medicare.employerRate
  if (annualGross > 200000) {
    deductions.medicare += grossPay * fed.medicare.additionalRate
    notes.push('Medicare additionnel 0.9% appliqué (revenus >200k$).')
  }

  // ── Impôt fédéral US ─────────────────────────────────────────────────────
  const annualFederalTax = calcBracketTax(
    annualGross,
    fed.incomeTax.brackets,
    fed.incomeTax.standardDeduction
  )
  deductions.federalIncomeTax = annualFederalTax / periods

  // ── Impôt d'état ─────────────────────────────────────────────────────────
  if (state?.hasIncomeTax) {
    if (state.flatRate) {
      deductions.stateTax = grossPay * state.flatRate
    } else if (state.brackets) {
      const annualStateTax = calcBracketTax(
        annualGross,
        state.brackets,
        state.standardDeduction ?? 0
      )
      deductions.stateTax = annualStateTax / periods
    }
  } else if (state) {
    notes.push(`${state.name} : ${state.notes ?? 'Aucun impôt sur le revenu.'}`)
  }

  // ── FUTA (employeur seulement) ────────────────────────────────────────────
  if (annualGross <= fed.futa.wageBase) {
    employerCost.futa = grossPay * fed.futa.rate
  } else {
    employerCost.futa = (fed.futa.wageBase * fed.futa.rate) / periods
  }

  // ── Totaux ───────────────────────────────────────────────────────────────
  const totalDeductions =
    (deductions.socialSecurity ?? 0) +
    (deductions.medicare ?? 0) +
    (deductions.federalIncomeTax ?? 0) +
    (deductions.stateTax ?? 0)

  const netPay = grossPay - totalDeductions

  const totalEmployerExtra =
    (employerCost.socialSecurity ?? 0) +
    (employerCost.medicare ?? 0) +
    (employerCost.futa ?? 0)

  const totalEmployerCost = grossPay + totalEmployerExtra

  notes.push(`Calculs estimés pour ${stateCode} — ${PAYROLL_YEAR}. Vérifiez avec un comptable CPA américain.`)

  return {
    country: 'US',
    province: stateCode,
    payFrequency,
    grossPay,
    annualGross,
    deductions,
    employerCost,
    totalDeductions,
    netPay,
    totalEmployerCost,
    effectiveTaxRate: (totalDeductions / grossPay) * 100,
    notes,
    year: PAYROLL_YEAR,
  }
}

// ─── FONCTION PRINCIPALE ───────────────────────────────────────────────────
export function calculatePayroll(
  grossPay: number,
  country: Country,
  regionCode: string,
  payFrequency: PayFrequency
): PayrollResult {
  if (country === 'CA') {
    return calculateCanadaPayroll(grossPay, regionCode, payFrequency)
  } else {
    return calculateUSAPayroll(grossPay, regionCode, payFrequency)
  }
}

// ─── FORMATEUR ─────────────────────────────────────────────────────────────
export function formatPayrollResult(result: PayrollResult, lang: 'fr' | 'en' = 'fr'): {
  label: string
  amount: number
  type: 'gross' | 'deduction' | 'employer' | 'net' | 'total'
  isEmployer?: boolean
}[] {
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en
  const rows = []
  const d = result.deductions
  const e = result.employerCost

  rows.push({ label: t('Salaire brut', 'Gross Pay'), amount: result.grossPay, type: 'gross' as const })

  if (result.country === 'CA') {
    if (d.cpp)          rows.push({ label: t('RPC (employé)', 'CPP (employee)'), amount: -d.cpp, type: 'deduction' as const })
    if (d.cpp2)         rows.push({ label: t('RPC2 (employé)', 'CPP2 (employee)'), amount: -d.cpp2, type: 'deduction' as const })
    if (d.ei)           rows.push({ label: t('AE (employé)', 'EI (employee)'), amount: -d.ei, type: 'deduction' as const })
    if (d.federalTax)   rows.push({ label: t('Impôt fédéral', 'Federal Tax'), amount: -d.federalTax, type: 'deduction' as const })
    if (d.provincialTax)rows.push({ label: t('Impôt provincial', 'Provincial Tax'), amount: -d.provincialTax, type: 'deduction' as const })
    rows.push({ label: t('💵 NET À PAYER', '💵 NET PAY'), amount: result.netPay, type: 'net' as const })
    rows.push({ label: '─────', amount: 0, type: 'total' as const })
    if (e.cpp)          rows.push({ label: t('RPC (employeur)', 'CPP (employer)'), amount: e.cpp, type: 'employer' as const, isEmployer: true })
    if (e.cpp2)         rows.push({ label: t('RPC2 (employeur)', 'CPP2 (employer)'), amount: e.cpp2, type: 'employer' as const, isEmployer: true })
    if (e.ei)           rows.push({ label: t('AE (employeur)', 'EI (employer)'), amount: e.ei, type: 'employer' as const, isEmployer: true })
  } else {
    if (d.socialSecurity)   rows.push({ label: 'Social Security (EE)', amount: -d.socialSecurity, type: 'deduction' as const })
    if (d.medicare)          rows.push({ label: 'Medicare (EE)', amount: -d.medicare, type: 'deduction' as const })
    if (d.federalIncomeTax)  rows.push({ label: t('Impôt fédéral', 'Federal Income Tax'), amount: -d.federalIncomeTax, type: 'deduction' as const })
    if (d.stateTax)          rows.push({ label: t('Impôt d\'état', 'State Tax'), amount: -d.stateTax, type: 'deduction' as const })
    rows.push({ label: t('💵 NET À PAYER', '💵 NET PAY'), amount: result.netPay, type: 'net' as const })
    rows.push({ label: '─────', amount: 0, type: 'total' as const })
    if (e.socialSecurity)    rows.push({ label: 'Social Security (ER)', amount: e.socialSecurity, type: 'employer' as const, isEmployer: true })
    if (e.medicare)          rows.push({ label: 'Medicare (ER)', amount: e.medicare, type: 'employer' as const, isEmployer: true })
    if (e.futa)              rows.push({ label: 'FUTA (ER)', amount: e.futa, type: 'employer' as const, isEmployer: true })
  }

  rows.push({ label: t('🏷️ Coût total employeur', '🏷️ Total Employer Cost'), amount: result.totalEmployerCost, type: 'total' as const })

  return rows
}

