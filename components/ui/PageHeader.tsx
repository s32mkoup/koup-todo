import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
  rightAction?: ReactNode;
};

export default function PageHeader({
  title,
  subtitle,
  backHref,
  rightAction,
}: PageHeaderProps) {
  return (
    <header className="bg-transparent px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {backHref ? (
            <Link
              aria-label="Go back"
              href={backHref}
              className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B1F2C] text-[#DFE2F3] transition duration-150 ease-out hover:bg-[#313442] active:scale-[0.97]"
            >
              <ArrowLeft size={20} strokeWidth={1.8} />
            </Link>
          ) : null}
          <div className="min-w-0">
            <h1
              className="truncate text-[28px] font-bold leading-[1.1] tracking-[-0.02em] text-[#DFE2F3]"
              style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif" }}
            >
              {title}
            </h1>
            {subtitle ? (
              <p
                className="mt-1 text-[13px] leading-[1.6] text-[rgba(223,226,243,0.60)]"
                style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {rightAction ? <div className="shrink-0">{rightAction}</div> : null}
      </div>
    </header>
  );
}
