import { cn } from "@/lib/utils";

const steps = ["Identitas", "Alamat", "Jaringan", "Review"];

export function CustomerWizardStepper({ step }: { step: number }) {
  return (
    <ol className="grid gap-2 sm:grid-cols-4">
      {steps.map((label, index) => {
        const number = index + 1;
        const active = number === step;
        const done = number < step;
        return (
          <li
            key={label}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
              active && "border-primary/30 bg-primary/5 text-primary",
              done && "border-emerald-500/20 bg-emerald-500/5",
              !active && !done && "text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                active && "bg-primary text-primary-foreground",
                done && "bg-emerald-500 text-white",
                !active && !done && "bg-muted text-muted-foreground"
              )}
            >
              {done ? "✓" : number}
            </span>
            <span className="font-medium">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
