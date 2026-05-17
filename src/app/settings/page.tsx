"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCompanyStore } from "@/store/useCompanyStore";
import { useEmployeeStore } from "@/store/useEmployeeStore";
import { useClientStore } from "@/store/useClientStore";
import { useCatalogueStore } from "@/store/useCatalogueStore";
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
  const router = useRouter();
  const { company, updateCompany, resetNumbering } = useCompanyStore();
  const { employees, addEmployee, deleteEmployee, currentEmployeeId } = useEmployeeStore();
  const { clients, addClient, deleteClient } = useClientStore();
  const { materials, addMaterial } = useCatalogueStore();
  const { themeId, setTheme } = useThemeStore();
  const allThemes = getAllThemes();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const currentEmployee = employees.find((e) => e.id === currentEmployeeId) ?? null;
  const isAdmin = currentEmployee?.role === "admin";
  const isXP = themeId === "xp";

  // ── Classes animées par thème ──────────────────────────────────────────────
  const isDeco     = themeId === "deco";
  const isQuantum  = themeId === "quantum";
  const isAventure = themeId === "aventure";
  const cardClass  = isDeco    ? "deco-card-sweep"    :
                     isQuantum ? "quantum-card-glow"  :
                     isAventure ? "aventure-card-glow" : "";

  const [saved, setSaved] = useState(false);

  const [showAddEmp, setShowAddEmp] = useState(false);
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpPin, setNewEmpPin] = useState("");
  const [newEmpRole, setNewEmpRole] = useState<"admin" | "employee">("employee");
  const [newEmpMode, setNewEmpMode] = useState<"heure" | "surface" | "forfait">("heure");
  const [newEmpRate, setNewEmpRate] = useState<number>(25);
  const [empError, setEmpError] = useState("");

  const [showAddClient, setShowAddClient] = useState(false);
  const [newCName, setNewCName] = useState("");
  const [newCPhone, setNewCPhone] = useState("");
  const [newCEmail, setNewCEmail] = useState("");
  const [newCAddress, setNewCAddress] = useState("");
  const [newCCity, setNewCCity] = useState("");
  const [newCProvince, setNewCProvince] = useState("AB");
  const [newCPostal, setNewCPostal] = useState("");
  const [newCNotes, setNewCNotes] = useState("");

  const [showAddMat, setShowAddMat] = useState(false);
  const [newMatName, setNewMatName] = useState("");
  const [newMatPrice, setNewMatPrice] = useState<number>(0);
  const [newMatCat, setNewMatCat] = useState("toiture");
  const [newMatUnit, setNewMatUnit] = useState("pi²");
  const [newMatEmoji, setNewMatEmoji] = useState("📦");

  type AdminSection = "company"|"contact"|"legal"|"payment"|"billing"|"employees"|"clients"|"catalogue"|"theme"|"numbering"|"danger";
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
    { id: "clients"   as AdminSection, emoji: "👥", label: "Clients"      },
    { id: "catalogue" as AdminSection, emoji: "📦", label: "Catalogue"    },
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

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      updateCompany({ logoUrl: base64 });
    };
    reader.readAsDataURL(file);
  }

  function handleAddEmployee() {
    if (!newEmpName.trim()) { setEmpError("Le nom est requis"); return; }
    if (!/^\d{4}$/.test(newEmpPin)) { setEmpError("PIN = 4 chiffres exactement (ex: 1234)"); return; }
    addEmployee({
      name: newEmpName.trim(), role: newEmpRole, pin: newEmpPin,
      workMode: newEmpMode, hourlyRate: newEmpRate, color: "", active: true,
    });
    setNewEmpName(""); setNewEmpPin(""); setNewEmpRole("employee");
    setNewEmpMode("heure"); setNewEmpRate(25); setEmpError("");
    setShowAddEmp(false);
  }

  function handleAddClient() {
    if (!newCName.trim()) return;
    addClient({
      name: newCName.trim(), phone: newCPhone, email: newCEmail,
      address: newCAddress, city: newCCity, province: newCProvince,
      postalCode: newCPostal, notes: newCNotes,
    });
    setNewCName(""); setNewCPhone(""); setNewCEmail("");
    setNewCAddress(""); setNewCCity(""); setNewCProvince("AB");
    setNewCPostal(""); setNewCNotes(""); setShowAddClient(false);
  }

  function handleAddMaterial() {
    if (!newMatName.trim()) return;
    addMaterial({
      name: newMatName.trim(), nameen: newMatName.trim(),
      category: newMatCat as "toiture"|"siding"|"fixations"|"etancheite"|"structure"|"maindoeuvre",
      unit: newMatUnit as "pi²"|"pi lin."|"boîte"|"rouleau"|"feuille"|"tube"|"unité"|"heure",
      price: newMatPrice, priceMin: newMatPrice, priceMax: newMatPrice,
      emoji: newMatEmoji || "📦", description: "", descriptionen: "",
    });
    setNewMatName(""); setNewMatPrice(0); setNewMatEmoji("📦"); setShowAddMat(false);
  }

  // ── Styles ──────────────────────────────────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    background: "var(--card)", border: "1px solid var(--border)",
    borderRadius: "12px", padding: "20px", marginBottom: "16px",
  };

  const btnPrimary: React.CSSProperties = {
    background: isXP
      ? "linear-gradient(135deg, #7c3aed, #a855f7)"
      : "linear-gradient(135deg, var(--primary), var(--secondary, #B8963E))",
    color: isXP ? "#fff" : "#000", border: "none", borderRadius: "10px",
    padding: "13px 24px", fontWeight: 800, fontSize: "14px", cursor: "pointer",
    width: "100%", letterSpacing: "0.5px",
    boxShadow: isXP ? "0 0 16px rgba(168,85,247,0.3)" : "none",
  };

  const btnDanger: React.CSSProperties = {
    background: "#7f1d1d", color: "#fca5a5", border: "1px solid #991b1b",
    borderRadius: "10px", padding: "13px 24px", fontWeight: 700, fontSize: "14px",
    cursor: "pointer", width: "100%", marginTop: "10px",
  };

  const btnSmallPrimary: React.CSSProperties = {
    background: isXP
      ? "linear-gradient(135deg, #7c3aed, #a855f7)"
      : "linear-gradient(135deg, var(--primary), var(--secondary, #B8963E))",
    color: isXP ? "#fff" : "#000", border: "none", borderRadius: "8px",
    padding: "8px 16px", cursor: "pointer", fontSize: "13px", fontWeight: 700,
    boxShadow: isXP ? "0 0 10px rgba(168,85,247,0.3)" : "none",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "8px", padding: "10px 12px", color: "var(--text)",
    fontSize: "14px", boxSizing: "border-box", outline: "none",
  };

  const selectStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "8px", padding: "10px 12px", color: "var(--text)",
    fontSize: "14px", boxSizing: "border-box", outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "11px", color: "var(--text-muted)",
    marginBottom: "4px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
  };

  function TabButton({ id, emoji, label }: { id: AnySection; emoji: string; label: string }) {
    const isActive = activeSection === id;
    return (
      <button onClick={() => setActiveSection(id)} style={{
        flexShrink: 0, padding: "8px 14px", borderRadius: "20px",
        cursor: "pointer", whiteSpace: "nowrap", fontSize: "13px",
        fontWeight: isActive ? 700 : 400,
        border: isActive ? "none" : "1px solid var(--border)",
        background: isActive
          ? isXP ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "linear-gradient(135deg, var(--primary), var(--secondary, #B8963E))"
          : "transparent",
        color: isActive ? (isXP ? "#fff" : "#000") : "var(--text-muted)",
        boxShadow: isActive && isXP ? "0 0 12px rgba(168,85,247,0.4)" : "none",
      }}>
        {emoji} {label}
      </button>
    );
  }

  // ThemeSection a accès à cardClass via closure
  const ThemeSection = () => (
    <div className={cardClass} style={cardStyle}>
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
              borderRadius: "12px", padding: "14px 12px", cursor: "pointer", textAlign: "left",
              position: "relative", overflow: "hidden", transition: "all 0.2s",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: theme.colors.primary }}/>
              <div style={{ fontSize: "20px", marginBottom: "6px" }}>{theme.emoji}</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: theme.colors.text, lineHeight: 1.3 }}>{theme.nameFr}</div>
              {isActive && <div style={{ marginTop: "6px", fontSize: "10px", color: theme.colors.primary, fontWeight: 800, letterSpacing: "1px" }}>✓ ACTIF</div>}
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
            <div className={cardClass} style={cardStyle}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, marginTop: 0, marginBottom: "16px", color: "var(--text)" }}>🔒 Changer mon PIN</h2>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                👑 Seul l&apos;admin peut modifier les PINs
              </div>
            </div>
          )}
          {activeSection === "paye" && (
            <div className={cardClass} style={cardStyle}>
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

        {/* ── COMPANY ── */}
        {activeSection === "company" && (
          <div className={cardClass} style={cardStyle}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginTop: 0, marginBottom: "16px", color: "var(--text)" }}>🏢 Informations Compagnie</h2>
            <Field label="Nom de la compagnie" value={company.name} onChange={(v) => updateCompany({ name: v })}/>
            <Field label="Slogan" value={company.tagline} onChange={(v) => updateCompany({ tagline: v })}/>
            <Field label="Nom du propriétaire" value={company.ownerName} onChange={(v) => updateCompany({ ownerName: v })}/>

            <div style={{ marginBottom: "16px", marginTop: "4px" }}>
              <label style={labelStyle}>Logo de la compagnie</label>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "10px", marginTop: "2px" }}>
                Apparaît en filigrane sur toutes les factures, devis, contrats et commandes.
              </p>
              {company.logoUrl ? (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px", padding: "12px", background: "var(--surface)", borderRadius: "10px", border: "1px solid var(--border)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={company.logoUrl} alt="Logo" style={{ width: "56px", height: "56px", objectFit: "contain", borderRadius: "8px", background: "#fff" }}/>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", margin: 0 }}>Logo actuel</p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "2px 0 0" }}>Visible en filigrane sur les documents</p>
                  </div>
                  <button onClick={() => updateCompany({ logoUrl: "" })} style={{ background: "#7f1d1d22", border: "1px solid #7f1d1d55", color: "#fca5a5", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>
                    ✕ Retirer
                  </button>
                </div>
              ) : (
                <div style={{ padding: "20px", background: "var(--surface)", borderRadius: "10px", border: "2px dashed var(--border)", textAlign: "center", marginBottom: "10px" }}>
                  <div style={{ fontSize: "32px", marginBottom: "6px" }}>🖼️</div>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>Aucun logo — cliquez pour en ajouter un</p>
                </div>
              )}
              <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={handleLogoUpload} style={{ display: "none" }}/>
              <button onClick={() => logoInputRef.current?.click()} style={{ width: "100%", padding: "12px", borderRadius: "10px", cursor: "pointer", border: "1px solid var(--primary)", background: "var(--primary)12", color: "var(--primary)", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                📁 {company.logoUrl ? "Changer le logo" : "Choisir un logo"}
              </button>
              <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "6px", textAlign: "center" }}>
                PNG, JPG, SVG ou WEBP recommandé · Fond transparent idéal
              </p>
            </div>
            <button style={btnPrimary} onClick={save}>{saved ? "✅ Sauvegardé!" : "💾 Sauvegarder"}</button>
          </div>
        )}

        {/* ── CONTACT ── */}
        {activeSection === "contact" && (
          <div className={cardClass} style={cardStyle}>
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

        {/* ── LEGAL ── */}
        {activeSection === "legal" && (
          <div className={cardClass} style={cardStyle}>
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

        {/* ── PAYMENT ── */}
        {activeSection === "payment" && (
          <div className={cardClass} style={cardStyle}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginTop: 0, marginBottom: "16px", color: "var(--text)" }}>💳 Informations de Paiement</h2>
            <Field label="Courriel Interac e-Transfer" value={company.etransferEmail} onChange={(v) => updateCompany({ etransferEmail: v })} type="email"/>
            <Field label="Nom de la banque" value={company.bankName} onChange={(v) => updateCompany({ bankName: v })}/>
            <Field label="Numéro de transit" value={company.bankTransit} onChange={(v) => updateCompany({ bankTransit: v })}/>
            <Field label="Numéro de compte" value={company.bankAccount} onChange={(v) => updateCompany({ bankAccount: v })}/>
            <button style={btnPrimary} onClick={save}>{saved ? "✅ Sauvegardé!" : "💾 Sauvegarder"}</button>
          </div>
        )}

        {/* ── BILLING ── */}
        {activeSection === "billing" && (
          <div className={cardClass} style={cardStyle}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginTop: 0, marginBottom: "16px", color: "var(--text)" }}>🧾 Paramètres Facturation</h2>
            <Field label="Dépôt requis (%)" value={company.defaultDepositPercent} onChange={(v) => updateCompany({ defaultDepositPercent: Number(v) })} type="number"/>
            <Field label="Délai de paiement (jours)" value={company.defaultPaymentTermsDays} onChange={(v) => updateCompany({ defaultPaymentTermsDays: Number(v) })} type="number"/>
            <div style={{ marginBottom: "12px" }}>
              <label style={labelStyle}>Notes par défaut</label>
              <textarea value={company.defaultNotes} onChange={(e) => updateCompany({ defaultNotes: e.target.value })} rows={3} style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 12px", color: "var(--text)", fontSize: "15px", boxSizing: "border-box", outline: "none", resize: "vertical" }}/>
            </div>
            <button style={btnPrimary} onClick={save}>{saved ? "✅ Sauvegardé!" : "💾 Sauvegarder"}</button>
          </div>
        )}

        {/* ── EMPLOYEES ── */}
        {activeSection === "employees" && (
          <div className={cardClass} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--text)" }}>
                👷 Employés <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 400 }}>({employees.length})</span>
              </h2>
              <button onClick={() => { setShowAddEmp(!showAddEmp); setEmpError(""); }} style={btnSmallPrimary}>
                {showAddEmp ? "✕ Fermer" : "+ Ajouter"}
              </button>
            </div>

            {showAddEmp && (
              <div style={{ background: "var(--surface)", border: "2px solid var(--primary)", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary)", marginTop: 0, marginBottom: "14px", letterSpacing: "1px", textTransform: "uppercase" }}>
                  ➕ Nouvel Employé
                </p>
                {empError && (
                  <div style={{ background: "#7f1d1d22", border: "1px solid #7f1d1d", borderRadius: "8px", padding: "10px", marginBottom: "12px", fontSize: "13px", color: "#fca5a5" }}>
                    ⚠️ {empError}
                  </div>
                )}
                <div style={{ marginBottom: "10px" }}>
                  <label style={labelStyle}>Nom complet *</label>
                  <input value={newEmpName} onChange={e => setNewEmpName(e.target.value)} placeholder="Ex: Jean Tremblay" style={inputStyle}/>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <div>
                    <label style={labelStyle}>PIN (4 chiffres) *</label>
                    <input value={newEmpPin} onChange={e => setNewEmpPin(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="1234" maxLength={4} type="password" style={inputStyle}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Rôle</label>
                    <select value={newEmpRole} onChange={e => setNewEmpRole(e.target.value as "admin"|"employee")} style={selectStyle}>
                      <option value="employee">👷 Employé</option>
                      <option value="admin">👑 Admin</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                  <div>
                    <label style={labelStyle}>Mode de travail</label>
                    <select value={newEmpMode} onChange={e => setNewEmpMode(e.target.value as "heure"|"surface"|"forfait")} style={selectStyle}>
                      <option value="heure">⏱ Par heure</option>
                      <option value="surface">📐 Par surface</option>
                      <option value="forfait">💼 Forfait</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Taux horaire ($)</label>
                    <input type="number" value={newEmpRate} onChange={e => setNewEmpRate(Number(e.target.value))} min={0} style={inputStyle}/>
                  </div>
                </div>
                <button onClick={handleAddEmployee} style={btnPrimary}>✅ Créer l&apos;employé</button>
              </div>
            )}

            {employees.length === 0 ? (
              <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>Aucun employé enregistré</p>
            ) : (
              employees.map((emp) => (
                <div key={emp.id} className={cardClass} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", background: "var(--surface)", borderRadius: "10px", marginBottom: "8px", border: "1px solid var(--border)" }}>
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

        {/* ── CLIENTS ── */}
        {activeSection === "clients" && (
          <div className={cardClass} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--text)" }}>
                👥 Clients <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 400 }}>({clients.length})</span>
              </h2>
              <button onClick={() => setShowAddClient(!showAddClient)} style={btnSmallPrimary}>
                {showAddClient ? "✕ Fermer" : "+ Ajouter"}
              </button>
            </div>

            {showAddClient && (
              <div style={{ background: "var(--surface)", border: "2px solid var(--primary)", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary)", marginTop: 0, marginBottom: "14px", letterSpacing: "1px", textTransform: "uppercase" }}>
                  ➕ Nouveau Client
                </p>
                <div style={{ marginBottom: "10px" }}>
                  <label style={labelStyle}>Nom *</label>
                  <input value={newCName} onChange={e => setNewCName(e.target.value)} placeholder="Nom du client ou compagnie" style={inputStyle}/>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <div>
                    <label style={labelStyle}>Téléphone</label>
                    <input value={newCPhone} onChange={e => setNewCPhone(e.target.value)} placeholder="780-555-1234" type="tel" style={inputStyle}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Courriel</label>
                    <input value={newCEmail} onChange={e => setNewCEmail(e.target.value)} placeholder="client@email.com" type="email" style={inputStyle}/>
                  </div>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <label style={labelStyle}>Adresse</label>
                  <input value={newCAddress} onChange={e => setNewCAddress(e.target.value)} placeholder="123 rue Exemple" style={inputStyle}/>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                  <div>
                    <label style={labelStyle}>Ville</label>
                    <input value={newCCity} onChange={e => setNewCCity(e.target.value)} placeholder="Calgary" style={inputStyle}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Code postal</label>
                    <input value={newCPostal} onChange={e => setNewCPostal(e.target.value)} placeholder="T2X 0A1" style={inputStyle}/>
                  </div>
                </div>
                <button onClick={handleAddClient} style={btnPrimary}>✅ Ajouter le client</button>
              </div>
            )}

            {clients.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>👥</div>
                <p style={{ fontSize: "14px" }}>Aucun client enregistré</p>
                <p style={{ fontSize: "12px" }}>Cliquez &quot;+ Ajouter&quot; pour commencer</p>
              </div>
            ) : (
              clients.map((client) => (
                <div key={client.id} className={cardClass} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", background: "var(--surface)", borderRadius: "10px", marginBottom: "8px", border: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text)", fontSize: "14px" }}>{client.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {client.phone ? `📞 ${client.phone}` : ""}
                      {client.phone && client.city ? " • " : ""}
                      {client.city ? `📍 ${client.city}` : ""}
                      {!client.phone && !client.city && client.email ? `✉️ ${client.email}` : ""}
                    </div>
                  </div>
                  <button onClick={() => { if (confirm(`Supprimer ${client.name}?`)) deleteClient(client.id); }} style={{ background: "#7f1d1d", color: "#fca5a5", border: "none", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>
                    Supprimer
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── CATALOGUE ── */}
        {activeSection === "catalogue" && (
          <div className={cardClass} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--text)" }}>
                📦 Catalogue <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 400 }}>({materials.length} articles)</span>
              </h2>
              <button onClick={() => setShowAddMat(!showAddMat)} style={btnSmallPrimary}>
                {showAddMat ? "✕ Fermer" : "+ Ajouter"}
              </button>
            </div>

            {showAddMat && (
              <div style={{ background: "var(--surface)", border: "2px solid var(--primary)", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary)", marginTop: 0, marginBottom: "14px", letterSpacing: "1px", textTransform: "uppercase" }}>
                  ➕ Nouveau Matériau
                </p>
                <div style={{ marginBottom: "10px" }}>
                  <label style={labelStyle}>Nom *</label>
                  <input value={newMatName} onChange={e => setNewMatName(e.target.value)} placeholder="Ex: Bardeau premium" style={inputStyle}/>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <div>
                    <label style={labelStyle}>Prix ($)</label>
                    <input type="number" value={newMatPrice} onChange={e => setNewMatPrice(parseFloat(e.target.value) || 0)} min={0} step={0.01} style={inputStyle}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Unité</label>
                    <select value={newMatUnit} onChange={e => setNewMatUnit(e.target.value)} style={selectStyle}>
                      {["pi²","pi lin.","boîte","rouleau","feuille","tube","unité","heure"].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Emoji</label>
                    <input value={newMatEmoji} onChange={e => setNewMatEmoji(e.target.value)} placeholder="📦" style={{ ...inputStyle, textAlign: "center" }}/>
                  </div>
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={labelStyle}>Catégorie</label>
                  <select value={newMatCat} onChange={e => setNewMatCat(e.target.value)} style={selectStyle}>
                    <option value="toiture">🏠 Toiture</option>
                    <option value="siding">🏡 Siding</option>
                    <option value="fixations">🔩 Fixations</option>
                    <option value="etancheite">💧 Étanchéité</option>
                    <option value="structure">🪵 Structure</option>
                    <option value="maindoeuvre">👷 Main d&apos;oeuvre</option>
                  </select>
                </div>
                <button onClick={handleAddMaterial} style={btnPrimary}>✅ Ajouter au catalogue</button>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
              {[
                { key: "toiture",     label: "Toiture",       emoji: "🏠", color: "#ea580c" },
                { key: "siding",      label: "Siding",        emoji: "🏡", color: "#f59e0b" },
                { key: "fixations",   label: "Fixations",     emoji: "🔩", color: "#06b6d4" },
                { key: "etancheite",  label: "Étanchéité",    emoji: "💧", color: "#3b82f6" },
                { key: "structure",   label: "Structure",     emoji: "🪵", color: "#22c55e" },
                { key: "maindoeuvre", label: "Main-d'oeuvre", emoji: "👷", color: "#a855f7" },
              ].map(cat => {
                const count = materials.filter(m => m.category === cat.key).length;
                return (
                  <div key={cat.key} style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}44`, borderRadius: "8px", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: cat.color, fontWeight: 700 }}>{cat.emoji} {cat.label}</span>
                    <span style={{ fontSize: "16px", fontWeight: 800, color: cat.color }}>{count}</span>
                  </div>
                );
              })}
            </div>

            <button onClick={() => router.push("/catalogue")} style={{ width: "100%", padding: "14px", borderRadius: "10px", cursor: "pointer", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              📦 Gérer le catalogue complet →
            </button>
          </div>
        )}

        {/* ── THEME ── */}
        {activeSection === "theme" && <ThemeSection/>}

        {/* ── NUMBERING ── */}
        {activeSection === "numbering" && (
          <div className={cardClass} style={cardStyle}>
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

        {/* ── DANGER ── */}
        {activeSection === "danger" && (
          <div className={cardClass} style={{ ...cardStyle, borderColor: "#7f1d1d" }}>
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
