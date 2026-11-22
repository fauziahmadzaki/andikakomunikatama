import { SelectField } from "@/components/shared/SelectField";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  SetPlanProfileField,
  PlanProfileWizardForm,
} from "@/features/plan-profiles/hooks/usePlanProfileWizard";
import type {
  PlanProfileBillingType,
  PlanProfileType,
} from "@/features/plan-profiles/data/types";

export function PlanProfileGeneralStep({
  form,
  set,
}: {
  form: PlanProfileWizardForm;
  set: SetPlanProfileField;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">
          Informasi umum
        </h2>
        <p className="text-sm text-muted-foreground">
          Data dasar paket yang akan tampil di katalog layanan.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="profile-name">Nama paket</FieldLabel>
          <Input
            id="profile-name"
            value={form.name}
            placeholder="Home 20 Mbps"
            onChange={(event) => set("name", event.target.value)}
          />
        </Field>

        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="profile-description">Deskripsi</FieldLabel>
          <Textarea
            id="profile-description"
            rows={2}
            value={form.description}
            placeholder="Profil PPPoE residensial untuk paket 20 Mbps."
            onChange={(event) => set("description", event.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="profile-price">Harga</FieldLabel>
          <Input
            id="profile-price"
            type="number"
            min={0}
            value={form.price}
            placeholder="200000"
            onChange={(event) => set("price", event.target.value)}
          />
          <FieldDescription>Harga dasar sebelum pajak.</FieldDescription>
        </Field>

        <div className="space-y-1.5">
          <p className="text-sm font-medium">Tipe koneksi</p>
          <SelectField
            value={form.type}
            onValueChange={(value) =>
              set("type", value as PlanProfileType)
            }
            ariaLabel="Tipe koneksi profil"
            options={[
              { value: "pppoe", label: "PPPoE" },
              { value: "hotspot", label: "Hotspot" },
              { value: "other", label: "Lainnya (simple queue)" },
            ]}
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-medium">Tipe billing</p>
          <SelectField
            value={form.billingType}
            onValueChange={(value) =>
              set("billingType", value as PlanProfileBillingType)
            }
            ariaLabel="Tipe billing profil"
            options={[
              { value: "monthly", label: "Bulanan" },
              { value: "non_monthly", label: "Non-bulanan" },
            ]}
          />
        </div>

        <label className="flex items-end gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => set("isActive", event.target.checked)}
            className="size-4 rounded border-input accent-primary"
          />
          Paket aktif
        </label>
      </div>
    </div>
  );
}
