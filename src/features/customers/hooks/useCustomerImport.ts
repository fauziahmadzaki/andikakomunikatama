"use client";

import { useState } from "react";
import { toast } from "sonner";

import { seedImportRows } from "@/features/customers/data/seed";
import type { ImportRow } from "@/features/customers/data/types";
import { useCustomerStore } from "@/features/customers/store/customer-store";

export function useCustomerImport() {
  const importCustomers = useCustomerStore((state) => state.importCustomers);
  const [step, setStep] = useState(1);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [imported, setImported] = useState(0);

  function processFile() {
    setRows(seedImportRows);
    setStep(2);
  }

  function commit() {
    const count = importCustomers(rows);
    setImported(count);
    setStep(3);
    toast.success(`${count} pelanggan diimport.`);
  }

  function reset() {
    setStep(1);
    setFileName("");
    setRows([]);
  }

  function downloadTemplate() {
    const header = ["nama", "telepon", "nik", "cabang", "paket"];
    const example = [
      "Ahmad Fauzi",
      "081211112222",
      "3174050101900011",
      "Jakarta Pusat",
      "Home 20 Mbps",
    ];
    const csv = [header, example]
      .map((row) => row.map((value) => `"${value}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "template-import-pelanggan.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Template import diunduh.");
  }

  return {
    step,
    fileName,
    setFileName,
    rows,
    imported,
    processFile,
    commit,
    reset,
    downloadTemplate,
    backToUpload: () => setStep(1),
  };
}
