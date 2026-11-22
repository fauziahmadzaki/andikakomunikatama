import { CopyIcon, SearchIcon } from "lucide-react";

import { SelectField } from "@/components/shared/SelectField";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  comboboxCustomers,
  planOptions,
  previewPaymentMethods,
} from "@/features/preview/data/preview-data";
import { useFormsPreview } from "@/features/preview/hooks/useFormsPreview";
import { PreviewSection } from "./PreviewSection";
import { PreviewSpecimen } from "./PreviewSpecimen";

export function FormsSection() {
  const { plan, setPlan, branch, setBranch } = useFormsPreview();

  return (
    <PreviewSection
      id="form"
      title="Form"
      description="Input, pilihan, dan kontrol pengaturan. Gunakan Field untuk menyusun label, deskripsi, dan pesan error yang aksesibel."
    >
      <PreviewSpecimen
        title="Input, textarea, dan validasi"
        description="Field · Input · Textarea · FieldError"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="preview-name">Nama pelanggan</FieldLabel>
            <Input id="preview-name" placeholder="Contoh: Budi Santoso" />
            <FieldDescription>Nama sesuai identitas pelanggan.</FieldDescription>
          </Field>

          <Field data-invalid="true">
            <FieldLabel htmlFor="preview-email">Email</FieldLabel>
            <Input
              id="preview-email"
              type="email"
              defaultValue="budi@"
              aria-invalid="true"
            />
            <FieldError errors={[{ message: "Format email tidak valid." }]} />
          </Field>

          <Field data-disabled="true">
            <FieldLabel htmlFor="preview-id">ID pelanggan</FieldLabel>
            <Input id="preview-id" defaultValue="CUST-001" disabled />
            <FieldDescription>ID dibuat otomatis oleh sistem.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="preview-address">Alamat pemasangan</FieldLabel>
            <Textarea
              id="preview-address"
              placeholder="Jalan, nomor, RT/RW, kelurahan…"
              rows={3}
            />
          </Field>
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Select"
        description="SelectField untuk filter · Select primitif untuk grup"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Paket berlangganan</FieldLabel>
            <SelectField
              value={plan}
              onValueChange={setPlan}
              options={planOptions}
              ariaLabel="Paket berlangganan"
            />
            <FieldDescription>
              Paket aktif saat ini: {planOptions.find((item) => item.value === plan)?.label}.
            </FieldDescription>
          </Field>

          <div className="space-y-2">
            <p className="text-sm font-medium">Status langganan</p>
            <Select
              defaultSelectedKey="aktif"
              aria-label="Status langganan"
              className="w-full"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status aktif</SelectLabel>
                  <SelectItem id="aktif">Aktif</SelectItem>
                  <SelectItem id="isolir">Isolir</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Status lainnya</SelectLabel>
                  <SelectItem id="nonaktif">Nonaktif</SelectItem>
                  <SelectItem id="draft">Draft</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select mendukung grup, pemisah, dan label.
            </p>
          </div>

          <Field>
            <FieldLabel>Cabang</FieldLabel>
            <SelectField
              value={branch}
              onValueChange={setBranch}
              ariaLabel="Cabang"
              placeholder="Pilih cabang"
              options={[
                { value: "all", label: "Semua cabang" },
                { value: "pusat", label: "Kantor pusat" },
                { value: "bandung", label: "Cabang Bandung" },
              ]}
            />
          </Field>

          <Field data-disabled="true">
            <FieldLabel>Metode penagihan</FieldLabel>
            <SelectField
              value="otomatis"
              onValueChange={() => undefined}
              ariaLabel="Metode penagihan"
              disabled
              options={[{ value: "otomatis", label: "Otomatis" }]}
            />
            <FieldDescription>Dikunci oleh kebijakan perusahaan.</FieldDescription>
          </Field>
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Combobox"
        description="Pencarian pelanggan dengan daftar dinamis"
      >
        <div className="max-w-md space-y-2">
          <Combobox aria-label="Cari pelanggan" defaultInputValue="">
            <ComboboxInput placeholder="Cari pelanggan…" showClear />
            <ComboboxContent>
              <ComboboxList>
                {comboboxCustomers.map((customer) => (
                  <ComboboxItem key={customer.id} id={customer.id}>
                    {customer.name}
                  </ComboboxItem>
                ))}
              </ComboboxList>
              <ComboboxEmpty>Tidak ada pelanggan yang cocok.</ComboboxEmpty>
            </ComboboxContent>
          </Combobox>
          <p className="text-xs text-muted-foreground">
            Ketik nama untuk menyaring daftar pelanggan.
          </p>
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Switch dan radio"
        description="Kontrol pengaturan dan pilihan tunggal"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Switch
            </p>
            <Field orientation="horizontal">
              <Switch aria-label="Notifikasi email" defaultSelected />
              <FieldContent>
                <FieldTitle>Notifikasi email</FieldTitle>
                <FieldDescription>
                  Kirim ringkasan aktivitas setiap pagi.
                </FieldDescription>
              </FieldContent>
            </Field>
            <Field orientation="horizontal">
              <Switch size="sm" aria-label="Mode hemat data" />
              <FieldContent>
                <FieldTitle>Mode hemat data</FieldTitle>
                <FieldDescription>
                  Kurangi gambar dan animasi pada koneksi lambat.
                </FieldDescription>
              </FieldContent>
            </Field>
            <Field orientation="horizontal" data-disabled="true">
              <Switch aria-label="Otomasi isolir" defaultSelected isDisabled />
              <FieldContent>
                <FieldTitle>Otomasi isolir</FieldTitle>
                <FieldDescription>Dikunci oleh role keamanan.</FieldDescription>
              </FieldContent>
            </Field>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Radio group
            </p>
            <RadioGroup
              aria-label="Metode pembayaran"
              defaultValue="transfer"
              className="gap-3"
            >
              {previewPaymentMethods.map((method) => (
                <Field key={method.value} orientation="horizontal">
                  <RadioGroupItem
                    id={`preview-payment-${method.value}`}
                    value={method.value}
                  />
                  <FieldLabel htmlFor={`preview-payment-${method.value}`}>
                    {method.label}
                  </FieldLabel>
                </Field>
              ))}
            </RadioGroup>
          </div>
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Input group"
        description="Input dengan ikon, tombol, dan teks tambahan"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              placeholder="Cari pelanggan…"
              aria-label="Cari pelanggan"
            />
          </InputGroup>

          <InputGroup>
            <InputGroupInput
              placeholder="Cari nomor tagihan…"
              aria-label="Cari nomor tagihan"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton variant="secondary">Cari</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>

          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>Rp</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              inputMode="numeric"
              placeholder="0"
              aria-label="Nominal pembayaran"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupText>,00</InputGroupText>
            </InputGroupAddon>
          </InputGroup>

          <InputGroup>
            <InputGroupInput
              defaultValue="INV-2026-000184"
              aria-label="Nomor invoice"
              readOnly
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton variant="ghost" aria-label="Salin nomor invoice">
                <CopyIcon />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Komposisi field"
        description="FieldSet · FieldGroup · FieldSeparator"
      >
        <FieldSet className="max-w-2xl">
          <FieldLegend>Informasi pelanggan baru</FieldLegend>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="preview-new-name">Nama lengkap</FieldLabel>
                <Input id="preview-new-name" placeholder="Nama pelanggan" />
              </Field>
              <Field>
                <FieldLabel htmlFor="preview-new-phone">Nomor WhatsApp</FieldLabel>
                <Input
                  id="preview-new-phone"
                  type="tel"
                  placeholder="0812 3456 7890"
                />
              </Field>
            </div>
            <FieldSeparator>Alamat pemasangan</FieldSeparator>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="preview-new-address">Alamat</FieldLabel>
                <Input id="preview-new-address" placeholder="Jalan dan nomor" />
              </Field>
              <Field>
                <FieldLabel htmlFor="preview-new-city">Kota</FieldLabel>
                <Input id="preview-new-city" placeholder="Kota" />
              </Field>
            </div>
          </FieldGroup>
        </FieldSet>
      </PreviewSpecimen>
    </PreviewSection>
  );
}
