import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function SidebarNavLink({
  href,
  title,
  active,
  icon: Icon,
  child = false,
  iconOnly = false,
  onNavigate,
}: {
  href: string;
  title: string;
  active: boolean;
  icon?: LucideIcon;
  child?: boolean;
  iconOnly?: boolean;
  onNavigate?: () => void;
}) {
  if (iconOnly && Icon) {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        title={title}
        aria-label={title}
        className={cn(
          "relative flex size-9 items-center justify-center rounded-lg transition-colors",
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {active ? (
          <div
            aria-hidden="true"
            className="absolute inset-y-0 -left-2 w-[3px] rounded-full bg-primary"
          />
        ) : null}
        <Icon aria-hidden="true" className="size-4" />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "relative flex items-center transition-colors",
        child
          ? "rounded-md px-3 py-1.5 text-sm"
          : "gap-2.5 rounded-lg px-3 py-2 text-sm font-medium",
        active
          ? "bg-primary/10 font-medium text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {active ? (
        <div
          aria-hidden="true"
          className="absolute inset-y-0 -left-2 w-[3px] rounded-full bg-primary"
        />
      ) : null}
      {Icon ? <Icon aria-hidden="true" className="size-4" /> : null}
      <span>{title}</span>
    </Link>
  );
}
