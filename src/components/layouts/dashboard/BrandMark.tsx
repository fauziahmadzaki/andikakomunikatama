import Image from "next/image";
import Link from "next/link";

import { dashboardHref } from "./data/navigation";
import { cn } from "@/lib/utils";

export function BrandMark({
  onNavigate,
  collapsed = false,
  className,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={dashboardHref}
      onClick={onNavigate}
      className={cn("flex items-center gap-2", className)}
    >
      <Image
        src="/assets/logo.png"
        alt="Logo MuraNET"
        width={446}
        height={446}
        className="size-6 shrink-0 object-contain"
      />
      {collapsed ? null : (
        <>
          <span className="text-sm font-bold tracking-tight">
            <span className="text-brand-red-600">MURA</span>
            <span className="text-brand-blue-700">NET</span>
          </span>
          <span className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            Internal
          </span>
        </>
      )}
    </Link>
  );
}
