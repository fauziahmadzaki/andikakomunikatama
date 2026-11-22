import { SelectField } from "@/components/shared/SelectField";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  defaultOversubRatio,
  formatBandwidth,
  oversubRatioOptions,
  type BandwidthPreview,
} from "@/features/plan-profiles/data/bandwidth";
import type {
  SetPlanProfileField,
  PlanProfileWizardForm,
} from "@/features/plan-profiles/hooks/usePlanProfileWizard";

function BandwidthMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

export function PlanProfileBandwidthStep({
  form,
  set,
  preview,
}: {
  form: PlanProfileWizardForm;
  set: SetPlanProfileField;
  preview: BandwidthPreview;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Bandwidth</h2>
        <p className="text-sm text-muted-foreground">
          Atur MIR, CIR, dan burst untuk paket ini.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">Gunakan oversubscription</p>
          <p className="text-xs text-muted-foreground">
            CIR dihitung dari MIR dibagi rasio oversubscription.
          </p>
        </div>
        <Switch
          aria-label="Gunakan oversubscription"
          isSelected={form.oversubscription}
          onChange={(isSelected) => {
            set("oversubscription", isSelected);
            if (isSelected && Number(form.oversubRatio) <= 1) {
              set("oversubRatio", defaultOversubRatio);
            }
          }}
        />
      </div>

      {form.oversubscription ? (
        <div className="max-w-xs space-y-1.5">
          <p className="text-sm font-medium">Rasio oversubscription</p>
          <SelectField
            value={form.oversubRatio}
            onValueChange={(value) => set("oversubRatio", value)}
            ariaLabel="Rasio oversubscription"
            options={oversubRatioOptions}
          />
          <p className="text-xs text-muted-foreground">
            Contoh 1 : 5 berarti CIR = MIR ÷ 5.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="download-mbps">Bandwidth unduh (Mbps)</FieldLabel>
          <Input
            id="download-mbps"
            type="number"
            min={1}
            value={form.downloadMbps}
            onChange={(event) => set("downloadMbps", event.target.value)}
          />
          <FieldDescription>Kecepatan MIR untuk unduhan.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="upload-mbps">Bandwidth unggah (Mbps)</FieldLabel>
          <Input
            id="upload-mbps"
            type="number"
            min={1}
            value={form.uploadMbps}
            onChange={(event) => set("uploadMbps", event.target.value)}
          />
          <FieldDescription>Kecepatan MIR untuk unggahan.</FieldDescription>
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border p-4 text-sm">
          <p className="font-medium">Unduh</p>
          <dl className="mt-2 space-y-1">
            <BandwidthMetric
              label="MIR"
              value={formatBandwidth(preview.mirDownloadMbps)}
            />
            <BandwidthMetric
              label="CIR"
              value={formatBandwidth(preview.cirDownloadMbps)}
            />
            <BandwidthMetric
              label="Burst"
              value={formatBandwidth(preview.burstDownloadMbps)}
            />
          </dl>
        </div>
        <div className="rounded-lg border p-4 text-sm">
          <p className="font-medium">Unggah</p>
          <dl className="mt-2 space-y-1">
            <BandwidthMetric
              label="MIR"
              value={formatBandwidth(preview.mirUploadMbps)}
            />
            <BandwidthMetric
              label="CIR"
              value={formatBandwidth(preview.cirUploadMbps)}
            />
            <BandwidthMetric
              label="Burst"
              value={formatBandwidth(preview.burstUploadMbps)}
            />
          </dl>
        </div>
      </div>

      <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Inline limit MikroTik (rx/tx = upload/download)
        </p>
        <code className="block overflow-x-auto rounded-md bg-background px-3 py-2 font-mono text-sm ring-1 ring-foreground/15">
          {preview.rateLimit}
        </code>
        <p className="text-xs text-muted-foreground">
          CIR masuk sebagai min-rate di akhir command. Burst memakai MIR; nilai
          desimal dikonversi ke k, misalnya 2,5 Mbps menjadi 2500k.
        </p>
      </div>
    </div>
  );
}
