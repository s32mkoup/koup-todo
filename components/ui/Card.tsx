import type { HTMLAttributes, ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

export default function Card({
  children,
  className = "",
  style,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-2xl p-4 ${className}`.trim()}
      style={{
        background: "#1B1F2C",
        border: "1px solid rgba(74, 69, 79, 0.20)",
        boxShadow: "none",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
