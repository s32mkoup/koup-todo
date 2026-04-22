type BadgeVariant = "violet" | "teal" | "amber" | "coral" | "green";

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  className?: string;
};

const variantStyles: Record<BadgeVariant, { background: string; color: string }> = {
  violet: {
    background: "rgba(123, 94, 167, 0.20)",
    color: "#D6BAFF",
  },
  teal: {
    background: "rgba(65, 228, 192, 0.15)",
    color: "#41E4C0",
  },
  amber: {
    background: "rgba(255, 185, 85, 0.15)",
    color: "#FFB955",
  },
  coral: {
    background: "rgba(255, 107, 107, 0.15)",
    color: "#FF6B6B",
  },
  green: {
    background: "rgba(93, 214, 125, 0.15)",
    color: "#5DD67D",
  },
};

export default function Badge({
  label,
  variant = "violet",
  className = "",
}: BadgeProps) {
  const colors = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.05em] ${className}`.trim()}
      style={{
        background: colors.background,
        color: colors.color,
        fontFamily: "var(--font-manrope), Manrope, sans-serif",
      }}
    >
      {label}
    </span>
  );
}
