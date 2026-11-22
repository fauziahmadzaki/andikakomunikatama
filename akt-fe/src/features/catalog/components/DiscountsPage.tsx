"use client";

import { ArrowLeftIcon, PlusIcon, SearchIcon } from "lucide-react";

import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDiscountsPage } from "@/features/catalog/hooks/useDiscountsPage";
import { DiscountDialog } from "./DiscountDialog";
import { DiscountsTable } from "./DiscountsTable";

export function DiscountsPage() {
  const {
    discounts,
    plans,
    branches,
    customers,
    query,
    setQuery,
    open,
    setOpen,
    form,
    setForm,
    openCreate,
    openEdit,
    save,
    addScope,
    removeScope,
    updateScope,
    scopeLabel,
    confirmId,
    setConfirmId,
    confirmToggle,
  } = useDiscountsPage();

  const confirmDiscount = discounts.find((item) => item.id === confirmId);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="space-y-3">
        <LinkButton
          href="/dashboard/paket"
          variant="ghost"
          size="sm"
          className="-ml-2"
        >
          <ArrowLeftIcon />
          Kembali ke paket
        </LinkButton>
        <PageHeader
          title="Diskon"
          description="Kelola diskon pelanggan, paket, dan cabang."
        >
          <Button onPress={openCreate}>
            <PlusIcon />
            Tambah diskon
          </Button>
        </PageHeader>
      </div>

      <Card className="gap-0 py-0">
        <CardContent className="space-y-4 p-4">
          <div className="relative w-full sm:max-w-sm">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari kode atau nama diskon…"
              className="pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <DiscountsTable
            discounts={discounts}
            scopeLabel={scopeLabel}
            onEdit={(discount) => openEdit(discount.id)}
            onToggle={(discount) => setConfirmId(discount.id)}
          />
        </CardContent>
      </Card>

      <DiscountDialog
        open={open}
        form={form}
        setForm={setForm}
        plans={plans}
        branches={branches}
        customers={customers}
        onAddScope={addScope}
        onRemoveScope={removeScope}
        onUpdateScope={updateScope}
        onSave={save}
        onClose={() => setOpen(false)}
      />

      <ConfirmationDialog
        open={Boolean(confirmDiscount)}
        title={
          confirmDiscount?.isActive
            ? "Nonaktifkan diskon?"
            : "Aktifkan diskon?"
        }
        description={
          confirmDiscount?.isActive
            ? "Diskon tidak bisa dipakai untuk langganan baru."
            : "Diskon bisa dipakai kembali untuk langganan baru."
        }
        confirmLabel={confirmDiscount?.isActive ? "Nonaktifkan" : "Aktifkan"}
        destructive={Boolean(confirmDiscount?.isActive)}
        onConfirm={confirmToggle}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
