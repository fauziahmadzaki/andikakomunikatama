"use client";

import type { Dispatch, SetStateAction } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { SelectField } from "@/components/shared/SelectField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type {
  DiscountMethod,
  DiscountScopeType,
} from "@/features/catalog/data/types";
import type {
  DiscountForm,
  DiscountScopeForm,
} from "@/features/catalog/hooks/useDiscountsPage";

export function DiscountDialog({
  open,
  form,
  setForm,
  plans,
  branches,
  customers,
  onAddScope,
  onRemoveScope,
  onUpdateScope,
  onSave,
  onClose,
}: {
  open: boolean;
  form: DiscountForm;
  setForm: Dispatch<SetStateAction<DiscountForm>>;
  plans: { id: string; name: string }[];
  branches: { id: string; name: string }[];
  customers: { id: string; fullName: string }[];
  onAddScope: () => void;
  onRemoveScope: (key: string) => void;
  onUpdateScope: (
    key: string,
    patch: Partial<Omit<DiscountScopeForm, "key">>
  ) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog
      isOpen={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      className="max-w-lg"
    >
      <DialogHeader>
        <DialogTitle>Diskon</DialogTitle>
        <DialogDescription>
          Diskon persentase dihitung dari harga paket. Satu diskon dapat memiliki
          beberapa scope.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="discount-code">Kode</FieldLabel>
            <Input
              id="discount-code"
              value={form.code}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  code: event.target.value.toUpperCase(),
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="discount-name">Nama</FieldLabel>
            <Input
              id="discount-name"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Metode</p>
            <SelectField
              value={form.method}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  method: value as DiscountMethod,
                }))
              }
              ariaLabel="Metode diskon"
              options={[
                { value: "percentage", label: "Persentase" },
                { value: "fixed", label: "Nominal" },
              ]}
            />
          </div>
          <Field>
            <FieldLabel htmlFor="discount-value">Nilai</FieldLabel>
            <Input
              id="discount-value"
              type="number"
              value={form.value}
              onChange={(event) =>
                setForm((current) => ({ ...current, value: event.target.value }))
              }
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="discount-start">Mulai</FieldLabel>
            <Input
              id="discount-start"
              type="date"
              value={form.startsAt}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  startsAt: event.target.value,
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="discount-end">Berakhir</FieldLabel>
            <Input
              id="discount-end"
              type="date"
              value={form.endsAt}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  endsAt: event.target.value,
                }))
              }
            />
          </Field>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Scope diskon</p>
            <Button variant="outline" size="sm" onPress={onAddScope}>
              <PlusIcon />
              Tambah scope
            </Button>
          </div>
          {form.scopes.map((scope) => (
            <div key={scope.key} className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    Tipe scope
                  </p>
                  <SelectField
                    value={scope.scopeType}
                    onValueChange={(value) =>
                      onUpdateScope(scope.key, {
                        scopeType: value as DiscountScopeType,
                      })
                    }
                    ariaLabel="Tipe scope diskon"
                    options={[
                      { value: "all", label: "Semua pelanggan" },
                      { value: "branch", label: "Cabang" },
                      { value: "plan", label: "Paket" },
                      { value: "plan_branch", label: "Paket + cabang" },
                      { value: "customer", label: "Pelanggan" },
                    ]}
                  />
                </div>
                <ActionIconButton
                  icon={Trash2Icon}
                  label="Hapus scope"
                  tone="destructive"
                  onPress={() => onRemoveScope(scope.key)}
                  isDisabled={form.scopes.length === 1}
                />
              </div>

              {scope.scopeType === "branch" ||
              scope.scopeType === "plan_branch" ? (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    Cabang
                  </p>
                  <SelectField
                    value={scope.branchId}
                    onValueChange={(value) =>
                      onUpdateScope(scope.key, { branchId: value })
                    }
                    ariaLabel="Cabang scope diskon"
                    options={branches.map((branch) => ({
                      value: branch.id,
                      label: branch.name,
                    }))}
                  />
                </div>
              ) : null}

              {scope.scopeType === "plan" ||
              scope.scopeType === "plan_branch" ? (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    Paket
                  </p>
                  <SelectField
                    value={scope.planId}
                    onValueChange={(value) =>
                      onUpdateScope(scope.key, { planId: value })
                    }
                    ariaLabel="Paket scope diskon"
                    options={plans.map((plan) => ({
                      value: plan.id,
                      label: plan.name,
                    }))}
                  />
                </div>
              ) : null}

              {scope.scopeType === "customer" ? (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    Pelanggan
                  </p>
                  <SelectField
                    value={scope.customerId}
                    onValueChange={(value) =>
                      onUpdateScope(scope.key, { customerId: value })
                    }
                    ariaLabel="Pelanggan scope diskon"
                    options={[
                      { value: "", label: "Pilih pelanggan" },
                      ...customers.map((customer) => ({
                        value: customer.id,
                        label: customer.fullName,
                      })),
                    ]}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                isActive: event.target.checked,
              }))
            }
            className="size-4 rounded border-input accent-primary"
          />
          Aktif
        </label>
      </div>

      <DialogFooter>
        <Button variant="outline" onPress={onClose}>
          Batal
        </Button>
        <Button onPress={onSave}>Simpan</Button>
      </DialogFooter>
    </Dialog>
  );
}
