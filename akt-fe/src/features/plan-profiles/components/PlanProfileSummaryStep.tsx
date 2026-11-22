import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Router } from "@/features/network/data/types";
import {
  formatBandwidth,
  type BandwidthPreview,
} from "@/features/plan-profiles/data/bandwidth";
import type { RouterIpPool } from "@/features/plan-profiles/data/types";
import type { PlanProfileWizardForm } from "@/features/plan-profiles/hooks/usePlanProfileWizard";
import { formatRupiah } from "@/lib/format";

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

export function PlanProfileSummaryStep({
  form,
  router,
  selectedPool,
  selectedParentQueue,
  preview,
}: {
  form: PlanProfileWizardForm;
  router: Router | undefined;
  selectedPool: RouterIpPool | undefined;
  selectedParentQueue?: { name: string; maxLimit?: string };
  preview: BandwidthPreview;
}) {
  const poolLabel =
    form.poolMode === "new"
      ? `${form.newPoolName} (baru)`
      : selectedPool?.name ?? "-";
  const poolRange =
    form.poolMode === "new"
      ? `${form.newPoolStart} – ${form.newPoolEnd}`
      : selectedPool
        ? `${selectedPool.rangeStart} – ${selectedPool.rangeEnd}`
        : "-";

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">
          Ringkasan pengaturan
        </h2>
        <p className="text-sm text-muted-foreground">
          Periksa kembali paket sebelum disimpan.
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">Informasi umum</p>
          <div className="flex flex-wrap gap-2">
            <StatusBadge
              tone={
                form.type === "pppoe"
                  ? "primary"
                  : form.type === "hotspot"
                    ? "warning"
                    : "neutral"
              }
            >
              {form.type === "pppoe"
                ? "PPPoE"
                : form.type === "hotspot"
                  ? "Hotspot"
                  : "Lainnya"}
            </StatusBadge>
            <StatusBadge tone={form.isActive ? "success" : "neutral"}>
              {form.isActive ? "Aktif" : "Nonaktif"}
            </StatusBadge>
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <SummaryItem label="Nama paket" value={form.name || "-"} />
          <SummaryItem
            label="Harga"
            value={formatRupiah(Number(form.price) || 0)}
          />
          <SummaryItem
            label="Tipe billing"
            value={
              form.billingType === "monthly" ? "Bulanan" : "Non-bulanan"
            }
          />
          <SummaryItem label="Deskripsi" value={form.description || "-"} />
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-sm font-medium">Koneksi</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <SummaryItem
            label="Router"
            value={router ? `${router.name} — ${router.host}` : "-"}
          />
          <SummaryItem
            label="Parent queue"
            value={selectedParentQueue?.name ?? "-"}
          />
          <SummaryItem label="IP pool" value={poolLabel} />
          <SummaryItem label="Range pool" value={poolRange} />
          <SummaryItem label="Local address" value={form.localAddress || "-"} />
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-sm font-medium">Bandwidth</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <SummaryItem
            label="MIR unduh"
            value={formatBandwidth(preview.mirDownloadMbps)}
          />
          <SummaryItem
            label="MIR unggah"
            value={formatBandwidth(preview.mirUploadMbps)}
          />
          <SummaryItem
            label="CIR unduh"
            value={formatBandwidth(preview.cirDownloadMbps)}
          />
          <SummaryItem
            label="CIR unggah"
            value={formatBandwidth(preview.cirUploadMbps)}
          />
          <SummaryItem
            label="Burst unduh"
            value={formatBandwidth(preview.burstDownloadMbps)}
          />
          <SummaryItem
            label="Burst unggah"
            value={formatBandwidth(preview.burstUploadMbps)}
          />
          <SummaryItem
            label="Oversubscription"
            value={form.oversubscription ? `1 : ${preview.ratio}` : "Tidak"}
          />
        </div>
        <div className="mt-4 space-y-2 rounded-lg bg-muted/40 p-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Inline limit MikroTik
          </p>
          <code className="block overflow-x-auto font-mono text-sm">
            {preview.rateLimit}
          </code>
          <p className="text-xs text-muted-foreground">
            rx/tx = upload/download. CIR masuk sebagai min-rate di akhir command.
          </p>
        </div>
      </div>
    </div>
  );
}
