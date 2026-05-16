"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEmployeeStore } from "@/store/useEmployeeStore";

interface NavItem {
  href: string;
  label: string;
  labelEn: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

function IconDashboard({ active }: { active: boolean }) {
  const color = active ? "#D4AF37" : "#888";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function IconCalendar({ active }: { active: boolean }) {
  const color = active ? "#D4AF37" : "#888";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconStats({ active }: { active: boolean }) {
  const color = active ? "#D4AF37" : "#888";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

function IconDollar({ active }: { active: boolean }) {
  const color = active ? "#D4AF37" : "#888";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function IconClients({ active }: { active: boolean }) {
  const color = active ? "#D4AF37" : "#888";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconDocuments({ active }: { active: boolean }) {
  const color = active ? "#D4AF37" : "#888";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

function IconAccounting({ active }: { active: boolean }) {
  const color = active ? "#D4AF37" : "#888";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function IconSettings({ active }: { active: boolean }) {
  const color = active ? "#D4AF37" : "#888";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconCatalogue({ active }: { active: boolean }) {
  const color = active ? "#D4AF37" : "#888";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function IconPayroll({ active }: { active: boolean }) {
  const color = active ? "#D4AF37" : "#888";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const { currentEmployee } = useEmployeeStore();

  const isAdmin = currentEmployee?.role === "admin";
  const lang = "fr"; // Remplace par ton store de langue si disponible

  const allNavItems: NavItem[] = [
    {
      href: "/dashboard",
      label: "Accueil",
      labelEn: "Home",
      icon: null,
      adminOnly: false,
    },
    {
      href: "/calendar",
      label: "Calendrier",
      labelEn: "Calendar",
      icon: null,
      adminOnly: false,
    },
    {
      href: "/stats",
      label: "Stats",
      labelEn: "Stats",
      icon: null,
      adminOnly: false,
    },
    {
      href: "/payroll",
      label: "Paye",
      labelEn: "Payroll",
      icon: null,
      adminOnly: false,
    },
    {
      href: "/clients",
      label: "Clients",
      labelEn: "Clients",
      icon: null,
      adminOnly: true,
    },
    {
      href: "/documents",
      label: "Docs",
      labelEn: "Docs",
      icon: null,
      adminOnly: true,
    },
    {
      href: "/accounting",
      label: "Compta",
      labelEn: "Accounting",
      icon: null,
      adminOnly: true,
    },
    {
      href: "/catalogue",
      label: "Catalogue",
      labelEn: "Catalogue",
      icon: null,
      adminOnly: true,
    },
    {
      href: "/settings",
      label: "Reglages",
      labelEn: "Settings",
      icon: null,
      adminOnly: true,
    },
  ];

  const iconMap: Record<string, (active: boolean) => React.ReactNode> = {
    "/dashboard": (active) => <IconDashboard active={active} />,
    "/calendar": (active) => <IconCalendar active={active} />,
    "/stats": (active) => <IconStats active={active} />,
    "/payroll": (active) => <IconPayroll active={active} />,
    "/clients": (active) => <IconClients active={active} />,
    "/documents": (active) => <IconDocuments active={active} />,
    "/accounting": (active) => <IconAccounting active={active} />,
    "/catalogue": (active) => <IconCatalogue active={active} />,
    "/settings": (active) => <IconSettings active={active} />,
  };

  const visibleItems = allNavItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: "var(--nav-bg, #1a1a1a)",
        borderTop: "1px solid var(--nav-border, #2a2a2a)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          height: "60px",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const iconRenderer = iconMap[item.href];
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
                opacity: isActive ? 1 : 0.6,
                transition: "opacity 0.2s",
              }}
            >
              {iconRenderer ? iconRenderer(isActive) : null}
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? "#D4AF37" : "#888",
                  letterSpacing: "0.03em",
                  whiteSpace: "nowrap",
                }}
              >
                {lang === "fr" ? item.label : item.labelEn}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
