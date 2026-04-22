import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="text-5xl leading-none">{icon}</div>
      <h2
        className="mt-5 text-[18px] font-semibold leading-[1.1] text-[#DFE2F3]"
        style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif" }}
      >
        {title}
      </h2>
      <p
        className="mt-3 max-w-sm text-sm leading-[1.6] text-[rgba(223,226,243,0.60)]"
        style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
      >
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
