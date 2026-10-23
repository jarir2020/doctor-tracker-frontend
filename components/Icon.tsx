/** Doctor Tracker: Maps typed icon names to accessible, inline SVG drawings. */
import type { ReactNode } from "react";

export type IconName =
  | "dashboard" | "doctor" | "patient" | "calendar" | "search" | "plus"
  | "chevron-left" | "chevron-right" | "close" | "edit" | "trash"
  | "logout" | "menu" | "activity" | "hospital" | "arrow-up" | "arrow-right"
  | "filter" | "check";

// Each typed name maps to the SVG geometry used by the shared Icon component.
const drawings: Record<IconName, ReactNode> = {
  dashboard: <><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="5" rx="2" /><rect x="13" y="10" width="8" height="11" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /></>,
  doctor: <><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" /><path d="M4 21a8 8 0 0 1 16 0M19 7v6m-3-3h6" /></>,
  patient: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 8v6m-3-3h6" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  "chevron-left": <><path d="m15 18-6-6 6-6" /></>,
  "chevron-right": <><path d="m9 18 6-6-6-6" /></>,
  close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
  trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 15H6L5 6m4 4v7m6-7v7" /></>,
  logout: <><path d="M10 17l5-5-5-5m5 5H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  activity: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,
  hospital: <><path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16M2 21h20M9 21v-5h6v5M9 7h.01M15 7h.01M9 11h.01M15 11h.01" /><path d="M12 7v4m-2-2h4" /></>,
  "arrow-up": <><path d="M12 19V5m-7 7 7-7 7 7" /></>,
  "arrow-right": <><path d="M5 12h14m-7-7 7 7-7 7" /></>,
  filter: <><path d="M4 5h16M7 12h10m-7 7h4" /></>,
  check: <><path d="m5 12 4 4L19 6" /></>,
};

/** Render a decorative inline SVG icon with consistent stroke styling. */
export function Icon({ name, size = 20, strokeWidth = 1.8 }: { name: IconName; size?: number; strokeWidth?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {drawings[name]}
    </svg>
  );
}
