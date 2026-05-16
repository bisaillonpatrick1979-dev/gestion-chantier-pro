"use client";

import { useState } from "react";
import { useCompanyStore } from "@/store/useCompanyStore";
import { useEmployeeStore } from "@/store/useEmployeeStore";
import { useThemeStore } from "@/store/useThemeStore";
import { getAllThemes } from "@/lib/themes";

function Field({
  label, value, onChange, type = "text", placeholder = "",
}: {
  label: string; value: string | number;
  onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
        {label}
      </label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{
        width: "100%", background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "8px", padding: "10px 12px", color: "var(--text)",
        fontSize: "15px", boxSizing: "border-box", outline: "none",
      }}/>
    </div>
  );
}

export default function SettingsPage() {
  const { company, updateCompany, resetNumbering } = useCompanyStore();
  const { employees, deleteEmployee, currentEmployeeId } = useEmployeeStore();
  const { themeId, setTheme } = useThemeStore();
  const allThemes = getAllThemes();

  const currentEmployee = employees.find((e) => e.id === currentEmployeeId) ?? null;
  const isAdmin = currentEmployee?.role === "admin";
  const isXP = themeId === "xp";

  const [saved, setSaved] = useState(false);

  type AdminSection = "company"|"contact"|"legal"|"payment"|"billing"|"employees"|"theme"|"numbering"|"danger";
  type EmpSection = "theme"|"pin"|"paye";
  type AnySection = AdminSection | EmpSection;
  const [activeSection, setActiveSection] = useState<AnySection>(isAdmin ? "company" : "theme");

  const adminSections = [
    { id: "company"   as AdminSection, emoji: "🏢", label: "Compagnie"    },
    { id: "contact"   as AdminSection, emoji: "📞", label: "Contact"      },
    { id: "legal"     as AdminSection, emoji: "📋", label: "Légal"        },
    { id: "payment"   as AdminSection, emoji: "💳", label: "Paiement"     },
    { id: "billing"   as AdminSection, emoji: "🧾", label: "Facturation"  },
    { id: "employees" as AdminSection, emoji: "👷", label: "Employés"     },
    { id: "theme"     as AdminSection, emoji: "🎨", label: "Thème"        },
    { id: "numbering" as AdminSection, emoji: "🔢", label: "Numérotation" },
    { id: "danger"    as AdminSection, emoji: "⚠️", label: "Danger"       },
  ];

  const empSections = [
    { id: "theme" as EmpSection, emoji: "🎨", label: "Thème"   },
    { id: "pin"   as EmpSection, emoji: "🔒", label: "Mon PIN" },
    { id: "paye"  as EmpSection, emoji: "💰", label: "Ma Paye" },
  ];

  function save() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  // Styles dynamiques selon thème
  const cardStyle: React.CSSProperties = {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
  };

  const btnPrimary: React.CSSProperties = {
    background: isXP
      ? "linear-gradient(135deg, #7c3aed, #a855f7)"
      : "linear-gradient(135deg, var(--primary), var(--secondary, #B8963E))",
    color: isXP ? "#fff" : "#000",
    border: "none",
    borderRadius: "10px",
    padding: "13px 24px",
    fontWeight: 800,
    fontSize: "14px",
    cursor: "pointer",
    width: "100%",
    letterSpacing: "0.5px",
    boxShadow: isXP ? "0 0 16px rgba(168,85,247,0.3)" : "none",
  };

  const btnDanger: React.CSSProperties = {
    background: "#7f1d1d",
    color: "#fca5a5",
    border: "1px solid #991b1b",
    borderRadius: "10px",
    padding: "13px 24px",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
    width: "100%",
    marginTop: "10px",
  };

  function TabButton({ id, emoji, label }: { id: AnySection; emoji: string; label: string }) {
    const isActive = activeSection === id;
    return (
      <button
        onClick={() => setActiveSection(id)}
        style={{
          flexShrink: 0,
          padding: "8px 14px",
          borderRadius: "20px",
          cursor: "pointer",
          whiteSpace: "nowrap",
          fontSize: "13px",
          fontWeight: isActive ? 700 : 400,
          border: isActive ? "none" : "1px solid var(--border)",
          background: isActive
            ? isXP
              ? "linear-gradient(135deg, #7c3aed, #a855f7)"
              : "linear-gradient(135deg, var(--primary), var(--secondary, #B8963E))"
            : "transparent",
          color: isActive ? (isXP ? "#fff" : "#000") : "var(--text-muted)",
          boxShadow: isActive && isXP ? "0 0 12px rgba(168,85,247,0.4)" : "none",
        }}
      >
        {emoji} {label}
      </button>
    );
  }

  const ThemeSection = () => (
    <div style={cardStyle}>
      <h2 style={{ fontSize: "16px", fontWeight: 700, marginTop: 0, marginBottom: "6px", color: "var(--text)" }}>
        🎨 Thème de l&apos;application
      </h2>
      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
        Le thème change toute l&apos;application instantanément.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {allThemes.map((theme) => {
          const isActive = themeId === theme.id;
          return (
            <button key={theme.id} onClick={() => setTheme(theme.id)} style={{
              background: theme.colors.background,
              border: isActive ? `2px solid ${theme.colors.primary}` : "2px solid transparent",
              borderRadius: "12px", padding: "14px 12px",
              cursor: "pointer", textAlign: "left",
              position: "relative", overflow: "hidden", transition: "all 0.2s",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: theme.colors.primary }}/>
              <div style={{ fontSize: "20px", marginBottom: "6px" }}>{theme.emoji}</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: theme.colors.text, lineHeight: 1.3 }}>{theme.nameFr}</div>
              {isActive && (
                <div style={{ marginTop: "6px", fontSize: "10px", color: theme.colors.primary, fontWeight: 800, letterSpacing: "1px" }}>✓ ACTIF</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── VUE EMPLOYÉ ─────────────────────────────────────────────────────────────
  if (!isAdmin) {
    const emp = currentEmployee;
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", paddingBottom: "80px" }}>
        <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid var(--border)", marginBottom: "16px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 800, margin: 0, color: "var(--primary)" }}>⚙️ Réglages</h1>
          {emp && <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{emp.name} — Employé</p>}
        </div>
        <div style={{ display: "flex", gap: "8px", padding: "0 16px 12px", overflowX: "auto", scrollbarWidth: "none" }}>
          {empSections.map(s => <TabButton key={s.id} id={s.id} emoji={s.emoji} label={s.label}/>)}
        </div>
        <div style={{ padding: "0 16px" }}>
          {activeSection === "theme" && <ThemeSection/>}
          {activeSection === "pin" && (
            <div style={cardStyle}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, marginTop: 0, marginBottom: "16px", color: "var(--text)" }}>🔒 Changer mon PIN</h2>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>Contactez votre administrateur pour changer votre PIN.</p>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                👑 Seul l&apos;admin peut modifier les PINs
              </div>
            </div>
          )}
          {activeSection === "paye" && (
            <div style={cardStyle}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, marginTop: 0, marginBottom: "16px", color: "var(--text)" }}>💰 Ma Paye</h2>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "20px" }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>Taux horaire</div>
                <div style={{ fontSize: "32px", fontWeight: 900, color: "var(--primary)" }}>${emp?.hourlyRate ?? 0}/h</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>Mode: {emp?.workMode ?? "—"}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── VUE ADMIN ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", paddingBottom: "80px" }}>
      <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid var(--border)", marginBottom: "12px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 800, margin: 0, color: "var(--primary)" }}>
          {isXP ? "⚙️ CONFIG" : "⚙️ Réglages Admin"}
        </h1>
      </div>

      <div style={{ display: "flex", overflowX: "auto", gap: "8px", padding: "0 16px 12px", scrollbarWidth: "none" }}>
        {adminSections.map(s => <TabButton key={s.id} id={s.id} emoji={s.emoji} label={s.label}/>)}
      </div>

      <div style={{ padding: "0 16px" }}>

        {activeSection === "company" && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginTop: 0, marginBottom: "16px", color: "var(--text)" }}>🏢 Informations Compagnie</h2>
            <Field label="Nom de la compagnie" value={company.name} onChange={(v) => updateCompany({ name: v })}/>
            <Field label="Slogan" value={company.tagline} onChange={(v) => updateCompany({ tagline: v })}/>
            <Field label="Nom du propriétaire" value={company.ownerName} onChange={(v) => updateCompany({ ownerName: v })}/>
            <button style={btnPrimary} onClick={save}>{saved ? "✅ Sauvegardé!" : "💾 Sauvegarder"}</button>
          </div>
        )}

        {activeSection === "contact" && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginTop: 0, marginBottom: "16px", color: "var(--text)" }}>📞 Coordonnées</h2>
            <Field label="Adresse" value={company.address} onChange={(v) => updateCompany({ address: v })}/>
            <Field label="Ville" value={company.city} onChange={(v) => updateCompany({ city: v })}/>
            <Field label="Province" value={company.province} onChange={(v) => updateCompany({ province: v })}/>
            <Field label="Code postal" value={company.postalCode} onChange={(v) => updateCompany({ postalCode: v })}/>
            <Field label="Téléphone" value={company.phone} onChange={(v) => updateCompany({ phone: v })} type="tel"/>
            <Field label="Courriel" value={company.email} onChange={(v) => updateCompany({ email: v })} type="email"/>
            <Field label="Site web" value={company.website} onChange={(v) => updateCompany({ website: v })}/>
            <button style={btnPrimary} onClick={save}>{saved ? "✅ Sauvegardé!" : "💾 Sauvegarder"}</button>
          </div>
        )}

        {activeSection === "legal" && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginTop: 0, marginBottom: "16px", color: "var(--text)" }}>📋 Légal & Taxes (Alberta)</h2>
            <div style={{ background: "var(--success)18", border: "1px solid var(--success)44", borderRadius: "8px", padding: "12px", marginBottom: "16px", fontSize: "13px", color: "var(--success)" }}>
              Alberta = GST 5% seulement (pas de PST/HST). WCB pour assurance employés.
            </div>
            <Field label="Numéro GST/HST (5% Alberta)" value={company.gstNumber} onChange={(v) => updateCompany({ gstNumber: v })} placeholder="123456789 RT 0001"/>
            <Field label="Numéro WCB" value={company.wcbNumber} onChange={(v) => updateCompany({ wcbNumber: v })}/>
            <Field label="Numéro d'entreprise (CRA)" value={company.businessNumber} onChange={(v) => updateCompany({ businessNumber: v })}/>
            <button style={btnPrimary} onClick={save}>{saved ? "✅ Sauvegardé!" : "💾 Sauvegarder"}</button>
          </div>
        )}

        {activeSection === "payment" && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginTop: 0, marginBottom: "16px", color: "var(--text)" }}>💳 Informations de Paiement</h2>
            <Field label="Courriel Interac e-Transfer" value={company.etransferEmail} onChange={(v) => updateCompany({ etransferEmail: v })} type="email"/>
            <Field label="Nom de la banque" value={company.bankName} onChange={(v) => updateCompany({ bankName: v })}/>
            <Field label="Numéro de transit" value={company.bankTransit} onChange={(v) => updateCompany({ bankTransit: v })}/>
            <Field label="Numéro de compte" value={company.bankAccount} onChange={(v) => updateCompany({ bankAccount: v })}/>
            <button style={btnPrimary} onClick={save}>{saved ? "✅ Sauvegardé!" : "💾 Sauvegarder"}</button>
          </div>
        )}

        {activeSection === "billing" && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginTop: 0, marginBottom: "16px", color: "var(--text)" }}>🧾 Paramètres Facturation</h2>
            <Field label="Dépôt requis (%)" value={company.defaultDepositPercent} onChange={(v) => updateCompany({ defaultDepositPercent: Number(v) })} type="number"/>
            <Field label="Délai de paiement (jours)" value={company.defaultPaymentTermsDays} onChange={(v) => updateCompany({ defaultPaymentTermsDays: Number(v) })} type="number"/>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Notes par défaut</label>
              <textarea value={company.defaultNotes} onChange={(e) => updateCompany({ defaultNotes: e.target.value })} rows={3} style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 12px", color: "var(--text)", fontSize: "15px", boxSizing: "border-box", outline: "none", resize: "vertical" }}/>
            </div>
            <button style={btnPrimary} onClick={save}>{saved ? "✅ Sauvegardé!" : "💾 Sauvegarder"}</button>
          </div>
        )}

        {activeSection === "employees" && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginTop: 0, marginBottom: "16px", color: "var(--text)" }}>👷 Gestion des Employés</h2>
            {employees.length === 0 ? (
              <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>Aucun employé enregistré</p>
            ) : (
              employees.map((emp) => (
                <div key={emp.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", background: "var(--surface)", borderRadius: "10px", marginBottom: "8px", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: isXP ? "8px" : "50%", background: emp.color || "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, color: "white", boxShadow: `0 0 10px ${emp.color}55` }}>
                      {emp.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--text)" }}>{emp.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {emp.role === "admin" ? "👑 Admin" : "👷 Employé"}{emp.hourlyRate ? ` • $${emp.hourlyRate}/h` : ""}
                      </div>
                    </div>
                  </div>
                  {emp.role !== "admin" && (
                    <button onClick={() => { if (confirm(`Supprimer ${emp.name}?`)) deleteEmployee(emp.id); }} style={{ background: "#7f1d1d", color: "#fca5a5", border: "none", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>
                      Supprimer
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeSection === "theme" && <ThemeSection/>}

        {activeSection === "numbering" && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginTop: 0, marginBottom: "16px", color: "var(--text)" }}>🔢 Numérotation des Documents</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <Field label="Préfixe Facture" value={company.invoicePrefix} onChange={(v) => updateCompany({ invoicePrefix: v })} placeholder="FAC"/>
              <Field label="Prochain # Facture" value={company.nextInvoiceNumber} onChange={(v) => updateCompany({ nextInvoiceNumber: Number(v) })} type="number"/>
              <Field label="Préfixe Devis" value={company.quotePrefix} onChange={(v) => updateCompany({ quotePrefix: v })} placeholder="DEV"/>
              <Field label="Prochain # Devis" value={company.nextQuoteNumber} onChange={(v) => updateCompany({ nextQuoteNumber: Number(v) })} type="number"/>
              <Field label="Préfixe Contrat" value={company.contractPrefix} onChange={(v) => updateCompany({ contractPrefix: v })} placeholder="CTR"/>
              <Field label="Prochain # Contrat" value={company.nextContractNumber} onChange={(v) => updateCompany({ nextContractNumber: Number(v) })} type="number"/>
            </div>
            <div style={{ background: "var(--surface)", borderRadius: "8px", padding: "12px", marginBottom: "12px", fontSize: "13px", color: "var(--text-muted)" }}>
              Exemple: <strong style={{ color: "var(--primary)" }}>{company.invoicePrefix}-{String(company.nextInvoiceNumber).padStart(3, "0")}</strong>
            </div>
            <button style={btnPrimary} onClick={save}>{saved ? "✅ Sauvegardé!" : "💾 Sauvegarder"}</button>
          </div>
        )}

        {activeSection === "danger" && (
          <div style={{ ...cardStyle, borderColor: "#7f1d1d" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginTop: 0, marginBottom: "8px", color: "#fca5a5" }}>⚠️ Zone Danger</h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>Ces actions sont irréversibles.</p>
            <button style={btnDanger} onClick={() => { if (confirm("Réinitialiser la numérotation? Repart à 001.")) { resetNumbering(); alert("Numérotation réinitialisée."); } }}>
              🔢 Réinitialiser numérotation (001)
            </button>
            <button style={{ ...btnDanger, marginTop: "12px" }} onClick={() => { if (confirm("ATTENTION: Effacer TOUTES les données de la compagnie?")) { updateCompany({ name: "Hailite Xteriors", tagline: "", address: "", city: "", phone: "", email: "", gstNumber: "", wcbNumber: "", businessNumber: "", etransferEmail: "" }); alert("Données réinitialisées."); } }}>
              🗑️ Réinitialiser infos compagnie
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
