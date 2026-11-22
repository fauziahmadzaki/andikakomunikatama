import { cn } from "@/lib/utils";

export function ColorSwatch({
  name,
  className,
  showToken = false,
}: {
  name: string;
  className: string;
  showToken?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          "h-12 rounded-lg ring-1 ring-foreground/15 ring-inset",
          className
        )}
      />
      <p className="truncate text-xs font-medium">{name}</p>
      {showToken ? (
        <p className="truncate font-mono text-[10px] text-muted-foreground">
          {className.replace("bg-", "--color-")}
        </p>
      ) : null}
    </div>
  );
}
