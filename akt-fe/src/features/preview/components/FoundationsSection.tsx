import {
  brandColorGroups,
  chartColorTokens,
  headingScaleTokens,
  radiusTokens,
  semanticColorTokens,
  typeScaleTokens,
} from "@/features/preview/data/preview-data";
import { ColorSwatch } from "./ColorSwatch";
import { PreviewSection } from "./PreviewSection";
import { PreviewSpecimen } from "./PreviewSpecimen";

const textRoles = [
  {
    label: "Judul halaman",
    description: "text-2xl · bold · tracking-tight",
    className: "text-2xl font-bold tracking-tight",
  },
  {
    label: "Label kartu",
    description: "text-sm · muted-foreground",
    className: "text-sm text-muted-foreground",
  },
  {
    label: "Angka KPI",
    description: "text-2xl · bold · tracking-tight",
    className: "text-2xl font-bold tracking-tight",
  },
  {
    label: "Metadata",
    description: "text-xs · muted-foreground",
    className: "text-xs text-muted-foreground",
  },
  {
    label: "ID teknis",
    description: "font-mono · text-xs",
    className: "font-mono text-xs",
  },
];

export function FoundationsSection() {
  return (
    <PreviewSection
      id="fondasi"
      title="Fondasi"
      description="Warna, tipografi, radius, dan elevasi yang menjadi dasar seluruh tampilan. Semua nilai berasal dari token di globals.css."
    >
      <PreviewSpecimen
        title="Palet brand"
        description="brand-blue · brand-red · brand-neutral"
      >
        <div className="space-y-5">
          {brandColorGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
                <p className="text-xs font-semibold">{group.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {group.description}
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-11">
                {group.tokens.map((token) => (
                  <ColorSwatch
                    key={token.name}
                    name={token.name}
                    className={token.className}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Token semantik"
        description="Gunakan token ini, bukan warna mentah"
      >
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {semanticColorTokens.map((token) => (
            <ColorSwatch
              key={token.name}
              name={token.name}
              className={token.className}
              showToken
            />
          ))}
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Warna chart"
        description="chart-1 sampai chart-5"
      >
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {chartColorTokens.map((token) => (
            <ColorSwatch
              key={token.name}
              name={token.name}
              className={token.className}
              showToken
            />
          ))}
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Skala display"
        description="text-display · text-title · text-subtitle"
      >
        <div className="divide-y">
          {typeScaleTokens.map((token) => (
            <div
              key={token.token}
              className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
              <div className="shrink-0">
                <p className="font-mono text-xs text-muted-foreground">
                  {token.token}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {token.description}
                </p>
              </div>
              <p className={`${token.className} truncate font-heading`}>
                {token.label}
              </p>
            </div>
          ))}
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Skala heading"
        description="h2 sampai h6"
      >
        <div className="divide-y">
          {headingScaleTokens.map((token) => (
            <div
              key={token.label}
              className="flex items-baseline justify-between gap-4 py-2 first:pt-0 last:pb-0"
            >
              <p className={`${token.className} font-heading font-bold tracking-tight`}>
                {token.label}
              </p>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {token.size}
              </span>
            </div>
          ))}
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Peran teks"
        description="Pemakaian ukuran dan warna teks"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {textRoles.map((role) => (
            <div key={role.label} className="space-y-1 rounded-lg border p-3">
              <p className={role.className}>{role.label}</p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {role.description}
              </p>
            </div>
          ))}
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Radius"
        description="Basis --radius: 0.375rem"
      >
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
          {radiusTokens.map((token) => (
            <div key={token.token} className="space-y-1.5">
              <div
                className={`${token.className} h-14 border bg-muted`}
                aria-hidden="true"
              />
              <p className="truncate font-mono text-[10px] text-muted-foreground">
                {token.token}
              </p>
            </div>
          ))}
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Elevasi & helper brand"
        description="shadow-brand · gradient"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex h-24 items-center justify-center rounded-xl bg-card text-sm ring-1 ring-foreground/15 shadow-brand-sm">
              shadow-brand-sm
            </div>
            <div className="flex h-24 items-center justify-center rounded-xl bg-card text-sm ring-1 ring-foreground/15 shadow-brand">
              shadow-brand
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-brand-gradient flex h-12 items-center justify-center rounded-lg text-sm font-medium text-white">
              bg-brand-gradient
            </div>
            <div className="bg-brand-gradient-accent flex h-12 items-center justify-center rounded-lg text-sm font-medium text-white">
              bg-brand-gradient-accent
            </div>
            <div className="flex h-12 items-center justify-center rounded-lg border">
              <span className="text-brand-gradient text-xl font-bold">
                text-brand-gradient
              </span>
            </div>
          </div>
        </div>
      </PreviewSpecimen>
    </PreviewSection>
  );
}
