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
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
  }).format(n);
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
  return {
    id: Math.random().toString(36).slice(2),
    description: "",
    quantity: 1,
    unitPrice: 0,
    total: 0,
  };
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
        num = `${company.invoicePrefix}-${String(company.nextInvoiceNumber).padStart(3, "0")}`;
      } else if (doc.type === "quote") {
        num = `${company.quotePrefix}-${String(company.nextQuoteNumber).padStart(3, "0")}`;
      } else {
        num = `${company.contractPrefix}-${String(company.nextContractNumber).padStart(3, "0")}`;
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
    sent: "Envoyé",
    paid: "Payé",
    cancelled: "Annulé",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg, #111)", color: "var(--text, #fff)", paddingBottom: "100px" }}>

      {/* Header */}
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
        <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: statusColors[doc.status] + "22", color: statusColors[doc.status], border: `1px solid ${statusColors[doc.status]}44` }}>
          {statusLabels[doc.status]}
        </span>
      </div>

      {/* Type selector */}
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

      {/* Tabs */}
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

        {/* INFO */}
        {activeTab === "info" && (
          <>
            <div style={{ ...card, border: "1px solid #D4AF3733", background: "#1a1400" }}>
              <div style={{ fontSize: "11px", color: "#D4AF37", letterSpacing: "0.1em", marginBottom: "12px", textTransform: "uppercase" }}>
                De (Auto — Réglages)
              </div>
              <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "4px" }}>{company.name}</div>
              {company.tagline && <div style={{ fontSize: "12px", color: "#D4AF37", marginBottom: "8px" }}>{company.tagline}</div>}
              <div style={{ fontSize: "13px", color: "#aaa", lineHeight: "1.6" }}>
                {[
                  company.address,
                  company.city && company.province ? `${company.city}, ${company.province} ${company.postalCode}` : "",
                  company.phone,
                  company.email,
                  company.gstNumber && `GST: ${company.gstNumber}`,
                  company.wcbNumb
