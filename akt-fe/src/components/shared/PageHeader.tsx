import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  headingLevel = "h1",
  children,
}: {
  title: string;
  description?: string;
  headingLevel?: "h1" | "h2";
  children?: ReactNode;
}) {
  const Heading = headingLevel;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <Heading className="text-2xl font-bold tracking-tight">{title}</Heading>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children ? (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      ) : null}
    </div>
  );
}
