import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/DataTable";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  previewCustomers,
  type PreviewCustomer,
} from "@/features/preview/data/preview-data";
import { useTablePreview } from "@/features/preview/hooks/useTablePreview";
import { PreviewSection } from "./PreviewSection";
import { PreviewSpecimen } from "./PreviewSpecimen";

export function TableSection() {
  const { page, setPage } = useTablePreview();

  const columns: DataTableColumn<PreviewCustomer>[] = [
    {
      key: "id",
      header: "ID",
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground">{row.id}</span>
      ),
    },
    {
      key: "name",
      header: "Pelanggan",
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    { key: "plan", header: "Paket" },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge tone={row.tone}>{row.status}</StatusBadge>,
    },
    {
      key: "actions",
      header: "Aksi",
      align: "right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-0.5">
          <ActionIconButton
            icon={EyeIcon}
            label={`Lihat ${row.name}`}
            onPress={() => undefined}
          />
          <ActionIconButton
            icon={PencilIcon}
            label={`Ubah ${row.name}`}
            onPress={() => undefined}
          />
          <ActionIconButton
            icon={Trash2Icon}
            label={`Hapus ${row.name}`}
            tone="destructive"
            onPress={() => undefined}
          />
        </div>
      ),
    },
  ];

  return (
    <PreviewSection
      id="tabel"
      title="Tabel"
      description="DataTable membungkus tabel aksesibel dengan kolom yang dapat dikustomisasi. Aksi baris selalu berupa tombol ikon dengan tooltip."
    >
      <PreviewSpecimen
        title="DataTable"
        description="Kolom teks, badge status, dan aksi"
        contentClassName="p-0 sm:p-0"
      >
        <div className="p-4 sm:p-5">
          <DataTable
            data={previewCustomers}
            columns={columns}
            getRowKey={(row) => row.id}
            ariaLabel="Daftar pelanggan contoh"
          />
          <DataTablePagination
            page={page}
            pageCount={5}
            onPageChange={setPage}
          />
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Tabel kosong"
        description="emptyMessage kustom"
      >
        <DataTable
          data={[]}
          columns={columns}
          getRowKey={(row) => row.id}
          ariaLabel="Tabel pelanggan kosong"
          emptyMessage="Belum ada pelanggan pada filter ini."
        />
      </PreviewSpecimen>
    </PreviewSection>
  );
}
