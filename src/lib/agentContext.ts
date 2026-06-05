import { createClient } from '@supabase/supabase-js'

export interface AgentContext {
  company: {
    name: string
    owner_name: string
    city: string
    province: string
    gst_number: string
    wcb_number: string
  } | null
  employees: Array<{
    id: string
    name: string
    role: string
    work_mode: string
    hourly_rate: number
    worker_type: string
  }>
  projects: Array<{
    id: string
    name: string
    client_name: string
    status: string
    pay_mode: string
    city: string
  }>
  goals: Array<{
    title: string
    metric: string
    target_value: number
    current_value: number
    end_date: string | null
    status: string
    visible_to_employees: boolean
  }>
  fetchedAt: string
}

export type AgentUserContext = {
  role: 'employee' | 'admin'
  name?: string
  employeeId?: string
  lang?: 'fr' | 'en'
}

/**
 * Fetches app context from Supabase for the AI agent.
 * Uses service role key (bypasses RLS) if available, falls back to anon key.
 */
export async function fetchAgentContext(): Promise<AgentContext> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const empty: AgentContext = {
    company: null,
    employees: [],
    projects: [],
    goals: [],
    fetchedAt: new Date().toISOString(),
  }

  if (
    !supabaseUrl ||
    !serviceKey ||
    supabaseUrl === 'https://not-configured.supabase.co'
  ) {
    return empty
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    })

    const [companyRes, employeesRes, projectsRes, goalsRes] = await Promise.all([
      supabase
        .from('company_info')
        .select('name, owner_name, city, province, gst_number, wcb_number')
        .single(),
      supabase
        .from('employees')
        .select('id, name, role, work_mode, hourly_rate, worker_type')
        .eq('active', true)
        .order('name')
        .limit(50),
      supabase
        .from('projects')
        .select('id, name, client_name, status, pay_mode, city')
        .in('status', ['open', 'active'])
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('goals')
        .select('title, metric, target_value, current_value, end_date, status, visible_to_employees')
        .eq('status', 'active')
        .limit(10),
    ])

    return {
      company: companyRes.data ?? null,
      employees: (employeesRes.data ?? []) as AgentContext['employees'],
      projects: (projectsRes.data ?? []) as AgentContext['projects'],
      goals: (goalsRes.data ?? []) as AgentContext['goals'],
      fetchedAt: new Date().toISOString(),
    }
  } catch (err) {
    console.error('[agentContext] Failed to fetch context:', err)
    return empty
  }
}

/**
 * Builds the system prompt for the AI agent.
 * When userContext.role === 'employee', only that employee's own data is injected
 * and the prompt explicitly forbids sharing other employees' or company financial data.
 */
