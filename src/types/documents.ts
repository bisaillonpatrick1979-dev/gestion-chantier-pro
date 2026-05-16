"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDocumentStore } from "@/store/useDocumentStore";
import { useCompanyStore } from "@/store/useCompanyStore";
import { useClientStore } from "@/store/useClientStore";
import { useThemeStore } from "@/store/useThemeStore";
import DocumentWatermark from "@/components/DocumentWatermark";
import { Document, DocumentType, DocumentStatus, LineItem } from "@/types/documents";

// ─────────────────────────────────────────
// Utilitaires
// ─────────────────────────────────────────
function formatCurrency(n: number): string {
  return new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(n ?? 0);
}
function today(): string {
  return new Date().toISOString().split("T")[0];
}
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

// ─────────────────────────────────────────
// Composant Field
// ─────────────────────────────────────────
function Field({
  label, value, onChange, type = "text", placeholder = "", readOnly = false,
}: {
  label: string; value: string | number;
  onChange?: (v: string) => void; type?: string; placeholder?: string; readOnly?: boolean;
}) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </label>
      <input
        type={type} value={value ?? ""}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder} readOnly={readOnly}
        style={{
          width: "100%", background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "8px", padding: "10px 12px", color: "var(--text)",
          fontSize: "15px", boxSizing: "border-box", outline: "none",
          opacity: readOnly ? 0.6 : 1,
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────
// Composant SignatureCanvas
// ─────────────────────────────────────────
function SignatureCanvas({
  label, isXP, onClear, canvasRef,
}: {
  label: string; isXP: boolean;
  onClear: () => void; canvasRef: React.RefObject<HTMLCanvasElement>;
}) {
  const [isDrawing, setIsDrawing] = useState(false);

  return (
    <div style={{ background: "var(--surface)", borderRadius: "10px", padding: "14px", border: "1px solid var(--border)", marginBottom: "14px" }}>
      <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        ✍️ {label}
      </label>
      <canvas
        ref={canvasRef}
        width={320} height={110}
        style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", touchAction: "none", display: "block", width: "100%" }}
        onMouseDown={() => { setIsDrawing(true); canvasRef.current?.getContext("2d")?.beginPath(); }}
        onMouseUp={() => setIsDrawing(false)}
        onMouseLeave={() => setIsDrawing(false)}
        onMouseMove={(e) => {
          if (!isDrawing || !canvasRef.current) return;
          const ctx = canvasRef.current.getContext("2d");
          if (!ctx) return;
          const rect = canvasRef.current.getBoundingClientRect();
          const sx = canvasRef.current.width / rect.width;
          const sy = canvasRef.current.height / rect.height;
          ctx.strokeStyle = isXP ? "#a855f7" : "var(--primary, #D4AF37)";
          ctx.lineWidth = 2; ctx.lineCap = "round";
          ctx.lineTo((e.clientX - rect.left) * sx, (e.clientY - rect.top) * sy);
          ctx.stroke(); ctx.beginPath();
          ctx.moveTo((e.clientX - rect.left) * sx, (e.clientY - rect.top) * sy);
        }}
        onTouchStart={(e) => { e.preventDefault(); setIsDrawing(true); canvasRef.current?.getContext("2d")?.beginPath(); }}
        onTouchMove={(e) => {
          e.preventDefault();
          if (!isDrawing || !canvasRef.current) return;
          const ctx = canvasRef.current.getContext("2d");
          if (!ctx) return;
          const rect = canvasRef.current.getBoundingClientRect();
          const sx = canvasRef.current.width / rect.width;
          const sy = canvasRef.current.height / rect.height;
          const t = e.touches[0];
          ctx.strokeStyle = isXP ? "#a855f7" : "var(--primary, #D4AF37)";
          ctx.lineWidth = 2; ctx.lineCap = "round";
          ctx.lineTo((t.clientX - rect.left) * sx, (t.clientY - rect.top) * sy);
          ctx.stroke(); ctx.beginPath();
          ctx.moveTo((t.clientX - rect.left) * sx, (t.clientY - rect.top) * sy);
        }}
        onTouchEnd={() => setIsDrawing(false)}
      />
      <button
        onClick={onClear}
        style={{ marginTop: "8px", background: "none", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: "6px", padding: "6px 14px", cursor: "pointer", fontSize: "13px" }}
      >
        Effacer
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────
const TYPE_META: Record<DocumentType, { label: string; emoji: string; color: string }> = {
  facture: { label: "Facture",  emoji: "📄", color: "#f59e0b" },
  devis:   { label: "Devis",    emoji: "📋", color: "#3b82f6" },
  contrat: { label: "Contrat",  emoji: "📝", color: "#22c55e" },
};

const STATUS_COLORS: Record<DocumentStatus, string> = {
  brouillon: "var(--text-muted)",
  envoye:    "#3b82f6",
  accepte:   "#22c55e",
  refuse:    "#ef4444",
  paye:      "#f59e0b",
};
const STATUS_LABELS: Record<DocumentStatus, string> = {
  brouillon: "Brouillon",
  envoye:    "Envoyé",
  accepte:   "Accepté",
  refuse:    "Refusé",
  paye:      "Payé",
};

function getWatermarkType(type: DocumentType): "FACTURE" | "DEVIS" | "CONTRAT" {
  if (type === "facture") return "FACTURE";
  if (type === "devis") return "DEVIS";
  return "CONTRAT";
}

// Tabs dynamiques selon le type
const TABS_BY_TYPE: Record<DocumentType, { id: string; label: string }[]> = {
  facture: [
    { id: "info",   label: "📋 Info"     },
    { id: "items",  label: "🔧 Articles" },
    { id: "totals", label: "💰 Totaux"   },
    { id: "notes",  label: "📝 Notes"    },
  ],
  devis: [
    { id: "info",    label: "📋 Info"     },
    { id: "travaux", label: "🏗️ Travaux"  },
    { id: "items",   label: "🔧 Articles" },
    { id: "totals",  label: "💰 Totaux"   },
    { id: "notes",   label: "📝 Notes"    },
  ],
  contrat: [
    { id: "info",    label: "📋 Info"      },
    { id: "travaux", label: "🏗️ Travaux"   },
    { id: "clauses", label: "⚖️ Clauses"   },
    { id: "totals",  label: "💰 Montant"   },
    { id: "sign",    label: "✍️ Signatures" },
  ],
};

// ─────────────────────────────────────────
// Page principale
// ─────────────────────────────────────────
export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const docId  = params.id as string;
  const isNew  = docId === "new";

  const {
    documents, addDocument, updateDocument,
    updateLineItem: storeUpdateLine,
    addLineItem:    storeAddLine,
    removeLineItem: storeRemoveLine,
    updateDiscount,
    updateDeposit,
    calculateTotals,
    deleteDocument,
  } = useDocumentStore();

  const { company } = useCompanyStore();
  const { clients } = useClientStore();
  const { themeId } = useThemeStore();
  const isXP = themeId === "xp";

  // ── UI state ──
  const [activeTab,        setActiveTab]        = useState("info");
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showPreview,      setShowPreview]      = useState(false);
  const [saved,            setSaved]            = useState(false);
  const [toast,            setToast]            = useState("");

  // Champs extras locaux (contrat / devis)
  const [startDate, setStartDate] = useState(today());
  const [endDate,   setEndDate]   = useState(addDays(today(), 30));
  const [validDays, setValidDays] = useState("30");
  const [workDesc,  setWorkDesc]  = useState("");
  const [clauses,   setClauses]   = useState(
    "1. Les travaux seront exécutés selon les règles de l'art.\n" +
    "2. Tout travail supplémentaire fera l'objet d'un avenant écrit.\n" +
    "3. Le client s'engage à fournir un accès libre au chantier.\n" +
    "4. Le paiement final est dû à la réception des travaux.\n" +
    "5. Garantie sur la main-d'œuvre : 1 an."
  );

  // Refs signatures
  const contractorSigRef = useRef<HTMLCanvasElement>(null);
  const clientSigRef     = useRef<HTMLCanvasElement>(null);
  const singleSigRef     = useRef<HTMLCanvasElement>(null);

  // ── Résolution / création du doc ──
  const [currentId] = useState<string>(() => {
    if (!isNew) return docId;
    const newDoc = addDocument("facture");
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/documents/${newDoc.id}`);
    }
    return newDoc.id;
  });

  const doc = documents.find((d) => d.id === currentId) ?? null;

  // ── Helpers ──
  function upd(updates: Partial<Document>) {
    if (!currentId) return;
    updateDocument(currentId, updates);
  }

  function handleLineChange(itemId: string, field: keyof LineItem, value: string | number) {
    storeUpdateLine(currentId, itemId, { [field]: value });
  }

  function showToastMsg(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  function selectClient(clientId: string) {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    upd({
      client: {
        name: client.name, email: client.email || "",
        phone: client.phone || "", address: client.address || "",
        city: "", province: "AB", postalCode: "",
      },
    });
    setShowClientPicker(false);
  }

  function handleSave() {
    setSaved(true);
    showToastMsg("✅ Document sauvegardé!");
    setTimeout(() => { setSaved(false); router.push("/documents"); }, 1500);
  }

  function handleSendEmail() {
    if (!doc) return;
    const subject = encodeURIComponent(`${TYPE_META[doc.type].label} ${doc.number} — ${company.name}`);
    const body = encodeURIComponent(
      `Bonjour ${doc.client.name || ""},\n\nVeuillez trouver ci-joint votre ${TYPE_META[doc.type].label.toLowerCase()} numéro ${doc.number} d'un montant de ${formatCurrency(doc.total)}.\n\nMerci de votre confiance.\n\n${company.name}\n${company.phone || ""}\n${company.email || ""}`
    );
    window.open(`mailto:${encodeURIComponent(doc.client.email || "")}?subject=${subject}&body=${body}`);
    upd({ status: "envoye" });
    showToastMsg("📧 Email ouvert — statut → Envoyé");
  }

  function handleSendSMS() {
    if (!doc) return;
    const msg = encodeURIComponent(
      `Bonjour ${doc.client.name || ""}! Votre ${TYPE_META[doc.type].label.toLowerCase()} #${doc.number} de ${formatCurrency(doc.total)} est prête. — ${company.name} ${company.phone || ""}`
    );
    window.open(`sms:${(doc.client.phone || "").replace(/\D/g, "")}?body=${msg}`);
    showToastMsg("💬 SMS ouvert");
  }

  function clearCanvas(ref: React.RefObject<HTMLCanvasElement>) {
    const ctx = ref.current?.getContext("2d");
    if (ctx && ref.current) ctx.clearRect(0, 0, ref.current.width, ref.current.height);
  }

  // Tabs valides pour le type courant
  const currentTabs = doc ? TABS_BY_TYPE[doc.type] : TABS_BY_TYPE["facture"];
  const validTabIds = currentTabs.map(t => t.id);
  const safeTab = validTabIds.includes(activeTab) ? activeTab : "info";

  if (!doc) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "var(--text-muted)", fontSize: "15px" }}>
        Chargement...
      </div>
    );
  }

  const wm       = getWatermarkType(doc.type);
  const typeMeta = TYPE_META[doc.type];

  // ── Styles ──
  const cardStyle: React.CSSProperties = {
    background: "var(--card)", border: "1px solid var(--border)",
    borderRadius: "12px", padding: "16px", marginBottom: "14px",
    position: "relative", overflow: "hidden",
  };
  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "8px", padding: "10px 12px", color: "var(--text)",
    fontSize: "15px", boxSizing: "border-box", outline: "none",
  };
  const btnPrimary: React.CSSProperties = {
    background: isXP ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "linear-gradient(135deg,var(--primary),var(--secondary))",
    color: isXP ? "#fff" : "#000", border: "none", borderRadius: "10px",
    padding: "14px 20px", fontWeight: 700, fontSize: "15px", cursor: "pointer", flex: 1,
    boxShadow: isXP ? "0 0 20px rgba(168,85,247,0.4)" : "none",
  };
  const tabActive: React.CSSProperties = {
    borderBottom: isXP ? "2px solid #a855f7" : "2px solid var(--primary)",
    color: isXP ? "#a855f7" : "var(--primary)", fontWeight: 700,
  };
  const typeActive: React.CSSProperties = {
    background: isXP ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "linear-gradient(135deg,var(--primary),var(--secondary))",
    color: isXP ? "#fff" : "#000", border: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", paddingBottom: "130px" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: "16px", left: "50%", transform: "translateX(-50%)", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 20px", color: "var(--text)", fontSize: "14px", fontWeight: 600, zIndex: 999, boxShadow: "0 8px 32px rgba(0,0,0,0.3)", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderBottom: "1px solid var(--border)" }}>
        <button onClick={() => router.push("/documents")} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-muted)", padding: "8px 12px", cursor: "pointer", fontSize: "14px" }}>
          ← Retour
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: typeMeta.color }}>
            {typeMeta.emoji} {doc.number}
          </h1>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{company.name}</div>
        </div>
        <button onClick={() => setShowStatusPicker(true)} style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: STATUS_COLORS[doc.status] + "22", color: STATUS_COLORS[doc.status], border: "1px solid " + STATUS_COLORS[doc.status] + "44", cursor: "pointer" }}>
          {STATUS_LABELS[doc.status]} ▾
        </button>
      </div>

      {/* ── Sélecteur de type ── */}
      <div style={{ display: "flex", gap: "8px", padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
        {(["facture", "devis", "contrat"] as DocumentType[]).map((t) => (
          <button key={t} onClick={() => { upd({ type: t }); setActiveTab("info"); }} style={{
            flex: 1, padding: "10px 4px", borderRadius: "10px", cursor: "pointer",
            fontSize: "13px", fontWeight: doc.type === t ? 700 : 400,
            ...(doc.type === t ? typeActive : { border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)" }),
          }}>
            {TYPE_META[t].emoji} {TYPE_META[t].label}
          </button>
        ))}
      </div>

      {/* ── Tabs dynamiques ── */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", overflowX: "auto", scrollbarWidth: "none" }}>
        {currentTabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, minWidth: "60px", padding: "12px 4px", border: "none",
            borderBottom: "2px solid transparent", background: "none",
            cursor: "pointer", fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap",
            ...(safeTab === tab.id ? tabActive : {}),
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "16px" }}>

        {/* ═══════════════════════════════════
            TAB INFO — commun aux 3 types
        ═══════════════════════════════════ */}
        {safeTab === "info" && (
          <>
            {/* Bloc compagnie auto */}
            <div style={{ ...cardStyle, border: `1px solid ${typeMeta.color}44`, background: `${typeMeta.color}08`, minHeight: "120px" }}>
              <DocumentWatermark type={wm} logoUrl={company.logoUrl} companyName={company.name} opacity={0.07}/>
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: "11px", color: typeMeta.color, letterSpacing: "0.1em", marginBottom: "10px", textTransform: "uppercase", fontWeight: 700 }}>
                  ✨ De (Auto — Réglages)
                </div>
                {company.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logoUrl} alt="Logo" style={{ width: "44px", height: "44px", objectFit: "contain", borderRadius: "6px", marginBottom: "8px", background: "#fff" }}/>
                )}
                <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text)" }}>{company.name}</div>
                {company.tagline && <div style={{ fontSize: "12px", color: typeMeta.color, marginBottom: "6px" }}>{company.tagline}</div>}
                <div style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.7" }}>
                  {company.address && <div>{company.address}</div>}
                  {company.city && <div>{company.city}, {company.province} {company.postalCode}</div>}
                  {company.phone && <div>📞 {company.phone}</div>}
                  {company.email && <div>✉️ {company.email}</div>}
                  {company.gstNumber && <div>GST: {company.gstNumber}</div>}
                  {company.wcbNumber && <div>WCB: {company.wcbNumber}</div>}
                </div>
              </div>
            </div>

            {/* Numéro + dates (différent selon type) */}
            <div style={cardStyle}>
              <Field label="Numéro de document" value={doc.number} onChange={(v) => upd({ number: v })}/>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <Field label="Date" value={doc.date} onChange={(v) => upd({ date: v })} type="date"/>
                {doc.type === "facture" && (
                  <Field label="Échéance paiement" value={doc.dueDate} onChange={(v) => upd({ dueDate: v })} type="date"/>
                )}
                {doc.type === "devis" && (
                  <Field label="Valide (jours)" value={validDays} onChange={setValidDays} type="number" placeholder="30"/>
                )}
                {doc.type === "contrat" && (
                  <Field label="Début des travaux" value={startDate} onChange={setStartDate} type="date"/>
                )}
              </div>
              {doc.type === "contrat" && (
                <Field label="Date fin prévue" value={endDate} onChange={setEndDate} type="date"/>
              )}
            </div>

            {/* Client */}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontWeight: 700, color: "var(--text)" }}>
                  {doc.type === "contrat" ? "🤝 Partie cliente" : "👤 Client"}
                </span>
                <button onClick={() => setShowClientPicker(true)} style={{ background: "var(--success)18", border: "1px solid var(--success)44", color: "var(--success)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
                  👥 Choisir
                </button>
              </div>
              <Field label="Nom complet" value={doc.client.name} onChange={(v) => upd({ client: { ...doc.client, name: v } })} placeholder="Nom du client"/>
              <Field label="Courriel" value={doc.client.email} onChange={(v) => upd({ client: { ...doc.client, email: v } })} type="email" placeholder="email@exemple.com"/>
              <Field label="Téléphone" value={doc.client.phone} onChange={(v) => upd({ client: { ...doc.client, phone: v } })} type="tel" placeholder="(780) 555-5555"/>
              <Field label="Adresse" value={doc.client.address} onChange={(v) => upd({ client: { ...doc.client, address: v } })} placeholder="Adresse complète"/>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════
            TAB TRAVAUX — devis + contrat
        ═══════════════════════════════════ */}
        {safeTab === "travaux" && (
          <>
            <div style={cardStyle}>
              <h3 style={{ marginTop: 0, marginBottom: "14px", color: "var(--text)" }}>🏗️ Description des travaux</h3>
              <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>
                {doc.type === "devis" ? "Travaux proposés" : "Travaux à réaliser"}
              </label>
              <textarea
                value={workDesc} onChange={(e) => setWorkDesc(e.target.value)}
                rows={8} placeholder="Décrire en détail les travaux à effectuer : matériaux, méthodes, zones concernées..."
                style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6" }}
              />
            </div>

            {doc.type === "devis" && (
              <div style={{ ...cardStyle, border: "1px solid #3b82f644", background: "#3b82f608" }}>
                <div style={{ fontSize: "11px", color: "#3b82f6", letterSpacing: "0.1em", marginBottom: "10px", textTransform: "uppercase", fontWeight: 700 }}>ℹ️ Validité</div>
                <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>
                  Ce devis est valide <strong style={{ color: "var(--text)" }}>{validDays} jours</strong> à compter du <strong style={{ color: "var(--text)" }}>{doc.date}</strong>.
                </p>
                <p style={{ margin: "8px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
                  L'acceptation de ce devis vaut bon de commande. Les travaux débuteront après réception du dépôt.
                </p>
              </div>
            )}

            {doc.type === "contrat" && (
              <div style={{ ...cardStyle, border: "1px solid #22c55e44", background: "#22c55e08" }}>
                <div style={{ fontSize: "11px", color: "#22c55e", letterSpacing: "0.1em", marginBottom: "10px", textTransform: "uppercase", fontWeight: 700 }}>📅 Calendrier</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>DÉBUT</div>
                    <div style={{ fontWeight: 700, color: "var(--text)", fontSize: "15px" }}>{startDate}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>FIN PRÉVUE</div>
                    <div style={{ fontWeight: 700, color: "var(--text)", fontSize: "15px" }}>{endDate}</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══════════════════════════════════
            TAB CLAUSES — contrat seulement
        ═══════════════════════════════════ */}
        {safeTab === "clauses" && doc.type === "contrat" && (
          <>
            <div style={cardStyle}>
              <h3 style={{ marginTop: 0, marginBottom: "14px", color: "var(--text)" }}>⚖️ Clauses & Conditions</h3>
              <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>
                Clauses contractuelles
              </label>
              <textarea
                value={clauses} onChange={(e) => setClauses(e.target.value)}
                rows={12} style={{ ...inputStyle, resize: "vertical", lineHeight: "1.7" }}
                placeholder="1. ..."
              />
            </div>

            <div style={{ ...cardStyle, border: "1px solid #f59e0b44", background: "#f59e0b08" }}>
              <div style={{ fontSize: "11px", color: "#f59e0b", letterSpacing: "0.1em", marginBottom: "10px", textTransform: "uppercase", fontWeight: 700 }}>
                ⚠️ Modalités de paiement
              </div>
              <textarea
                value={doc.terms ?? ""}
                onChange={(e) => upd({ terms: e.target.value })}
                rows={4}
                placeholder="Ex: 30% à la signature, 40% à mi-travaux, 30% à la réception..."
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
          </>
        )}

        {/* ═══════════════════════════════════
            TAB ARTICLES — facture + devis
        ═══════════════════════════════════ */}
        {safeTab === "items" && (
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, marginBottom: "16px", color: "var(--text)" }}>
              {doc.type === "devis" ? "🔧 Estimatif des travaux" : "🔧 Articles / Services"}
            </h3>
            {doc.items.map((item, idx) => (
              <div key={item.id} style={{ background: "var(--surface)", borderRadius: "10px", padding: "14px", marginBottom: "10px", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Ligne {idx + 1}</span>
                  {doc.items.length > 1 && (
                    <button onClick={() => storeRemoveLine(currentId, item.id)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "20px", padding: "0 4px" }}>✕</button>
                  )}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>Description</label>
                  <input type="text" value={item.description} onChange={(e) => handleLineChange(item.id, "description", e.target.value)} placeholder="Description..." style={inputStyle}/>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>Qté</label>
                    <input type="number" value={item.quantity} onChange={(e) => handleLineChange(item.id, "quantity", Number(e.target.value))} min="0" step="0.5" style={inputStyle}/>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>Prix unit.</label>
                    <input type="number" value={item.unitPrice} onChange={(e) => handleLineChange(item.id, "unitPrice", Number(e.target.value))} min="0" step="0.01" style={inputStyle}/>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>Total</label>
                    <input type="text" value={formatCurrency(item.total)} readOnly style={{ ...inputStyle, opacity: 0.6 }}/>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => storeAddLine(currentId)} style={{ width: "100%", padding: "12px", background: "transparent", border: "2px dashed var(--border)", borderRadius: "10px", color: "var(--primary)", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
              + Ajouter une ligne
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════
            TAB TOTAUX — tous les types
        ═══════════════════════════════════ */}
        {safeTab === "totals" && (
          <>
            <div style={{ ...cardStyle, minHeight: "200px" }}>
              <DocumentWatermark type={wm} logoUrl={company.logoUrl} companyName={company.name} opacity={0.05}/>
              <div style={{ position: "relative", zIndex: 1 }}>
                <h3 style={{ marginTop: 0, marginBottom: "16px", color: "var(--text)" }}>
                  {doc.type === "contrat" ? "💰 Montant du contrat" : "💰 Totaux"}
                </h3>

                {/* Remise — facture et devis seulement */}
                {doc.type !== "contrat" && (
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>Remise (%)</label>
                    <input type="number" value={doc.discountType === "percent" ? doc.discountValue : 0} onChange={(e) => { updateDiscount(currentId, "percent", Number(e.target.value)); calculateTotals(currentId); }} min="0" max="100" style={inputStyle}/>
                  </div>
                )}

                {/* Dépôt / Acompte */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>
                    {doc.type === "contrat" ? "Acompte à la signature ($)" : doc.type === "devis" ? "Dépôt demandé ($)" : "Dépôt reçu ($)"}
                  </label>
                  <input type="number" value={doc.deposit ?? 0} onChange={(e) => updateDeposit(currentId, Number(e.target.value))} min="0" step="0.01" style={inputStyle}/>
                </div>

                {/* Récap financier */}
                <div style={{ background: "var(--surface)", borderRadius: "10px", padding: "16px", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", color: "var(--text-muted)" }}>
                    <span>Sous-total</span><span>{formatCurrency(doc.subtotal)}</span>
                  </div>
                  {doc.discountAmount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", color: "#22c55e" }}>
                      <span>Remise</span><span>−{formatCurrency(doc.discountAmount)}</span>
                    </div>
                  )}
                  {doc.taxes.filter(t => t.enabled).map(tax => (
                    <div key={tax.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", color: "var(--text-muted)" }}>
                      <span>{tax.name} ({tax.rate}%)</span>
                      <span>{formatCurrency((doc.subtotal - (doc.discountAmount ?? 0)) * tax.rate / 100)}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "22px", fontWeight: 800, color: typeMeta.color, marginBottom: "12px" }}>
                      <span>TOTAL</span><span>{formatCurrency(doc.total)}</span>
                    </div>
                    {(doc.deposit ?? 0) > 0 && (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#3b82f6", marginBottom: "6px" }}>
                          <span>{doc.type === "contrat" ? "Acompte" : "Dépôt"}</span>
                          <span>−{formatCurrency(doc.deposit)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: 700, color: "var(--danger)" }}>
                          <span>Solde dû</span><span>{formatCurrency(doc.balanceDue)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Infos paiement auto */}
            {(company.etransferEmail || company.bankName) && (
              <div style={{ ...cardStyle, border: "1px solid #3b82f644", background: "#3b82f608" }}>
                <div style={{ fontSize: "11px", color: "#3b82f6", letterSpacing: "0.1em", marginBottom: "10px", textTransform: "uppercase", fontWeight: 700 }}>
                  💳 Paiement (Auto — Réglages)
                </div>
                {company.etransferEmail && <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "4px" }}>Interac: <strong style={{ color: "var(--text)" }}>{company.etransferEmail}</strong></div>}
                {company.bankName && <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>{company.bankName}{company.bankAccount && " — " + company.bankAccount}</div>}
              </div>
            )}
          </>
        )}

        {/* ═══════════════════════════════════
            TAB NOTES — facture + devis
        ═══════════════════════════════════ */}
        {safeTab === "notes" && (
          <div style={{ ...cardStyle, minHeight: "260px" }}>
            <DocumentWatermark type={wm} logoUrl={company.logoUrl} companyName={company.name} opacity={0.05}/>
            <div style={{ position: "relative", zIndex: 1 }}>
              <h3 style={{ marginTop: 0, marginBottom: "16px", color: "var(--text)" }}>📝 Notes & Signature</h3>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>Notes pour le client</label>
                <textarea value={doc.notes ?? ""} onChange={(e) => upd({ notes: e.target.value })} rows={4} style={{ ...inputStyle, resize: "vertical" }} placeholder="Merci pour votre confiance..."/>
              </div>

              {doc.type === "devis" && (
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>Conditions d'acceptation</label>
                  <textarea value={doc.terms ?? ""} onChange={(e) => upd({ terms: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="L'acceptation de ce devis vaut bon de commande..."/>
                </div>
              )}

              {/* Signature client (facture / devis) */}
              <SignatureCanvas
                label="Signature du client"
                isXP={isXP}
                canvasRef={singleSigRef}
                onClear={() => clearCanvas(singleSigRef)}
              />
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════
            TAB SIGNATURES — contrat seulement
        ═══════════════════════════════════ */}
        {safeTab === "sign" && doc.type === "contrat" && (
          <>
            <div style={{ ...cardStyle, border: "1px solid #22c55e44", background: "#22c55e08" }}>
              <DocumentWatermark type="CONTRAT" logoUrl={company.logoUrl} companyName={company.name} opacity={0.05}/>
              <div style={{ position: "relative", zIndex: 1 }}>
                <h3 style={{ marginTop: 0, marginBottom: "6px", color: "var(--text)" }}>✍️ Signatures des parties</h3>
                <p style={{ margin: "0 0 20px", fontSize: "13px", color: "var(--text-muted)" }}>
                  Les deux parties confirment avoir lu et accepté les termes du présent contrat.
                </p>

                {/* ── Signature CONTRACTEUR ── */}
                <div style={{ marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <div style={{ flex: 1, height: "1px", background: "var(--border)" }}/>
                    <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 700, whiteSpace: "nowrap", padding: "4px 12px", background: "var(--primary)18", borderRadius: "20px", border: "1px solid var(--primary)44" }}>
                      🔨 CONTRACTEUR
                    </span>
                    <div style={{ flex: 1, height: "1px", background: "var(--border)" }}/>
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px", paddingLeft: "4px" }}>
                    <strong style={{ color: "var(--text)" }}>{company.name}</strong>
                    {company.ownerName && <span style={{ color: "var(--text-muted)" }}> — {company.ownerName}</span>}
                  </div>
                  <SignatureCanvas
                    label="Signature du contracteur"
                    isXP={isXP}
                    canvasRef={contractorSigRef}
                    onClear={() => clearCanvas(contractorSigRef)}
                  />
                  <Field label="Date de signature — contracteur" value={today()} type="date" readOnly/>
                </div>

                {/* Séparateur */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "20px 0" }}>
                  <div style={{ flex: 1, height: "1px", background: "var(--border)" }}/>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>ET</span>
                  <div style={{ flex: 1, height: "1px", background: "var(--border)" }}/>
                </div>

                {/* ── Signature CLIENT ── */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <div style={{ flex: 1, height: "1px", background: "var(--border)" }}/>
                    <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: 700, whiteSpace: "nowrap", padding: "4px 12px", background: "#22c55e18", borderRadius: "20px", border: "1px solid #22c55e44" }}>
                      👤 CLIENT
                    </span>
                    <div style={{ flex: 1, height: "1px", background: "var(--border)" }}/>
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px", paddingLeft: "4px" }}>
                    <strong style={{ color: doc.client.name ? "var(--text)" : "var(--danger)" }}>
                      {doc.client.name || "⚠️ Client non défini — allez dans Info"}
                    </strong>
                  </div>
                  <SignatureCanvas
                    label="Signature du client"
                    isXP={isXP}
                    canvasRef={clientSigRef}
                    onClear={() => clearCanvas(clientSigRef)}
                  />
                  <Field label="Date de signature — client" value={today()} type="date" readOnly/>
                </div>

                {/* Bloc légal */}
                <div style={{ marginTop: "20px", padding: "14px", background: "var(--surface)", borderRadius: "10px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.7" }}>
                    En signant ce document, les deux parties reconnaissent avoir pris connaissance de l'ensemble des clauses et conditions et s'engagent à les respecter. Ce contrat constitue l'intégralité de l'entente entre les parties.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════
            BOUTONS D'ACTION
        ═══════════════════════════════════ */}
        <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "10px" }}>

          <button style={btnPrimary} onClick={handleSave}>
            {saved ? "✅ Sauvegardé!" : "💾 Sauvegarder"}
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button onClick={handleSendEmail} style={{ padding: "13px", borderRadius: "10px", cursor: "pointer", border: "1px solid #3b82f644", background: "#3b82f608", color: "#3b82f6", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              📧 Email
            </button>
            <button onClick={handleSendSMS} style={{ padding: "13px", borderRadius: "10px", cursor: "pointer", border: "1px solid #22c55e44", background: "#22c55e08", color: "#22c55e", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              💬 SMS
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button onClick={() => setShowPreview(true)} style={{ padding: "13px", borderRadius: "10px", cursor: "pointer", border: "1px solid var(--primary)44", background: "var(--primary)08", color: "var(--primary)", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              👁️ Aperçu
            </button>
            <button onClick={() => window.print()} style={{ padding: "13px", borderRadius: "10px", cursor: "pointer", border: "1px solid #f59e0b44", background: "#f59e0b08", color: "#f59e0b", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              🖨️ PDF
            </button>
          </div>

          <button onClick={() => { if (confirm("Supprimer ce document?")) { deleteDocument(currentId); router.push("/documents"); } }} style={{ padding: "12px", borderRadius: "10px", cursor: "pointer", border: "1px solid var(--danger)44", background: "var(--danger)08", color: "var(--danger)", fontWeight: 600, fontSize: "13px" }}>
            🗑️ Supprimer ce document
          </button>
        </div>
      </div>

      {/* ── Modal client picker ── */}
      {showClientPicker && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setShowClientPicker(false)}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", width: "100%", maxHeight: "70vh", borderRadius: "20px 20px 0 0", padding: "20px", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: "16px", color: "var(--text)" }}>👥 Choisir un client</h3>
            {clients.length === 0
              ? <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>Aucun client. Ajoutez-en dans Réglages.</p>
              : clients.map((client) => (
                <button key={client.id} onClick={() => selectClient(client.id)} style={{ display: "block", width: "100%", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px", color: "var(--text)", textAlign: "left", cursor: "pointer", marginBottom: "8px" }}>
                  <div style={{ fontWeight: 700 }}>{client.name}</div>
                  {client.email && <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{client.email}</div>}
                  {client.phone && <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{client.phone}</div>}
                </button>
              ))
            }
          </div>
        </div>
      )}

      {/* ── Modal statut ── */}
      {showStatusPicker && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setShowStatusPicker(false)}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", width: "100%", borderRadius: "20px 20px 0 0", padding: "20px" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: "16px", color: "var(--text)" }}>Changer le statut</h3>
            {(Object.keys(STATUS_LABELS) as DocumentStatus[]).map((s) => (
              <button key={s} onClick={() => { upd({ status: s }); setShowStatusPicker(false); showToastMsg("Statut → " + STATUS_LABELS[s]); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: doc.status === s ? STATUS_COLORS[s] + "18" : "var(--card)", border: "1px solid " + (doc.status === s ? STATUS_COLORS[s] + "66" : "var(--border)"), borderRadius: "10px", padding: "14px", color: "var(--text)", cursor: "pointer", marginBottom: "8px", fontWeight: doc.status === s ? 700 : 400 }}>
                <span>{STATUS_LABELS[s]}</span>
                {doc.status === s && <span style={{ color: STATUS_COLORS[s] }}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Modal aperçu ── */}
      {showPreview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, overflowY: "auto" }} onClick={() => setShowPreview(false)}>
          <div style={{ background: "#fff", color: "#111", margin: "20px auto", maxWidth: "600px", borderRadius: "12px", padding: "32px" }} onClick={(e) => e.stopPropagation()}>

            {/* En-tête aperçu */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
              <div>
                {company.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logoUrl} alt="Logo" style={{ width: "60px", height: "60px", objectFit: "contain", marginBottom: "8px" }}/>
                )}
                <div style={{ fontWeight: 800, fontSize: "18px" }}>{company.name}</div>
                {company.tagline && <div style={{ fontSize: "12px", color: "#666" }}>{company.tagline}</div>}
                <div style={{ fontSize: "12px", color: "#666", marginTop: "6px", lineHeight: "1.6" }}>
                  {company.address && <div>{company.address}</div>}
                  {company.city && <div>{company.city}, {company.province} {company.postalCode}</div>}
                  {company.phone && <div>{company.phone}</div>}
                  {company.email && <div>{company.email}</div>}
                  {company.gstNumber && <div>GST: {company.gstNumber}</div>}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "26px", fontWeight: 900, color: typeMeta.color, textTransform: "uppercase" }}>{typeMeta.label}</div>
                <div style={{ fontSize: "14px", fontWeight: 700 }}>{doc.number}</div>
                <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>Date: {doc.date}</div>
                {doc.type === "facture" && <div style={{ fontSize: "12px", color: "#666" }}>Échéance: {doc.dueDate}</div>}
                {doc.type === "devis"   && <div style={{ fontSize: "12px", color: "#666" }}>Valide {validDays} jours</div>}
                {doc.type === "contrat" && <div style={{ fontSize: "12px", color: "#666" }}>{startDate} → {endDate}</div>}
              </div>
            </div>

            {/* Client */}
            <div style={{ background: "#f8f8f8", borderRadius: "8px", padding: "16px", marginBottom: "24px" }}>
              <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", marginBottom: "6px" }}>
                {doc.type === "contrat" ? "Partie cliente" : "Facturer à"}
              </div>
              <div style={{ fontWeight: 700 }}>{doc.client.name || "—"}</div>
              {doc.client.email   && <div style={{ fontSize: "13px", color: "#555" }}>{doc.client.email}</div>}
              {doc.client.phone   && <div style={{ fontSize: "13px", color: "#555" }}>{doc.client.phone}</div>}
              {doc.client.address && <div style={{ fontSize: "13px", color: "#555" }}>{doc.client.address}</div>}
            </div>

            {/* Description travaux */}
            {workDesc && (
              <div style={{ marginBottom: "20px", padding: "14px", background: "#f0fdf4", borderRadius: "8px" }}>
                <div style={{ fontSize: "11px", color: "#16a34a", textTransform: "uppercase", marginBottom: "6px" }}>Description des travaux</div>
                <div style={{ fontSize: "13px", color: "#333", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{workDesc}</div>
              </div>
            )}

            {/* Articles */}
            {doc.items.some(i => i.description) && (
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
                <thead>
                  <tr style={{ background: "#111", color: "#fff" }}>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "12px" }}>Description</th>
                    <th style={{ padding: "10px 12px", textAlign: "center", fontSize: "12px" }}>Qté</th>
                    <th style={{ padding: "10px 12px", textAlign: "right", fontSize: "12px" }}>Prix unit.</th>
                    <th style={{ padding: "10px 12px", textAlign: "right", fontSize: "12px" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {doc.items.map((item, i) => (
                    <tr key={item.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8f8f8" }}>
                      <td style={{ padding: "10px 12px", fontSize: "13px" }}>{item.description || "—"}</td>
                      <td style={{ padding: "10px 12px", textAlign: "center", fontSize: "13px" }}>{item.quantity}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontSize: "13px" }}>{formatCurrency(item.unitPrice)}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontSize: "13px", fontWeight: 600 }}>{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Totaux aperçu */}
            <div style={{ marginLeft: "auto", maxWidth: "260px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                <span style={{ color: "#666" }}>Sous-total</span><span>{formatCurrency(doc.subtotal)}</span>
              </div>
              {doc.taxes.filter(t => t.enabled).map(tax => (
                <div key={tax.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px", color: "#666" }}>
                  <span>{tax.name} ({tax.rate}%)</span>
                  <span>{formatCurrency((doc.subtotal - (doc.discountAmount ?? 0)) * tax.rate / 100)}</span>
                </div>
              ))}
              <div style={{ borderTop: "2px solid #111", paddingTop: "10px", marginTop: "10px", display: "flex", justifyContent: "space-between", fontSize: "20px", fontWeight: 800 }}>
                <span>TOTAL</span><span style={{ color: typeMeta.color }}>{formatCurrency(doc.total)}</span>
              </div>
              {(doc.deposit ?? 0) > 0 && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "13px", color: "#3b82f6" }}>
                    <span>{doc.type === "contrat" ? "Acompte" : "Dépôt"}</span><span>−{formatCurrency(doc.deposit)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "15px", fontWeight: 700, color: "#ef4444" }}>
                    <span>Solde dû</span><span>{formatCurrency(doc.balanceDue)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Clauses contrat */}
            {doc.type === "contrat" && clauses && (
              <div style={{ marginBottom: "20px", padding: "14px", background: "#f8f8f8", borderRadius: "8px" }}>
                <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", marginBottom: "8px" }}>Clauses & Conditions</div>
                <div style={{ fontSize: "12px", color: "#444", whiteSpace: "pre-wrap", lineHeight: "1.7" }}>{clauses}</div>
              </div>
            )}

            {/* Notes */}
            {doc.notes && (
              <div style={{ marginBottom: "16px", padding: "14px", background: "#f8f8f8", borderRadius: "8px" }}>
                <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", marginBottom: "6px" }}>Notes</div>
                <div style={{ fontSize: "13px", color: "#444" }}>{doc.notes}</div>
              </div>
            )}

            {/* Paiement */}
            {(company.etransferEmail || company.bankName) && (
              <div style={{ marginBottom: "20px", padding: "14px", background: "#f0f9ff", borderRadius: "8px" }}>
                <div style={{ fontSize: "11px", color: "#3b82f6", textTransform: "uppercase", marginBottom: "6px" }}>Paiement</div>
                {company.etransferEmail && <div style={{ fontSize: "13px" }}>Interac: <strong>{company.etransferEmail}</strong></div>}
                {company.bankName && <div style={{ fontSize: "13px" }}>{company.bankName}{company.bankAccount && " — " + company.bankAccount}</div>}
              </div>
            )}

            {/* Zones signature dans l'aperçu */}
            <div style={{ display: "grid", gridTemplateColumns: doc.type === "contrat" ? "1fr 1fr" : "1fr", gap: "16px", marginTop: "24px" }}>
              {doc.type === "contrat" && (
                <div style={{ borderTop: "2px solid #111", paddingTop: "10px" }}>
                  <div style={{ height: "60px", background: "#f8f8f8", borderRadius: "6px", marginBottom: "8px" }}/>
                  <div style={{ fontSize: "11px", color: "#888" }}>Contracteur — {company.name}</div>
                </div>
              )}
              <div style={{ borderTop: "2px solid #111", paddingTop: "10px" }}>
                <div style={{ height: "60px", background: "#f8f8f8", borderRadius: "6px", marginBottom: "8px" }}/>
                <div style={{ fontSize: "11px", color: "#888" }}>Client — {doc.client.name || "—"}</div>
              </div>
            </div>

            <div style={{ marginTop: "24px", display: "flex", gap: "10px" }}>
              <button onClick={() => setShowPreview(false)} style={{ flex: 1, padding: "12px", background: "#111", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>
                ✕ Fermer
              </button>
              <button onClick={() => window.print()} style={{ flex: 1, padding: "12px", background: typeMeta.color, color: "#000", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>
                🖨️ Imprimer / PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
