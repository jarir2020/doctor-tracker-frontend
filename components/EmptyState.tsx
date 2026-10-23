import { Icon } from "./Icon";

export function EmptyState({ title, description, icon = "activity" }: { title: string; description: string; icon?: "activity" | "doctor" | "patient" }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon name={icon} size={24} /></span>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
