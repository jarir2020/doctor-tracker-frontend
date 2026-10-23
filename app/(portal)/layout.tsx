/** Doctor Tracker: Wraps protected portal routes with the authenticated application shell. */
import { PortalShell } from "@/components/PortalShell";
import { Suspense, type ReactNode } from "react";

/** Adds the shared portal shell and a suspense fallback to protected routes. */
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="boot-screen"><div className="boot-mark">D</div><span className="loading-dot" /><p>Opening your workspace…</p></div>}>
      <PortalShell>{children}</PortalShell>
    </Suspense>
  );
}
