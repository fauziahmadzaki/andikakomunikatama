"use client";

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
import { Textarea } from "@/components/ui/textarea";
import type { TicketPriority } from "@/features/tickets/data/types";
import { useTicketDialog } from "@/features/tickets/hooks/useTickets";

export function TicketDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { branches, form, set, save } = useTicketDialog({ onClose });

  return (
    <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogHeader>
        <DialogTitle>Buat tiket</DialogTitle>
        <DialogDescription>
          Tiket baru masuk dengan status open.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <Field>
          <FieldLabel htmlFor="ticket-customer">Nama pelanggan</FieldLabel>
          <Input
            id="ticket-customer"
            value={form.customerName}
            onChange={(event) => set("customerName", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="ticket-subject">Subjek</FieldLabel>
          <Input
            id="ticket-subject"
            value={form.subject}
            onChange={(event) => set("subject", event.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="ticket-category">Kategori</FieldLabel>
            <Input
              id="ticket-category"
              value={form.category}
              onChange={(event) => set("category", event.target.value)}
            />
          </Field>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Prioritas</p>
            <SelectField
              value={form.priority}
              onValueChange={(value) => set("priority", value as TicketPriority)}
              ariaLabel="Prioritas tiket"
              options={[
                { value: "low", label: "Low" },
                { value: "normal", label: "Normal" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" },
              ]}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Cabang</p>
          <SelectField
            value={form.branchName}
            onValueChange={(value) => set("branchName", value)}
            ariaLabel="Cabang tiket"
            options={branches.map((branch) => ({
              value: branch.name,
              label: branch.name,
            }))}
          />
        </div>
        <Field>
          <FieldLabel htmlFor="ticket-description">Deskripsi</FieldLabel>
          <Textarea
            id="ticket-description"
            rows={3}
            value={form.description}
            onChange={(event) => set("description", event.target.value)}
          />
        </Field>
      </div>

      <DialogFooter>
        <Button variant="outline" onPress={onClose}>
          Batal
        </Button>
        <Button onPress={save}>Simpan</Button>
      </DialogFooter>
    </Dialog>
  );
}
