import { Icon } from "./Icon";
import type { IconName } from "./Icon";

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
