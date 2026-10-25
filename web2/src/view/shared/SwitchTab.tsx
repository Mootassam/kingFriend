import { KeyboardEvent, ReactNode } from "react";

interface Props<T extends string> {
  items: readonly T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  badges?: Partial<Record<T, number>>;
  icons?: Partial<Record<T, ReactNode>>;
}

// Accessible tab strip: arrow keys, Home and End move the selection.
export default function SwitchTab<T extends string>({
  items,
  value,
  onChange,
  className = "",
  badges,
  icons,
}: Props<T>) {
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, item: T) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const index =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : (items.indexOf(item) + step + items.length) % items.length;
    onChange(items[index]);
    (event.currentTarget.parentElement?.children[index] as HTMLElement | undefined)?.focus();
  };

  return (
    <div className={"tabs " + className} role="tablist">
      {items.map((item) => (
        <button
          key={item}
          role="tab"
          aria-selected={value === item}
          tabIndex={value === item ? 0 : -1}
          className={value === item ? "selected" : ""}
          onClick={() => onChange(item)}
          onKeyDown={(e) => onKeyDown(e, item)}
        >
          {icons?.[item] && (
            <span className="tab-icon" aria-hidden="true">
              {icons[item]}
            </span>
          )}
          {item}
          {badges?.[item] !== undefined && (
            <span className="tab-count" aria-label={`${badges[item]} items`}>
              {badges[item]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
