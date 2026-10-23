/** Doctor Tracker: Displays one labeled practice metric with its icon and visual tone. */
import { Icon } from "./Icon";
import type { IconName } from "./Icon";

/** Display one dashboard total with its note, icon, and color treatment. */
export function StatCard({
  label,
  value,
  note,
  icon,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  icon: IconName;
  tone: "blue" | "mint" | "violet" | "amber";
}) {
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <span className={`stat-icon ${tone}`}><Icon name={icon} size={20} /></span>
        <span className="stat-note">{note}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </article>
  );
}
