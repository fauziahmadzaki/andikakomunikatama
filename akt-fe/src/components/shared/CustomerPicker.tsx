"use client";

import { useState } from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import type { Customer } from "@/features/customers/data/types";

export function CustomerPicker({
  customers,
  value,
  onValueChange,
  placeholder = "Cari pelanggan…",
  ariaLabel = "Pilih pelanggan",
}: {
  customers: Customer[];
  value: string;
  onValueChange: (customerId: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const selected = customers.find((customer) => customer.id === value);
  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? customers.filter((customer) =>
        `${customer.fullName} ${customer.customerNumber}`
          .toLowerCase()
          .includes(normalized)
      )
    : customers;

  return (
    <Combobox
      key={value || "empty"}
      aria-label={ariaLabel}
      selectedKey={value || null}
      onSelectionChange={(key) =>
        onValueChange(key === null ? "" : String(key))
      }
      onInputChange={setQuery}
      defaultInputValue={selected?.fullName ?? ""}
    >
      <ComboboxInput placeholder={placeholder} showClear />
      <ComboboxContent>
        <ComboboxList>
          {filtered.map((customer) => (
            <ComboboxItem
              key={customer.id}
              id={customer.id}
              textValue={`${customer.fullName} ${customer.customerNumber}`}
            >
              <div className="flex flex-col">
                <span className="font-medium">{customer.fullName}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {customer.customerNumber}
                </span>
              </div>
            </ComboboxItem>
          ))}
        </ComboboxList>
        <ComboboxEmpty>Tidak ada pelanggan yang cocok.</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}
