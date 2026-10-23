/** Doctor Tracker: Renders a reusable message for lists or charts with no matching data. */
import { Icon } from "./Icon";

/** Provides a consistent icon, title, and explanation when a view has no rows. */
export function EmptyState({ title, description, icon = "activity" }: { title: string; description: string; icon?: "activity" | "doctor" | "patient" }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon name={icon} size={24} /></span>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
