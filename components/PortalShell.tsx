/** Doctor Tracker: Checks the administrator session and builds the responsive portal navigation. */
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { apiRequest } from "@/lib/api";
import { initials } from "@/lib/format";
import type { Admin } from "@/lib/types";
import { Icon } from "./Icon";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: "dashboard" as const },
  { href: "/doctors", label: "Doctors", icon: "doctor" as const },
  { href: "/patients", label: "Patients", icon: "patient" as const },
];

/** Pick the breadcrumb label for the active portal path. */
function titleForPath(path: string) {
  if (path.startsWith("/doctors/")) return "Doctor profile";
  if (path.startsWith("/doctors")) return "Doctors";
  if (path.startsWith("/patients")) return "Patients";
  return "Overview";
}

/** Guard portal content with the admin session and render responsive navigation. */
export function PortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    // Resolve the session before exposing protected content to the user.
    apiRequest<{ admin: Admin }>("/auth/me")
      .then(({ admin: currentAdmin }) => {
        if (active) setAdmin(currentAdmin);
      })
      .catch(() => {
        if (active) router.replace("/login");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [router]);

  /** Destroy the server session and return to the sign-in page. */
  async function signOut() {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
    }
  }

  const waitingForAdmin = loading || !admin;
  const adminName = admin?.name || "Administrator";

  return (
    <>
      {waitingForAdmin && (
        <div className="boot-screen" role="status" aria-live="polite">
          <div className="boot-mark">D</div>
          <span className="loading-dot" />
          <p>Opening your workspace…</p>
        </div>
      )}
      {/* Keep the protected route tree mounted but hidden while auth is unresolved. */}
      <div
        className="portal-shell"
        aria-hidden={waitingForAdmin}
        hidden={waitingForAdmin}
        style={waitingForAdmin ? { display: "none" } : undefined}
      >
        {menuOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
        <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
          <Link className="brand-lockup" href="/dashboard" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark">D</span>
            <span><strong>doctor<span>track</span></strong><small>CARE OPERATIONS</small></span>
          </Link>

          <div className="nav-caption">WORKSPACE</div>
          <nav className="side-nav" aria-label="Main navigation">
            {navigation.map((item) => {
              const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${active ? "active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon name={item.icon} size={19} />
                  <span>{item.label}</span>
                  {active && <i className="nav-active-dot" />}
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-bottom">
            <div className="support-card">
              <span className="support-orbit"><Icon name="activity" size={18} /></span>
              <strong>Care, connected.</strong>
              <p>One calm view of your practice.</p>
            </div>
            <div className="sidebar-user">
              <span className="avatar avatar-sidebar">{initials(adminName)}</span>
              <span className="sidebar-user-copy"><strong>{adminName}</strong><small>Administrator</small></span>
              <button className="sidebar-logout" type="button" onClick={signOut} aria-label="Sign out" title="Sign out">
                <Icon name="logout" size={17} />
              </button>
            </div>
          </div>
        </aside>

        <div className="portal-main">
          <header className="topbar">
            <div className="topbar-left">
              <button className="mobile-menu icon-button" type="button" onClick={() => setMenuOpen(true)} aria-label="Open navigation">
                <Icon name="menu" />
              </button>
              <div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{titleForPath(pathname)}</strong></div>
            </div>
            <div className="topbar-right">
              <span className="today-label">Care dashboard</span>
              <span className="topbar-divider" />
              <span className="avatar avatar-top">{initials(adminName)}</span>
              <div className="topbar-user"><strong>{adminName}</strong><small>Admin</small></div>
            </div>
          </header>
          <main className="page-content">{children}</main>
          <footer className="portal-footer"><span>DoctorTrack</span><span>Organized care starts here</span></footer>
        </div>
      </div>
    </>
  );
}
