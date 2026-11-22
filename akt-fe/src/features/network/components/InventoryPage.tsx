"use client";

import { PlusIcon, SearchIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useInventoryPage } from "@/features/network/hooks/useInventoryPage";
import { formatRupiah } from "@/lib/format";
import { InventoryItemDialog, InventoryMovementDialog } from "./InventoryDialogs";
import { InventoryTable, MovementTable } from "./InventoryTable";

export function InventoryPage() {
  const {
    inventory,
    movements,
    query,
    setQuery,
    branches,
    employees,
    itemOpen,
    setItemOpen,
    itemForm,
    setItemForm,
    movementItem,
    setMovementItem,
    movementForm,
    setMovementForm,
    saveItem,
    saveMovement,
    install,
    returnDevice,
  } = useInventoryPage();

  const stats = {
    total: inventory.length,
    inStock: inventory.filter((item) => item.status === "in_stock").length,
    installed: inventory.filter((item) => item.status === "installed").length,
    value: inventory.reduce((total, item) => total + item.purchasePrice, 0),
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Inventaris"
        description="Kelola stok serialized, pemasangan, dan movement perangkat."
      >
        <Button onPress={() => setItemOpen(true)}>
          <PlusIcon />
          Tambah barang
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total item", value: stats.total },
          { label: "In stock", value: stats.inStock },
          { label: "Terpasang", value: stats.installed },
          { label: "Nilai inventaris", value: formatRupiah(stats.value) },
        ].map((item) => (
          <Card key={item.label} className="gap-0 py-0">
            <CardContent className="space-y-1 p-5">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-bold tracking-tight">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="gap-0 py-0">
        <CardContent className="space-y-4 p-4">
          <div className="relative w-full sm:max-w-sm">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari SKU, nama, atau serial number…"
              className="pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <InventoryTable
            items={inventory}
            onInstall={install}
            onReturn={returnDevice}
            onMove={setMovementItem}
          />
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle>Movement terbaru</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <MovementTable movements={movements.slice(0, 8)} />
        </CardContent>
      </Card>

      <InventoryItemDialog
        open={itemOpen}
        form={itemForm}
        setForm={setItemForm}
        branches={branches}
        onSave={saveItem}
        onClose={() => setItemOpen(false)}
      />
      <InventoryMovementDialog
        item={movementItem}
        form={movementForm}
        setForm={setMovementForm}
        branches={branches}
        employees={employees}
        onSave={saveMovement}
        onClose={() => setMovementItem(null)}
      />
    </div>
  );
}
