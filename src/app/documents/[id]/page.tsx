"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCompanyStore } from "@/store/useCompanyStore";
import { useClientStore } from "@/store/useClientStore";
import { useEmployeeStore } from "@/store/useEmployeeStore";

type DocType = "invoice" | "quote" | "contract";
type DocStatus = "draft" | "sent" | "paid" | "cancelled";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface DocumentData {
  id: string;
  type: DocType;
  status: DocStatus;
  number: string;
  date: string;
  dueDate: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  projectDescription: string;
  lineItems: LineItem[];
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  discountPercent: number;
  discountAmount: number;
  depositPercent: number;
  depositAmount: number;
  total: number;
  balanceDue: number;
  notes: string;
  signature: string;
  signatureDate: string;
  createdAt: string;
  updatedAt: string;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(n);
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function newLineItem(): LineItem {
  return { id: Math.random().toString(36).slice(2), description: "", quantity: 1, unitPrice: 0, total: 0 };
}

const card: React.CSSProperties = {
  background: "var(--card-bg, #1e1e1e)",
  border: "1px solid var(--border, #2a2a2a)",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "16px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--input-bg, #111)",
  border: "1px solid var(--border, #333)",
  borderRadius: "8px",
  padding: "10px 12px",
  color: "var(--text, #fff)",
  fontSize: "15px",
  boxSizing: "border-box",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  color: "#888",
  marginBottom: "4px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const btnGold: React.CSSProperties = {
  background: "linear-gradient(135deg, #D4AF37, #B8963E)",
  color: "#000",
  border: "none",
  borderRadius: "10px",
  padding: "14px 20px",
  fontWeight: 700,
  fontSize: "15px",
  cursor: "pointer",
  flex: 1,
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  readOnly = false,
}: {
  label: string;
  value: string | number;
  onChange?: (v: string) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{ ...inputStyle, opacity: readOnly ? 0.6 : 1 }}
      />
    </div>
  );
}

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;
  const isNew = docId === "new";

  const { company } = useCompanyStore();
  const { clients } = useClientStore();
  const { employees, currentEmployeeId } = useEmployeeStore();
  const currentEmployee = employees.find((e) => e.id === currentEmployeeId) ?? null;
  void currentEmployee;

  const [showClientPicker, setShowClientPicker] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "items" | "totals" | "notes">("info");
  const signatureRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const defaultDate = today();
  const defaultDueDate = addDays(defaultDate, company.defaultPaymentTermsDays || 14);

  const [doc, setDoc] = useState<DocumentData>({
    id: isNew ? Math.random().toString(36).slice(2) : docId,
    type: "invoice",
    status: "draft",
    number: "",
    date: defaultDate,
    dueDate: defaultDueDate,
    clientId: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    projectDescription: "",
    lineItems: [newLineItem()],
    subtotal: 0,
    gstRate: 5,
    gstAmount: 0,
    discountPercent: 0,
    discountAmount: 0,
    depositPercent: company.defaultDepositPercent || 30,
    depositAmount: 0,
    total: 0,
    balanceDue: 0,
    notes: company.defaultNotes || "",
    signature: "",
    signatureDate: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  useEffect(() => {
    if (isNew) {
      let num = "";
      if (doc.type === "invoice") {
        num = company.invoicePrefix + "-" + String(company.nextInvoiceNumber).padStart(3, "0");
      } else if (doc.type === "quote") {
        num = company.quotePrefix + "-" + String(company.nextQuoteNumber).padStart(3, "0");
      } else {
        num = company.contractPrefix + "-" + String(company.nextContractNumber).padStart(3, "0");
      }
      setDoc((d) => ({ ...d, number: num }));
    }
  }, [doc.type, isNew]);

  useEffect(() => {
    const subtotal = doc.lineItems.reduce((s, item) => s + item.total, 0);
    const discountAmount = (subtotal * doc.discountPercent) / 100;
    const afterDiscount = subtotal - discountAmount;
    const gstAmount = (afterDiscount * doc.gstRate) / 100;
    const total = afterDiscount + gstAmount;
    const depositAmount = (total * doc.depositPercent) / 100;
    const balanceDue = total - depositAmount;
    setDoc((d) => ({ ...d, subtotal, discountAmount, gstAmount, total, depositAmount, balanceDue }));
  }, [doc.lineItems, doc.discountPercent, doc.gstRate, doc.depositPercent]);

  function updateLineItem(id: string, field: keyof LineItem, value: string | number) {
    setDoc((d) => ({
      ...d,
      lineItems: d.lineItems.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          updated.total = Number(updated.quantity) * Number(updated.unitPrice);
        }
        return updated;
      }),
    }));
  }

  function addLineItem() {
    setDoc((d) => ({ ...d, lineItems: [...d.lineItems, newLineItem()] }));
  }

  function removeLineItem(id: string) {
    setDoc((d) => ({ ...d, lineItems: d.lineItems.filter((item) => item.id !== id) }));
  }

  function selectClient(clientId: string) {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    setDoc((d) => ({
      ...d,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email || "",
      clientPhone: client.phone || "",
      clientAddress: client.address || "",
    }));
    setShowClientPicker(false);
  }

  function saveDocument() {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.push("/documents");
    }, 1500);
  }

  const typeLabels: Record<DocType, string> = {
    invoice: "Facture",
    quote: "Devis",
    contract: "Contrat",
  };

  const statusColors: Record<DocStatus, string> = {
    draft: "#888",
    sent: "#3b82f6",
    paid: "#22c55e",
    cancelled: "#ef4444",
  };

  const statusLabels: Record<DocStatus, string> = {
    draft: "Brouillon",
    sent: "Envoye",
    paid: "Paye",
    cancelled: "Annule",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg, #111)", color: "var(--text, #fff)", paddingBottom: "100px" }}>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderBottom: "1px solid #222" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "1px solid #333", borderRadius: "8px", color: "#aaa", padding: "8px 12px", cursor: "pointer", fontSize: "14px" }}>
          Retour
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#D4AF37" }}>
            {isNew ? "Nouveau Document" : doc.number}
          </h1>
          <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>{company.name}</div>
        </div>
        <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: statusColors[doc.status] + "22", color: statusColors[doc.status], border: "1px solid " + statusColors[doc.status] + "44" }}>
          {statusLabels[doc.status]}
        </span>
      </div>

      {isNew && (
        <div style={{ display: "flex", gap: "8px", padding: "12px 16px", borderBottom: "1px solid #222" }}>
          {(["invoice", "quote", "contract"] as DocType[]).map((t) => (
            <button key={t} onClick={() => setDoc((d) => ({ ...d, type: t, number: "" }))}
              style={{ flex: 1, padding: "10px 4px", borderRadius: "10px", border: doc.type === t ? "none" : "1px solid #333", background: doc.type === t ? "linear-gradient(135deg,#D4AF37,#B8963E)" : "transparent", color: doc.type === t ? "#000" : "#aaa", fontWeight: doc.type === t ? 700 : 400, fontSize: "13px", cursor: "pointer" }}>
              {typeLabels[t]}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", borderBottom: "1px solid #222" }}>
        {[
          { id: "info", label: "Info" },
          { id: "items", label: "Articles" },
          { id: "totals", label: "Totaux" },
          { id: "notes", label: "Notes" },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{ flex: 1, padding: "12px 8px", border: "none", borderBottom: activeTab === tab.id ? "2px solid #D4AF37" : "2px solid transparent", background: "none", color: activeTab === tab.id ? "#D4AF37" : "#666", fontWeight: activeTab === tab.id ? 700 : 400, fontSize: "13px", cursor: "pointer" }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "16px" }}>

        {activeTab === "info" && (
          <>
            <div style={{ ...card, border: "1px solid #D4AF3733", background: "#1a1400" }}>
              <div style={{ fontSize: "11px", color: "#D4AF37", letterSpacing: "0.1em", marginBottom: "12px", textTransform: "uppercase" }}>
                De (Auto — Reglages)
              </div>
              <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "4px" }}>{company.name}</div>
              {company.tagline && (
                <div style={{ fontSize: "12px", color: "#D4AF37", marginBottom: "8px" }}>{company.tagline}</div>
              )}
              <div style={{ fontSize: "13px", color: "#aaa", lineHeight: "1.6" }}>
                {company.address && <div>{company.address}</div>}
                {(company.city || company.province) && (
                  <div>{company.city}{company.city && company.province ? ", " : ""}{company.province} {company.postalCode}</div>
                )}
                {company.phone && <div>{company.phone}</div>}
                {company.email && <div>{company.email}</div>}
                {company.gstNumber && <div>GST: {company.gstNumber}</div>}
                {company.wcbNumber && <div>WCB: {company.wcbNumber}</div>}
              </div>
            </div>

            <div style={card}>
              <Field label="Numero de document" value={doc.number} onChange={(v) => setDoc((d) => ({ ...d, number: v }))} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <Field label="Date" value={doc.date} onChange={(v) => setDoc((d) => ({ ...d, date: v }))} type="date" />
                <Field label="Echeance" value={doc.dueDate} onChange={(v) => setDoc((d) => ({ ...d, dueDate: v }))} type="date" />
              </div>
            </div>

            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontWeight: 700 }}>Client</span>
                <button onClick={() => setShowClientPicker(true)} style={{ background: "#1a2e1a", border: "1px solid #3a5a20", color: "#86efac", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "13px" }}>
                  Choisir client
                </button>
              </div>
              <Field label="Nom" value={doc.clientName} onChange={(v) => setDoc((d) => ({ ...d, clientName: v }))} placeholder="Nom du client" />
              <Field label="Courriel" value={doc.clientEmail} onChange={(v) => setDoc((d) => ({ ...d, clientEmail: v }))} type="email" />
              <Field label="Telephone" value={doc.clientPhone} onChange={(v) => setDoc((d) => ({ ...d, clientPhone: v }))} type="tel" />
              <Field label="Adresse" value={doc.clientAddress} onChange={(v) => setDoc((d) => ({ ...d, clientAddress: v }))} />
            </div>

            <div style={card}>
              <label style={labelStyle}>Description du projet</label>
              <textarea value={doc.projectDescription} onChange={(e) => setDoc((d) => ({ ...d, projectDescription: e.target.value }))} rows={4} placeholder="Description des travaux..." style={{ ...inputStyle, resize: "vertical" }} />
            </div>
          </>
        )}

        {activeTab === "items" && (
          <div style={card}>
            <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Articles / Services</h3>
            {doc.lineItems.map((item, idx) => (
              <div key={item.id} style={{ background: "#111", borderRadius: "10px", padding: "14px", marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#666" }}>Article {idx + 1}</span>
                  {doc.lineItems.length > 1 && (
                    <button onClick={() => removeLineItem(item.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "20px", lineHeight: "1" }}>x</button>
                  )}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <label style={labelStyle}>Description</label>
                  <input type="text" value={item.description} onChange={(e) => updateLineItem(item.id, "description", e.target.value)} placeholder="Description..." style={inputStyle} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  <div>
                    <label style={labelStyle}>Qte</label>
                    <input type="number" value={item.quantity} onChange={(e) => updateLineItem(item.id, "quantity", Number(e.target.value))} min="0" step="0.5" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Prix unit.</label>
                    <input type="number" value={item.unitPrice} onChange={(e) => updateLineItem(item.id, "unitPrice", Number(e.target.value))} min="0" step="0.01" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Total</label>
                    <input type="text" value={formatCurrency(item.total)} readOnly style={{ ...inputStyle, opacity: 0.6 }} />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addLineItem} style={{ width: "100%", padding: "12px", background: "transparent", border: "2px dashed #333", borderRadius: "10px", color: "#D4AF37", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
              + Ajouter un article
            </button>
          </div>
        )}

        {activeTab === "totals" && (
          <>
            <div style={card}>
              <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Totaux</h3>
              <div style={{ marginBottom: "12px" }}>
                <label style={labelStyle}>Remise (%)</label>
                <input type="number" value={doc.discountPercent} onChange={(e) => setDoc((d) => ({ ...d, discountPercent: Number(e.target.value) }))} min="0" max="100" style={inputStyle} />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label style={labelStyle}>Depot requis (%)</label>
                <input type="number" value={doc.depositPercent} onChange={(e) => setDoc((d) => ({ ...d, depositPercent: Number(e.target.value) }))} min="0" max="100" style={inputStyle} />
              </div>
              <div style={{ background: "#111", borderRadius: "10px", padding: "16px", marginTop: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", color: "#aaa" }}>
                  <span>Sous-total</span><span>{formatCurrency(doc.subtotal)}</span>
                </div>
                {doc.discountPercent > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", color: "#22c55e" }}>
                    <span>Remise ({doc.discountPercent}%)</span><span>-{formatCurrency(doc.discountAmount)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", color: "#aaa" }}>
                  <span>GST (5% Alberta)</span><span>{formatCurrency(doc.gstAmount)}</span>
                </div>
                <div style={{ borderTop: "1px solid #333", paddingTop: "12px", marginTop: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "20px", fontWeight: 800, color: "#D4AF37", marginBottom: "12px" }}>
                    <span>TOTAL</span><span>{formatCurrency(doc.total)}</span>
                  </div>
                  {doc.depositPercent > 0 && (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#3b82f6", marginBottom: "6px" }}>
                        <span>Depot ({doc.depositPercent}%)</span><span>{formatCurrency(doc.depositAmount)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: 700, color: "#ef4444" }}>
                        <span>Solde du</span><span>{formatCurrency(doc.balanceDue)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            {(company.etransferEmail || company.bankName) && (
              <div style={{ ...card, border: "1px solid #1e3a5f" }}>
                <div style={{ fontSize: "11px", color: "#3b82f6", letterSpacing: "0.1em", marginBottom: "10px", textTransform: "uppercase" }}>
                  Paiement (Auto — Reglages)
                </div>
                {company.etransferEmail && (
                  <div style={{ fontSize: "14px", color: "#aaa", marginBottom: "4px" }}>
                    Interac e-Transfer: <strong style={{ color: "#fff" }}>{company.etransferEmail}</strong>
                  </div>
                )}
                {company.bankName && (
                  <div style={{ fontSize: "14px", color: "#aaa" }}>
                    {company.bankName}{company.bankAccount && " — Compte: " + company.bankAccount}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === "notes" && (
          <div style={card}>
            <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Notes et Signature</h3>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Notes pour le client</label>
              <textarea value={doc.notes} onChange={(e) => setDoc((d) => ({ ...d, notes: e.target.value }))} rows={5} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div style={{ background: "#111", borderRadius: "10px", padding: "14px" }}>
              <label style={{ ...labelStyle, marginBottom: "10px", display: "block" }}>Zone de signature</label>
              <canvas
                ref={signatureRef}
                width={320}
                height={120}
                style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", touchAction: "none", display: "block", width: "100%" }}
                onMouseDown={() => setIsDrawing(true)}
                onMouseUp={() => setIsDrawing(false)}
                onMouseMove={(e) => {
                  if (!isDrawing || !signatureRef.current) return;
                  const ctx = signatureRef.current.getContext("2d");
                  if (!ctx) return;
                  const rect = signatureRef.current.getBoundingClientRect();
                  const scaleX = signatureRef.current.width / rect.width;
                  const scaleY = signatureRef.current.height / rect.height;
                  ctx.strokeStyle = "#D4AF37";
                  ctx.lineWidth = 2;
                  ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
                  ctx.stroke();
                  ctx.beginPath();
                  ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  setIsDrawing(true);
                  signatureRef.current?.getContext("2d")?.beginPath();
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  if (!isDrawing || !signatureRef.current) return;
                  const ctx = signatureRef.current.getContext("2d");
                  if (!ctx) return;
                  const rect = signatureRef.current.getBoundingClientRect();
                  const scaleX = signatureRef.current.width / rect.width;
                  const scaleY = signatureRef.current.height / rect.height;
                  const touch = e.touches[0];
                  ctx.strokeStyle = "#D4AF37";
                  ctx.lineWidth = 2;
                  ctx.lineTo((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY);
                  ctx.stroke();
                  ctx.beginPath();
                  ctx.moveTo((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY);
                }}
                onTouchEnd={() => setIsDrawing(false)}
              />
              <button
                onClick={() => {
                  const ctx = signatureRef.current?.getContext("2d");
                  if (ctx && signatureRef.current) {
                    ctx.clearRect(0, 0, signatureRef.current.width, signatureRef.current.height);
                  }
                }}
                style={{ marginTop: "8px", background: "none", border: "1px solid #333", color: "#888", borderRadius: "6px", padding: "6px 14px", cursor: "pointer", fontSize: "13px" }}>
                Effacer
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button style={btnGold} onClick={saveDocument}>
            {saved ? "Sauvegarde!" : isNew ? "Creer le document" : "Sauvegarder"}
          </button>
        </div>
      </div>

      {showClientPicker && (
        <div style={{ position: "fixed", inset: 0, background: "#000b", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setShowClientPicker(false)}>
          <div style={{ background: "#1a1a1a", width: "100%", maxHeight: "70vh", borderRadius: "20px 20px 0 0", padding: "20px", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Choisir un client</h3>
            {clients.length === 0 ? (
              <p style={{ color: "#666", textAlign: "center" }}>Aucun client. Ajoutez-en dans Clients.</p>
            ) : (
              clients.map((client) => (
                <button key={client.id} onClick={() => selectClient(client.id)}
                  style={{ display: "block", width: "100%", background: "#111", border: "1px solid #333", borderRadius: "10px", padding: "14px", color: "#fff", textAlign: "left", cursor: "pointer", marginBottom: "8px" }}>
                  <div style={{ fontWeight: 700 }}>{client.name}</div>
                  {client.email && <div style={{ fontSize: "12px", color: "#888" }}>{client.email}</div>}
                  {client.phone && <div style={{ fontSize: "12px", color: "#888" }}>{client.phone}</div>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
      }
