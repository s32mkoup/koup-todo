"use client";

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

import LoadingSpinner from "./LoadingSpinner";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-[52px] px-6 text-[15px]",
  lg: "min-h-14 px-7 text-base",
};

const variantStyles: Record<ButtonVariant, { className: string; style?: CSSProperties }> = {
  primary: {
    className:
      "text-[#0F131F] hover:opacity-95 active:scale-[0.98] active:opacity-75",
    style: {
      background: "linear-gradient(135deg, #D6BAFF, #7B5EA7)",
    },
  },
  secondary: {
    className:
      "text-[#DFE2F3] hover:bg-[rgba(223,226,243,0.08)] active:scale-[0.98]",
    style: {
      background: "rgba(15, 19, 31, 0.6)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(74, 69, 79, 0.20)",
    },
  },
  danger: {
    className:
      "bg-[#FF6B6B] text-[#0F131F] hover:bg-[#ff7e7e] active:scale-[0.98]",
  },
  ghost: {
    className:
      "bg-transparent text-[#D6BAFF] hover:bg-[rgba(214,186,255,0.08)] active:scale-[0.98]",
  },
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  className = "",
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const variantStyle = variantStyles[variant];

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-[0.01em] transition duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#41E4C0]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F131F]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        sizeClasses[size],
        variantStyle.className,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        fontFamily: "var(--font-manrope), Manrope, sans-serif",
        borderRadius: "12px",
        ...variantStyle.style,
        ...style,
      }}
      {...props}
    >
      {loading ? <LoadingSpinner size="sm" /> : null}
      <span>{children}</span>
    </button>
  );
}
