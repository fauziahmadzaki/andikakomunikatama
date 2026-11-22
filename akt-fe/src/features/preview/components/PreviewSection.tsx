import type { ReactNode } from "react";

export function PreviewSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-32 space-y-4"
    >
      <div className="space-y-1">
        <h2
          id={`${id}-heading`}
          className="text-xl font-bold tracking-tight"
        >
          {title}
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