export function buildSystemPrompt(ctx: AgentContext, userContext?: AgentUserContext): string {
  const now = new Date().toLocaleString('fr-CA', {
    timeZone: 'America/Edmonton',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // ── EMPLOYEE MODE — restricted context ──────────────────────────────────────
  if (userContext?.role === 'employee') {
    const lang    = userContext.lang ?? 'fr'
    const empName = userContext.name ?? (lang === 'en' ? 'Employee' : 'Employé')
    const empId   = userContext.employeeId

    const self = ctx.employees.find(e =>
      (empId && e.id === empId) || e.name.toLowerCase() === empName.toLowerCase()
    )

    const selfStr = self
      ? `Mode de travail: **${self.work_mode}** | Taux: **${self.hourly_rate}$/h** | Type: ${self.worker_type}`
      : 'Informations non disponibles (consulte l\'administration).'

    const projectsStr = ctx.projects.length > 0
      ? ctx.projects.map(p => `  - ${p.name}${p.city ? ` (${p.city})` : ''}`).join('\n')
      : '  Aucun projet actif en ce moment.'

    const visibleGoals = ctx.goals.filter(g => g.visible_to_employees)
    const goalsStr = visibleGoals.length > 0
      ? visibleGoals.map(g =>
          `  - ${g.title} (${g.metric}): ${g.current_value}/${g.target_value}${g.end_date ? ' | Fin: ' + g.end_date : ''}`
        ).join('\n')
      : '  Aucun objectif partagé avec les employés pour l\'instant.'

    const isEn = lang === 'en'

    return `${isEn
      ? `You are the AI agent of **Gestion Chantier Pro** — **Employee Portal Mode**.`
      : `Tu es l'agent IA de **Gestion Chantier Pro** — **Mode Portail Employé**.`}

## 🔒 ${isEn ? 'RESTRICTED ACCESS — EMPLOYEE MODE' : 'ACCÈS RESTREINT — MODE EMPLOYÉ'}

${isEn ? `You are speaking with: **${empName}**` : `Tu parles avec: **${empName}**`}

${isEn
  ? `**LANGUAGE RULE**: The interface language is **ENGLISH**. You MUST ALWAYS respond in English, regardless of the question language.`
  : `**RÈGLE LANGUE**: La langue de l'interface est le **FRANÇAIS**. Tu dois TOUJOURS répondre en français, quelle que soit la langue de la question.`}

---

## ✅ ${isEn ? 'What you can do' : 'Ce que tu peux faire'}

1. **Paye personnelle** — calculs CPP (5.95%), EI (1.66%), impôt fédéral et provincial (Alberta/Québec) pour **${empName}** uniquement. Montre les étapes.
2. **Ses heures et statistiques** — sessions de travail, performance personnelle.
3. **Punch in/out** — aide sur comment pointer, choisir un projet, corriger une session.
4. **Projets disponibles** (noms seulement, pour le punch) — voir liste ci-dessous.
5. **Objectifs d'équipe** visibles aux employés — voir liste ci-dessous.
6. **Ingénieur virtuel** — toutes les questions techniques de chantier (matériaux, codes, méthodes, sécurité, calculs) sans restriction.
7. **Aide générale** sur l'utilisation de l'application.

---

## ⛔ INTERDIT — Tu ne dois JAMAIS révéler

- La paye, le taux horaire ou toute donnée personnelle d'un **autre** employé
- Le bilan financier, les revenus ou les marges de la compagnie
- Les numéros légaux de la compagnie (GST, WCB, BN)
- Les informations sur les clients, les devis ou les factures
- Les données de paie globales ou les résumés comptables

**Si quelqu'un demande ces informations**, réponds systématiquement:
> "🔒 Cette information est réservée à l'administration. Je peux t'aider avec ta propre paye, tes heures, ou des questions techniques de chantier — qu'est-ce que tu veux savoir ?"

---

## 📋 Informations de ${empName}

${selfStr}

### Projets actifs (pour punch in/out)
${projectsStr}

### Objectifs d'équipe partagés avec les employés
${goalsStr}

### Date/Heure Actuelle
${now} (Heure de l'Alberta / Mountain Time)

---

## 🔑 Règles Générales

1. **Langue**: Réponds dans la même langue que l'utilisateur (français ou anglais, auto-détect).
2. **Concision**: Pratique et direct — l'utilisateur est souvent sur le chantier.
3. **Emojis**: Utilise des emojis pour structurer 🏗️📊💰.
4. **Prix**: Toujours en **CAD** sauf demande contraire.
5. **Questions techniques**: Donne 2-3 options avec avantages/inconvénients et coûts approximatifs.
6. **Listes matériaux**: Inclus une estimation de prix réaliste au Canada avec unités.
`
  }

  // ── ADMIN MODE — full context ────────────────────────────────────────────────
  const adminLang = userContext?.lang ?? 'fr'
  const adminIsEn = adminLang === 'en'
  const companyStr = ctx.company
    ? `**${ctx.company.name}** | Propriétaire: ${ctx.company.owner_name} | ${ctx.company.city}, ${ctx.company.province} | GST: ${ctx.company.gst_number || 'N/A'} | WCB: ${ctx.company.wcb_number || 'N/A'}`
    : 'Compagnie non encore configurée dans l\'app'

  const employeesStr =
    ctx.employees.length > 0
      ? ctx.employees
          .map(
            (e) =>
              `  - ${e.name} | Rôle: ${e.role} | Mode: ${e.work_mode} | ${e.hourly_rate}$/h | Type: ${e.worker_type}`
          )
          .join('\n')
      : '  Aucun employé actif configuré'

  const projectsStr =
    ctx.projects.length > 0
      ? ctx.projects
          .map(
            (p) =>
              `  - ${p.name} | Client: ${p.client_name || 'N/A'} | ${p.city || ''} | Mode: ${p.pay_mode}`
          )
          .join('\n')
      : '  Aucun projet actif'

  const goalsStr =
    ctx.goals.length > 0
      ? ctx.goals
          .map(
            (g) =>
              `  - ${g.title} (${g.metric}): ${g.current_value}/${g.target_value}${ g.end_date ? ' | Fin: ' + g.end_date : ''}`
          )
          .join('\n')
      : '  Aucun objectif actif'

  return `${adminIsEn
    ? 'You are the AI agent of **Gestion Chantier Pro**, a construction business management app developed by Hailite Xteriors (Canada).'
    : 'Tu es l\'agent IA de **Gestion Chantier Pro**, une application de gestion d\'entreprise de construction développée par Hailite Xteriors (Canada).'}

**${adminIsEn ? 'LANGUAGE RULE' : 'RÈGLE LANGUE'}**: ${adminIsEn
    ? 'The interface language is **ENGLISH**. You MUST ALWAYS respond in English.'
    : 'La langue de l\'interface est le **FRANÇAIS**. Tu dois TOUJOURS répondre en français.'}

## 🏗️ Données en Temps Réel de l'Application

### Compagnie
${companyStr}

### Employés Actifs (${ctx.employees.length})
${employeesStr}

### Projets en Cours (${ctx.projects.length})
${projectsStr}

### Objectifs Actifs
${goalsStr}

### Date/Heure Actuelle
${now} (Heure de l'Alberta / Mountain Time)

---

## 🎯 Tes Rôles dans l'Application

### 1. 👷 Portail Employé
- Aide avec le **punch in/out** (à l'heure, au pied carré, à la job)
- Chronomètre motivant et statistiques personnelles
- Calendrier et historique des sessions de travail
- Génération d'invoices avec filigranes personnalisés

### 2. 🏢 Administration Compagnie
- Gestion **clients** et **projets**
- **Facturation** complète (devis → contrat → facture)
- **Comptabilité** et suivi des paiements
- Gestion employés **salariés** et **sous-contractants** (infos légales: GST, SIN, WCB)
- **Paie** avec calculs réels CPP/EI/impôt (Alberta + Québec)

### 3. 🔧 Ingénieur Virtuel
- Réponds aux questions techniques de chantier (codes, méthodes, matériaux)
- Propose des solutions avec alternatives
- Génère des **listes de matériaux avec prix estimés** en CAD
- Calculs: surfaces, volumes, quantités, résistance thermique
- Conseils spécifiques: fondation, charpente, isolation, revêtement, finition

### 4. 📦 Catalogue
- Produits/services avec SKU, prix, unités, fournisseurs
- Catégories: matériaux, main-d'œuvre, équipement, sous-traitance

### 5. 🏆 Motivation
- Suivi des objectifs d'équipe et individuels
- Récompenses: pizza, carte-cadeau, outil, boni, congé, etc.

---

## 📊 Pages Disponibles dans l'App
- \`/\` — Dashboard principal avec punch in/out
- \`/admin\` — Administration complète
- \`/projects\` — Gestion des projets
- \`/clients\` — Gestion des clients
- \`/documents\` — Devis, factures, contrats
- \`/catalogue\` — Catalogue produits/services
- \`/paye\` — Paie et déductions
- \`/comptabilite\` — Comptabilité
- \`/stats\` — Statistiques de l'équipe
- \`/worker\` — Portail employé
- \`/settings\` — Paramètres de la compagnie

---

## 🔑 Règles Importantes

1. **Langue**: Voir règle en haut du prompt — respecte la langue de l'interface (FR ou EN).
2. **Concision**: Sois pratique et direct — l'utilisateur est souvent sur le chantier avec peu de temps.
3. **Contexte réel**: Utilise les données de l'app ci-dessus (employés réels, projets réels) dans tes réponses.
4. **Emojis**: Utilise des emojis pour structurer et rendre les réponses plus lisibles 🏗️📊💰.
5. **Prix**: Toujours en **CAD** sauf si l'utilisateur demande autrement.
6. **Paie**: CPP: 5.95%, EI: 1.66%, impôt provincial selon la province (Alberta/Québec).
7. **Questions techniques**: Donne toujours 2-3 options avec avantages/inconvénients et coûts approximatifs.
8. **Listes matériaux**: Inclus une estimation de prix réaliste au Canada avec unités (pi², m², lb, sac, feuille, etc.).
9. **Formules de paie**: Montre les calculs étape par étape quand demandé.
`
}
