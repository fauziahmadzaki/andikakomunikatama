"use client";

import {
  BanIcon,
  CheckCircleIcon,
  CircleOffIcon,
  DownloadIcon,
  PlusIcon,
  RepeatIcon,
  SearchIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";

import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { PageHeader } from "@/components/shared/PageHeader";
import { SelectField } from "@/components/shared/SelectField";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useCustomersPage } from "@/features/customers/hooks/useCustomersPage";
import { formatRupiah } from "@/features/customers/data/status";
import { CustomerBulkActionDialog } from "./CustomerBulkActionDialog";
import { CustomerConfirmationDialog } from "./CustomerConfirmationDialog";
import { CustomersTable } from "./CustomersTable";

export function CustomersPage() {
  const {
    branches,
    query,
    setQuery,
    branch,
    setBranch,
    statusFilter,
    setStatusFilter,
    setPage,
    currentPage,
    pageCount,
    rows,
    stats,
    exportCsv,
    viewCustomer,
    confirmCustomer,
    setConfirmCustomer,
    confirmToggle,
    selectedKeys,
    setSelectedKeys,
    selectedCount,
    selectableIds,
    bulkAction,
    bulkReason,
    setBulkReason,
    bulkTargetPlanId,
    setBulkTargetPlanId,
    bulkTargetOptions,
    startBulkAction,
    closeBulkAction,
    applyBulkAction,
    canActivate,
    canIsolate,
    canDeactivate,
    canMigrate,
    canDelete,
  } = useCustomersPage();

  const hasBulkActions =
    canActivate || canIsolate || canDeactivate || canMigrate || canDelete;
  const canToggle = canActivate || canIsolate;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        title="Data pelanggan"
        description="Cari, kelola, dan pantau status pelanggan."
      >
        {hasBulkActions && selectedCount > 0 ? (
          <DropdownMenuTrigger>
            <Button type="button" variant="outline">
              Aksi ({selectedCount})
            </Button>
            <DropdownMenu>
              {canActivate ? (
                <DropdownMenuItem
                  textValue="Aktifkan"
                  onAction={() => startBulkAction("activate")}
                >
                  <CheckCircleIcon />
                  Aktifkan
                </DropdownMenuItem>
              ) : null}
              {canIsolate ? (
                <DropdownMenuItem
                  textValue="Isolir"
                  onAction={() => startBulkAction("isolate")}
                >
                  <BanIcon />
                  Isolir
                </DropdownMenuItem>
              ) : null}
              {canDeactivate ? (
                <DropdownMenuItem
                  textValue="Nonaktifkan"
                  onAction={() => startBulkAction("deactivate")}
                >
                  <CircleOffIcon />
                  Nonaktifkan
                </DropdownMenuItem>
              ) : null}
              {canMigrate ? (
                <DropdownMenuItem
                  textValue="Migrasi"
                  onAction={() => startBulkAction("migrate")}
                >
                  <RepeatIcon />
                  Migrasi
                </DropdownMenuItem>
              ) : null}
              {canDelete ? <DropdownMenuSeparator /> : null}
              {canDelete ? (
                <DropdownMenuItem
                  textValue="Hapus"
                  variant="destructive"
                  onAction={() => startBulkAction("delete")}
                >
                  <Trash2Icon />
                  Hapus
                </DropdownMenuItem>
              ) : null}
            </DropdownMenu>
          </DropdownMenuTrigger>
        ) : null}
        <Button variant="outline" onPress={exportCsv}>
          <DownloadIcon />
          Export
        </Button>
        <LinkButton href="/dashboard/pelanggan/impor" variant="outline">
          <UploadIcon />
          Impor
        </LinkButton>
        <LinkButton href="/dashboard/pelanggan/pendaftaran">
          <PlusIcon />
          Tambah pelanggan
        </LinkButton>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Total pelanggan", value: stats.total, tone: "" },
          {
            label: "Aktif",
            value: stats.active,
            tone: "text-emerald-600",
          },
          {
            label: "Isolir",
            value: stats.suspended,
            tone: "text-amber-600",
          },
          {
            label: "Total outstanding",
            value: formatRupiah(stats.outstanding),
            tone: "text-destructive",
          },
          {
            label: "MRR",
            value: formatRupiah(stats.mrr),
            tone: "text-emerald-600",
          },
        ].map((item) => (
          <Card key={item.label} className="gap-0 py-0">
            <CardContent className="space-y-1 p-5">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className={`text-2xl font-bold tracking-tight ${item.tone}`}>
                {item.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="gap-0 py-0">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-2 lg:flex-row">
            <div className="relative w-full lg:max-w-sm">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama, nomor pelanggan, atau telepon…"
                className="pl-9"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full lg:w-48">
              <SelectField
                value={branch}
                onValueChange={(value) => {
                  setBranch(value);
                  setPage(1);
                }}
                ariaLabel="Filter cabang"
                options={[
                  { value: "all", label: "Semua cabang" },
                  ...branches.map((item) => ({
                    value: item.id,
                    label: item.name,
                  })),
                ]}
              />
            </div>
            <div className="w-full lg:w-40">
              <SelectField
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
                ariaLabel="Filter status pelanggan"
                options={[
                  { value: "all", label: "Semua status" },
                  { value: "active", label: "Aktif" },
                  { value: "suspended", label: "Isolir" },
                  { value: "inactive", label: "Nonaktif" },
                  { value: "draft", label: "Draft" },
                ]}
              />
            </div>
          </div>

          <CustomersTable
            customers={rows}
            onView={(customer) => viewCustomer(customer.id)}
            onToggle={setConfirmCustomer}
            canToggle={canToggle}
            selection={{
              selectedKeys,
              allKeys: selectableIds,
              onSelectionChange: (keys) => setSelectedKeys(keys),
            }}
          />

          <DataTablePagination
            page={currentPage}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      <CustomerConfirmationDialog
        customer={confirmCustomer}
        onConfirm={confirmToggle}
        onCancel={() => setConfirmCustomer(null)}
      />

      <CustomerBulkActionDialog
        action={bulkAction}
        count={selectedCount}
        reason={bulkReason}
        onReasonChange={setBulkReason}
        targetPlanId={bulkTargetPlanId}
        onTargetPlanChange={setBulkTargetPlanId}
        targetOptions={bulkTargetOptions}
        onConfirm={applyBulkAction}
        onCancel={closeBulkAction}
      />
    </div>
  );
}
