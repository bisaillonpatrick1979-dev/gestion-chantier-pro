"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEmployeeStore } from "@/store/useEmployeeStore";

export default function BottomNav() {
  const pathname = usePathname();
  const { currentEmployee } = useEmployeeStore();
  const isAdmin = currentEmployee?.role === "admin";

  function IconHome(active: boolean) {
    const c = active ? "#D4AF37" : "#666";
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <polyline points="3,11 12,2 21,11" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="5" y="11" width="14" height="11" rx="1" stroke={c} strokeWidth="2" fill="none" />
      </svg>
    );
  }

  function IconCalendar(active: boolean) {
    const c = active ? "#D4AF37" : "#666";
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke={c} strokeWidth="2" fill="none" />
        <line x1="16" y1="2" x2="16" y2="6" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="2" x2="8" y2="6" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <line x1="3" y1="10" x2="21" y2="10" stroke={c} strokeWidth="2" />
      </svg>
    );
  }

  function IconStats(active: boolean) {
    const c = active ? "#D4AF37" : "#666";
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <line x1="6" y1="20" x2="6" y2="14" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="20" x2="12" y2="4" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="20" x2="18" y2="10" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <line x1="2" y1="20" x2="22" y2="20" stroke={c} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  function IconDollar(active: boolean) {
    const c = active ? "#D4AF37" : "#666";
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <line x1="12" y1="1" x2="12" y2="23" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  function IconClients(active: boolean) {
    const c = active ? "#D4AF37" : "#666";
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="4" stroke={c} strokeWidth="2" fill="none" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M21 21v-2a4 4 0 0 0-3-3.87" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  function IconDocs(active: boolean) {
    const c = active ? "#D4AF37" : "#666";
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={c} strokeWidth="2" strokeLinejoin="round" fill="none" />
        <polyline points="14,2 14,8 20,8" stroke={c} strokeWidth="2" strokeLinejoin="round" fill="none" />
        <line x1="8" y1="13" x2="16" y2="13" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="17" x2="16" y2="17" stroke={c} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  function IconAccounting(active: boolean) {
    const c = active ? "#D4AF37" : "#666";
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="3" width="20" height="14" rx="2" stroke={c} strokeWidth="2" fill="none" />
        <line x1="8" y1="21" x2="16" y2="21" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="17" x2="12" y2="21" stroke={c} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  function IconCatalogue(active: boolean) {
    const c = active ? "#D4AF37" : "#666";
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <line x1="8" y1="6" x2="21" y2="6" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="12" x2="21" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="18" x2="21" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <circle cx="3" cy="6" r="1" fill={c} />
        <circle cx="3" cy="12" r="1" fill={c} />
        <circle cx="3" cy="18" r="1" fill={c} />
      </svg>
    );
  }

  function IconSettings(active: boolean) {
    const c = active ? "#D4AF37" : "#666";
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke={c} strokeWidth="2" fill="none" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={c} strokeWidth="2" fill="none" />
      </svg>
    );
  }

  const adminItems = [
    { href: "/dashboard", label: "Accueil", icon: IconHome },
    { href: "/calendar", label: "Calendrier", icon: IconCalendar },
    { href: "/stats", label: "Stats", icon: IconStats },
    { href: "/payroll", label: "Paye", icon: IconDollar },
    { href: "/clients", label: "Clients", icon: IconClients },
    { href: "/documents", label: "Docs", icon: IconDocs },
    { href: "/accounting", label: "Compta", icon: IconAccounting },
    { href: "/catalogue", label: "Catalogue", icon: IconCatalogue },
    { href: "/settings", label: "Réglages", icon: IconSettings },
  ];

  const employeeItems = [
    { href: "/dashboard", label: "Accueil", icon: IconHome },
    { href: "/stats", label: "Stats", icon: IconStats },
    { href: "/payroll", label: "Paye", icon: IconDollar },
  ];

  const items = isAdmin ? adminItems : employeeItems;

  return (
    <nav style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      backgroundColor: "#111",
      borderTop: "1px solid #222",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        height: "60px",
        overflowX: "auto",
        scrollbarWidth: "none",
      }}>
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "2px",
                minWidth: "52px",
                padding: "6px 4px",
                textDecoration: "none",
              }}
            >
              {item.icon(isActive)}
              <span style={{
                fontSize: "9px",
                fontWeight: isActive ? 700 : 400,
                color: isActive ? "#D4AF37" : "#666",
                whiteSpace: "nowrap",
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
