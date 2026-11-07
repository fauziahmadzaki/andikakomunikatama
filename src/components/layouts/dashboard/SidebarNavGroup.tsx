import { ChevronDownIcon } from "lucide-react";

import { SidebarNavLink } from "./SidebarNavLink";
import type { NavGroup } from "./data/navigation";
import { cn } from "@/lib/utils";

export function SidebarNavGroup({
  group,
  activeHref,
  open,
  onToggle,
  onNavigate,
}: {
  group: NavGroup;
  activeHref?: string;
  open: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const groupActive = group.items.some((item) => item.href === activeHref);
  const panelId = `nav-${group.title.toLowerCase()}`;

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          groupActive
            ? "text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <group.icon aria-hidden="true" className="size-4" />
        <span className="flex-1 text-left">{group.title}</span>
        <ChevronDownIcon
          aria-hidden="true"
          className={cn(
            "size-4 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div id={panelId} className="mt-1 ml-5 space-y-0.5 border-l pl-2">
          {group.items.map((item) => (
            <SidebarNavLink
              key={item.href}
              href={item.href}
              title={item.title}
              active={item.href === activeHref}
              child
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
