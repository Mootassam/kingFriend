import { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  heading: string;
  description?: string;
}

export default function EmptyState({ icon, heading, description }: Props) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <h3>{heading}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}
