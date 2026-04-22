"use client";

import type { InputHTMLAttributes } from "react";

type InputProps = {
  label?: string;
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  label,
  id,
  className = "",
  style,
  ...props
}: InputProps) {
  return (
    <label
      className="flex w-full flex-col gap-1.5"
      style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
    >
      {label ? (
        <span className="text-xs font-medium tracking-[0.03em] text-[rgba(223,226,243,0.60)]">
          {label}
        </span>
      ) : null}
      <input
        id={id}
        className={[
          "w-full rounded-xl border px-4 py-3 text-[15px] text-[#DFE2F3] outline-none transition duration-150 ease-out",
          "placeholder:text-[rgba(223,226,243,0.30)]",
          "focus:border-[#41E4C0] focus:shadow-[0_0_0_3px_rgba(65,228,192,0.12)]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          background: "#0A0E1A",
          borderColor: "rgba(255,255,255,0.10)",
          fontFamily: "var(--font-manrope), Manrope, sans-serif",
          ...style,
        }}
        {...props}
      />
    </label>
  );
}
